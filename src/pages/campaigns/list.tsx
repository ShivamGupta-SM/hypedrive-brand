import {
	ArrowPathIcon,
	CheckCircleIcon,
	DocumentTextIcon,
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	NoSymbolIcon,
	PauseCircleIcon,
	PlusIcon,
	Squares2X2Icon,
	TableCellsIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Input, InputGroup } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { IconButton } from "@/components/shared/icon-button";
import { Skeleton } from "@/components/skeleton";
import {
	useCancelCampaign,
	useDuplicateCampaign,
	useInfiniteCampaigns,
	useOrgContext,
	usePauseCampaign,
	useResumeCampaign,
} from "@/hooks";
import type { brand, db } from "@/lib/brand-client";
import { downloadCSV } from "@/lib/download";
import { showToast } from "@/lib/toast";
import { useCan } from "@/store/permissions-store";
import { CampaignCard, CampaignCardSkeleton, getStatusConfig } from "./campaign-card";
import { CreateCampaignModal } from "./create-campaign-modal";

type Campaign = brand.CampaignWithStats;
type StatusFilter = "all" | "active" | "paused" | "ended" | "draft";

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
// LOADING SKELETON
// =============================================================================

function CampaignsListSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Skeleton width={130} height={32} borderRadius={8} />
					<Skeleton width={280} height={16} borderRadius={6} className="mt-2" />
				</div>
				<Skeleton width={150} height={40} borderRadius={8} />
			</div>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Campaigns", value: "" },
					{ name: "Active", value: "" },
					{ name: "Ending Soon", value: "" },
					{ name: "Enrollments", value: "" },
				]}
				loading
				columns={4}
			/>

			{/* Search */}
			<div className="flex items-center gap-2">
				<Skeleton height={40} borderRadius={8} containerClassName="flex-1" />
				<Skeleton width={100} height={40} borderRadius={8} className="hidden sm:block" />
			</div>

			{/* Tabs */}
			<div className="flex gap-1.5">
				<Skeleton width={80} height={36} borderRadius={999} />
				<Skeleton width={70} height={36} borderRadius={999} />
				<Skeleton width={75} height={36} borderRadius={999} />
				<Skeleton width={65} height={36} borderRadius={999} />
				<Skeleton width={60} height={36} borderRadius={999} />
			</div>

			{/* Results count */}
			<div>
				<Skeleton width={110} height={14} />
			</div>

			{/* Grid */}
			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<CampaignCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

// =============================================================================
// CAMPAIGNS LIST
// =============================================================================

