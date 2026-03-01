import {
	ArrowDownTrayIcon,
	ArrowPathIcon,
	CalendarIcon,
	CheckCircleIcon,
	CurrencyRupeeIcon,
	DocumentTextIcon,
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	ReceiptPercentIcon,
	UserGroupIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useMemo, useState } from "react";
import { showToast } from "@/lib/toast";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody } from "@/components/dialog";
import { Heading } from "@/components/heading";
import { Logo } from "@/components/logo";
import { StatCard } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton, StatCardSkeleton } from "@/components/skeleton";
import { Text } from "@/components/text";
import {
	useCurrentOrganization,
	useGenerateInvoicePDF,
	useInfiniteInvoices,
	useInvoice,
} from "@/hooks";
import type { brand } from "@/lib/brand-client";
import { formatCurrency, formatDate } from "@/lib/design-tokens";

type Invoice = brand.Invoice;

// Period filter options
const periodFilters = [
	{ value: "all", label: "All" },
	{ value: "this_month", label: "This Month" },
	{ value: "last_month", label: "Last Month" },
	{ value: "last_3_months", label: "3 Months" },
] as const;

type PeriodFilter = (typeof periodFilters)[number]["value"];

// =============================================================================
// LOADING SKELETON
// =============================================================================

function InvoicesSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Skeleton width={130} height={32} borderRadius={8} />
					<Skeleton width={200} height={16} borderRadius={6} className="mt-2" />
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				{[1, 2, 3, 4].map((i) => (
					<StatCardSkeleton key={i} />
				))}
			</div>

			{/* Filters + Search */}
			<div className="space-y-3">
				<div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
					<div className="flex gap-2">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} width={80} height={36} borderRadius={9999} />
						))}
					</div>
				</div>
				<Skeleton height={40} borderRadius={12} containerClassName="max-w-md" />
			</div>

			{/* Invoice list skeleton */}
			<div className="space-y-2">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} width="100%" height={80} borderRadius={12} />
				))}
			</div>
		</div>
	);
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
				<ExclamationTriangleIcon className="size-8 text-red-400" />
			</div>
			<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
				Something went wrong
			</p>
			<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
				Failed to load invoices. Please try again.
			</p>
			<Button className="mt-6" onClick={onRetry} color="dark/zinc">
				<ArrowPathIcon className="size-4" />
				Try Again
			</Button>
		</div>
	);
}

// =============================================================================
// INVOICE ROW
// =============================================================================

function InvoiceRow({ invoice, onView }: { invoice: Invoice; onView: () => void }) {
	return (
		<button
			type="button"
			onClick={onView}
			className="group flex w-full flex-col gap-3 rounded-xl bg-white p-4 text-left ring-1 ring-zinc-200 transition-all hover:bg-zinc-50 hover:ring-zinc-300 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800/80 dark:hover:ring-zinc-700"
		>
			{/* Left side - Invoice info */}
			<div className="flex items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 transition-colors group-hover:bg-emerald-100 dark:bg-zinc-800 dark:group-hover:bg-emerald-900/30">
					<DocumentTextIcon className="size-5 text-zinc-500 transition-colors group-hover:text-emerald-600 dark:text-zinc-400 dark:group-hover:text-emerald-400" />
				</div>
				<div className="min-w-0">
					<p className="truncate font-mono text-sm font-medium text-zinc-900 dark:text-white">
						{invoice.invoiceNumber}
					</p>
					<div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
						<span className="flex items-center gap-1">
							<CalendarIcon className="size-3 shrink-0" />
							<span className="truncate">
								{formatDate(invoice.periodStart ?? "")} – {formatDate(invoice.periodEnd ?? "")}
							</span>
						</span>
						<span className="hidden text-zinc-300 sm:inline dark:text-zinc-600">•</span>
						<span className="text-zinc-400">Billed</span>
					</div>
				</div>
			</div>

			{/* Right side - Amount and status */}
			<div className="flex items-center justify-between gap-3 pl-13 sm:justify-end sm:gap-4 sm:pl-0">
				<div className="text-left sm:text-right">
					<p className="font-semibold text-zinc-900 dark:text-white">
						{formatCurrency(invoice.totalAmount)}
					</p>
					<p className="text-xs text-zinc-400 dark:text-zinc-500">
						GST {formatCurrency(invoice.gstAmount)}
					</p>
				</div>
				<Badge color="green" className="shrink-0">
					<CheckCircleIcon className="size-3" />
					Paid
				</Badge>
			</div>
		</button>
	);
}

