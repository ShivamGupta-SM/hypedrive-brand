import {
	ArrowPathIcon,
	ArrowsUpDownIcon,
	CalendarIcon,
	CheckCircleIcon,
	CurrencyRupeeIcon,
	ExclamationTriangleIcon,
	TableCellsIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { Textarea } from "@/components/textarea";
import { EnrollmentCardFull, getEnrollmentStatusConfig, isEnrollmentOverdue } from "@/components/enrollment-card";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterPills, type FilterPillOption } from "@/components/shared/filter-pills";
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

const sortPillOptions: FilterPillOption[] = [
	{ value: "newest", label: "Newest", icon: CalendarIcon, iconColor: "text-sky-500" },
	{ value: "oldest", label: "Oldest", icon: CalendarIcon, iconColor: "text-zinc-400" },
	{ value: "orderValue", label: "Order Value", icon: CurrencyRupeeIcon, iconColor: "text-emerald-500" },
	{ value: "status", label: "Status", icon: ArrowsUpDownIcon, iconColor: "text-violet-500" },
];

const sortMap = {
	newest: { sortBy: "createdAt" as const, sortOrder: "desc" as const },
	oldest: { sortBy: "createdAt" as const, sortOrder: "asc" as const },
	orderValue: { sortBy: "orderValue" as const, sortOrder: "desc" as const },
	status: { sortBy: "status" as const, sortOrder: "asc" as const },
};

interface EnrollmentsGridProps {
	status?: db.EnrollmentStatus;
}

