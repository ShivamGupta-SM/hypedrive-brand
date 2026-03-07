import {
	ArchiveBoxIcon,
	ArrowPathIcon,
	ArrowsUpDownIcon,
	CalendarIcon,
	ExclamationTriangleIcon,
	PauseIcon,
	PlayIcon,
	TableCellsIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { SelectionCheckbox } from "@/components/shared/selection-checkbox";
import { FilterDropdown, type FilterOption } from "@/components/shared/filter-dropdown";
import { Skeleton } from "@/components/skeleton";
import { useInfiniteCampaigns } from "@/features/campaigns/hooks";
import {
	useBatchCampaigns,
	useCancelCampaign,
	useDuplicateCampaign,
	useExportCampaigns,
	usePauseCampaign,
	useResumeCampaign,
} from "@/features/campaigns/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import type { db } from "@/lib/brand-client";
import { downloadExcel } from "@/lib/download";
import { showToast } from "@/lib/toast";
import { CampaignCard, CampaignCardSkeleton } from "./campaign-card";

const campaignsRouteApi = getRouteApi("/_app/$orgSlug/campaigns");

// =============================================================================
// GRID SKELETON
// =============================================================================

export function CampaignsGridSkeleton() {
	return (
		<div className="space-y-6">
			<div>
				<Skeleton width={110} height={14} />
			</div>
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<CampaignCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

// =============================================================================
// CAMPAIGNS GRID
// =============================================================================

interface CampaignsGridProps {
	status?: db.CampaignStatus;
}

const sortOptions: FilterOption[] = [
	{ value: "newest", label: "Newest", icon: CalendarIcon, iconColor: "text-sky-500" },
	{ value: "oldest", label: "Oldest", icon: CalendarIcon, iconColor: "text-zinc-400" },
	{ value: "title", label: "Title A-Z", icon: ArrowsUpDownIcon, iconColor: "text-violet-500" },
	{ value: "startDate", label: "Start Date", icon: CalendarIcon, iconColor: "text-emerald-500" },
];

const sortMap = {
	newest: { sortBy: "createdAt" as const, sortOrder: "desc" as const },
	oldest: { sortBy: "createdAt" as const, sortOrder: "asc" as const },
	title: { sortBy: "title" as const, sortOrder: "asc" as const },
	startDate: { sortBy: "startDate" as const, sortOrder: "desc" as const },
};

export function CampaignsGrid({ status }: CampaignsGridProps) {
	const { organizationId, orgSlug } = useOrgContext();
	const { q, sort } = campaignsRouteApi.useSearch();
	const navigate = useNavigate();
	const sortBy = sort || "newest";

	const canCreate = useCan("campaign", "create");
	const canDelete = useCan("campaign", "delete");
	const canPause = useCan("campaign", "pause");
	const canResume = useCan("campaign", "resume");
	const [actionPendingId, setActionPendingId] = useState<string | null>(null);
	const [cancelConfirm, setCancelConfirm] = useState<{ id: string; title: string } | null>(null);

	// Campaign action mutations
	const pauseCampaign = usePauseCampaign();
	const resumeCampaign = useResumeCampaign();
	const cancelCampaign = useCancelCampaign();
	const duplicateCampaign = useDuplicateCampaign();
	const batchCampaigns = useBatchCampaigns();
	const exportCampaigns = useExportCampaigns(organizationId);

	// Batch selection state
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchLoading, setIsBatchLoading] = useState(false);

	const toggleSelect = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	}, []);

	const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

	const activeSort = sortMap[sortBy as keyof typeof sortMap] || sortMap.newest;

	const {
		data: campaigns,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteCampaigns(organizationId, {
		status,
		q: q || undefined,
		sortBy: activeSort.sortBy,
		sortOrder: activeSort.sortOrder,
	});

	const handleBatchAction = useCallback(async (action: "pause" | "resume" | "end" | "archive") => {
		if (!organizationId || selectedIds.size === 0) return;
		setIsBatchLoading(true);
		try {
			await batchCampaigns.mutateAsync({
				organizationId,
				action,
				campaignIds: Array.from(selectedIds),
			});
			showToast.success(`${selectedIds.size} campaign${selectedIds.size > 1 ? "s" : ""} ${action === "end" ? "ended" : action + "d"}`);
			setSelectedIds(new Set());
			refetch();
		} catch (err) {
			showToast.error(err, `Failed to ${action} campaigns`);
		} finally {
			setIsBatchLoading(false);
		}
	}, [organizationId, selectedIds, batchCampaigns, refetch]);

	// Campaign action handlers
	const handlePauseCampaign = async (campaignId: string) => {
		if (!organizationId) return;
		setActionPendingId(campaignId);
		try {
			await pauseCampaign.mutateAsync({
				organizationId,
				campaignId,
				reason: "Paused by user",
			});
			showToast.success("Campaign paused");
		} catch (err) {
			showToast.error(err, "Failed to pause campaign");
		} finally {
			setActionPendingId(null);
		}
	};

	const handleResumeCampaign = async (campaignId: string) => {
		if (!organizationId) return;
		setActionPendingId(campaignId);
		try {
			await resumeCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign resumed");
		} catch (err) {
			showToast.error(err, "Failed to resume campaign");
		} finally {
			setActionPendingId(null);
		}
	};

	const handleRequestCancel = (campaignId: string) => {
		const campaign = campaigns.find((c) => c.id === campaignId);
		setCancelConfirm({ id: campaignId, title: campaign?.title || "this campaign" });
	};

	const handleConfirmCancel = async () => {
		if (!organizationId || !cancelConfirm) return;
		setActionPendingId(cancelConfirm.id);
		try {
			await cancelCampaign.mutateAsync({ organizationId, campaignId: cancelConfirm.id });
			showToast.success("Campaign cancelled");
		} catch (err) {
			showToast.error(err, "Failed to cancel campaign");
		} finally {
			setActionPendingId(null);
			setCancelConfirm(null);
		}
	};

	const handleDuplicateCampaign = async (campaignId: string) => {
		if (!organizationId) return;
		setActionPendingId(campaignId);
		try {
			await duplicateCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign duplicated");
		} catch (err) {
			showToast.error(err, "Failed to duplicate campaign");
		} finally {
			setActionPendingId(null);
		}
	};

	if (loading) {
		return <CampaignsGridSkeleton />;
	}

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex items-center gap-2">
				<FilterDropdown label="Sort" options={sortOptions} value={sortBy} onChange={(value) => navigate({ search: ((prev: Record<string, unknown>) => ({ ...prev, sort: value === "newest" ? undefined : value })) as never })} />
				<div className="flex-1" />
				{campaigns.length > 0 && (
					<Button
						size="sm"
						color="emerald"
						disabled={exportCampaigns.isPending}
						onClick={async () => {
							try {
								const result = await exportCampaigns.mutateAsync({ status, q: q || undefined });
								downloadExcel(result.data, result.filename);
								showToast.success("Export downloaded");
							} catch (err) {
								showToast.error(err, "Failed to export campaigns");
							}
						}}
					>
						<TableCellsIcon data-slot="icon" className="size-4" />
						{exportCampaigns.isPending ? "Exporting..." : "Export"}
					</Button>
				)}
			</div>

			{/* Results grid */}
			{error ? (
				<ErrorState message="Unable to load campaigns." onRetry={refetch} />
			) : campaigns.length > 0 ? (
				<>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
						{campaigns.map((campaign) => (
							<div key={campaign.id} className={clsx("group relative rounded-xl transition-shadow", selectedIds.has(campaign.id) && "outline-2 outline-zinc-900 dark:outline-white")}>
								<SelectionCheckbox
									selected={selectedIds.has(campaign.id)}
									onToggle={(e) => { e.preventDefault(); toggleSelect(campaign.id); }}
								/>
								<CampaignCard
									campaign={campaign}
									orgSlug={orgSlug}
									onPause={handlePauseCampaign}
									onResume={handleResumeCampaign}
									onDelete={handleRequestCancel}
									onDuplicate={handleDuplicateCampaign}
									isActionPending={actionPendingId === campaign.id}
									canPause={canPause}
									canResume={canResume}
									canDelete={canDelete}
									canCreate={canCreate}
								/>
							</div>
						))}
					</div>

					{/* Load More */}
					{hasMore && (
						<div className="flex justify-center py-6">
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
				</>
			) : (
				<EmptyState
					preset="campaigns"
					title={q ? "No campaigns found" : "No campaigns yet"}
					description={
						q
							? "Try adjusting your search query"
							: canCreate
								? "Create your first campaign to start driving results"
								: "No campaigns have been created yet"
					}
				/>
			)}

			{/* Floating Batch Actions Bar */}
			<BulkActionsBar selectedCount={selectedIds.size} onClear={clearSelection}>
				{canPause && status === "active" && (
					<Button color="amber" onClick={() => handleBatchAction("pause")} disabled={isBatchLoading}>
						<PauseIcon data-slot="icon" className="size-4" /> Pause
					</Button>
				)}
				{canResume && status === "paused" && (
					<Button color="emerald" onClick={() => handleBatchAction("resume")} disabled={isBatchLoading}>
						<PlayIcon data-slot="icon" className="size-4" /> Resume
					</Button>
				)}
				<Button outline onClick={() => handleBatchAction("archive")} disabled={isBatchLoading}>
					<ArchiveBoxIcon data-slot="icon" className="size-4" /> Archive
				</Button>
			</BulkActionsBar>

			{/* Cancel Confirmation Dialog */}
			<Dialog open={!!cancelConfirm} onClose={() => setCancelConfirm(null)} size="sm">
				<DialogHeader
					icon={XMarkIcon}
					iconColor="red"
					title="Cancel Campaign"
					description={`Are you sure you want to cancel "${cancelConfirm?.title}"? This action cannot be undone.`}
					onClose={() => setCancelConfirm(null)}
				/>
				<DialogBody>
					<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
						<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
						<p className="text-sm text-red-700 dark:text-red-300">
							No new enrollments will be accepted after cancellation.
						</p>
					</div>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setCancelConfirm(null)} disabled={!!actionPendingId}>
						Go Back
					</Button>
					<Button color="red" onClick={handleConfirmCancel} disabled={!!actionPendingId}>
						{actionPendingId === cancelConfirm?.id ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Cancelling...
							</>
						) : (
							<>
								<XMarkIcon className="size-4" />
								Cancel Campaign
							</>
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