// =============================================================================
// INVOICE DETAIL MODAL
// =============================================================================

function InvoiceDetailModal({
	invoice,
	onClose,
}: {
	invoice: Invoice | null;
	onClose: () => void;
}) {
	const organization = useCurrentOrganization();
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
			{/* Header */}
			<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
				<Logo className="h-5 w-auto text-zinc-950 dark:text-white" />
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
				>
					<XMarkIcon className="size-5" />
				</button>
			</div>

			<DialogBody className="space-y-5">
				{/* Tax Invoice Title */}
				<div className="text-center">
					<p className="text-xs font-medium uppercase tracking-widest text-zinc-400">Tax Invoice</p>
					<p className="mt-1 font-mono text-sm font-semibold text-zinc-900 dark:text-white">
						{displayInvoice.invoiceNumber}
					</p>
				</div>

				{/* From / To */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-zinc-400">From</p>
						<p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">Hypedrive</p>
						<p className="text-xs text-zinc-500">GSTIN: —</p>
					</div>
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Bill To</p>
						<p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">{orgName}</p>
						<p className="text-xs text-zinc-500">GSTIN: —</p>
					</div>
				</div>

				{/* Dates */}
				<div className="grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
					<div>
						<p className="text-xs text-zinc-400">Invoice Date</p>
						<p className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-white">
							{formatDate(displayInvoice.createdAt)}
						</p>
					</div>
					<div>
						<p className="text-xs text-zinc-400">Due Date</p>
						<p className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-white">
							{formatDate(displayInvoice.dueDate)}
						</p>
					</div>
					<div className="col-span-2">
						<p className="text-xs text-zinc-400">Billing Period</p>
						<p className="mt-0.5 text-xs font-medium text-zinc-900 dark:text-white">
							{formatDate(displayInvoice.periodStart ?? "")} –{" "}
							{formatDate(displayInvoice.periodEnd ?? "")}
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
							<p className="text-xs text-zinc-500">Campaign enrollment fees</p>
						</div>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">
							{formatCurrency(displayInvoice.subtotal)}
						</p>
					</div>
				</div>

				{/* Totals */}
				<div className="space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
					<div className="flex justify-between text-xs text-zinc-500">
						<span>Subtotal</span>
						<span>{formatCurrency(displayInvoice.subtotal)}</span>
					</div>
					<div className="flex justify-between text-xs text-zinc-500">
						<span>CGST @ 9%</span>
						<span>{formatCurrency(Math.round(displayInvoice.gstAmount / 2))}</span>
					</div>
					<div className="flex justify-between text-xs text-zinc-500">
						<span>SGST @ 9%</span>
						<span>{formatCurrency(Math.round(displayInvoice.gstAmount / 2))}</span>
					</div>
					<div className="flex justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
						<span className="text-sm font-medium text-zinc-900 dark:text-white">Total</span>
						<span className="text-base font-bold text-zinc-900 dark:text-white">
							{formatCurrency(displayInvoice.totalAmount)}
						</span>
					</div>
				</div>

				{/* Payment Status */}
				{displayInvoice.status === "paid" && (
					<div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-950/30">
						<CheckCircleIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
						<span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
							Paid via Wallet
						</span>
					</div>
				)}
			</DialogBody>

			<DialogActions className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
				<Button
					color="dark/zinc"
					onClick={handleDownloadPDF}
					disabled={generatePDF.isPending}
					className="w-full"
				>
					<ArrowDownTrayIcon className="size-4" />
					{generatePDF.isPending ? "Generating..." : "Download PDF"}
				</Button>
			</DialogActions>

			{/* Footer */}
			<div className="mt-4 text-center">
				<p className="text-xs text-zinc-400">Thank you for your business!</p>
				<p className="mt-0.5 text-xs text-zinc-400">support@hypedrive.in • hypedrive.in</p>
			</div>
		</Dialog>
	);
}