export function EnrollmentsGrid({ status }: EnrollmentsGridProps) {
	const { organizationId, orgSlug } = useOrgContext();
	const { q } = enrollmentsRouteApi.useSearch();

	const [sortBy, setSortBy] = useState("newest");
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

	const activeSort = sortMap[sortBy as keyof typeof sortMap] || sortMap.newest;

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
		q: q || undefined,
		sortBy: activeSort.sortBy,
		sortOrder: activeSort.sortOrder,
	});

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

	const clearSelection = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	// Bulk approve dialog state
	const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);

	// Bulk reject dialog state
	const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
	const [bulkRejectReason, setBulkRejectReason] = useState("");

	// Bulk action handlers
	const handleBulkApproveRequest = useCallback(() => {
		if (selectedIds.size === 0) return;
		setShowBulkApproveDialog(true);
	}, [selectedIds.size]);

	const handleBulkApproveConfirm = useCallback(async () => {
		if (selectedIds.size === 0) return;
		setIsBulkLoading(true);
		try {
			await bulkApprove.mutateAsync({ enrollmentIds: Array.from(selectedIds) });
			showToast.success(`${selectedIds.size} enrollment${selectedIds.size > 1 ? "s" : ""} approved`);
			setSelectedIds(new Set());
			setShowBulkApproveDialog(false);
			refetch();
		} catch (err) {
			showToast.error(err, "Failed to approve enrollments");
		} finally {
			setIsBulkLoading(false);
		}
	}, [selectedIds, bulkApprove, refetch]);

	const handleBulkRejectRequest = useCallback(() => {
		if (selectedIds.size === 0) return;
		setBulkRejectReason("");
		setShowBulkRejectDialog(true);
	}, [selectedIds.size]);

	const handleBulkRejectConfirm = useCallback(async () => {
		if (selectedIds.size === 0) return;
		setIsBulkLoading(true);
		try {
			await bulkReject.mutateAsync({
				enrollmentIds: Array.from(selectedIds),
				reason: bulkRejectReason.trim() || "Rejected by brand",
			});
			showToast.success(`${selectedIds.size} enrollment${selectedIds.size > 1 ? "s" : ""} rejected`);
			setSelectedIds(new Set());
			setShowBulkRejectDialog(false);
			refetch();
		} catch (err) {
			showToast.error(err, "Failed to reject enrollments");
		} finally {
			setIsBulkLoading(false);
		}
	}, [selectedIds, bulkReject, bulkRejectReason, refetch]);

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
				exportEnrollmentsToCSV(enrollments, "enrollments");
				showToast.exportedLocally();
			}
		} catch {
			exportEnrollmentsToCSV(enrollments, "enrollments");
			showToast.exportedLocally();
		}
	}, [exportEnrollments, status, enrollments]);

	if (loading) {
		return <EnrollmentsGridSkeleton />;
	}

	if (error) {
		return <ErrorState message="Failed to load enrollments. Please try again." onRetry={refetch} />;
	}

	return (
		<div className="space-y-4">
			{/* Enrollments List */}
			{enrollments.length === 0 ? (
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
					{/* Toolbar: Sort + count + Export */}
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<FilterPills options={sortPillOptions} value={sortBy} onChange={setSortBy} />
							<span className="hidden text-xs text-zinc-500 sm:inline dark:text-zinc-400">
								{enrollments.length} enrollment{enrollments.length !== 1 ? "s" : ""}
								{q && ` matching "${q}"`}
							</span>
						</div>
						<Button
							color="emerald"
							onClick={handleExport}
							disabled={exportEnrollments.isPending}
							className="shrink-0"
						>
							{exportEnrollments.isPending ? (
								<ArrowPathIcon className="size-4 animate-spin" />
							) : (
								<TableCellsIcon data-slot="icon" className="size-4" />
							)}
							<span className="hidden sm:inline">{exportEnrollments.isPending ? "Exporting..." : "Export"}</span>
						</Button>
					</div>

					{/* Cards Grid */}
					<div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
						{enrollments.map((enrollment) => (
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
			<BulkActionsBar selectedCount={selectedIds.size} onClear={clearSelection}>
				<Button color="emerald" onClick={handleBulkApproveRequest} disabled={isBulkLoading}>
					{isBulkLoading ? (
						<ArrowPathIcon data-slot="icon" className="size-4 animate-spin" />
					) : (
						<CheckCircleIcon data-slot="icon" className="size-4" />
					)}
					Approve
				</Button>
				<Button color="red" onClick={handleBulkRejectRequest} disabled={isBulkLoading}>
					<XMarkIcon data-slot="icon" className="size-4" />
					Reject
				</Button>
			</BulkActionsBar>

			{/* Bulk Approve Confirmation Dialog */}
			<Dialog open={showBulkApproveDialog} onClose={() => setShowBulkApproveDialog(false)} size="sm">
				<DialogHeader
					icon={CheckCircleIcon}
					iconColor="emerald"
					title="Approve Enrollments"
					description={`Approve ${selectedIds.size} enrollment${selectedIds.size > 1 ? "s" : ""}?`}
					onClose={() => setShowBulkApproveDialog(false)}
				/>
				<DialogActions>
					<Button plain onClick={() => setShowBulkApproveDialog(false)} disabled={isBulkLoading}>
						Cancel
					</Button>
					<Button color="emerald" onClick={handleBulkApproveConfirm} disabled={isBulkLoading}>
						{isBulkLoading ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Approving...
							</>
						) : (
							<>
								<CheckCircleIcon className="size-4" />
								Approve
							</>
						)}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Bulk Reject Reason Dialog */}
			<Dialog open={showBulkRejectDialog} onClose={() => setShowBulkRejectDialog(false)} size="sm">
				<DialogHeader
					icon={ExclamationTriangleIcon}
					iconColor="red"
					title="Reject Enrollments"
					description={`Reject ${selectedIds.size} selected enrollment${selectedIds.size > 1 ? "s" : ""}?`}
					onClose={() => setShowBulkRejectDialog(false)}
				/>
				<DialogBody>
					<div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
						<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
						<p className="text-sm text-red-700 dark:text-red-300">
							This action is permanent. The creators will be notified immediately.
						</p>
					</div>
					<Field>
						<Label>Rejection reason</Label>
						<Textarea
							value={bulkRejectReason}
							onChange={(e) => setBulkRejectReason(e.target.value)}
							placeholder="e.g., Content does not meet campaign requirements..."
							rows={3}
						/>
					</Field>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setShowBulkRejectDialog(false)} disabled={isBulkLoading}>
						Cancel
					</Button>
					<Button color="red" onClick={handleBulkRejectConfirm} disabled={isBulkLoading}>
						{isBulkLoading ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Rejecting...
							</>
						) : (
							<>
								<XMarkIcon className="size-4" />
								Reject {selectedIds.size} enrollment{selectedIds.size > 1 ? "s" : ""}
							</>
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
