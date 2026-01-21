import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Text } from "@/components/text";
import { EmptyState } from "@/components/shared/empty-state";
import { useEnrollments, useCurrentOrganization } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/design-tokens";
import type { organizations, shared } from "@/lib/brand-client";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  XCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
} from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";

type Enrollment = organizations.EnrollmentWithRelations;
type EnrollmentStatus = shared.EnrollmentStatus;
type StatusFilter = "all" | EnrollmentStatus;

// =============================================================================
// STATUS CONFIG
// =============================================================================

function getStatusConfig(status: EnrollmentStatus): {
  label: string;
  shortLabel: string;
  icon: typeof CheckCircleIcon;
  color: "lime" | "sky" | "amber" | "red" | "zinc" | "emerald" | "orange";
  bgClass: string;
  textClass: string;
} {
  const statusMap: Record<EnrollmentStatus, {
    label: string;
    shortLabel: string;
    icon: typeof CheckCircleIcon;
    color: "lime" | "sky" | "amber" | "red" | "zinc" | "emerald" | "orange";
    bgClass: string;
    textClass: string;
  }> = {
    awaiting_submission: {
      label: "Awaiting Submission",
      shortLabel: "Pending",
      icon: ClockIcon,
      color: "zinc",
      bgClass: "bg-zinc-100 dark:bg-zinc-800",
      textClass: "text-zinc-600 dark:text-zinc-400"
    },
    awaiting_review: {
      label: "Awaiting Review",
      shortLabel: "In Review",
      icon: ClockIcon,
      color: "amber",
      bgClass: "bg-amber-50 dark:bg-amber-950/30",
      textClass: "text-amber-600 dark:text-amber-400"
    },
    changes_requested: {
      label: "Changes Requested",
      shortLabel: "Changes",
      icon: ExclamationTriangleIcon,
      color: "orange",
      bgClass: "bg-orange-50 dark:bg-orange-950/30",
      textClass: "text-orange-600 dark:text-orange-400"
    },
    approved: {
      label: "Approved",
      shortLabel: "Approved",
      icon: CheckCircleIcon,
      color: "lime",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
      textClass: "text-emerald-600 dark:text-emerald-400"
    },
    permanently_rejected: {
      label: "Rejected",
      shortLabel: "Rejected",
      icon: XCircleIcon,
      color: "red",
      bgClass: "bg-red-50 dark:bg-red-950/30",
      textClass: "text-red-600 dark:text-red-400"
    },
    withdrawn: {
      label: "Withdrawn",
      shortLabel: "Withdrawn",
      icon: XCircleIcon,
      color: "zinc",
      bgClass: "bg-zinc-100 dark:bg-zinc-800",
      textClass: "text-zinc-600 dark:text-zinc-400"
    },
    expired: {
      label: "Expired",
      shortLabel: "Expired",
      icon: ClockIcon,
      color: "zinc",
      bgClass: "bg-zinc-100 dark:bg-zinc-800",
      textClass: "text-zinc-600 dark:text-zinc-400"
    },
  };
  return statusMap[status] || {
    label: status,
    shortLabel: status,
    icon: ClockIcon,
    color: "zinc",
    bgClass: "bg-zinc-100 dark:bg-zinc-800",
    textClass: "text-zinc-600 dark:text-zinc-400"
  };
}

// =============================================================================
// SKELETON LOADING
// =============================================================================

function EnrollmentsListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-36 animate-pulse rounded-lg bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
        </div>
      </div>

      {/* Stats skeleton - horizontal scroll on mobile */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 w-32 shrink-0 animate-pulse rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800 sm:w-auto"
            />
          ))}
        </div>
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
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
        Failed to load enrollments. Please try again.
      </p>
      <Button className="mt-6" onClick={onRetry} color="dark/zinc">
        <ArrowPathIcon className="size-4" />
        Try Again
      </Button>
    </div>
  );
}

// =============================================================================
// STAT CARD
// =============================================================================