// =============================================================================
// INVOICES LIST PAGE
// =============================================================================

export function InvoicesList() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;

	const [search, setSearch] = useState("");
	const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

	const {
		data: invoices,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteInvoices(organizationId, {});

	// Filter invoices
	const filteredInvoices = useMemo(() => {
		let result = invoices;

		// Period filter
		if (periodFilter !== "all") {
			const now = new Date();
			const currentMonth = now.getMonth();
			const currentYear = now.getFullYear();

			if (periodFilter === "this_month") {
				result = result.filter((inv: Invoice) => {
					const d = new Date(inv.createdAt);
					return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
				});
			} else if (periodFilter === "last_month") {
				const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
				const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
				result = result.filter((inv: Invoice) => {
					const d = new Date(inv.createdAt);
					return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
				});
			} else if (periodFilter === "last_3_months") {
				const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
				result = result.filter((inv: Invoice) => new Date(inv.createdAt) >= threeMonthsAgo);
			}
		}

		// Search filter
		if (search) {
			result = result.filter((inv: Invoice) =>
				inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
			);
		}

		return result;
	}, [invoices, periodFilter, search]);

	// Calculate stats
	const stats = useMemo(
		() => ({
			count: filteredInvoices.length,
			totalAmount: filteredInvoices.reduce((acc: number, inv: Invoice) => acc + inv.totalAmount, 0),
			totalGst: filteredInvoices.reduce((acc: number, inv: Invoice) => acc + inv.gstAmount, 0),
			totalEnrollments: filteredInvoices.length,
		}),
		[filteredInvoices]
	);

	// Format compact currency
	const formatCompact = useCallback((amount: number) => {
		if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
		if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
		return `₹${amount}`;
	}, []);

	if (loading) {
		return <InvoicesSkeleton />;
	}

	if (error) {
		return <ErrorState onRetry={refetch} />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Heading>Invoices</Heading>
					<Text className="mt-1">Weekly billing records</Text>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				<StatCard
					label="Invoices"
					value={stats.count}
					icon={<DocumentTextIcon className="size-4" />}
				/>
				<StatCard
					label="Billed"
					value={formatCompact(stats.totalAmount)}
					icon={<CurrencyRupeeIcon className="size-4" />}
					variant="success"
				/>
				<StatCard
					label="GST"
					value={formatCompact(stats.totalGst)}
					icon={<ReceiptPercentIcon className="size-4" />}
					variant="warning"
				/>
				<StatCard
					label="Enrollments"
					value={stats.totalEnrollments}
					icon={<UserGroupIcon className="size-4" />}
					variant="info"
				/>
			</div>

			{/* Search + Filter Row */}
			<div className="flex items-center gap-3">
				<div className="relative w-52 shrink-0">
					<MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search invoices..."
						className="h-9 w-full rounded-lg bg-white pl-9 pr-8 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700 dark:focus:ring-white"
						aria-label="Search invoices"
					/>
					{search && (
						<button
							type="button"
							onClick={() => setSearch("")}
							className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700"
							aria-label="Clear search"
						>
							<XMarkIcon className="size-3.5" />
						</button>
					)}
				</div>

				{/* Period Pills */}
				<div className="min-w-0 flex-1 overflow-x-auto">
					<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
					{periodFilters.map((filter) => (
						<button
							key={filter.value}
							type="button"
							onClick={() => setPeriodFilter(filter.value)}
							className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
								periodFilter === filter.value
									? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
									: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
							}`}
						>
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
				<div className="rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 overflow-hidden dark:bg-zinc-900 dark:ring-white/10">
					<div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
						<span className="text-sm text-zinc-500">
							{filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? "s" : ""}
						</span>
					</div>
					<div className="p-3 sm:p-4">
						<div className="space-y-2">
							{filteredInvoices.map((inv: Invoice) => (
								<InvoiceRow key={inv.id} invoice={inv} onView={() => setSelectedInvoice(inv)} />
							))}
						</div>

						{/* Load More */}
						{hasMore && (
							<div className="flex justify-center pt-4">
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
				</div>
			)}

			{/* Invoice Detail Modal */}
			<InvoiceDetailModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
		</div>
	);
}
