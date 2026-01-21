import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Select } from "@/components/select";
import { Skeleton, StatCardSkeleton, CardSkeleton } from "@/components/skeleton";
import { Text } from "@/components/text";
import { Card, StatCard } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  SearchInput,
  TabButton,
  TabGroup,
  ActiveFilters,
} from "@/components/shared/filter-chip";
import { useCampaigns, useCurrentOrganization } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/design-tokens";
import type { organizations, shared } from "@/lib/brand-client";
import {
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MegaphoneIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  PlusIcon,
  RocketLaunchIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";

type Campaign = organizations.CampaignWithStats;
type CampaignStatus = shared.CampaignStatus;
type StatusFilter = "all" | "active" | "paused" | "ended" | "draft";

// Sort options
const sortOptions = [
  { value: "date", label: "Newest first" },
  { value: "name", label: "Name A-Z" },
  { value: "enrollments", label: "Most enrolled" },
];

// =============================================================================
// STATUS CONFIG
// =============================================================================

function getStatusConfig(status: CampaignStatus): {
  label: string;
  icon: typeof CheckCircleIcon;
  color: "lime" | "sky" | "amber" | "zinc" | "emerald" | "red";
} {
  const statusMap: Record<string, { label: string; icon: typeof CheckCircleIcon; color: "lime" | "sky" | "amber" | "zinc" | "emerald" | "red" }> = {
    active: { label: "Active", icon: PlayCircleIcon, color: "lime" },
    draft: { label: "Draft", icon: ClockIcon, color: "zinc" },
    pending_approval: { label: "Pending", icon: ClockIcon, color: "amber" },
    approved: { label: "Approved", icon: CheckCircleIcon, color: "sky" },
    paused: { label: "Paused", icon: PauseCircleIcon, color: "amber" },
    ended: { label: "Ended", icon: CheckCircleIcon, color: "zinc" },
    completed: { label: "Completed", icon: CheckCircleIcon, color: "emerald" },
    cancelled: { label: "Cancelled", icon: XCircleIcon, color: "red" },
    rejected: { label: "Rejected", icon: XCircleIcon, color: "red" },
    expired: { label: "Expired", icon: ClockIcon, color: "zinc" },
    archived: { label: "Archived", icon: ClockIcon, color: "zinc" },
  };
  return statusMap[status] || { label: status, icon: ClockIcon, color: "zinc" };
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950/50 dark:to-red-950/30">
        <ExclamationTriangleIcon className="size-10 text-red-500 dark:text-red-400" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-white">
        Failed to load campaigns
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
        Please check your connection and try again.
      </p>
      <Button className="mt-8" onClick={onRetry} color="dark/zinc">
        <ArrowPathIcon className="size-4" />
        Try Again
      </Button>
    </div>
  );
}

// =============================================================================
// ENROLLMENT PROGRESS BAR
// =============================================================================

function EnrollmentProgress({ current, max }: { current: number; max?: number }) {
  if (!max || max === 0) {
    return (
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Enrollments</span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {current.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-full w-1/3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>
        <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">No limit set</p>
      </div>
    );
  }

  const percent = Math.min(100, (current / max) * 100);
  const colorClass = percent >= 90
    ? "bg-gradient-to-r from-red-500 to-rose-500"
    : percent >= 70
      ? "bg-gradient-to-r from-amber-500 to-orange-500"
      : "bg-gradient-to-r from-emerald-500 to-green-500";

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 dark:text-zinc-400">Enrollments</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {current.toLocaleString("en-IN")} / {max.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
        {Math.round(percent)}% filled
      </p>
    </div>
  );
}

