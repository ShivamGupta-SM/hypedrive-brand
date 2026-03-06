import {
	ArrowPathIcon,
	CalendarDaysIcon,
	CalendarIcon,
	CheckCircleIcon,
	DocumentArrowDownIcon,
	DocumentTextIcon,
	MagnifyingGlassIcon,
	Squares2X2Icon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Input, InputGroup } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";
import { useInfiniteInvoices, useInvoice } from "@/features/invoices/hooks";
import { useBatchInvoices, useGenerateInvoicePDF } from "@/features/invoices/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand } from "@/lib/brand-client";
import { formatCurrency, formatDate } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";

type Invoice = brand.Invoice;

// Period filter options
const periodFilters = [
	{ value: "all", label: "All", icon: Squares2X2Icon, iconColor: "text-sky-500" },
	{ value: "this_month", label: "This Month", icon: CalendarIcon, iconColor: "text-emerald-500" },
	{ value: "last_month", label: "Last Month", icon: CalendarDaysIcon, iconColor: "text-amber-500" },
	{ value: "last_3_months", label: "3 Months", icon: CalendarDaysIcon, iconColor: "text-violet-500" },
] as const;

type PeriodFilter = (typeof periodFilters)[number]["value"];

// =============================================================================
// LOADING SKELETON
// =============================================================================

function InvoicesSkeleton() {
	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Skeleton width={130} height={32} borderRadius={8} />
					<Skeleton width={200} height={16} borderRadius={6} className="mt-2" />
				</div>
			</div>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Invoices", value: "" },
					{ name: "Billed", value: "" },
					{ name: "GST", value: "" },
					{ name: "Enrollments", value: "" },
				]}
				loading
				columns={4}
			/>

			{/* Search + Filter pills */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Skeleton height={40} borderRadius={8} containerClassName="w-full sm:w-64 shrink-0" />
				<div className="flex gap-1.5 overflow-x-auto">
					{[70, 90, 90, 80].map((w, i) => (
						<Skeleton key={i} width={w} height={36} borderRadius={9999} />
					))}
				</div>
			</div>

			{/* Invoice list skeleton */}
			<div className="space-y-2">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} width="100%" height={56} borderRadius={8} />
				))}
			</div>
		</div>
	);
}

// =============================================================================
// INVOICE ROW
// =============================================================================

function InvoiceRow({
	invoice,
	onView,
	selected,
	onToggleSelect,
}: {
	invoice: Invoice;
	onView: () => void;
	selected: boolean;
	onToggleSelect: () => void;
}) {
	return (
		<div className="group flex w-full items-center gap-0 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
			{/* Selection checkbox */}
			<button
				type="button"
				onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
				className={`ml-3 flex size-5 shrink-0 items-center justify-center rounded border transition-all ${
					selected
						? "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white"
						: "border-zinc-300 bg-white opacity-0 group-hover:opacity-100 dark:border-zinc-600 dark:bg-zinc-800"
				}`}
			>
				{selected && (
					<CheckCircleIcon className="size-3.5 text-white dark:text-zinc-900" />
				)}
			</button>
			<button
				type="button"
				onClick={onView}
				className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
			>
				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
					<DocumentTextIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<p className="truncate font-mono text-sm font-medium text-zinc-900 dark:text-white">
							{invoice.invoiceNumber}
						</p>
						<Badge color="emerald" className="shrink-0">
							Paid
						</Badge>
					</div>
					<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
						{formatDate(invoice.periodStart ?? "")} – {formatDate(invoice.periodEnd ?? "")}
					</p>
				</div>
				<div className="shrink-0 text-right">
					<p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
						{formatCurrency(invoice.totalAmountDecimal)}
					</p>
					<p className="text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
						GST {formatCurrency(invoice.gstAmountDecimal)}
					</p>
				</div>
			</button>
		</div>
	);
}

// =============================================================================
// INVOICE DETAIL MODAL
// =============================================================================

