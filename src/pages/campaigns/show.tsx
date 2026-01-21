import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from "@/components/dialog";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Skeleton } from "@/components/skeleton";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { Card, CardGrid, StatCard } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useCampaign,
  useCampaignStats,
  useCampaignEnrollments,
  useCurrentOrganization,
  useApproveEnrollment,
  useRejectEnrollment,
  getAPIErrorMessage,
} from "@/hooks/use-api";
import { formatCurrency } from "@/lib/design-tokens";
import type { organizations, shared } from "@/lib/brand-client";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  PauseCircleIcon,
  PencilIcon,
  PlayCircleIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";
import { useParams } from "react-router";

type CampaignStatus = shared.CampaignStatus;
type CampaignEnrollment = organizations.EnrollmentWithRelations;
type EnrollmentStatus = shared.EnrollmentStatus;

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

function getEnrollmentStatusConfig(status: EnrollmentStatus): {
  label: string;
  icon: typeof CheckCircleIcon;
  color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange";
} {
  const statusMap: Record<EnrollmentStatus, { label: string; icon: typeof CheckCircleIcon; color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange" }> = {
    awaiting_submission: { label: "Awaiting Submission", icon: ClockIcon, color: "zinc" },
    awaiting_review: { label: "Awaiting Review", icon: ClockIcon, color: "amber" },
    changes_requested: { label: "Changes Requested", icon: ExclamationTriangleIcon, color: "orange" },
    approved: { label: "Approved", icon: CheckCircleIcon, color: "lime" },
    permanently_rejected: { label: "Rejected", icon: XCircleIcon, color: "red" },
    withdrawn: { label: "Withdrawn", icon: XCircleIcon, color: "zinc" },
    expired: { label: "Expired", icon: ClockIcon, color: "zinc" },
  };
  return statusMap[status] || { label: status, icon: ClockIcon, color: "zinc" };
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
        Failed to load campaign details. Please try again.
      </p>
      <Button className="mt-6" onClick={onRetry} color="dark/zinc">
        <ArrowPathIcon className="size-4" />
        Try Again
      </Button>
    </div>
  );
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Skeleton width={120} height={36} borderRadius={8} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton width={80} height={80} borderRadius={16} />
          <div className="space-y-2">
            <Skeleton width={200} height={28} borderRadius={8} />
            <Skeleton width={150} height={20} borderRadius={6} />
            <div className="flex gap-2">
              <Skeleton width={80} height={24} borderRadius={12} />
              <Skeleton width={80} height={24} borderRadius={12} />
            </div>
          </div>
        </div>
        <Skeleton width={100} height={36} borderRadius={8} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <Skeleton width={48} height={16} />
            <Skeleton width={80} height={28} className="mt-2" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <Skeleton width={150} height={24} />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width="100%" height={48} borderRadius={8} />
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
          <Skeleton width={150} height={24} />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width="100%" height={48} borderRadius={8} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// ENROLLMENT PROGRESS BAR
// =============================================================================

function EnrollmentProgress({ current, max }: { current: number; max?: number }) {
  if (!max || max === 0) {
    return (
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Enrollments</span>
          <span className="font-medium text-zinc-900 dark:text-white">
            {current.toLocaleString("en-IN")} (No limit)
          </span>
        </div>
      </div>
    );
  }

  const percent = Math.min(100, (current / max) * 100);

  const colorClass = percent >= 90
    ? "bg-red-500"
    : percent >= 70
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">Enrollments</span>
        <span className="font-medium text-zinc-900 dark:text-white">
          {current.toLocaleString("en-IN")} / {max.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">
        {(100 - percent).toFixed(0)}% remaining
      </p>
    </div>
  );
}

// =============================================================================
// ENROLLMENT REVIEW DIALOG
// =============================================================================

