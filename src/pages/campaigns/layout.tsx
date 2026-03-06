import {
	CheckCircleIcon,
	DocumentTextIcon,
	MagnifyingGlassIcon,
	NoSymbolIcon,
	PauseCircleIcon,
	PlusIcon,
	Squares2X2Icon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Input, InputGroup } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { useCan } from "@/components/shared/can";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { IconButton } from "@/components/shared/icon-button";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";
import { Skeleton } from "@/components/skeleton";
import { useInfiniteCampaigns } from "@/features/campaigns/hooks";
import { useOrgContext } from "@/hooks/use-org-context";
import { useOrgPath } from "@/hooks/use-org-slug";
import { CampaignCardSkeleton } from "./campaign-card";
import { CreateCampaignModal } from "./create-campaign-modal";

import { Route } from "@/routes/_app/$orgSlug/campaigns";

// =============================================================================
// LOADING SKELETON
// =============================================================================

function CampaignsLayoutSkeleton() {
	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Skeleton width={130} height={32} borderRadius={8} />
					<Skeleton width={280} height={16} borderRadius={6} className="mt-2" />
				</div>
				<Skeleton width={40} height={40} borderRadius={8} />
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

			{/* Search + Tabs */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Skeleton height={40} width={256} borderRadius={8} containerClassName="w-full sm:w-64 shrink-0" />
				<div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
					{[80, 70, 75, 65, 60].map((w, i) => (
						<Skeleton key={i} width={w} height={36} borderRadius={999} />
					))}
				</div>
			</div>

			{/* Grid skeleton */}
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
// CAMPAIGNS LAYOUT
// =============================================================================

export function CampaignsLayout() {
	const { organizationId } = useOrgContext();
	const orgPath = useOrgPath();
	const navigate = Route.useNavigate();
	const { q } = Route.useSearch();

	const canCreate = useCan("campaign", "create");
	const [showCreateModal, setShowCreateModal] = useState(false);

	// All campaigns for stats + tab counts (deduplicated by TQ with layout loader prefetch)
	const { data: campaigns, loading, refetch } = useInfiniteCampaigns(organizationId, {});

	if (loading) return <CampaignsLayoutSkeleton />;

	const statusCounts = {
		all: campaigns.length,
		active: campaigns.filter((c) => c.status === "active").length,
		paused: campaigns.filter((c) => c.status === "paused").length,
		ended: campaigns.filter((c) => c.status === "ended").length,
		draft: campaigns.filter((c) => c.status === "draft").length,
	};

	const totalEnrollments = campaigns.reduce((sum, c) => sum + (c.currentEnrollments ?? 0), 0);
	const endingSoon = campaigns.filter((c) => {
		if (c.status !== "active" || !c.endDate) return false;
		const diff = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
		return diff >= 0 && diff <= 7;
	}).length;

	const tabs: TabNavItem[] = [
		{
			label: "All",
			to: orgPath("/campaigns"),
			exact: true,
			count: statusCounts.all,
			icon: Squares2X2Icon,
			iconColor: "text-sky-500",
		},
		{
			label: "Active",
			to: orgPath("/campaigns/active"),
			count: statusCounts.active,
			icon: CheckCircleIcon,
			iconColor: "text-emerald-500",
		},
		{
			label: "Paused",
			to: orgPath("/campaigns/paused"),
			count: statusCounts.paused,
			icon: PauseCircleIcon,
			iconColor: "text-amber-500",
		},
		{
			label: "Ended",
			to: orgPath("/campaigns/ended"),
			count: statusCounts.ended,
			icon: NoSymbolIcon,
			iconColor: "text-red-500",
		},
		{
			label: "Draft",
			to: orgPath("/campaigns/draft"),
			count: statusCounts.draft,
			icon: DocumentTextIcon,
			iconColor: "text-zinc-400",
		},
	];

	const setSearchQuery = (value: string) => {
		navigate({ search: (prev) => ({ ...prev, q: value || undefined }) });
	};

	return (
		<div className="space-y-5">
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
					{ name: "Campaigns", value: statusCounts.all },
					{ name: "Active", value: statusCounts.active },
					{
						name: "Ending Soon",
						value: endingSoon,
						change: endingSoon > 0 ? "action needed" : undefined,
						changeType: endingSoon > 0 ? "negative" : undefined,
					},
					{ name: "Enrollments", value: totalEnrollments.toLocaleString("en-IN") },
				]}
				columns={4}
			/>

			{/* Search + Tabs */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="w-full sm:w-64 sm:shrink-0">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="search"
							value={q ?? ""}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search campaigns..."
							aria-label="Search campaigns"
						/>
						{q && (
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
				<TabNav tabs={tabs} />
			</div>

			{/* Child route renders here — tighter gap from tabs */}
			<div className="-mt-2">
				<Outlet />
			</div>

			{/* Create Campaign Modal */}
			<CreateCampaignModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				organizationId={organizationId}
				onSuccess={refetch}
			/>
		</div>
	);
}