// =============================================================================
// CAMPAIGN CARD - Desktop/Tablet
// =============================================================================

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const statusConfig = getStatusConfig(campaign.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  const getTypeColor = (type: string): "indigo" | "emerald" | "purple" => {
    const typeColors: Record<string, "indigo" | "emerald" | "purple"> = {
      cashback: "emerald",
      barter: "purple",
      hybrid: "indigo",
    };
    return typeColors[type] || "indigo";
  };

  return (
    <Card variant="interactive" padding="none" className="group overflow-hidden">
      {/* Gradient Header */}
      <div className="relative bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;20&quot; height=&quot;20&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cdefs%3E%3Cpattern id=&quot;grid&quot; width=&quot;20&quot; height=&quot;20&quot; patternUnits=&quot;userSpaceOnUse&quot;%3E%3Cpath d=&quot;M 20 0 L 0 0 0 20&quot; fill=&quot;none&quot; stroke=&quot;white&quot; stroke-width=&quot;0.5&quot; stroke-opacity=&quot;0.1&quot;/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=&quot;100%25&quot; height=&quot;100%25&quot; fill=&quot;url(%23grid)&quot;/%3E%3C/svg%3E')] opacity-50" />

        <div className="relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge color={statusConfig.color} className="inline-flex items-center gap-1">
                <StatusIcon className="size-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <Badge color={getTypeColor(campaign.campaignType)} className="bg-white/20 capitalize text-white backdrop-blur-sm">
              {campaign.campaignType}
            </Badge>
          </div>

          <Link href={`/campaigns/${campaign.id}`} className="mt-3 block">
            <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-white">
              {campaign.title}
            </h3>
          </Link>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
            <CalendarIcon className="size-3.5" />
            <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <EnrollmentProgress current={campaign.currentEnrollments} max={campaign.maxEnrollments} />

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Rebate</p>
            <p className="mt-0.5 text-base font-bold text-zinc-900 dark:text-white">
              {campaign.rebatePercentage ? `${campaign.rebatePercentage}%` : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-50 p-2.5 dark:bg-zinc-800/50">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Platform Fee</p>
            <p className="mt-0.5 text-base font-bold text-emerald-600 dark:text-emerald-400">
              {campaign.platformFee ? formatCurrency(campaign.platformFee / 100) : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <Link
          href={`/campaigns/${campaign.id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View details
        </Link>
        <Dropdown>
          <DropdownButton plain aria-label="More options" className="-m-1.5 p-1.5">
            <EllipsisVerticalIcon className="size-5 text-zinc-400 dark:text-zinc-500" />
          </DropdownButton>
          <DropdownMenu anchor="bottom end">
            <DropdownItem href={`/campaigns/${campaign.id}`}>View details</DropdownItem>
            <DropdownItem href={`/campaigns/${campaign.id}/edit`}>Edit campaign</DropdownItem>
            <DropdownItem>Duplicate</DropdownItem>
            {campaign.status === "active" && (
              <DropdownItem>Pause campaign</DropdownItem>
            )}
            {campaign.status === "paused" && (
              <DropdownItem>Resume campaign</DropdownItem>
            )}
            <DropdownItem className="text-red-600 dark:text-red-400">Delete</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </Card>
  );
}

// =============================================================================
// CAMPAIGN LIST ITEM - Mobile optimized
// =============================================================================

function CampaignListItem({ campaign }: { campaign: Campaign }) {
  const statusConfig = getStatusConfig(campaign.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/80 transition-all hover:shadow-md hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
    >
      {/* Icon */}
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
        <MegaphoneIcon className="size-6 text-white" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-zinc-900 dark:text-white">
            {campaign.title}
          </h3>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Badge color={statusConfig.color} className="inline-flex items-center gap-0.5 text-[10px]">
            <StatusIcon className="size-2.5" />
            {statusConfig.label}
          </Badge>
          <span>{campaign.currentEnrollments} enrolled</span>
          <span className="hidden xs:inline">•</span>
          <span className="hidden xs:inline">{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
        </div>
      </div>

      {/* Chevron */}
      <ChevronRightIcon className="size-5 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
    </Link>
  );
}

// =============================================================================
// MOBILE FILTER SHEET
// =============================================================================

function MobileFilters({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  campaigns,
}: {
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  campaigns: Campaign[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const filterCount = (statusFilter !== "all" ? 1 : 0) + (sortBy !== "date" ? 1 : 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <FunnelIcon className="size-4" />
        Filters
        {filterCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
            {filterCount}
          </span>
        )}
      </button>

      {/* Bottom sheet */}
      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-label="Close filters"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-5 shadow-xl dark:bg-zinc-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Filters</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <XCircleIcon className="size-6" />
              </button>
            </div>

            {/* Status filter */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "active", "paused", "ended", "draft"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-indigo-500 text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    {status !== "all" && (
                      <span className="ml-1 opacity-60">
                        ({campaigns.filter((c) => c.status === status).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Sort by</p>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              onClick={() => setIsOpen(false)}
              color="dark/zinc"
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </>
      )}
    </>
  );
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function CampaignsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton width={160} height={36} borderRadius={8} />
          <Skeleton width={280} height={18} borderRadius={6} className="hidden sm:block" />
        </div>
        <Skeleton width={140} height={40} borderRadius={8} />
      </div>

      {/* Stats - horizontal scroll on mobile */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-36 shrink-0 sm:w-auto">
            <StatCardSkeleton />
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="flex gap-3">
        <Skeleton width={240} height={40} borderRadius={8} className="flex-1 sm:flex-none" />
        <Skeleton width={100} height={40} borderRadius={8} className="sm:hidden" />
        <Skeleton width={160} height={40} borderRadius={8} className="hidden sm:block" />
      </div>

      {/* Tab filters - hidden on mobile */}
      <div className="hidden gap-2 sm:flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} width={80} height={36} borderRadius={8} />
        ))}
      </div>

      {/* Cards - list on mobile, grid on desktop */}
      <div className="space-y-3 sm:hidden">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={84} borderRadius={12} />
        ))}
      </div>
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} height={320} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// CAMPAIGNS LIST
// =============================================================================

export function CampaignsList() {
  const organization = useCurrentOrganization();
  const organizationId = organization?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState("date");

  // Map UI filter to API status
  const apiStatus = useMemo((): shared.CampaignStatus | undefined => {
    if (statusFilter === "all") return undefined;
    return statusFilter as shared.CampaignStatus;
  }, [statusFilter]);

  const { data: campaigns, loading, error, refetch } = useCampaigns(organizationId, {
    status: apiStatus,
  });

  // Filter and sort campaigns locally
  const filteredCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(query) ||
          campaign.campaignType.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "enrollments") return b.currentEnrollments - a.currentEnrollments;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [campaigns, searchQuery, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const active = campaigns.filter((c) => c.status === "active").length;
    const totalEnrollments = campaigns.reduce((sum, c) => sum + c.currentEnrollments, 0);
    const thisMonth = campaigns.filter((c) => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    return { total: campaigns.length, active, totalEnrollments, thisMonth };
  }, [campaigns]);

  // Active filters
  const activeFilters = useMemo(() => {
    const filters: Array<{ id: string; label: string }> = [];
    if (searchQuery) filters.push({ id: "search", label: `"${searchQuery}"` });
    if (statusFilter !== "all") {
      filters.push({ id: "status", label: statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) });
    }
    return filters;
  }, [searchQuery, statusFilter]);

  const clearFilter = (id: string) => {
    if (id === "search") setSearchQuery("");
    if (id === "status") setStatusFilter("all");
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  if (loading) {
    return <CampaignsListSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-5 pb-8 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <Heading className="text-2xl sm:text-3xl">Campaigns</Heading>
          <Text className="mt-1 hidden sm:block">Manage your marketing campaigns and track performance</Text>
        </div>
        <Button href="/campaigns/create" color="emerald" className="w-full sm:w-auto">
          <PlusIcon className="size-4" />
          Create Campaign
        </Button>
      </div>

      {/* Stats - Horizontal scroll on mobile */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
        <div className="w-36 shrink-0 sm:w-auto">
          <StatCard
            icon={<MegaphoneIcon className="size-5" />}
            label="Total"
            value={stats.total}
            size="sm"
          />
        </div>
        <div className="w-36 shrink-0 sm:w-auto">
          <StatCard
            icon={<RocketLaunchIcon className="size-5" />}
            label="Active"
            value={stats.active}
            variant="lime"
            size="sm"
          />
        </div>
        <div className="w-36 shrink-0 sm:w-auto">
          <StatCard
            icon={<ChartBarIcon className="size-5" />}
            label="Enrollments"
            value={stats.totalEnrollments.toLocaleString("en-IN")}
            variant="success"
            size="sm"
          />
        </div>
        <div className="w-36 shrink-0 sm:w-auto">
          <StatCard
            icon={<CalendarIcon className="size-5" />}
            label="This Month"
            value={stats.thisMonth}
            variant="info"
            size="sm"
          />
        </div>
      </div>

      {/* Search + Mobile Filter Button */}
      <div className="flex gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search campaigns..."
          className="flex-1 sm:max-w-sm"
        />
        <div className="sm:hidden">
          <MobileFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            campaigns={campaigns}
          />
        </div>
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="hidden w-40 sm:block"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Desktop Tab Filters */}
      <div className="hidden sm:block">
        <TabGroup>
          <TabButton
            label="All"
            isActive={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
            count={campaigns.length}
          />
          <TabButton
            label="Active"
            icon={PlayCircleIcon}
            isActive={statusFilter === "active"}
            onClick={() => setStatusFilter("active")}
            count={campaigns.filter((c) => c.status === "active").length}
          />
          <TabButton
            label="Paused"
            icon={PauseCircleIcon}
            isActive={statusFilter === "paused"}
            onClick={() => setStatusFilter("paused")}
            count={campaigns.filter((c) => c.status === "paused").length}
          />
          <TabButton
            label="Ended"
            icon={CheckCircleIcon}
            isActive={statusFilter === "ended"}
            onClick={() => setStatusFilter("ended")}
            count={campaigns.filter((c) => c.status === "ended").length}
          />
          <TabButton
            label="Draft"
            icon={ClockIcon}
            isActive={statusFilter === "draft"}
            onClick={() => setStatusFilter("draft")}
            count={campaigns.filter((c) => c.status === "draft").length}
          />
        </TabGroup>
      </div>

      {/* Active filters */}
      <ActiveFilters
        filters={activeFilters}
        onRemove={clearFilter}
        onClearAll={clearAllFilters}
      />

      {/* Content */}
      {filteredCampaigns.length === 0 ? (
        <EmptyState
          preset="campaigns"
          title={searchQuery || statusFilter !== "all" ? "No campaigns found" : "No campaigns yet"}
          description={
            searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters or search query"
              : "Create your first campaign to start driving results"
          }
          action={
            searchQuery || statusFilter !== "all"
              ? { label: "Clear filters", onClick: clearAllFilters }
              : { label: "Create Campaign", href: "/campaigns/create" }
          }
        />
      ) : (
        <>
          {/* Mobile: List view */}
          <div className="space-y-2 sm:hidden">
            {filteredCampaigns.map((campaign) => (
              <CampaignListItem key={campaign.id} campaign={campaign} />
            ))}
          </div>

          {/* Desktop: Grid view */}
          <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