function EnrollmentReviewDialog({
  open,
  onClose,
  enrollment,
  organizationId,
  campaignId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  enrollment: CampaignEnrollment | null;
  organizationId: string;
  campaignId: string;
  onSuccess: () => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const approveEnrollment = useApproveEnrollment(organizationId);
  const rejectEnrollment = useRejectEnrollment(organizationId);

  const handleApprove = async () => {
    if (!enrollment) return;
    setError(null);
    try {
      await approveEnrollment.mutateAsync({
        campaignId,
        enrollmentId: enrollment.id,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to approve enrollment"));
    }
  };

  const handleReject = async () => {
    if (!enrollment || !rejectReason.trim()) return;
    setError(null);
    try {
      await rejectEnrollment.mutateAsync({
        campaignId,
        enrollmentId: enrollment.id,
        reason: rejectReason,
      });
      onSuccess();
      onClose();
      setRejectReason("");
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to reject enrollment"));
    }
  };

  if (!enrollment) return null;

  const isPending = approveEnrollment.isPending || rejectEnrollment.isPending;

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogTitle>Review Enrollment</DialogTitle>
      <DialogDescription>
        Review this enrollment request from {enrollment.shopper?.displayName || "a shopper"}.
      </DialogDescription>

      <DialogBody>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Enrollment Details */}
          <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Order ID</p>
                <p className="mt-1 font-medium text-zinc-900 dark:text-white">#{enrollment.orderId.slice(-8)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Order Value</p>
                <p className="mt-1 font-medium text-zinc-900 dark:text-white">{formatCurrency(enrollment.orderValueDecimal)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Rebate</p>
                <p className="mt-1 font-medium text-emerald-600 dark:text-emerald-400">{enrollment.lockedRebatePercentage}%</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Created</p>
                <p className="mt-1 font-medium text-zinc-900 dark:text-white">
                  {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Reject Reason */}
          <div>
            <label htmlFor="reject-reason" className="block text-sm font-medium text-zinc-900 dark:text-white">
              Rejection Reason (required to reject)
            </label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
              className="mt-2"
            />
          </div>
        </div>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={handleReject}
          disabled={isPending || !rejectReason.trim()}
        >
          {rejectEnrollment.isPending ? "Rejecting..." : "Reject"}
        </Button>
        <Button
          color="emerald"
          onClick={handleApprove}
          disabled={isPending}
        >
          {approveEnrollment.isPending ? "Approving..." : "Approve"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// ENROLLMENT CARD
// =============================================================================

function EnrollmentCard({
  enrollment,
  onClick,
}: {
  enrollment: CampaignEnrollment;
  onClick: () => void;
}) {
  const statusConfig = getEnrollmentStatusConfig(enrollment.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  // Calculate rebate amount
  const rebateAmount = useMemo(() => {
    const orderValue = parseFloat(enrollment.orderValueDecimal);
    const rebatePercentage = enrollment.lockedRebatePercentage;
    if (Number.isNaN(orderValue) || rebatePercentage == null) return "0.00";
    return ((orderValue * rebatePercentage) / 100).toFixed(2);
  }, [enrollment.orderValueDecimal, enrollment.lockedRebatePercentage]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg bg-zinc-50 p-3 text-left transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700">
          <ShoppingBagIcon className="size-5 text-zinc-400" />
        </div>
        <div>
          <p className="font-medium text-zinc-900 dark:text-white">
            Order #{enrollment.orderId.slice(-8)}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {enrollment.shopper?.displayName || "Shopper"} · {formatDate(enrollment.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-medium text-zinc-900 dark:text-white">{formatCurrency(enrollment.orderValueDecimal)}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">+{formatCurrency(rebateAmount)}</p>
        </div>
        <Badge color={statusConfig.color} className="inline-flex items-center gap-1">
          <StatusIcon className="size-3" />
          {statusConfig.label}
        </Badge>
      </div>
    </button>
  );
}

// =============================================================================
// CAMPAIGN SHOW PAGE
// =============================================================================

export function CampaignShow() {
  const { id: campaignId } = useParams<{ id: string }>();
  const organization = useCurrentOrganization();
  const organizationId = organization?.id;

  const { data: campaign, loading: campaignLoading, error: campaignError, refetch: refetchCampaign } = useCampaign(organizationId, campaignId);
  const { data: stats, loading: statsLoading, refetch: refetchStats } = useCampaignStats(organizationId, campaignId);
  const { data: enrollments, loading: enrollmentsLoading, refetch: refetchEnrollments } = useCampaignEnrollments(organizationId, campaignId, { take: 10 });

  const [selectedEnrollment, setSelectedEnrollment] = useState<CampaignEnrollment | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const loading = campaignLoading || statsLoading;

  const handleRefetch = () => {
    refetchCampaign();
    refetchStats();
    refetchEnrollments();
  };

  const handleEnrollmentClick = (enrollment: CampaignEnrollment) => {
    if (enrollment.status === "awaiting_review") {
      setSelectedEnrollment(enrollment);
      setShowReviewDialog(true);
    }
  };

  const handleReviewSuccess = () => {
    refetchEnrollments();
    refetchStats();
  };

  // Format dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Calculate days remaining
  const daysRemaining = useMemo(() => {
    if (!campaign?.endDate) return null;
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [campaign?.endDate]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (campaignError || !campaign) {
    return <ErrorState onRetry={handleRefetch} />;
  }

  const statusConfig = getStatusConfig(campaign.status);
  const StatusIcon = statusConfig.icon;

  // Get type badge color
  const getTypeColor = (type: string): "indigo" | "emerald" | "purple" => {
    const typeColors: Record<string, "indigo" | "emerald" | "purple"> = {
      cashback: "emerald",
      barter: "purple",
      hybrid: "indigo",
    };
    return typeColors[type] || "indigo";
  };

  const pendingCount = enrollments.filter(e => e.status === "awaiting_review").length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Campaigns
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Campaign Icon */}
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600">
            <MegaphoneIcon className="size-10 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Heading>{campaign.title}</Heading>
            </div>
            {campaign.description && (
              <Text className="mt-1 max-w-xl">{campaign.description}</Text>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge color={statusConfig.color} className="inline-flex items-center gap-1">
                <StatusIcon className="size-3" />
                {statusConfig.label}
              </Badge>
              <Badge color={getTypeColor(campaign.campaignType)}>
                {campaign.campaignType}
              </Badge>
              {pendingCount > 0 && (
                <Badge color="amber">
                  {pendingCount} pending review
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button href={`/campaigns/${campaignId}/edit`} outline>
            <PencilIcon className="size-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <CardGrid columns={4} gap="md">
        <StatCard
          icon={<UserGroupIcon className="size-5" />}
          label="Total Enrollments"
          value={stats?.totalEnrollments ?? 0}
        />
        <StatCard
          icon={<CheckCircleIcon className="size-5" />}
          label="Approved"
          value={stats?.approvedEnrollments ?? 0}
          variant="success"
        />
        <StatCard
          icon={<ClockIcon className="size-5" />}
          label="Pending Review"
          value={stats?.pendingEnrollments ?? 0}
          variant="warning"
        />
        <StatCard
          icon={<CurrencyRupeeIcon className="size-5" />}
          label="Total Rebates"
          value={formatCurrency(stats?.totalPayoutsDecimal ?? "0")}
          variant="info"
        />
      </CardGrid>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Campaign Details */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Campaign Details</h3>

            <div className="mt-6 space-y-4">
              {/* Duration */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/30">
                    <CalendarIcon className="size-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Duration</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </p>
                  </div>
                </div>
                {daysRemaining !== null && (
                  <Badge color={daysRemaining <= 7 ? "amber" : "zinc"}>
                    {daysRemaining > 0 ? `${daysRemaining} days left` : "Ended"}
                  </Badge>
                )}
              </div>

              {/* Rebate */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                    <CurrencyRupeeIcon className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Rebate Percentage</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Cashback to shoppers</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {campaign.rebatePercentage}%
                </span>
              </div>

              {/* Platform Fee */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
                    <ChartBarIcon className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Platform Fee</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Per enrollment</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {campaign.platformFee ? formatCurrency(campaign.platformFee / 100) : "N/A"}
                </span>
              </div>

              {/* Enrollment Progress */}
              <div className="pt-2">
                <EnrollmentProgress
                  current={campaign.currentEnrollments ?? 0}
                  max={campaign.maxEnrollments}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Recent Enrollments</h3>
              <Link
                href={`/enrollments?campaignId=${campaignId}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                View all
              </Link>
            </div>

            {enrollmentsLoading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} width="100%" height={64} borderRadius={8} />
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  preset="enrollments"
                  title="No enrollments yet"
                  description="Enrollments will appear here when shoppers join this campaign"
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {enrollments.slice(0, 5).map((enrollment) => (
                  <EnrollmentCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    onClick={() => handleEnrollmentClick(enrollment)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Review Dialog */}
      <EnrollmentReviewDialog
        open={showReviewDialog}
        onClose={() => {
          setShowReviewDialog(false);
          setSelectedEnrollment(null);
        }}
        enrollment={selectedEnrollment}
        organizationId={organizationId || ""}
        campaignId={campaignId || ""}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
