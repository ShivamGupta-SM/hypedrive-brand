import {
	ArrowPathIcon,
	ExclamationTriangleIcon,
	TableCellsIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/skeleton";
import { useInfiniteCampaigns } from "@/features/campaigns/hooks";
import {
	useCancelCampaign,
	useDuplicateCampaign,
	usePauseCampaign,
	useResumeCampaign,
} from "@/features/campaigns/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand, db } from "@/lib/brand-client";
import { downloadCSV } from "@/lib/download";
import { showToast } from "@/lib/toast";
import { CampaignCard, CampaignCardSkeleton } from "./campaign-card";

type Campaign = brand.CampaignWithStats;

const campaignsRouteApi = getRouteApi("/_app/$orgSlug/campaigns");

// =============================================================================
// CSV EXPORT UTILITY
// =============================================================================

function exportCampaignsToCSV(campaigns: Campaign[]) {
	const headers = ["ID", "Title", "Status", "Type", "Start Date", "End Date", "Max Enrollments", "Created At"];

	const rows = campaigns.map((c) => [
		c.id,
		c.title,
		c.status,
		c.campaignType,
		c.startDate || "",
		c.endDate || "",
		String(c.maxEnrollments || ""),
		c.createdAt,
	]);

	downloadCSV(headers, rows, "campaigns");
}

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

export function CampaignsGrid({ status }: CampaignsGridProps) {
	const { organizationId, orgSlug } = useOrgContext();
	const { q } = campaignsRouteApi.useSearch();

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
	});

	// Client-side search + sort
	const filteredCampaigns = useMemo(() => {
		let result = [...campaigns];

		if (q) {
			const query = q.toLowerCase();
			result = result.filter(
				(campaign) =>
					campaign.title.toLowerCase().includes(query) || campaign.campaignType.toLowerCase().includes(query),
			);
		}

		result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		return result;
	}, [campaigns, q]);

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

	const campaignCount = filteredCampaigns.length;

	if (loading) {
		return <CampaignsGridSkeleton />;
	}

	return (
		<>
			{/* Results count + Export */}
			<div className="flex items-center justify-between">
				<p className="text-xs text-zinc-400 dark:text-zinc-500">
					{campaignCount} campaign{campaignCount !== 1 ? "s" : ""}
					{q && ` matching "${q}"`}
				</p>
				{campaigns.length > 0 && (
					<Button
						color="emerald"
						onClick={() => exportCampaignsToCSV(filteredCampaigns)}
						className="hidden sm:inline-flex"
					>
						<TableCellsIcon data-slot="icon" className="size-4" />
						Export
					</Button>
				)}
			</div>

			{/* Results grid */}
			{error ? (
				<ErrorState message="Unable to load campaigns." onRetry={refetch} />
			) : filteredCampaigns.length > 0 ? (
				<>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
						{filteredCampaigns.map((campaign) => (
							<CampaignCard
								key={campaign.id}
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
		</>
	);
}
