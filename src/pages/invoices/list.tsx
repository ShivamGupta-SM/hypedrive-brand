import {
	ArrowPathIcon,
	CalendarDaysIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyRupeeIcon,
	DocumentArrowDownIcon,
	DocumentTextIcon,
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Input, InputGroup } from "@/components/input";
import { Logo } from "@/components/logo";
import { PageHeader } from "@/components/page-header";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown, type FilterOption } from "@/components/shared/filter-dropdown";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { SelectionCheckbox } from "@/components/shared/selection-checkbox";
import { Skeleton } from "@/components/skeleton";
import { useInfiniteInvoices, useInvoice } from "@/features/invoices/hooks";
import { useBatchInvoices, useGenerateInvoicePDF } from "@/features/invoices/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand, db } from "@/lib/brand-client";
import { formatCurrency, formatDate, formatDateCompact } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";

type Invoice = brand.Invoice;

const invoicesRouteApi = getRouteApi("/_app/$orgSlug/invoices");

// =============================================================================
// STATUS CONFIG
// =============================================================================

const statusConfig: Record<
	string,
	{
		label: string;
		color: "emerald" | "amber" | "red" | "sky" | "zinc";
		dotClass: string;
		bgClass: string;
		iconText: string;
	}
> = {
	paid: {
		label: "Paid",
		color: "emerald",
		dotClass: "bg-emerald-500",
		bgClass: "bg-emerald-50 dark:bg-emerald-900/20",
		iconText: "text-emerald-500 dark:text-emerald-400",
	},
	sent: {
		label: "Sent",
		color: "sky",
		dotClass: "bg-sky-500",
		bgClass: "bg-sky-50 dark:bg-sky-900/20",
		iconText: "text-sky-500 dark:text-sky-400",
	},
	viewed: {
		label: "Viewed",
		color: "sky",
		dotClass: "bg-sky-500",
		bgClass: "bg-sky-50 dark:bg-sky-900/20",
		iconText: "text-sky-500 dark:text-sky-400",
	},
	draft: {
		label: "Draft",
		color: "zinc",
		dotClass: "bg-zinc-400",
		bgClass: "bg-zinc-100 dark:bg-zinc-800",
		iconText: "text-zinc-400 dark:text-zinc-500",
	},
	unpaid: {
		label: "Unpaid",
		color: "amber",
		dotClass: "bg-amber-500",
		bgClass: "bg-amber-50 dark:bg-amber-900/20",
		iconText: "text-amber-500 dark:text-amber-400",
	},
	partially_paid: {
		label: "Partial",
		color: "amber",
		dotClass: "bg-amber-500",
		bgClass: "bg-amber-50 dark:bg-amber-900/20",
		iconText: "text-amber-500 dark:text-amber-400",
	},
	overdue: {
		label: "Overdue",
		color: "red",
		dotClass: "bg-red-500",
		bgClass: "bg-red-50 dark:bg-red-900/20",
		iconText: "text-red-500 dark:text-red-400",
	},
	cancelled: {
		label: "Cancelled",
		color: "zinc",
		dotClass: "bg-zinc-400",
		bgClass: "bg-zinc-100 dark:bg-zinc-800",
		iconText: "text-zinc-400 dark:text-zinc-500",
	},
};

function getStatusConfig(status: string) {
	return statusConfig[status] || statusConfig.draft;
}

function InvoiceStatusBadge({ status }: { status: string }) {
	const cfg = getStatusConfig(status);
	return (
		<Badge color={cfg.color}>
			<span className={clsx("size-1.5 rounded-full", cfg.dotClass)} />
			{cfg.label}
		</Badge>
	);
}

// =============================================================================
// FILTER OPTIONS
// =============================================================================

const periodFilterOptions: FilterOption[] = [
	{ value: "all", label: "All", icon: CalendarIcon, iconColor: "text-sky-500" },
	{ value: "this_month", label: "This Month", icon: CalendarIcon, iconColor: "text-emerald-500" },
	{ value: "last_month", label: "Last Month", icon: CalendarDaysIcon, iconColor: "text-amber-500" },
	{ value: "last_3_months", label: "3 Months", icon: CalendarDaysIcon, iconColor: "text-violet-500" },
];