function StatCard({
  icon,
  label,
  value,
  variant = "default"
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant?: "default" | "warning" | "success" | "danger";
}) {
  const variants = {
    default: {
      bg: "bg-white dark:bg-zinc-900",
      iconBg: "bg-zinc-100 dark:bg-zinc-800",
      iconColor: "text-zinc-600 dark:text-zinc-400",
      valueColor: "text-zinc-900 dark:text-white",
    },
    warning: {
      bg: "bg-amber-50/50 dark:bg-amber-950/20",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-amber-700 dark:text-amber-300",
    },
    success: {
      bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      valueColor: "text-emerald-700 dark:text-emerald-300",
    },
    danger: {
      bg: "bg-red-50/50 dark:bg-red-950/20",
      iconBg: "bg-red-100 dark:bg-red-900/50",
      iconColor: "text-red-600 dark:text-red-400",
      valueColor: "text-red-700 dark:text-red-300",
    },
  };

  const v = variants[variant];

  return (
    <div className={`flex min-w-[120px] shrink-0 items-center gap-3 rounded-xl p-3 ring-1 ring-zinc-200 dark:ring-zinc-800 sm:min-w-0 ${v.bg}`}>
      <div className={`flex size-10 items-center justify-center rounded-lg ${v.iconBg}`}>
        <div className={v.iconColor}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className={`text-lg font-bold ${v.valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

// =============================================================================
// MOBILE FILTERS
// =============================================================================

function MobileFilters({
  isOpen,
  onClose,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  stats,
}: {
  isOpen: boolean;
  onClose: () => void;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stats: { total: number; awaitingReview: number; approved: number; rejected: number };
}) {
  if (!isOpen) return null;

  const statusOptions: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: "all", label: "All Enrollments", count: stats.total },
    { value: "awaiting_review", label: "Awaiting Review", count: stats.awaitingReview },
    { value: "approved", label: "Approved", count: stats.approved },
    { value: "permanently_rejected", label: "Rejected", count: stats.rejected },
  ];

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close filters"
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-4 pb-8 shadow-xl dark:bg-zinc-900">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Filters</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <XMarkIcon className="size-5 text-zinc-500" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search enrollments..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
          />
        </div>

        {/* Status options */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Status</p>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setStatusFilter(option.value);
                onClose();
              }}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
                statusFilter === option.value
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <span className={`text-sm ${statusFilter === option.value ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500"}`}>
                {option.count}
              </span>
            </button>
          ))}
        </div>

        {/* Clear button */}
        {(statusFilter !== "all" || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setSearchQuery("");
              onClose();
            }}
            className="mt-4 w-full rounded-xl border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </>
  );
}

// =============================================================================
// ENROLLMENT CARD (Desktop/Tablet)
// =============================================================================

