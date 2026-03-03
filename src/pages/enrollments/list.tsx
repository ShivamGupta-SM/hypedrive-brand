import {
	ArrowPathIcon,
	CheckCircleIcon,
	ClockIcon,
	ExclamationCircleIcon,
	MagnifyingGlassIcon,
	Squares2X2Icon,
	TableCellsIcon,
	XCircleIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/button";
import { EnrollmentCardFull, getEnrollmentStatusConfig, isEnrollmentOverdue } from "@/components/enrollment-card";
import { Input, InputGroup } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { useCampaigns } from "@/features/campaigns/hooks";
import { useInfiniteEnrollments } from "@/features/enrollments/hooks";
import {
	useBulkApproveEnrollments,
	useBulkRejectEnrollments,
	useExportOrganizationEnrollments,
} from "@/features/enrollments/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand, db } from "@/lib/brand-client";
import { downloadCSV } from "@/lib/download";
import { showToast } from "@/lib/toast";

type Enrollment = brand.EnrollmentWithRelations;
type EnrollmentStatus = db.EnrollmentStatus;
type StatusFilter = "all" | EnrollmentStatus;

// =============================================================================
// EXPORT FUNCTIONALITY
// =============================================================================

function exportEnrollmentsToCSV(enrollments: Enrollment[], filename = "enrollments") {
	const headers = [
		"Order ID",
		"Status",
		"Campaign",
		"Shopper",
		"Platform",
		"Order Value",
		"Rebate %",
		"Rebate Amount",
		"Created At",
	];

	const rows = enrollments.map((e) => [
		e.orderId,
		getEnrollmentStatusConfig(e.status).label,
		e.campaignId,
		e.creatorId,
		e.platform?.name || "",
		String(e.orderValueDecimal),
		`${e.lockedBillRate}%`,
		String(e.lockedPlatformFeeDecimal),
		new Date(e.createdAt).toISOString(),
	]);

	downloadCSV(headers, rows, filename);
}

// =============================================================================
// BULK ACTIONS BAR
// =============================================================================

function BulkActionsBar({
	selectedCount,
	onApprove,
	onReject,
	onClear,
	isLoading,
}: {
	selectedCount: number;
	onApprove: () => void;
	onReject: () => void;
	onClear: () => void;
	isLoading: boolean;
}) {
	if (selectedCount === 0) return null;

	return (
		<div className="fixed inset-x-0 bottom-6 z-30 mx-auto flex w-max items-center gap-3 rounded-xl bg-zinc-900 px-4 py-2.5 text-white shadow-2xl ring-1 ring-white/10 dark:bg-white dark:text-zinc-900 dark:ring-zinc-900/10">
			<span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold tabular-nums dark:bg-zinc-900/20">
				{selectedCount}
			</span>
			<span className="text-sm font-medium">{selectedCount} selected</span>
			<div className="mx-1 h-5 w-px bg-white/20 dark:bg-zinc-900/10" />
			<div className="flex items-center gap-1.5">
				<Button color="emerald" onClick={onApprove} disabled={isLoading}>
					{isLoading ? (
						<ArrowPathIcon data-slot="icon" className="size-4 animate-spin" />
					) : (
						<CheckCircleIcon data-slot="icon" className="size-4" />
					)}
					Approve
				</Button>
				<Button color="red" onClick={onReject} disabled={isLoading}>
					<XCircleIcon data-slot="icon" className="size-4" />
					Reject
				</Button>
			</div>
			<button
				type="button"
				onClick={onClear}
				className="rounded-full p-1 hover:bg-white/10 dark:hover:bg-zinc-900/10"
				aria-label="Clear selection"
			>
				<XMarkIcon className="size-4" />
			</button>
		</div>
	);
}

// =============================================================================
// SKELETON LOADING
// =============================================================================

function EnrollmentsListSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header skeleton */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<div className="h-8 w-36 animate-pulse rounded-lg bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
					<div className="mt-2 h-4 w-48 animate-pulse rounded bg-zinc-200 skeleton-shimmer sm:w-56 dark:bg-zinc-800" />
				</div>
			</div>

			{/* Stats skeleton */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total", value: "" },
					{ name: "In Review", value: "" },
					{ name: "Approved", value: "" },
					{ name: "Rejected", value: "" },
				]}
				loading
				columns={4}
			/>

			{/* Search + Filters skeleton */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="h-9 w-full animate-pulse rounded-lg bg-zinc-200 skeleton-shimmer sm:w-52 dark:bg-zinc-800" />
				<div className="flex gap-2 overflow-x-auto">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-800"
						/>
					))}
				</div>
			</div>

			{/* Cards skeleton */}
			<div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
					>
						<div className="flex items-start gap-3 p-3 sm:p-4">
							<div className="size-11 shrink-0 animate-pulse rounded-lg bg-zinc-200 sm:size-12 dark:bg-zinc-700" />
							<div className="min-w-0 flex-1 space-y-2">
								<div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
								<div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
								<div className="h-3 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
							</div>
						</div>
						<div className="h-px bg-zinc-200 dark:bg-zinc-700" />
						<div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
							{[1, 2, 3].map((j) => (
								<div key={j} className="flex flex-col items-center gap-1 py-2.5">
									<div className="h-2.5 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
									<div className="h-3.5 w-14 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// FILTER TAB
// =============================================================================

function FilterTab({
	label,
	count,
	isActive,
	onClick,
	icon: Icon,
	iconColor,
}: {
	label: string;
	count: number;
	isActive: boolean;
	onClick: () => void;
	icon?: typeof CheckCircleIcon;
	iconColor?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ring-1 transition-all duration-200 active:scale-95 ${
				isActive
					? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
					: "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800"
			}`}
		>
			{Icon && <Icon className={`size-3.5 ${isActive ? "text-white dark:text-zinc-900" : iconColor || ""}`} />}
			{label}
			<span
				className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${isActive ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"}`}
			>
				{count}
			</span>
		</button>
	);
}

// =============================================================================
// ENROLLMENTS LIST
// =============================================================================

export function EnrollmentsList() {
	const { organizationId, orgSlug } = useOrgContext();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBulkLoading, setIsBulkLoading] = useState(false);

	// Campaign name lookup
	const { data: campaigns } = useCampaigns(organizationId, { take: 100 });
	const campaignNameMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const c of campaigns) {
			map.set(c.id, c.title);
		}
		return map;
	}, [campaigns]);

	// Bulk action mutations
	const bulkApprove = useBulkApproveEnrollments(organizationId);
	const bulkReject = useBulkRejectEnrollments(organizationId);
	const exportEnrollments = useExportOrganizationEnrollments(organizationId);

	// Map UI filter to API status
	const apiStatus = useMemo((): EnrollmentStatus | undefined => {
		if (statusFilter === "all") return undefined;
		return statusFilter;
	}, [statusFilter]);

	const {
		data: enrollments,
		loading,
		error,
		refetch,
		total,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteEnrollments(organizationId, {
		status: apiStatus,
	});

	// Filter enrollments locally (search)
	const filteredEnrollments = useMemo(() => {
		let result = [...enrollments];

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(enrollment) =>
					enrollment.displayId.toLowerCase().includes(query) ||
					enrollment.orderId.toLowerCase().includes(query) ||
					campaignNameMap.get(enrollment.campaignId)?.toLowerCase().includes(query)
			);
		}

		return result;
	}, [enrollments, searchQuery, campaignNameMap]);

	// Stats - count from current filtered or all enrollments
	const stats = useMemo(() => {
		const awaitingReview = enrollments.filter((e) => e.status === "awaiting_review").length;
		const approved = enrollments.filter((e) => e.status === "approved").length;
		const rejected = enrollments.filter((e) => e.status === "permanently_rejected").length;
		return { total: total || enrollments.length, awaitingReview, approved, rejected };
	}, [enrollments, total]);

	// Reference time for overdue calculation (stable during render)
	const referenceTime = useMemo(() => new Date(), []);

	// Count overdue enrollments
	const overdueCount = useMemo(() => {
		return enrollments.filter((e) => e.status === "awaiting_review" && isEnrollmentOverdue(e.createdAt, referenceTime))
			.length;
	}, [enrollments, referenceTime]);

	// Selection handlers
	const handleSelect = useCallback((id: string, selected: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (selected) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	}, []);

	const handleSelectAll = useCallback(() => {
		// Only select enrollments that can be actioned (awaiting_review)
		const actionableIds = filteredEnrollments.filter((e) => e.status === "awaiting_review").map((e) => e.id);

		if (selectedIds.size === actionableIds.length && actionableIds.length > 0) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(actionableIds));
		}
	}, [filteredEnrollments, selectedIds.size]);

	const clearSelection = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	// Bulk action handlers
	const handleBulkApprove = useCallback(async () => {
		if (selectedIds.size === 0) return;
		setIsBulkLoading(true);
		try {
			await bulkApprove.mutateAsync({ enrollmentIds: Array.from(selectedIds) });
			setSelectedIds(new Set());
			refetch();
		} catch (error) {
			console.error("Failed to approve enrollments:", error);
		} finally {
			setIsBulkLoading(false);
		}
	}, [selectedIds, bulkApprove, refetch]);

	const handleBulkReject = useCallback(async () => {
		if (selectedIds.size === 0) return;
		setIsBulkLoading(true);
		try {
			await bulkReject.mutateAsync({
				enrollmentIds: Array.from(selectedIds),
				reason: "Bulk rejected",
			});
			setSelectedIds(new Set());
			refetch();
		} catch (error) {
			console.error("Failed to reject enrollments:", error);
		} finally {
			setIsBulkLoading(false);
		}
	}, [selectedIds, bulkReject, refetch]);

	// Export handler — tries API export first, falls back to client-side CSV
	const handleExport = useCallback(async () => {
		try {
			const result = await exportEnrollments.mutateAsync({
				status: apiStatus,
			});
			// If the API returns a download URL, open it
			const url = (result as { url?: string })?.url;
			if (url) {
				window.open(url, "_blank");
				showToast.exported();
			} else {
				// Fallback to client-side export
				exportEnrollmentsToCSV(filteredEnrollments, "enrollments");
				showToast.exportedLocally();
			}
		} catch {
			// Fallback to client-side CSV on API failure
			exportEnrollmentsToCSV(filteredEnrollments, "enrollments");
			showToast.exportedLocally();
		}
	}, [exportEnrollments, apiStatus, filteredEnrollments]);

	const clearAllFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
	};

	if (loading) {
		return <EnrollmentsListSkeleton />;
	}

	if (error) {
		return <ErrorState message="Failed to load enrollments. Please try again." onRetry={refetch} />;
	}

	// Count actionable enrollments for select all
	const actionableCount = filteredEnrollments.filter((e) => e.status === "awaiting_review").length;

	return (
		<div className="space-y-5">
			{/* Header */}
			<PageHeader
				title="Enrollments"
				description="Review and manage campaign enrollments"
				actions={
					<Button
						color="emerald"
						onClick={handleExport}
						disabled={exportEnrollments.isPending}
						className="hidden shrink-0 sm:flex"
					>
						{exportEnrollments.isPending ? (
							<ArrowPathIcon className="size-4 animate-spin" />
						) : (
							<TableCellsIcon data-slot="icon" className="size-4" />
						)}
						{exportEnrollments.isPending ? "Exporting..." : "Export"}
					</Button>
				}
			/>

			{/* Overdue Alert */}
			{overdueCount > 0 && (
				<div className="flex items-center gap-3 rounded-xl bg-red-50 p-3 shadow-sm ring-1 ring-red-200 dark:bg-red-950/30 dark:ring-red-800">
					<div className="flex size-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
						<ExclamationCircleIcon className="size-4 text-red-600 dark:text-red-400" />
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium text-red-800 dark:text-red-200">
							{overdueCount} enrollment{overdueCount !== 1 ? "s" : ""} overdue
						</p>
						<p className="text-xs text-red-600 dark:text-red-400">Pending review for more than 48 hours</p>
					</div>
					<Button color="red" onClick={() => setStatusFilter("awaiting_review")} className="text-xs!">
						View
					</Button>
				</div>
			)}

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total", value: stats.total },
					{ name: "In Review", value: stats.awaitingReview },
					{ name: "Approved", value: stats.approved, changeType: "positive" },
					{ name: "Rejected", value: stats.rejected, changeType: "negative" },
				]}
				columns={4}
			/>

			{/* Search + Filter Row */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="w-full sm:w-52 sm:shrink-0">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by shopper, campaign..."
							aria-label="Search enrollments"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-4" />
							</button>
						)}
					</InputGroup>
				</div>

				{/* Tab Filters */}
				<div className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1 py-1">
					<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
						<FilterTab
							label="All"
							count={stats.total}
							isActive={statusFilter === "all"}
							onClick={() => setStatusFilter("all")}
							icon={Squares2X2Icon}
							iconColor="text-sky-500"
						/>
						<FilterTab
							label="Awaiting Review"
							count={stats.awaitingReview}
							isActive={statusFilter === "awaiting_review"}
							onClick={() => setStatusFilter("awaiting_review")}
							icon={ClockIcon}
							iconColor="text-amber-500"
						/>
						<FilterTab
							label="Approved"
							count={stats.approved}
							isActive={statusFilter === "approved"}
							onClick={() => setStatusFilter("approved")}
							icon={CheckCircleIcon}
							iconColor="text-emerald-500"
						/>
						<FilterTab
							label="Rejected"
							count={stats.rejected}
							isActive={statusFilter === "permanently_rejected"}
							onClick={() => setStatusFilter("permanently_rejected")}
							icon={XCircleIcon}
							iconColor="text-red-500"
						/>
					</div>
				</div>
			</div>

			{/* Active filter chips */}
			{(searchQuery || statusFilter !== "all") && (
				<div className="flex flex-wrap items-center gap-2">
					{searchQuery && (
						<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
							"{searchQuery}"
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="ml-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50"
								aria-label="Remove search filter"
							>
								<XMarkIcon className="size-3.5" />
							</button>
						</span>
					)}
					{statusFilter !== "all" && (
						<span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{getEnrollmentStatusConfig(statusFilter).label}
							<button
								type="button"
								onClick={() => setStatusFilter("all")}
								className="ml-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
								aria-label="Remove status filter"
							>
								<XMarkIcon className="size-3.5" />
							</button>
						</span>
					)}
					<button
						type="button"
						onClick={clearAllFilters}
						className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						Clear all
					</button>
				</div>
			)}

			{/* Enrollments List */}
			{filteredEnrollments.length === 0 ? (
				<EmptyState
					preset="enrollments"
					title={searchQuery || statusFilter !== "all" ? "No enrollments found" : "No enrollments yet"}
					description={
						searchQuery || statusFilter !== "all"
							? "Try adjusting your filters or search query"
							: "Enrollments will appear here when shoppers join your campaigns"
					}
					action={
						searchQuery || statusFilter !== "all" ? { label: "Clear filters", onClick: clearAllFilters } : undefined
					}
				/>
			) : (
				<div className="space-y-4">
					{/* Results header with Select All */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{actionableCount > 0 && (
								<button
									type="button"
									onClick={handleSelectAll}
									className="hidden items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:flex"
								>
									<span
										className={`flex size-4 items-center justify-center rounded border transition-colors ${
											selectedIds.size === actionableCount && actionableCount > 0
												? "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white"
												: "border-zinc-300 dark:border-zinc-600"
										}`}
									>
										{selectedIds.size === actionableCount && actionableCount > 0 && (
											<CheckCircleIcon className="size-3 text-white dark:text-zinc-900" />
										)}
									</span>
									Select all ({actionableCount})
								</button>
							)}
							<span className="text-xs text-zinc-400 dark:text-zinc-500">
								{filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""}
							</span>
						</div>
					</div>

					{/* Cards Grid */}
					<div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
						{filteredEnrollments.map((enrollment) => (
							<EnrollmentCardFull
								key={enrollment.id}
								enrollment={enrollment}
								orgSlug={orgSlug}
								isSelected={selectedIds.has(enrollment.id)}
								onSelect={enrollment.status === "awaiting_review" ? handleSelect : undefined}
								showOverdueAlert={
									enrollment.status === "awaiting_review" && isEnrollmentOverdue(enrollment.createdAt, referenceTime)
								}
								campaignName={campaignNameMap.get(enrollment.campaignId)}
							/>
						))}
					</div>

					{/* Load More */}
					{hasMore && (
						<div className="flex justify-center pt-2">
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

			{/* Floating Bulk Actions Bar */}
			<BulkActionsBar
				selectedCount={selectedIds.size}
				onApprove={handleBulkApprove}
				onReject={handleBulkReject}
				onClear={clearSelection}
				isLoading={isBulkLoading}
			/>
		</div>
	);
}