export function CampaignsList() {
	const { organizationId, orgSlug } = useOrgContext();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sortBy, setSortBy] = useState("date");
	const canCreate = useCan("campaign", "create");
	const canDelete = useCan("campaign", "delete");
	const canPause = useCan("campaign", "pause");
	const canResume = useCan("campaign", "resume");

	const [showCreateModal, setShowCreateModal] = useState(false);
	const [actionPendingId, setActionPendingId] = useState<string | null>(null);
	const [cancelConfirm, setCancelConfirm] = useState<{ id: string; title: string } | null>(null);

	// Campaign action mutations
	const pauseCampaign = usePauseCampaign();
	const resumeCampaign = useResumeCampaign();
	const cancelCampaign = useCancelCampaign();
	const duplicateCampaign = useDuplicateCampaign();

	// Map UI filter to API status
	const apiStatus = useMemo((): db.CampaignStatus | undefined => {
		if (statusFilter === "all") return undefined;
		return statusFilter as db.CampaignStatus;
	}, [statusFilter]);

	const {
		data: campaigns,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteCampaigns(organizationId, {
		status: apiStatus,
	});

	// Filter and sort campaigns
	const filteredCampaigns = useMemo(() => {
		let result = [...campaigns];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(campaign) =>
					campaign.title.toLowerCase().includes(query) || campaign.campaignType.toLowerCase().includes(query)
			);
		}

		result.sort((a, b) => {
			if (sortBy === "name") return a.title.localeCompare(b.title);
			// Stats not available on Campaign type, sort by date instead
			if (sortBy === "enrollments") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

		return result;
	}, [campaigns, searchQuery, sortBy]);

	// Status counts for filter
	const statusCounts = useMemo(() => {
		return {
			all: campaigns.length,
			active: campaigns.filter((c) => c.status === "active").length,
			paused: campaigns.filter((c) => c.status === "paused").length,
			ended: campaigns.filter((c) => c.status === "ended").length,
			draft: campaigns.filter((c) => c.status === "draft").length,
		};
	}, [campaigns]);

	// Stats
	const stats = useMemo(() => {
		const active = statusCounts.active;
		const totalEnrollments = campaigns.reduce((sum, c) => sum + (c.currentEnrollments ?? 0), 0);
		const endingSoon = campaigns.filter((c) => {
			if (c.status !== "active" || !c.endDate) return false;
			const diff = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
			return diff >= 0 && diff <= 7;
		}).length;
		return { total: campaigns.length, active, totalEnrollments, endingSoon };
	}, [campaigns, statusCounts]);

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

	const clearAllFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
		setSortBy("date");
	};

	const hasActiveFilters = searchQuery || statusFilter !== "all" || sortBy !== "date";
	const campaignCount = filteredCampaigns.length;

	if (loading) {
		return <CampaignsListSkeleton />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<PageHeader
				title="Campaigns"
				description="Manage your marketing campaigns and track performance"
				actions={
					canCreate ? (
						<IconButton color="zinc" onClick={() => setShowCreateModal(true)}>
							<PlusIcon className="size-5" />
						</IconButton>
					) : undefined
				}
			/>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Campaigns", value: stats.total },
					{ name: "Active", value: stats.active },
					{
						name: "Ending Soon",
						value: stats.endingSoon,
						change: stats.endingSoon > 0 ? "action needed" : undefined,
						changeType: stats.endingSoon > 0 ? "negative" : undefined,
					},
					{ name: "Enrollments", value: stats.totalEnrollments.toLocaleString("en-IN") },
				]}
				columns={4}
			/>

			{/* Search */}
			<div className="flex items-center gap-2">
				<div className="w-full sm:max-w-xs">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search campaigns..."
							aria-label="Search campaigns"
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

			{/* Status Tabs — pill style */}
			<div className="-mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-1 scrollbar-hide">
				{(
					[
						{ value: "all", label: "All", count: statusCounts.all, icon: Squares2X2Icon, iconColor: "text-sky-500" },
						{ value: "active", label: "Active", count: statusCounts.active, icon: CheckCircleIcon, iconColor: "text-emerald-500" },
						{ value: "paused", label: "Paused", count: statusCounts.paused, icon: PauseCircleIcon, iconColor: "text-amber-500" },
						{ value: "ended", label: "Ended", count: statusCounts.ended, icon: NoSymbolIcon, iconColor: "text-red-500" },
						{ value: "draft", label: "Draft", count: statusCounts.draft, icon: DocumentTextIcon, iconColor: "text-zinc-400" },
					] as { value: StatusFilter; label: string; count: number; icon: typeof Squares2X2Icon; iconColor: string }[]
				).map((tab) => {
					const isActive = statusFilter === tab.value;
					return (
						<button
							type="button"
							key={tab.value}
							onClick={() => setStatusFilter(tab.value)}
							className={clsx(
								"inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ring-1 transition-all duration-200 active:scale-95",
								isActive
									? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
									: "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800"
							)}
						>
							<tab.icon className={clsx("size-3.5", isActive ? "text-white dark:text-zinc-900" : tab.iconColor)} />
							{tab.label}
							<span
								className={clsx(
									"inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
									isActive
										? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
										: "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
								)}
							>
								{tab.count}
							</span>
						</button>
					);
				})}
			</div>

			{/* Active filters indicator */}
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
							{getStatusConfig(statusFilter).label}
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

			{/* Results count */}
			<div className="flex items-center justify-between">
				<p className="text-xs text-zinc-400 dark:text-zinc-500">
					{campaignCount} campaign{campaignCount !== 1 ? "s" : ""}
					{searchQuery && ` matching "${searchQuery}"`}
				</p>
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
					title={hasActiveFilters ? "No campaigns found" : "No campaigns yet"}
					description={
						hasActiveFilters
							? "Try adjusting your filters or search query"
							: canCreate
								? "Create your first campaign to start driving results"
								: "No campaigns have been created yet"
					}
					action={
						hasActiveFilters
							? { label: "Clear filters", onClick: clearAllFilters }
							: canCreate
								? { label: "Create Campaign", onClick: () => setShowCreateModal(true) }
								: undefined
					}
				/>
			)}

			{/* Create Campaign Modal */}
			<CreateCampaignModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				organizationId={organizationId}
				onSuccess={refetch}
			/>

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