function EnrollmentCard({
  enrollment,
  searchQuery = "",
}: {
  enrollment: Enrollment;
  searchQuery?: string;
}) {
  const statusConfig = getStatusConfig(enrollment.status);
  const StatusIcon = statusConfig.icon;

  // Highlight search match
  const highlightText = (text: string | undefined) => {
    if (!text) return "—";
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, idx) =>
          regex.test(part) ? (
            <mark key={`highlight-${text.slice(0, 10)}-${idx}`} className="bg-amber-200 dark:bg-amber-800/50">{part}</mark>
          ) : (
            <span key={`text-${text.slice(0, 10)}-${idx}`}>{part}</span>
          )
        )}
      </>
    );
  };

  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate rebate amount from order value and percentage
  const rebateAmount = useMemo(() => {
    const orderValue = parseFloat(enrollment.orderValueDecimal);
    const rebatePercentage = enrollment.lockedRebatePercentage;
    if (Number.isNaN(orderValue) || rebatePercentage == null) return "0.00";
    return ((orderValue * rebatePercentage) / 100).toFixed(2);
  }, [enrollment.orderValueDecimal, enrollment.lockedRebatePercentage]);

  return (
    <Link
      href={`/enrollments/${enrollment.id}`}
      className="group hidden flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700 sm:flex"
    >
      {/* Main Content */}
      <div className="p-4">
        {/* Order + Campaign Section */}
        <div className="flex items-start gap-3">
          {/* Order Icon */}
          <div className="relative shrink-0">
            <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
              <ShoppingBagIcon className="size-6 text-indigo-500" />
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            {/* Order ID + Status Row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold text-zinc-900 dark:text-white">
                Order #{enrollment.orderId.slice(-8)}
              </h3>
              <Badge color={statusConfig.color} className="inline-flex shrink-0 items-center gap-1 text-xs!">
                <StatusIcon className="size-3" />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Campaign & Shopper */}
            <div className="mt-1.5 space-y-0.5">
              {enrollment.campaign?.title && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <MegaphoneIcon className="size-3 shrink-0" />
                  <span className="line-clamp-1 font-medium">{highlightText(enrollment.campaign.title)}</span>
                </div>
              )}
              {enrollment.shopper?.displayName && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <UserGroupIcon className="size-3 shrink-0" />
                  <span>{highlightText(enrollment.shopper.displayName)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="relative border-t border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
        <div className="grid grid-cols-3 items-center px-4 py-3">
          {/* Order Value */}
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-400">Order Value</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
              {formatCurrency(enrollment.orderValueDecimal)}
            </p>
          </div>

          {/* Rebate */}
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-400">Rebate ({enrollment.lockedRebatePercentage}%)</p>
            <p className="mt-0.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(rebateAmount)}
            </p>
          </div>

          {/* Created */}
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase text-zinc-500 dark:text-zinc-400">Created</p>
            <p className="mt-0.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {formatDate(enrollment.createdAt)}
            </p>
          </div>
        </div>

        {/* Vertical Dividers */}
        <div className="pointer-events-none absolute inset-y-2 left-1/3 w-px bg-zinc-300 dark:bg-zinc-600" />
        <div className="pointer-events-none absolute inset-y-2 left-2/3 w-px bg-zinc-300 dark:bg-zinc-600" />
      </div>
    </Link>
  );
}

// =============================================================================
// ENROLLMENT LIST ITEM (Mobile)
// =============================================================================

