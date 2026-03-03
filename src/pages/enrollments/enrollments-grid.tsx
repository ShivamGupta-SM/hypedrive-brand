import {
	ArrowPathIcon,
	CheckCircleIcon,
	TableCellsIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/button";
import { EnrollmentCardFull, getEnrollmentStatusConfig, isEnrollmentOverdue } from "@/components/enrollment-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
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

const enrollmentsRouteApi = getRouteApi("/_app/$orgSlug/enrollments");

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
					<XMarkIcon data-slot="icon" className="size-4" />
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
// GRID SKELETON
// =============================================================================

export function EnrollmentsGridSkeleton() {
	return (
		<div className="space-y-4">
			<div className="h-3 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
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
// ENROLLMENTS GRID
// =============================================================================

interface EnrollmentsGridProps {
	status?: db.EnrollmentStatus;
}

export function EnrollmentsGrid({ status }: EnrollmentsGridProps) {
	const { organizationId, orgSlug } = useOrgContext();
	const { q } = enrollmentsRouteApi.useSearch();

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

	const {
		data: enrollments,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteEnrollments(organizationId, {
		status,
	});

	// Client-side search
	const filteredEnrollments = useMemo(() => {
		let result = [...enrollments];

		if (q) {
			const query = q.toLowerCase();
			result = result.filter(
				(enrollment) =>
					enrollment.displayId.toLowerCase().includes(query) ||
					enrollment.orderId.toLowerCase().includes(query) ||
					campaignNameMap.get(enrollment.campaignId)?.toLowerCase().includes(query),
			);
		}

		return result;
	}, [enrollments, q, campaignNameMap]);

	// Reference time for overdue calculation (stable during render)
	const referenceTime = useMemo(() => new Date(), []);

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

	// Export handler
	const handleExport = useCallback(async () => {
		try {
			const result = await exportEnrollments.mutateAsync({
				status,
			});
			const url = (result as { url?: string })?.url;
			if (url) {
				window.open(url, "_blank");
				showToast.exported();
			} else {
				exportEnrollmentsToCSV(filteredEnrollments, "enrollments");
				showToast.exportedLocally();
			}
		} catch {
			exportEnrollmentsToCSV(filteredEnrollments, "enrollments");
			showToast.exportedLocally();
		}
	}, [exportEnrollments, status, filteredEnrollments]);

	const actionableCount = filteredEnrollments.filter((e) => e.status === "awaiting_review").length;

	if (loading) {
		return <EnrollmentsGridSkeleton />;
	}

	if (error) {
		return <ErrorState message="Failed to load enrollments. Please try again." onRetry={refetch} />;
	}

	return (
		<>
			{/* Enrollments List */}
			{filteredEnrollments.length === 0 ? (
				<EmptyState
					preset="enrollments"
					title={q ? "No enrollments found" : "No enrollments yet"}
					description={
						q
							? "Try adjusting your search query"
							: "Enrollments will appear here when shoppers join your campaigns"
					}
				/>
			) : (
				<div className="space-y-4">
					{/* Results header with Select All + Export */}
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
								{q && ` matching "${q}"`}
							</span>
						</div>
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
		</>
	);
}
