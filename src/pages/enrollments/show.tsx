import { Avatar } from "@/components/avatar";
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
import { Card } from "@/components/shared/card";
import {
  useEnrollmentDetail,
  useCurrentOrganization,
  useApproveEnrollment,
  useRejectEnrollment,
  getAPIErrorMessage,
} from "@/hooks/use-api";
import { formatCurrency } from "@/lib/design-tokens";
import type { shared } from "@/lib/brand-client";
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  MegaphoneIcon,
  PhotoIcon,
  ShoppingBagIcon,
  UserIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";
import { useParams } from "react-router";

type EnrollmentStatus = shared.EnrollmentStatus;

// =============================================================================
// STATUS CONFIG
// =============================================================================

function getStatusConfig(status: EnrollmentStatus): {
  label: string;
  icon: typeof CheckCircleIcon;
  color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange";
  bgColor: string;
} {
  const statusMap: Record<EnrollmentStatus, { label: string; icon: typeof CheckCircleIcon; color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange"; bgColor: string }> = {
    awaiting_submission: { label: "Awaiting Submission", icon: ClockIcon, color: "zinc", bgColor: "bg-zinc-50 dark:bg-zinc-800/50" },
    awaiting_review: { label: "Awaiting Review", icon: ClockIcon, color: "amber", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
    changes_requested: { label: "Changes Requested", icon: ExclamationTriangleIcon, color: "orange", bgColor: "bg-orange-50 dark:bg-orange-950/30" },
    approved: { label: "Approved", icon: CheckCircleIcon, color: "lime", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
    permanently_rejected: { label: "Rejected", icon: XCircleIcon, color: "red", bgColor: "bg-red-50 dark:bg-red-950/30" },
    withdrawn: { label: "Withdrawn", icon: XCircleIcon, color: "zinc", bgColor: "bg-zinc-50 dark:bg-zinc-800/50" },
    expired: { label: "Expired", icon: ClockIcon, color: "zinc", bgColor: "bg-zinc-50 dark:bg-zinc-800/50" },
  };
  return statusMap[status] || { label: status, icon: ClockIcon, color: "zinc", bgColor: "bg-zinc-50 dark:bg-zinc-800/50" };
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
        Failed to load enrollment details. Please try again.
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
      <Skeleton width={140} height={36} borderRadius={8} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton width={64} height={64} borderRadius={16} />
          <div className="space-y-2">
            <Skeleton width={200} height={28} borderRadius={8} />
            <Skeleton width={150} height={20} borderRadius={6} />
            <Skeleton width={100} height={24} borderRadius={12} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton width={100} height={36} borderRadius={8} />
          <Skeleton width={100} height={36} borderRadius={8} />
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
            <Skeleton width={150} height={24} />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} width="100%" height={48} borderRadius={8} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// INFO ROW COMPONENT
// =============================================================================

function InfoRow({
  icon: Icon,
  iconColor,
  label,
  value,
  valueColor,
}: {
  icon: typeof CheckCircleIcon;
  iconColor: string;
  label: string;
  value: string | React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-lg ${iconColor}`}>
          <Icon className="size-4 text-current" />
        </div>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      </div>
      <span className={`text-sm font-medium ${valueColor || "text-zinc-900 dark:text-white"}`}>
        {value}
      </span>
    </div>
  );
}

// =============================================================================
// REVIEW DIALOG
// =============================================================================

function ReviewDialog({
  open,
  onClose,
  action,
  organizationId,
  campaignId,
  enrollmentId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  action: "approve" | "reject";
  organizationId: string;
  campaignId: string;
  enrollmentId: string;
  onSuccess: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const approveEnrollment = useApproveEnrollment(organizationId);
  const rejectEnrollment = useRejectEnrollment(organizationId);

  const handleSubmit = async () => {
    setError(null);
    try {
      if (action === "approve") {
        await approveEnrollment.mutateAsync({
          campaignId,
          enrollmentId,
          remarks: reason || undefined,
        });
      } else {
        if (!reason.trim()) {
          setError("Please provide a reason for rejection");
          return;
        }
        await rejectEnrollment.mutateAsync({
          campaignId,
          enrollmentId,
          reason,
        });
      }
      onSuccess();
      onClose();
      setReason("");
    } catch (err) {
      setError(getAPIErrorMessage(err, `Failed to ${action} enrollment`));
    }
  };

  const isPending = approveEnrollment.isPending || rejectEnrollment.isPending;

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogTitle>
        {action === "approve" ? "Approve Enrollment" : "Reject Enrollment"}
      </DialogTitle>
      <DialogDescription>
        {action === "approve"
          ? "Add optional remarks for this approval."
          : "Please provide a reason for rejecting this enrollment."}
      </DialogDescription>

      <DialogBody>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-zinc-900 dark:text-white">
            {action === "approve" ? "Remarks (optional)" : "Reason (required)"}
          </label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={action === "approve" ? "Add any notes..." : "Enter reason for rejection..."}
            rows={3}
            className="mt-2"
          />
        </div>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          color={action === "approve" ? "emerald" : "red"}
          onClick={handleSubmit}
          disabled={isPending || (action === "reject" && !reason.trim())}
        >
          {isPending ? "Processing..." : action === "approve" ? "Approve" : "Reject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// ENROLLMENT SHOW PAGE
// =============================================================================

export function EnrollmentShow() {
  const { id: enrollmentId, campaignId } = useParams<{ id: string; campaignId: string }>();
  const organization = useCurrentOrganization();
  const organizationId = organization?.id;

  const { data: enrollment, loading, error, refetch } = useEnrollmentDetail(
    organizationId,
    campaignId,
    enrollmentId
  );

  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);

  const handleReviewSuccess = () => {
    refetch();
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate rebate amount
  const rebateAmount = useMemo(() => {
    if (!enrollment) return "0.00";
    const orderValue = parseFloat(enrollment.orderValueDecimal);
    const rebatePercentage = enrollment.lockedRebatePercentage;
    if (Number.isNaN(orderValue) || rebatePercentage == null) return "0.00";
    return ((orderValue * rebatePercentage) / 100).toFixed(2);
  }, [enrollment]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !enrollment) {
    return <ErrorState onRetry={refetch} />;
  }

  const statusConfig = getStatusConfig(enrollment.status);
  const StatusIcon = statusConfig.icon;
  const canReview = enrollment.status === "awaiting_review";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/enrollments"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Enrollments
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Order Icon */}
          <div className={`flex size-16 shrink-0 items-center justify-center rounded-2xl ${statusConfig.bgColor}`}>
            <ShoppingBagIcon className={`size-8 ${statusConfig.color === "lime" ? "text-emerald-500" : statusConfig.color === "amber" ? "text-amber-500" : statusConfig.color === "red" ? "text-red-500" : "text-zinc-500"}`} />
          </div>

          <div>
            <Heading>Order #{enrollment.orderId.slice(-8)}</Heading>
            <Text className="mt-1">
              Enrollment for campaign
            </Text>
            <div className="mt-2">
              <Badge color={statusConfig.color} className="inline-flex items-center gap-1">
                <StatusIcon className="size-3" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>

        {canReview && (
          <div className="flex gap-2">
            <Button outline onClick={() => setReviewAction("reject")}>
              <XCircleIcon className="size-4" />
              Reject
            </Button>
            <Button color="emerald" onClick={() => setReviewAction("approve")}>
              <CheckCircleIcon className="size-4" />
              Approve
            </Button>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Details */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Order Details</h3>

            <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-700">
              <InfoRow
                icon={ShoppingBagIcon}
                iconColor="bg-indigo-50 text-indigo-500 dark:bg-indigo-950/30"
                label="Order ID"
                value={enrollment.orderId}
              />
              <InfoRow
                icon={CurrencyRupeeIcon}
                iconColor="bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30"
                label="Order Value"
                value={formatCurrency(enrollment.orderValueDecimal)}
              />
              <InfoRow
                icon={CurrencyRupeeIcon}
                iconColor="bg-amber-50 text-amber-500 dark:bg-amber-950/30"
                label="Rebate"
                value={`${enrollment.lockedRebatePercentage}% (${formatCurrency(rebateAmount)})`}
                valueColor="text-emerald-600 dark:text-emerald-400"
              />
              <InfoRow
                icon={CalendarIcon}
                iconColor="bg-sky-50 text-sky-500 dark:bg-sky-950/30"
                label="Created"
                value={formatDate(enrollment.createdAt)}
              />
            </div>
          </div>
        </Card>

        {/* Campaign Info */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Campaign</h3>

            <div className="mt-4">
              <Link
                href={`/campaigns/${enrollment.campaignId}`}
                className="flex items-center gap-4 rounded-xl bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-950/50">
                  <MegaphoneIcon className="size-6 text-indigo-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {enrollment.campaign.title || "Campaign"}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {enrollment.lockedRebatePercentage}% rebate
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </Card>

        {/* Shopper Info */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Shopper</h3>

            <div className="mt-4">
              <div className="flex items-center gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                {enrollment.shopper.avatarUrl ? (
                  <Avatar src={enrollment.shopper.avatarUrl} className="size-12" />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/50">
                    <UserIcon className="size-6 text-indigo-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {enrollment.shopper.displayName || "Shopper"}
                  </p>
                  {enrollment.shopper.email && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {enrollment.shopper.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Submission Details */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Submission</h3>

            <div className="mt-4 space-y-4">
              {/* Screenshots from submissions */}
              {enrollment.submissions.some((s) => s.proofScreenshot) ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">Screenshots</p>
                  <div className="grid grid-cols-3 gap-2">
                    {enrollment.submissions
                      .filter((s) => s.proofScreenshot)
                      .map((submission) => (
                        <a
                          key={submission.id}
                          href={submission.proofScreenshot}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
                        >
                          <img
                            src={submission.proofScreenshot}
                            alt={submission.deliverableName}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <PhotoIcon className="size-6 text-white" />
                          </div>
                        </a>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <PhotoIcon className="size-5 text-zinc-400" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">No screenshots uploaded</span>
                </div>
              )}

              {/* Links from submissions */}
              {enrollment.submissions.some((s) => s.proofLink) ? (
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">Links</p>
                  <div className="space-y-2">
                    {enrollment.submissions
                      .filter((s) => s.proofLink)
                      .map((submission) => (
                        <a
                          key={submission.id}
                          href={submission.proofLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm text-indigo-600 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:text-indigo-400 dark:hover:bg-zinc-800"
                        >
                          <LinkIcon className="size-4" />
                          <span className="truncate">{submission.proofLink}</span>
                        </a>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                  <LinkIcon className="size-5 text-zinc-400" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">No links submitted</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Status History */}
      {enrollment.history && enrollment.history.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Status History</h3>

            <div className="mt-4 space-y-3">
              {enrollment.history.map((historyItem) => (
                <div
                  key={historyItem.id}
                  className="flex items-start gap-3 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50"
                >
                  <div className={`flex size-8 items-center justify-center rounded-full ${
                    historyItem.toStatus === "approved"
                      ? "bg-emerald-100 dark:bg-emerald-950/50"
                      : historyItem.toStatus === "permanently_rejected"
                        ? "bg-red-100 dark:bg-red-950/50"
                        : "bg-zinc-100 dark:bg-zinc-800"
                  }`}>
                    {historyItem.toStatus === "approved" ? (
                      <CheckCircleIcon className="size-4 text-emerald-500" />
                    ) : historyItem.toStatus === "permanently_rejected" ? (
                      <XCircleIcon className="size-4 text-red-500" />
                    ) : (
                      <ClockIcon className="size-4 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {historyItem.toStatus.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(historyItem.changedAt)}
                      </span>
                    </div>
                    {historyItem.reason && (
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                        {historyItem.reason}
                      </p>
                    )}
                    {historyItem.changedByName && (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        by {historyItem.changedByName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Review Dialog */}
      {reviewAction && (
        <ReviewDialog
          open={!!reviewAction}
          onClose={() => setReviewAction(null)}
          action={reviewAction}
          organizationId={organizationId || ""}
          campaignId={campaignId || ""}
          enrollmentId={enrollmentId || ""}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