const invoiceSortOptions: FilterOption[] = [
	{ value: "newest", label: "Newest", icon: CalendarIcon, iconColor: "text-sky-500" },
	{ value: "oldest", label: "Oldest", icon: CalendarIcon, iconColor: "text-zinc-400" },
	{ value: "amount", label: "Amount", icon: CurrencyRupeeIcon, iconColor: "text-emerald-500" },
];

const statusOptions: FilterOption[] = [
	{ value: "all", label: "All", icon: DocumentTextIcon },
	{ value: "unpaid", label: "Unpaid", icon: ClockIcon, iconColor: "text-amber-500" },
	{ value: "paid", label: "Paid", icon: CheckCircleIcon, iconColor: "text-emerald-500" },
	{ value: "overdue", label: "Overdue", icon: ExclamationTriangleIcon, iconColor: "text-red-500" },
];

// =============================================================================
// LOADING SKELETON
// =============================================================================

function InvoicesSkeleton() {
	const skeletonStats = [
		{ name: "Total Billed", value: "" },
		{ name: "Paid", value: "" },
		{ name: "Outstanding", value: "" },
		{ name: "Overdue", value: "" },
	];

	return (
		<div className="animate-fade-in space-y-5">
			<div className="flex items-start justify-between gap-4">
				<div>
					<Skeleton width={130} height={28} borderRadius={8} />
					<Skeleton width={220} height={14} borderRadius={6} className="mt-2" />
				</div>
			</div>

			<FinancialStatsGridBordered stats={skeletonStats} loading columns={4} />

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Skeleton height={40} borderRadius={8} containerClassName="w-full sm:w-64" />
				<div className="flex gap-2">
					<Skeleton width={90} height={32} borderRadius={8} />
					<Skeleton width={90} height={32} borderRadius={8} />
					<Skeleton width={80} height={32} borderRadius={8} />
				</div>
			</div>

			{/* List skeleton */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
					<Skeleton width={18} height={18} borderRadius={4} />
					<Skeleton width={80} height={14} borderRadius={4} />
				</div>
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-800"
					>
						<Skeleton width={18} height={18} borderRadius={4} />
						<Skeleton width={32} height={32} borderRadius={8} />
						<div className="min-w-0 flex-1 space-y-1.5">
							<Skeleton width={120} height={14} borderRadius={4} />
							<Skeleton width={180} height={10} borderRadius={4} />
						</div>
						<div className="space-y-1.5 text-right">
							<Skeleton width={80} height={14} borderRadius={4} />
							<Skeleton width={50} height={10} borderRadius={4} />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// INVOICE DETAIL DIALOG
// =============================================================================

function InvoiceDetailDialog({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
	const { organization } = useOrgContext();
	const canDownload = useCan("invoice", "download");
	const generatePDF = useGenerateInvoicePDF(organization?.id);
	const { data: freshInvoice } = useInvoice(organization?.id, invoice?.id);
	const inv = freshInvoice ?? invoice;

	const handleDownloadPDF = async () => {
		if (!inv) return;
		try {
			if (inv.pdfUrl) {
				window.open(inv.pdfUrl, "_blank");
			} else {
				const result = await generatePDF.mutateAsync(inv.id);
				if (result.pdfUrl) {
					window.open(result.pdfUrl, "_blank");
					showToast.fileGenerated("Invoice PDF");
				}
			}
		} catch (err) {
			showToast.error(err, "Failed to download PDF");
		}
	};

	if (!inv) return null;

	const orgName = organization?.name || "Organization";
	const subtotal = parseFloat(inv.subtotalDecimal || "0");
	const gst = parseFloat(inv.gstAmountDecimal || "0");
	const tds = parseFloat(inv.tdsAmountDecimal || "0");
	const halfGst = gst / 2;
	const isPaid = inv.status === "paid";
	const isOverdue = inv.status === "overdue";

	return (
		<Dialog open={!!inv} onClose={onClose} size="2xl">
			<DialogHeader
				icon={DocumentTextIcon}
				iconColor={isPaid ? "emerald" : isOverdue ? "red" : "zinc"}
				title={`Invoice ${inv.invoiceNumber}`}
				description={`Issued ${formatDate(inv.issuedAt || inv.createdAt)}${inv.dueDate ? ` · Due ${formatDate(inv.dueDate)}` : ""}`}
				onClose={onClose}
			/>

			<div className="mt-3 flex items-center gap-2">
				<InvoiceStatusBadge status={inv.status} />
				{inv.enrollmentCount > 0 && (
					<span className="text-xs text-zinc-500 dark:text-zinc-400">
						{inv.enrollmentCount} enrollment{inv.enrollmentCount !== 1 ? "s" : ""}
					</span>
				)}
			</div>

			<DialogBody className="space-y-5 sm:space-y-6">
				{/* FROM / TO */}
				<div className="grid grid-cols-2 gap-4 sm:gap-6">
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">From</p>
						<Logo className="mt-1.5 h-5 w-auto text-zinc-900 dark:text-white" />
						<p className="mt-1 text-[11px] leading-relaxed text-zinc-500 sm:text-xs dark:text-zinc-400">
							Hypedrive Technologies Pvt. Ltd.
							<br />
							support@hypedrive.in
						</p>
					</div>
					<div>
						<p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
							Bill To
						</p>
						<p className="mt-1.5 text-sm font-semibold text-zinc-900 dark:text-white">{orgName}</p>
						<p className="mt-0.5 text-[11px] text-zinc-500 sm:text-xs dark:text-zinc-400">Organization</p>
					</div>
				</div>

				{/* METADATA GRID */}
				<div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-zinc-200 ring-1 ring-zinc-200 sm:grid-cols-4 dark:bg-zinc-700 dark:ring-zinc-700">
					{[
						{ label: "Issue Date", value: formatDate(inv.issuedAt || inv.createdAt) },
						{ label: "Due Date", value: formatDate(inv.dueDate), danger: isOverdue },
						{
							label: "Period",
							value: `${formatDateCompact(inv.periodStart ?? "")} – ${formatDateCompact(inv.periodEnd ?? "")}`,
							nowrap: true,
						},
						{ label: "Enrollments", value: String(inv.enrollmentCount) },
					].map((item) => (
						<div key={item.label} className="bg-white px-3 py-2.5 sm:px-4 sm:py-3 dark:bg-zinc-900">
							<p className="text-[9px] font-medium uppercase tracking-wider text-zinc-400 sm:text-[10px] dark:text-zinc-500">
								{item.label}
							</p>
							<p
								className={clsx(
									"mt-0.5 text-xs font-medium sm:text-sm",
									item.nowrap && "whitespace-nowrap",
									item.danger ? "text-red-600 dark:text-red-400" : "text-zinc-900 dark:text-white"
								)}
							>
								{item.value}
							</p>
						</div>
					))}
				</div>

				{/* LINE ITEMS — mobile stacked */}
				<div className="space-y-2 sm:hidden">
					<p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
						Line Items
					</p>
					{inv.lineItems && inv.lineItems.length > 0 ? (
						inv.lineItems.map((item) => (
							<div
								key={item.id}
								className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2.5 dark:border-zinc-800"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm text-zinc-900 dark:text-white">{item.description}</p>
									<p className="text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
										{item.quantity} &times; {formatCurrency(item.rateDecimal)}
									</p>
								</div>
								<p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
									{formatCurrency(item.amountDecimal)}
								</p>
							</div>
						))
					) : (
						<div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
							<div>
								<p className="text-sm text-zinc-900 dark:text-white">Campaign Enrollments</p>
								<p className="text-[11px] text-zinc-500 dark:text-zinc-400">
									{inv.enrollmentCount} enrollment{inv.enrollmentCount !== 1 ? "s" : ""}
								</p>
							</div>
							<p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
								{formatCurrency(inv.subtotalDecimal)}
							</p>
						</div>
					)}
				</div>

				{/* LINE ITEMS — desktop table */}
				<div className="hidden sm:block">
					<table className="w-full">
						<thead>
							<tr className="border-b-2 border-zinc-200 dark:border-zinc-700">
								<th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
									Description
								</th>
								<th className="whitespace-nowrap pb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
									Qty
								</th>
								<th className="whitespace-nowrap pb-2 pl-4 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
									Rate
								</th>
								<th className="whitespace-nowrap pb-2 pl-4 text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
									Amount
								</th>
							</tr>
						</thead>
						<tbody>
							{inv.lineItems && inv.lineItems.length > 0 ? (
								inv.lineItems.map((item, idx) => (
									<tr key={item.id} className={clsx(idx > 0 && "border-t border-zinc-100 dark:border-zinc-800")}>
										<td className="py-2.5 pr-4 text-sm text-zinc-900 dark:text-white">{item.description}</td>
										<td className="whitespace-nowrap py-2.5 text-center text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
											{item.quantity}
										</td>
										<td className="whitespace-nowrap py-2.5 pl-4 text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
											{formatCurrency(item.rateDecimal)}
										</td>
										<td className="whitespace-nowrap py-2.5 pl-4 text-right text-sm font-medium tabular-nums text-zinc-900 dark:text-white">
											{formatCurrency(item.amountDecimal)}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td className="py-2.5 pr-4">
										<p className="text-sm text-zinc-900 dark:text-white">Campaign Enrollments</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											{inv.enrollmentCount} enrollment{inv.enrollmentCount !== 1 ? "s" : ""}
										</p>
									</td>
									<td className="whitespace-nowrap py-2.5 text-center text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
										{inv.enrollmentCount}
									</td>
									<td className="whitespace-nowrap py-2.5 pl-4 text-right text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
										—
									</td>
									<td className="whitespace-nowrap py-2.5 pl-4 text-right text-sm font-medium tabular-nums text-zinc-900 dark:text-white">
										{formatCurrency(inv.subtotalDecimal)}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{/* TOTALS */}
				<div className="flex justify-end">
					<div className="w-full sm:max-w-xs">
						<div className="space-y-1.5 border-t border-zinc-200 pt-3 dark:border-zinc-700">
							<TotalRow label="Subtotal" value={formatCurrency(subtotal)} />
							{halfGst > 0 && (
								<>
									<TotalRow label={`CGST @ ${inv.gstRate / 2}%`} value={formatCurrency(halfGst)} />
									<TotalRow label={`SGST @ ${inv.gstRate / 2}%`} value={formatCurrency(halfGst)} />
								</>
							)}
							{tds > 0 && (
								<TotalRow
									label={`TDS @ ${inv.tdsRate}%`}
									value={`-${formatCurrency(tds)}`}
									className="text-red-600 dark:text-red-400"
								/>
							)}
						</div>
						<div className="mt-2 flex items-baseline justify-between border-t-2 border-zinc-900 pt-2 dark:border-white">
							<span className="text-sm font-bold text-zinc-900 dark:text-white">Total Due</span>
							<span className="text-base font-bold tabular-nums text-zinc-900 sm:text-lg dark:text-white">
								{formatCurrency(inv.totalAmountDecimal)}
							</span>
						</div>
						{inv.amountPaid > 0 && !isPaid && (
							<div className="mt-2 space-y-1">
								<TotalRow
									label="Amount Paid"
									value={`-${formatCurrency(inv.amountPaidDecimal)}`}
									className="text-emerald-600 dark:text-emerald-400"
								/>
								<div className="flex justify-between rounded-md bg-amber-50 px-2 py-1 dark:bg-amber-950/20">
									<span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Balance Due</span>
									<span className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">
										{formatCurrency(parseFloat(inv.totalAmountDecimal) - parseFloat(inv.amountPaidDecimal))}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* STATUS BANNERS */}
				{isPaid && (
					<div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
						<CheckCircleIcon className="size-4 text-emerald-600 sm:size-5 dark:text-emerald-400" />
						<div>
							<p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Payment Received</p>
							{inv.paidAt && (
								<p className="text-[11px] text-emerald-600/80 sm:text-xs dark:text-emerald-400/70">
									Paid on {formatDate(inv.paidAt)}
								</p>
							)}
						</div>
					</div>
				)}
				{isOverdue && (
					<div className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 dark:border-red-800/40 dark:bg-red-950/20">
						<ExclamationTriangleIcon className="size-4 text-red-500 sm:size-5 dark:text-red-400" />
						<div>
							<p className="text-sm font-medium text-red-700 dark:text-red-300">Payment Overdue</p>
							<p className="text-[11px] text-red-600/80 sm:text-xs dark:text-red-400/70">
								Was due on {formatDate(inv.dueDate)}
							</p>
						</div>
					</div>
				)}

				{inv.notes && (
					<div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30">
						<p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
							Notes
						</p>
						<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{inv.notes}</p>
					</div>
				)}
			</DialogBody>

			<DialogActions>
				<p className="mr-auto hidden text-xs text-zinc-400 sm:block dark:text-zinc-500">support@hypedrive.in</p>
				<Button plain onClick={onClose}>
					Close
				</Button>
				{canDownload && (
					<Button color="dark/zinc" onClick={handleDownloadPDF} disabled={generatePDF.isPending}>
						{generatePDF.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								<span className="hidden sm:inline">Generating...</span>
							</>
						) : (
							<>
								<DocumentArrowDownIcon data-slot="icon" className="size-4" />
								<span className="hidden sm:inline">Download PDF</span>
								<span className="sm:hidden">PDF</span>
							</>
						)}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
}

function TotalRow({ label, value, className }: { label: string; value: string; className?: string }) {
	return (
		<div className={clsx("flex justify-between text-xs sm:text-sm", className || "text-zinc-500 dark:text-zinc-400")}>
			<span>{label}</span>
			<span className="tabular-nums">{value}</span>
		</div>
	);
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export function InvoicesList() {
	const { organizationId } = useOrgContext();
	const navigate = useNavigate();
	const { q, sort, period, status } = invoicesRouteApi.useSearch();

	const searchQuery = q || "";
	const sortBy = sort || "newest";
	const periodFilter = period || "all";
	const statusFilter = (status as string) || "all";

	// Debounced search
	const [localSearch, setLocalSearch] = useState(searchQuery);
	const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const updateSearch = useCallback(
		(value: string) => {
			setLocalSearch(value);
			clearTimeout(searchTimerRef.current);
			searchTimerRef.current = setTimeout(() => {
				navigate({ search: ((prev: Record<string, unknown>) => ({ ...prev, q: value || undefined })) as never });
			}, 300);
		},
		[navigate]
	);

	const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

	// Selection
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchLoading, setIsBatchLoading] = useState(false);
	const batchInvoices = useBatchInvoices();
	const generatePDF = useGenerateInvoicePDF(organizationId);

	const toggleSelect = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);
	const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

	// Period date range
	const periodDateRange = useMemo(() => {
		if (periodFilter === "all") return {};
		const now = new Date();
		const y = now.getFullYear();
		const m = now.getMonth();
		if (periodFilter === "this_month")
			return {
				issuedDateFrom: new Date(y, m, 1).toISOString(),
				issuedDateTo: new Date(y, m + 1, 0, 23, 59, 59).toISOString(),
			};
		if (periodFilter === "last_month")
			return {
				issuedDateFrom: new Date(y, m - 1, 1).toISOString(),
				issuedDateTo: new Date(y, m, 0, 23, 59, 59).toISOString(),
			};
		return { issuedDateFrom: new Date(y, m - 3, 1).toISOString() };
	}, [periodFilter]);

	// Sort
	const sortMapping: Record<
		string,
		{ sortBy?: "createdAt" | "issuedAt" | "dueDate" | "totalAmount"; sortOrder?: "asc" | "desc" }
	> = {
		newest: { sortBy: "createdAt", sortOrder: "desc" },
		oldest: { sortBy: "createdAt", sortOrder: "asc" },
		amount: { sortBy: "totalAmount", sortOrder: "desc" },
	};

	const {
		data: invoices,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteInvoices(organizationId, {
		q: searchQuery || undefined,
		status: statusFilter !== "all" ? (statusFilter as db.InvoiceStatus) : undefined,
		...periodDateRange,
		...(sortMapping[sortBy] || sortMapping.newest),
	});

	// Computed stats
	const stats = useMemo(() => {
		const totalBilled = invoices.reduce((s, i) => s + parseFloat(i.totalAmountDecimal || "0"), 0);
		const paid = invoices
			.filter((i) => i.status === "paid")
			.reduce((s, i) => s + parseFloat(i.totalAmountDecimal || "0"), 0);
		const outstanding = invoices
			.filter((i) => i.status !== "paid" && i.status !== "cancelled" && i.status !== "draft")
			.reduce((s, i) => s + parseFloat(i.totalAmountDecimal || "0"), 0);
		const overdueAmount = invoices
			.filter((i) => i.status === "overdue")
			.reduce((s, i) => s + parseFloat(i.totalAmountDecimal || "0"), 0);
		return { totalBilled, paid, outstanding, overdueAmount };
	}, [invoices]);

	// Status counts
	const statusCounts = useMemo(() => {
		const counts: Record<string, number> = { all: invoices.length, unpaid: 0, paid: 0, overdue: 0 };
		for (const inv of invoices) {
			if (inv.status === "paid") counts.paid++;
			else if (inv.status === "overdue") counts.overdue++;
			else if (inv.status !== "cancelled" && inv.status !== "draft") counts.unpaid++;
		}
		return counts;
	}, [invoices]);

	// Select all
	const allSelected = invoices.length > 0 && invoices.every((inv) => selectedIds.has(inv.id));
	const toggleSelectAll = useCallback(() => {
		setSelectedIds(allSelected ? new Set() : new Set(invoices.map((inv) => inv.id)));
	}, [allSelected, invoices]);

	// Batch
	const handleBatchAction = useCallback(
		async (action: "mark_paid") => {
			if (!organizationId || selectedIds.size === 0) return;
			setIsBatchLoading(true);
			try {
				await batchInvoices.mutateAsync({ organizationId, action, invoiceIds: Array.from(selectedIds) });
				showToast.success(`${selectedIds.size} invoice${selectedIds.size > 1 ? "s" : ""} marked as paid`);
				setSelectedIds(new Set());
				refetch();
			} catch (err) {
				showToast.error(err, "Failed to update invoices");
			} finally {
				setIsBatchLoading(false);
			}
		},
		[organizationId, selectedIds, batchInvoices, refetch]
	);

	const hasFilters = searchQuery || periodFilter !== "all" || sortBy !== "newest" || statusFilter !== "all";
	const clearFilters = () => {
		setLocalSearch("");
		navigate({ search: {} as never });
	};

	const setParam = useCallback(
		(key: string, value: string | undefined) => {
			navigate({ search: ((prev: Record<string, unknown>) => ({ ...prev, [key]: value })) as never });
		},
		[navigate]
	);

	if (loading) return <InvoicesSkeleton />;
	if (error) return <ErrorState message="Failed to load invoices. Please try again." onRetry={refetch} />;

	const statsItems = [
		{ name: "Total Billed", value: formatCurrency(stats.totalBilled) },
		{
			name: "Paid",
			value: formatCurrency(stats.paid),
			change: stats.totalBilled > 0 ? `${Math.round((stats.paid / stats.totalBilled) * 100)}%` : undefined,
			changeType: "positive" as const,
		},
		{
			name: "Outstanding",
			value: formatCurrency(stats.outstanding),
			change: stats.outstanding > 0 ? `${statusCounts.unpaid} pending` : undefined,
			changeType: "neutral" as const,
		},
		{
			name: "Overdue",
			value: formatCurrency(stats.overdueAmount),
			change:
				statusCounts.overdue > 0
					? `${statusCounts.overdue} invoice${statusCounts.overdue !== 1 ? "s" : ""}`
					: undefined,
			changeType: stats.overdueAmount > 0 ? ("negative" as const) : ("neutral" as const),
		},
	];

	return (
		<div className="space-y-5">
			<PageHeader title="Invoices" description="Billing records and payment history" />

			<FinancialStatsGridBordered stats={statsItems} columns={4} />

			{/* Toolbar */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="w-full sm:w-64 sm:shrink-0">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="text"
							value={localSearch}
							onChange={(e) => updateSearch(e.target.value)}
							placeholder="Search invoices..."
							aria-label="Search invoices"
						/>
						{localSearch && (
							<button
								type="button"
								onClick={() => updateSearch("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-4" />
							</button>
						)}
					</InputGroup>
				</div>

				<div className="flex items-center gap-2">
					<FilterDropdown
						label="Status"
						options={statusOptions}
						value={statusFilter}
						onChange={(v) => setParam("status", v === "all" ? undefined : v)}
					/>
					<FilterDropdown
						label="Period"
						options={periodFilterOptions}
						value={periodFilter}
						onChange={(v) => setParam("period", v === "all" ? undefined : v)}
					/>
					<FilterDropdown
						label="Sort"
						options={invoiceSortOptions}
						value={sortBy}
						onChange={(v) => setParam("sort", v === "newest" ? undefined : v)}
					/>
					{hasFilters && (
						<button
							type="button"
							onClick={clearFilters}
							className="shrink-0 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
						>
							Clear
						</button>
					)}
				</div>
			</div>

			{/* Content */}
			{invoices.length === 0 ? (
				<EmptyState
					preset="generic"
					title={hasFilters ? "No invoices found" : "No invoices yet"}
					description={
						hasFilters
							? "Try adjusting your filters or search query"
							: "Invoices will appear here once billing cycles complete"
					}
					action={hasFilters ? { label: "Clear filters", onClick: clearFilters } : undefined}
				/>
			) : (
				<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
					{/* List header */}
					<div className="flex items-center justify-between border-b border-zinc-200 py-3 pl-3 pr-4 dark:border-zinc-800">
						<div className="flex items-center gap-3">
							<SelectionCheckbox
								variant="inline"
								selected={allSelected}
								indeterminate={!allSelected && selectedIds.size > 0}
								onToggle={toggleSelectAll}
							/>
							<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
								Invoices
								<span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">{invoices.length}</span>
							</h3>
						</div>
					</div>

					{/* Invoice rows */}
					<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
						{invoices.map((inv) => {
							const cfg = getStatusConfig(inv.status);
							const selected = selectedIds.has(inv.id);
							return (
								<div
									key={inv.id}
									className={clsx(
										"group flex w-full items-center gap-0 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
										selected && "bg-emerald-50/30 dark:bg-emerald-950/10"
									)}
								>
									<div className="flex shrink-0 items-center pl-3">
										<SelectionCheckbox
											variant="inline"
											selected={selected}
											onToggle={(e) => {
												e.stopPropagation();
												toggleSelect(inv.id);
											}}
										/>
									</div>
									<button
										type="button"
										onClick={() => setViewingInvoice(inv)}
										className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
									>
										<div className={clsx("flex size-8 shrink-0 items-center justify-center rounded-lg", cfg.bgClass)}>
											<DocumentTextIcon className={clsx("size-4", cfg.iconText)} />
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<p className="truncate font-mono text-sm font-medium text-zinc-900 dark:text-white">
													{inv.invoiceNumber}
												</p>
												<InvoiceStatusBadge status={inv.status} />
											</div>
											<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
												{formatDateCompact(inv.periodStart ?? "")} – {formatDateCompact(inv.periodEnd ?? "")}
												{inv.enrollmentCount > 0 && (
													<span className="ml-1.5 text-zinc-400 dark:text-zinc-500">
														&middot; {inv.enrollmentCount} enrollment{inv.enrollmentCount !== 1 ? "s" : ""}
													</span>
												)}
											</p>
										</div>
										<div className="shrink-0 text-right">
											<p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
												{formatCurrency(inv.totalAmountDecimal)}
											</p>
											<p className="text-[10px] tabular-nums text-zinc-500 dark:text-zinc-400">
												GST {formatCurrency(inv.gstAmountDecimal)}
											</p>
										</div>
									</button>
								</div>
							);
						})}
					</div>

					{/* Load more */}
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

			{/* Bulk actions */}
			<BulkActionsBar selectedCount={selectedIds.size} onClear={clearSelection}>
				<Button color="emerald" onClick={() => handleBatchAction("mark_paid")} disabled={isBatchLoading}>
					<CheckCircleIcon data-slot="icon" className="size-4" />
					<span className="hidden sm:inline">Mark Paid</span>
					<span className="sm:hidden">Paid</span>
				</Button>
				<Button
					color="dark/zinc"
					onClick={async () => {
						const selected = invoices.filter((inv) => selectedIds.has(inv.id));
						if (selected.length === 0) return;
						setIsBatchLoading(true);
						let downloaded = 0;
						try {
							for (const inv of selected) {
								if (inv.pdfUrl) {
									window.open(inv.pdfUrl, "_blank");
									downloaded++;
								} else {
									try {
										const result = await generatePDF.mutateAsync(inv.id);
										if (result.pdfUrl) {
											window.open(result.pdfUrl, "_blank");
											downloaded++;
										}
									} catch {
										/* skip */
									}
								}
							}
							if (downloaded > 0) showToast.success(`Downloaded ${downloaded} PDF${downloaded !== 1 ? "s" : ""}`);
						} finally {
							setIsBatchLoading(false);
						}
					}}
					disabled={isBatchLoading || generatePDF.isPending}
				>
					<DocumentArrowDownIcon data-slot="icon" className="size-4" />
					<span className="hidden sm:inline">{isBatchLoading ? "Downloading..." : "Download PDFs"}</span>
					<span className="sm:hidden">PDFs</span>
				</Button>
			</BulkActionsBar>

			{/* Detail dialog */}
			<InvoiceDetailDialog invoice={viewingInvoice} onClose={() => setViewingInvoice(null)} />
		</div>
	);
}