function EnrollmentListItem({
  enrollment,
  searchQuery = "",
}: {
  enrollment: Enrollment;
  searchQuery?: string;
}) {
  const statusConfig = getStatusConfig(enrollment.status);
  const StatusIcon = statusConfig.icon;

  // Highlight search match
  const highlightText = (text: string | undefined) => {
    if (!text) return "—";
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, idx) =>
          regex.test(part) ? (
            <mark key={`highlight-${text.slice(0, 10)}-${idx}`} className="bg-amber-200 dark:bg-amber-800/50">{part}</mark>
          ) : (
            <span key={`text-${text.slice(0, 10)}-${idx}`}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <Link
      href={`/enrollments/${enrollment.id}`}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 transition-all active:scale-[0.98] dark:bg-zinc-900 dark:ring-zinc-800 sm:hidden"
    >
      {/* Icon */}
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/30">
        <ShoppingBagIcon className="size-5 text-indigo-500" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
            Order #{enrollment.orderId.slice(-8)}
          </h3>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}>
            <StatusIcon className="size-2.5" />
            {statusConfig.shortLabel}
          </span>
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {enrollment.campaign?.title && (
            <span className="truncate">{highlightText(enrollment.campaign.title)}</span>
          )}
          {enrollment.shopper?.displayName && enrollment.campaign?.title && (
            <span>•</span>
          )}
          {enrollment.shopper?.displayName && (
            <span className="truncate">{highlightText(enrollment.shopper.displayName)}</span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-3 text-xs">
          <span className="font-semibold text-zinc-900 dark:text-white">
            {formatCurrency(enrollment.orderValueDecimal)}
          </span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            +{enrollment.lockedRebatePercentage}% rebate
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRightIcon className="size-5 shrink-0 text-zinc-400" />
    </Link>
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
}: {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  icon?: typeof CheckCircleIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {Icon && <Icon className="size-3.5" />}
      <span>{label}</span>
      <span className={`ml-0.5 text-xs ${isActive ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-500"}`}>
        {count}
      </span>
    </button>
  );
}

// =============================================================================
// ENROLLMENTS LIST
// =============================================================================

export function EnrollmentsList() {
  const organization = useCurrentOrganization();
  const organizationId = organization?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Map UI filter to API status
  const apiStatus = useMemo((): EnrollmentStatus | undefined => {
    if (statusFilter === "all") return undefined;
    return statusFilter;
  }, [statusFilter]);

  const { data: enrollments, loading, error, refetch, total } = useEnrollments(organizationId, {
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
          enrollment.shopper?.displayName?.toLowerCase().includes(query) ||
          enrollment.campaign?.title?.toLowerCase().includes(query) ||
          enrollment.orderId.toLowerCase().includes(query)
      );
    }

    return result;
  }, [enrollments, searchQuery]);

  // Stats - count from current filtered or all enrollments
  const stats = useMemo(() => {
    const awaitingReview = enrollments.filter((e) => e.status === "awaiting_review").length;
    const approved = enrollments.filter((e) => e.status === "approved").length;
    const rejected = enrollments.filter((e) => e.status === "permanently_rejected").length;
    return { total: total || enrollments.length, awaitingReview, approved, rejected };
  }, [enrollments, total]);

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== "all") count++;
    return count;
  }, [searchQuery, statusFilter]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  if (loading) {
    return <EnrollmentsListSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Heading>Enrollments</Heading>
        <Text className="mt-1">Review and manage campaign enrollments</Text>
      </div>

      {/* Stats Row - horizontal scroll on mobile */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:pb-0">
          <StatCard
            icon={<UserGroupIcon className="size-5" />}
            label="Total"
            value={stats.total}
          />
          <StatCard
            icon={<ClockIcon className="size-5" />}
            label="In Review"
            value={stats.awaitingReview}
            variant="warning"
          />
          <StatCard
            icon={<CheckCircleIcon className="size-5" />}
            label="Approved"
            value={stats.approved}
            variant="success"
          />
          <StatCard
            icon={<XCircleIcon className="size-5" />}
            label="Rejected"
            value={stats.rejected}
            variant="danger"
          />
        </div>
      </div>

      {/* Filters - Desktop tabs + Search */}
      <div className="space-y-3">
        {/* Desktop Tab Filters */}
        <div className="hidden gap-2 overflow-x-auto pb-1 sm:flex">
          <FilterTab
            label="All"
            count={stats.total}
            isActive={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <FilterTab
            label="Awaiting Review"
            count={stats.awaitingReview}
            isActive={statusFilter === "awaiting_review"}
            onClick={() => setStatusFilter("awaiting_review")}
            icon={ClockIcon}
          />
          <FilterTab
            label="Approved"
            count={stats.approved}
            isActive={statusFilter === "approved"}
            onClick={() => setStatusFilter("approved")}
            icon={CheckCircleIcon}
          />
          <FilterTab
            label="Rejected"
            count={stats.rejected}
            isActive={statusFilter === "permanently_rejected"}
            onClick={() => setStatusFilter("permanently_rejected")}
            icon={XCircleIcon}
          />
        </div>

        {/* Desktop Search */}
        <div className="hidden sm:block">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shopper, campaign, or order..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-0 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Clear search"
              >
                <XMarkIcon className="size-4 text-zinc-400" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile: Filter button + Quick search */}
        <div className="flex gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-2.5 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <FunnelIcon className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-semibold text-white dark:bg-white dark:text-zinc-900">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-0 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
            />
          </div>
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
      </div>

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
            searchQuery || statusFilter !== "all"
              ? { label: "Clear filters", onClick: clearAllFilters }
              : undefined
          }
        />
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 dark:border-zinc-700">
            <p className="text-sm text-zinc-500">
              {filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Cards Grid - Desktop */}
          <div className="hidden grid-cols-1 gap-4 sm:grid md:grid-cols-2">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                searchQuery={searchQuery}
              />
            ))}
          </div>

          {/* List View - Mobile */}
          <div className="space-y-2 sm:hidden">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentListItem
                key={enrollment.id}
                enrollment={enrollment}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        </>
      )}

      {/* Mobile Filters Sheet */}
      <MobileFilters
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        stats={stats}
      />
    </div>
  );
}