function InvoiceDetailModal({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
	const { organization } = useOrgContext();
	const canDownload = useCan("invoice", "download");
	const generatePDF = useGenerateInvoicePDF(organization?.id);
	// Fetch fresh invoice detail when modal opens
	const { data: freshInvoice } = useInvoice(organization?.id, invoice?.id);
	const displayInvoice = freshInvoice ?? invoice;

	const handleDownloadPDF = async () => {
		if (!displayInvoice) return;
		try {
			if (displayInvoice.pdfUrl) {
				window.open(displayInvoice.pdfUrl, "_blank");
			} else {
				const result = await generatePDF.mutateAsync(displayInvoice.id);
				if (result.pdfUrl) {
					window.open(result.pdfUrl, "_blank");
					showToast.fileGenerated("Invoice PDF");
				}
			}
		} catch (err) {
			showToast.error(err, "Failed to download PDF");
		}
	};

	if (!displayInvoice) return null;

	const orgName = organization?.name || "Organization";

	return (
		<Dialog open={!!displayInvoice} onClose={onClose} size="md">
			<DialogHeader
				icon={DocumentTextIcon}
				iconColor="zinc"
				title={`Invoice ${displayInvoice.invoiceNumber}`}
				onClose={onClose}
			/>

			<DialogBody className="space-y-5">
				{/* From / To */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">From</p>
						<p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">Hypedrive</p>
						<p className="text-xs text-zinc-500 dark:text-zinc-400">GSTIN: —</p>
					</div>
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">Bill To</p>
						<p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">{orgName}</p>
						<p className="text-xs text-zinc-500 dark:text-zinc-400">GSTIN: —</p>
					</div>
				</div>

				{/* Dates */}
				<div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
					<div>
						<p className="text-xs text-zinc-400 dark:text-zinc-500">Invoice Date</p>
						<p className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-white">
							{formatDate(displayInvoice.createdAt)}
						</p>
					</div>
					<div>
						<p className="text-xs text-zinc-400 dark:text-zinc-500">Due Date</p>
						<p className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-white">
							{formatDate(displayInvoice.dueDate)}
						</p>
					</div>
					<div className="col-span-2">
						<p className="text-xs text-zinc-400 dark:text-zinc-500">Billing Period</p>
						<p className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-white">
							{formatDate(displayInvoice.periodStart ?? "")} – {formatDate(displayInvoice.periodEnd ?? "")}
						</p>
					</div>
				</div>

				{/* Line Items */}
				<div>
					<div className="flex justify-between border-b border-zinc-200 pb-2 text-xs uppercase tracking-wide text-zinc-400 dark:border-zinc-700">
						<span>Description</span>
						<span>Amount</span>
					</div>
					<div className="flex items-center justify-between py-3">
						<div>
							<p className="text-sm text-zinc-900 dark:text-white">Campaign Enrollments</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">Campaign enrollment fees</p>
						</div>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">
							{formatCurrency(displayInvoice.subtotalDecimal)}
						</p>
					</div>
				</div>

				{/* Totals */}
				<div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
					<div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
						<span>Subtotal</span>
						<span>{formatCurrency(displayInvoice.subtotalDecimal)}</span>
					</div>
					<div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
						<span>CGST @ 9%</span>
						<span>{formatCurrency(parseFloat(displayInvoice.gstAmountDecimal) / 2)}</span>
					</div>
					<div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
						<span>SGST @ 9%</span>
						<span>{formatCurrency(parseFloat(displayInvoice.gstAmountDecimal) / 2)}</span>
					</div>
					<div className="flex justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
						<span className="text-sm font-medium text-zinc-900 dark:text-white">Total</span>
						<span className="text-base font-bold text-zinc-900 dark:text-white">
							{formatCurrency(displayInvoice.totalAmountDecimal)}
						</span>
					</div>
				</div>

				{/* Payment Status */}
				{displayInvoice.status === "paid" && (
					<div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
						<CheckCircleIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
						<span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Paid via Wallet</span>
					</div>
				)}
			</DialogBody>

			{canDownload && (
				<DialogActions>
					<Button color="emerald" onClick={handleDownloadPDF} disabled={generatePDF.isPending}>
						{generatePDF.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<DocumentArrowDownIcon data-slot="icon" className="size-4" />
								Download PDF
							</>
						)}
					</Button>
				</DialogActions>
			)}

			{/* Footer */}
			<div className="mt-4 text-center">
				<p className="text-xs text-zinc-400 dark:text-zinc-500">Thank you for your business!</p>
				<p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">support@hypedrive.in • hypedrive.in</p>
			</div>
		</Dialog>
	);
}

// =============================================================================
// INVOICES LIST PAGE
// =============================================================================

export function InvoicesList() {
	const { organizationId } = useOrgContext();

	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const handleSearchChange = (value: string) => {
		setSearch(value);
		clearTimeout(searchTimerRef.current);
		searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), 300);
	};

	const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

	// Batch selection state
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchLoading, setIsBatchLoading] = useState(false);
	const batchInvoices = useBatchInvoices();

	const toggleSelect = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	}, []);

	const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

	// Convert period filter to server-side date range
	const periodDateRange = useMemo(() => {
		if (periodFilter === "all") return {};
		const now = new Date();
		const y = now.getFullYear();
		const m = now.getMonth();
		if (periodFilter === "this_month") {
			return { issuedDateFrom: new Date(y, m, 1).toISOString(), issuedDateTo: new Date(y, m + 1, 0, 23, 59, 59).toISOString() };
		}
		if (periodFilter === "last_month") {
			return { issuedDateFrom: new Date(y, m - 1, 1).toISOString(), issuedDateTo: new Date(y, m, 0, 23, 59, 59).toISOString() };
		}
		// last_3_months
		return { issuedDateFrom: new Date(y, m - 3, 1).toISOString() };
	}, [periodFilter]);

	const {
		data: invoices,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteInvoices(organizationId, {
		q: debouncedSearch || undefined,
		...periodDateRange,
	});

	const filteredInvoices = invoices;

	// Calculate stats (sum decimal strings -> rupees)
	const stats = useMemo(
		() => ({
			count: filteredInvoices.length,
			totalAmount: filteredInvoices
				.reduce((acc, inv: Invoice) => acc + parseFloat(inv.totalAmountDecimal || "0"), 0)
				.toFixed(2),
			totalGst: filteredInvoices
				.reduce((acc, inv: Invoice) => acc + parseFloat(inv.gstAmountDecimal || "0"), 0)
				.toFixed(2),
			totalEnrollments: filteredInvoices.length,
		}),
		[filteredInvoices]
	);

	// Format compact currency (amount is a decimal string in rupees)
	const formatCompact = useCallback((amount: string) => {
		const rupees = parseFloat(amount) || 0;
		if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
		if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}K`;
		return `₹${Math.round(rupees)}`;
	}, []);

	// Select-all toggle for currently visible (filtered) invoices
	const allVisibleSelected = filteredInvoices.length > 0 && filteredInvoices.every((inv: Invoice) => selectedIds.has(inv.id));
	const toggleSelectAll = useCallback(() => {
		if (allVisibleSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(filteredInvoices.map((inv: Invoice) => inv.id)));
		}
	}, [allVisibleSelected, filteredInvoices]);

	// Batch action handler
	const handleBatchAction = useCallback(async (action: "mark_paid") => {
		if (!organizationId || selectedIds.size === 0) return;
		setIsBatchLoading(true);
		try {
			await batchInvoices.mutateAsync({
				organizationId,
				action,
				invoiceIds: Array.from(selectedIds),
			});
			showToast.success(`${selectedIds.size} invoice${selectedIds.size > 1 ? "s" : ""} marked as paid`);
			setSelectedIds(new Set());
			refetch();
		} catch (err) {
			showToast.error(err, "Failed to update invoices");
		} finally {
			setIsBatchLoading(false);
		}
	}, [organizationId, selectedIds, batchInvoices, refetch]);

	if (loading) {
		return <InvoicesSkeleton />;
	}

	if (error) {
		return <ErrorState message="Failed to load invoices. Please try again." onRetry={refetch} />;
	}

	return (
		<div className="space-y-5">
			{/* Header */}
			<PageHeader title="Invoices" description="Weekly billing records" />

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Invoices", value: stats.count },
					{ name: "Billed", value: formatCompact(stats.totalAmount) },
					{ name: "GST", value: formatCompact(stats.totalGst) },
					{ name: "Enrollments", value: stats.totalEnrollments },
				]}
				columns={4}
			/>

			{/* Search + Filter Row */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="w-full sm:w-64 sm:shrink-0">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="text"
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							placeholder="Search invoices..."
							aria-label="Search invoices"
						/>
						{search && (
							<button
								type="button"
								onClick={() => { setSearch(""); setDebouncedSearch(""); }}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-4" />
							</button>
						)}
					</InputGroup>
				</div>

				{/* Period Pills */}
				<div className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1 py-1">
					<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
						{periodFilters.map((filter) => (
							<button
								key={filter.value}
								type="button"
								onClick={() => setPeriodFilter(filter.value)}
								className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ring-1 transition-all duration-200 active:scale-95 ${
									periodFilter === filter.value
										? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
										: "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800"
								}`}
							>
								<filter.icon
									className={`size-3.5 ${periodFilter === filter.value ? "text-white dark:text-zinc-900" : filter.iconColor}`}
								/>
								{filter.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Invoice List */}
			{filteredInvoices.length === 0 ? (
				<EmptyState
					preset="generic"
					title="No invoices"
					description={search ? `No results for "${search}"` : "No invoices for this period"}
				/>
			) : (
				<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
					<div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
						<div className="flex items-center gap-3">
							{/* Select All checkbox */}
							<button
								type="button"
								onClick={toggleSelectAll}
								className={`flex size-5 items-center justify-center rounded border transition-all ${
									allVisibleSelected
										? "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white"
										: "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800"
								}`}
							>
								{allVisibleSelected && (
									<CheckCircleIcon className="size-3.5 text-white dark:text-zinc-900" />
								)}
							</button>
							<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
								Invoices
								<span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">{filteredInvoices.length}</span>
							</h3>
						</div>
					</div>
					<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
						{filteredInvoices.map((inv: Invoice) => (
							<InvoiceRow
								key={inv.id}
								invoice={inv}
								onView={() => setSelectedInvoice(inv)}
								selected={selectedIds.has(inv.id)}
								onToggleSelect={() => toggleSelect(inv.id)}
							/>
						))}
					</div>
					{hasMore && (
						<div className="flex justify-center border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
							<Button outline onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
								{isFetchingNextPage ? (
									<>
										<ArrowPathIcon className="size-4 animate-spin" />
										Loading...
									</>
								) : (
									"Load More"
								)}
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Floating Batch Actions Bar */}
			<BulkActionsBar selectedCount={selectedIds.size} onClear={clearSelection}>
				<Button color="emerald" onClick={() => handleBatchAction("mark_paid")} disabled={isBatchLoading}>
					<CheckCircleIcon className="size-4" /> Mark Paid
				</Button>
				<Button color="emerald" onClick={() => {
					const selected = filteredInvoices.filter((inv: Invoice) => selectedIds.has(inv.id));
					for (const inv of selected) {
						if (inv.pdfUrl) window.open(inv.pdfUrl, "_blank");
					}
				}} disabled={isBatchLoading}>
					<DocumentArrowDownIcon className="size-4" /> Download PDFs
				</Button>
			</BulkActionsBar>

			{/* Invoice Detail Modal */}
			<InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
		</div>
	);
}
