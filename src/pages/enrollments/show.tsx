import {
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyRupeeIcon,
	ExclamationTriangleIcon,
	HashtagIcon,
	LinkIcon,
	MegaphoneIcon,
	PencilSquareIcon,
	PhotoIcon,
	ShoppingBagIcon,
	UserIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import { useParams } from "@tanstack/react-router";
import clsx from "clsx";
import lgZoom from "lightgallery/plugins/zoom";
import LightGallery from "lightgallery/react";
import { useMemo, useState } from "react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { ContentCard } from "@/components/content-card";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { extractPlatformFromText, getPlatformColor, getPlatformIcon } from "@/components/icons/platform-icons";
import { Link } from "@/components/link";
import { useCan } from "@/components/shared/can";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/skeleton";
import { Textarea } from "@/components/textarea";
import { useEnrollment } from "@/features/enrollments/hooks";
import {
	useApproveEnrollment,
	useRejectEnrollment,
	useRequestChangesEnrollment,
} from "@/features/enrollments/mutations";
import { getAssetUrl } from "@/hooks/api-client";
import { usePageTitle } from "@/hooks/use-breadcrumb";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand, db } from "@/lib/brand-client";
import { formatCurrency, formatDateTime, formatRelativeTime, getInitials } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";

type EnrollmentStatus = db.EnrollmentStatus;

// =============================================================================
// STATUS CONFIG
// =============================================================================

const STATUS_MAP: Record<
	EnrollmentStatus,
	{
		label: string;
		icon: typeof CheckCircleIcon;
		color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange" | "sky";
		dot: string;
		bg: string;
		text: string;
		gradient: string;
	}
> = {
	awaiting_submission: {
		label: "Awaiting Submission",
		icon: ClockIcon,
		color: "zinc",
		dot: "bg-zinc-400",
		bg: "bg-zinc-100 dark:bg-zinc-800",
		text: "text-zinc-500 dark:text-zinc-400",
		gradient: "from-zinc-500/10 to-transparent dark:from-zinc-500/5",
	},
	awaiting_review: {
		label: "Awaiting Review",
		icon: ClockIcon,
		color: "amber",
		dot: "bg-amber-400",
		bg: "bg-amber-50 dark:bg-amber-950/30",
		text: "text-amber-600 dark:text-amber-400",
		gradient: "from-amber-500/10 to-transparent dark:from-amber-500/5",
	},
	changes_requested: {
		label: "Changes Requested",
		icon: ExclamationTriangleIcon,
		color: "orange",
		dot: "bg-orange-400",
		bg: "bg-orange-50 dark:bg-orange-950/30",
		text: "text-orange-600 dark:text-orange-400",
		gradient: "from-orange-500/10 to-transparent dark:from-orange-500/5",
	},
	approved: {
		label: "Approved",
		icon: CheckCircleIcon,
		color: "emerald",
		dot: "bg-emerald-400",
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		text: "text-emerald-600 dark:text-emerald-400",
		gradient: "from-emerald-500/10 to-transparent dark:from-emerald-500/5",
	},
	permanently_rejected: {
		label: "Rejected",
		icon: XCircleIcon,
		color: "red",
		dot: "bg-red-400",
		bg: "bg-red-50 dark:bg-red-950/30",
		text: "text-red-600 dark:text-red-400",
		gradient: "from-red-500/10 to-transparent dark:from-red-500/5",
	},
	cancelled: {
		label: "Cancelled",
		icon: XCircleIcon,
		color: "zinc",
		dot: "bg-zinc-400",
		bg: "bg-zinc-100 dark:bg-zinc-800",
		text: "text-zinc-500 dark:text-zinc-400",
		gradient: "from-zinc-500/10 to-transparent dark:from-zinc-500/5",
	},
	expired: {
		label: "Expired",
		icon: ClockIcon,
		color: "zinc",
		dot: "bg-zinc-400",
		bg: "bg-zinc-100 dark:bg-zinc-800",
		text: "text-zinc-500 dark:text-zinc-400",
		gradient: "from-zinc-500/10 to-transparent dark:from-zinc-500/5",
	},
};

const FALLBACK_STATUS = {
	label: "Unknown",
	icon: ClockIcon,
	color: "zinc" as const,
	dot: "bg-zinc-400",
	bg: "bg-zinc-100 dark:bg-zinc-800",
	text: "text-zinc-500 dark:text-zinc-400",
	gradient: "from-zinc-500/10 to-transparent dark:from-zinc-500/5",
};

function getStatusConfig(status: EnrollmentStatus) {
	return STATUS_MAP[status] || FALLBACK_STATUS;
}

// =============================================================================
// COST CALCULATION
// =============================================================================

function calculateCosts(enrollment: brand.EnrollmentDetail) {
	if (enrollment.brandCost) {
		const orderValue = parseFloat(enrollment.brandCost.orderValueDecimal);
		const billAmount = (orderValue * enrollment.lockedBillRate) / 100;
		return {
			billAmount,
			gstAmount: parseFloat(enrollment.brandCost.gstAmountDecimal),
			platformFee: parseFloat(enrollment.brandCost.platformFeeDecimal),
			totalCost: parseFloat(enrollment.brandCost.totalChargeDecimal),
			orderValue,
		};
	}
	const orderValue = parseFloat(enrollment.orderValueDecimal);
	const billAmount = orderValue * (enrollment.lockedBillRate / 100);
	const gstAmount = billAmount * 0.18;
	const platformFee = parseFloat(enrollment.lockedPlatformFeeDecimal);
	const totalCost = billAmount + gstAmount + platformFee;
	return { billAmount, gstAmount, platformFee, totalCost, orderValue };
}

function getAvatarColor(name: string): string {
	const colors = [
		"bg-blue-500",
		"bg-purple-500",
		"bg-sky-500",
		"bg-amber-500",
		"bg-emerald-500",
		"bg-rose-500",
		"bg-indigo-500",
		"bg-teal-500",
	];
	const charCode = (name?.charAt(0) || "U").toUpperCase().charCodeAt(0);
	return colors[charCode % colors.length];
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
	return (
		<div className="animate-fade-in space-y-5">
			{/* Hero */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="p-5 sm:p-6">
					<div className="flex items-start gap-4">
						<Skeleton width={52} height={52} borderRadius={14} />
						<div className="flex-1 space-y-2.5">
							<Skeleton width={180} height={22} borderRadius={6} />
							<Skeleton width={140} height={14} borderRadius={6} />
							<div className="flex gap-2">
								<Skeleton width={90} height={22} borderRadius={10} />
								<Skeleton width={70} height={22} borderRadius={10} />
							</div>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-px border-t border-zinc-200 bg-zinc-200 sm:grid-cols-4 dark:border-zinc-700 dark:bg-zinc-700">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="bg-white px-4 py-3.5 sm:px-5 dark:bg-zinc-900">
							<Skeleton width={60} height={10} borderRadius={4} />
							<Skeleton width={90} height={20} borderRadius={5} className="mt-1.5" />
						</div>
					))}
				</div>
			</div>

			{/* Grid */}
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				<div className="space-y-5">
					<Skeleton width="100%" height={320} borderRadius={12} />
					<Skeleton width="100%" height={280} borderRadius={12} />
				</div>
				<div className="space-y-5">
					<Skeleton width="100%" height={120} borderRadius={12} />
					<Skeleton width="100%" height={180} borderRadius={12} />
					<Skeleton width="100%" height={200} borderRadius={12} />
					<Skeleton width="100%" height={200} borderRadius={12} />
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// DETAIL ROW
// =============================================================================

function DetailRow({
	label,
	value,
	copyValue,
	mono,
}: {
	label: string;
	value: React.ReactNode;
	copyValue?: string;
	mono?: boolean;
}) {
	return (
		<div className="flex items-center justify-between gap-4 py-2.5">
			<dt className="shrink-0 text-[13px] text-zinc-500 dark:text-zinc-400">{label}</dt>
			<dd className="flex min-w-0 items-center gap-1.5">
				{typeof value === "string" ? (
					<span
						className={clsx(
							"truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100",
							mono && "font-mono text-xs"
						)}
					>
						{value}
					</span>
				) : (
					value
				)}
				{copyValue && <CopyButton value={copyValue} label={label} />}
			</dd>
		</div>
	);
}

// =============================================================================
// ZOOMABLE IMAGE
// =============================================================================

function ZoomableImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
	return (
		<LightGallery plugins={[lgZoom]} download={false} backdropDuration={200} elementClassNames="inline">
			<a href={src}>
				<img
					src={src}
					alt={alt}
					loading="lazy"
					className={clsx("cursor-pointer transition-all duration-300 hover:brightness-95", className)}
				/>
			</a>
		</LightGallery>
	);
}

// =============================================================================
// STATUS TIMELINE
// =============================================================================

const TIMELINE_CONFIG: Record<string, { icon: typeof CheckCircleIcon; color: string; bg: string; ring: string }> = {
	enrolled: {
		icon: CheckCircleIcon,
		color: "text-emerald-500",
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		ring: "ring-emerald-200 dark:ring-emerald-800/40",
	},
	awaiting_submission: {
		icon: ClockIcon,
		color: "text-zinc-400",
		bg: "bg-zinc-50 dark:bg-zinc-800/50",
		ring: "ring-zinc-200 dark:ring-zinc-700",
	},
	awaiting_review: {
		icon: ClockIcon,
		color: "text-amber-500",
		bg: "bg-amber-50 dark:bg-amber-950/30",
		ring: "ring-amber-200 dark:ring-amber-800/40",
	},
	changes_requested: {
		icon: ExclamationTriangleIcon,
		color: "text-orange-500",
		bg: "bg-orange-50 dark:bg-orange-950/30",
		ring: "ring-orange-200 dark:ring-orange-800/40",
	},
	approved: {
		icon: CheckCircleIcon,
		color: "text-emerald-500",
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		ring: "ring-emerald-200 dark:ring-emerald-800/40",
	},
	permanently_rejected: {
		icon: XCircleIcon,
		color: "text-red-500",
		bg: "bg-red-50 dark:bg-red-950/30",
		ring: "ring-red-200 dark:ring-red-800/40",
	},
	rejected: {
		icon: XCircleIcon,
		color: "text-red-500",
		bg: "bg-red-50 dark:bg-red-950/30",
		ring: "ring-red-200 dark:ring-red-800/40",
	},
	cancelled: {
		icon: XCircleIcon,
		color: "text-zinc-400",
		bg: "bg-zinc-50 dark:bg-zinc-800/50",
		ring: "ring-zinc-200 dark:ring-zinc-700",
	},
	expired: {
		icon: ClockIcon,
		color: "text-zinc-400",
		bg: "bg-zinc-50 dark:bg-zinc-800/50",
		ring: "ring-zinc-200 dark:ring-zinc-700",
	},
};

const STATUS_LABELS: Record<string, string> = {
	enrolled: "Enrolled",
	awaiting_submission: "Awaiting Submission",
	awaiting_review: "Awaiting Review",
	changes_requested: "Changes Requested",
	approved: "Approved",
	permanently_rejected: "Rejected",
	rejected: "Rejected",
	cancelled: "Cancelled",
	expired: "Expired",
};

function TimelineItem({ item, isLast }: { item: brand.EnrollmentDetail["history"][number]; isLast: boolean }) {
	const config = TIMELINE_CONFIG[item.toStatus] || {
		icon: ClockIcon,
		color: "text-zinc-400",
		bg: "bg-zinc-50 dark:bg-zinc-800/50",
		ring: "ring-zinc-200 dark:ring-zinc-700",
	};
	const Icon = config.icon;

	return (
		<div className="relative flex gap-3.5">
			{!isLast && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700/80" />}
			<div
				className={clsx(
					"relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full ring-1",
					config.bg,
					config.ring
				)}
			>
				<Icon className={clsx("size-3.5", config.color)} />
			</div>
			<div className={clsx("min-w-0 flex-1 pt-0.5", !isLast && "pb-5")}>
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
							{STATUS_LABELS[item.toStatus] || item.toStatus}
						</p>
						{item.reason && (
							<p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{item.reason}</p>
						)}
					</div>
					<span className="shrink-0 whitespace-nowrap pt-0.5 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
						{formatRelativeTime(item.changedAt)}
					</span>
				</div>
				{item.changedByName && (
					<p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">by {item.changedByName}</p>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
	title,
	icon: Icon,
	iconBg,
	iconColor,
	actions,
}: {
	title: string;
	icon: React.ElementType;
	iconBg: string;
	iconColor: string;
	actions?: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-2.5 border-b border-zinc-200/80 px-4 py-3 sm:px-5 dark:border-zinc-800">
			<div className="flex items-center gap-2.5">
				<div className={clsx("flex size-7 items-center justify-center rounded-lg", iconBg)}>
					<Icon className={clsx("size-3.5", iconColor)} />
				</div>
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
			</div>
			{actions}
		</div>
	);
}

// =============================================================================
// APPROVE DIALOG
// =============================================================================

function ApproveDialog({
	open,
	onClose,
	enrollment,
	organizationId,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	enrollment: brand.EnrollmentDetail;
	organizationId: string;
	onSuccess: () => void;
}) {
	const approveEnrollment = useApproveEnrollment(organizationId);
	const [remarks, setRemarks] = useState("");
	const costs = calculateCosts(enrollment);

	const handleSubmit = async () => {
		try {
			await approveEnrollment.mutateAsync({
				enrollmentId: enrollment.id,
				remarks: remarks || undefined,
			});
			showToast.success("Enrollment approved successfully");
			onSuccess();
			onClose();
			setRemarks("");
		} catch (err) {
			showToast.error(err, "Failed to approve enrollment");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} size="sm">
			<DialogHeader
				icon={CheckCircleIcon}
				iconColor="emerald"
				title="Approve Enrollment"
				description="Authorize payment to the creator."
				onClose={onClose}
			/>

			<DialogBody>
				<div className="mb-4 overflow-hidden rounded-xl shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
					<div className="flex justify-between border-b border-zinc-200 px-4 py-2.5 text-xs dark:border-zinc-800">
						<span className="text-zinc-500 dark:text-zinc-400">Bill Amount ({enrollment.lockedBillRate}%)</span>
						<span className="font-medium text-zinc-900 dark:text-white">{formatCurrency(costs.billAmount)}</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 px-4 py-2.5 text-xs dark:border-zinc-800">
						<span className="text-zinc-500 dark:text-zinc-400">GST (18%)</span>
						<span className="font-medium text-zinc-900 dark:text-white">{formatCurrency(costs.gstAmount)}</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 px-4 py-2.5 text-xs dark:border-zinc-800">
						<span className="text-zinc-500 dark:text-zinc-400">Platform Fee</span>
						<span className="font-medium text-zinc-900 dark:text-white">{formatCurrency(costs.platformFee)}</span>
					</div>
					<div className="flex justify-between bg-emerald-50 px-4 py-3 dark:bg-emerald-950/20">
						<span className="text-sm font-semibold text-zinc-900 dark:text-white">Total</span>
						<span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
							{formatCurrency(costs.totalCost)}
						</span>
					</div>
				</div>

				<div>
					<label htmlFor="approve-remarks" className="block text-sm font-medium text-zinc-900 dark:text-white">
						Remarks (optional)
					</label>
					<Textarea
						id="approve-remarks"
						value={remarks}
						onChange={(e) => setRemarks(e.target.value)}
						placeholder="Add any notes..."
						rows={2}
						className="mt-2"
					/>
				</div>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose} disabled={approveEnrollment.isPending}>
					Cancel
				</Button>
				<Button color="emerald" onClick={handleSubmit} disabled={approveEnrollment.isPending}>
					{approveEnrollment.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Processing...
						</>
					) : (
						<>
							<CheckCircleIcon className="size-4" />
							Approve & Pay
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// REJECT DIALOG
// =============================================================================

function RejectDialog({
	open,
	onClose,
	enrollment,
	organizationId,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	enrollment: brand.EnrollmentDetail;
	organizationId: string;
	onSuccess: () => void;
}) {
	const rejectEnrollment = useRejectEnrollment(organizationId);
	const [reason, setReason] = useState("");

	const handleSubmit = async () => {
		if (!reason.trim()) return;
		try {
			await rejectEnrollment.mutateAsync({
				enrollmentId: enrollment.id,
				reason,
			});
			showToast.success("Enrollment rejected");
			onSuccess();
			onClose();
			setReason("");
		} catch (err) {
			showToast.error(err, "Failed to reject enrollment");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} size="sm">
			<DialogHeader icon={XCircleIcon} iconColor="red" title="Reject Enrollment" onClose={onClose} />

			<DialogBody>
				<div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
					<p className="text-sm text-red-700 dark:text-red-300">
						This action is permanent and cannot be undone. The creator will be notified immediately.
					</p>
				</div>
				<div>
					<label htmlFor="reject-reason" className="block text-sm font-medium text-zinc-900 dark:text-white">
						Reason for rejection
					</label>
					<Textarea
						id="reject-reason"
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="Enter reason for rejection..."
						rows={3}
						className="mt-2"
					/>
				</div>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose} disabled={rejectEnrollment.isPending}>
					Cancel
				</Button>
				<Button color="red" onClick={handleSubmit} disabled={rejectEnrollment.isPending || !reason.trim()}>
					{rejectEnrollment.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Rejecting...
						</>
					) : (
						<>
							<XCircleIcon className="size-4" />
							Confirm Rejection
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// REQUEST CHANGES DIALOG
// =============================================================================

function RequestChangesDialog({
	open,
	onClose,
	enrollment,
	organizationId,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	enrollment: brand.EnrollmentDetail;
	organizationId: string;
	onSuccess: () => void;
}) {
	const requestChanges = useRequestChangesEnrollment(organizationId);
	const [comment, setComment] = useState("");

	const handleSubmit = async () => {
		if (!comment.trim()) return;
		try {
			await requestChanges.mutateAsync({
				enrollmentId: enrollment.id,
				reason: comment.trim(),
			});
			showToast.success("Changes requested from creator");
			onSuccess();
			onClose();
			setComment("");
		} catch (err) {
			showToast.error(err, "Failed to request changes");
		}
	};

	return (
		<Dialog open={open} onClose={onClose} size="sm">
			<DialogHeader
				icon={PencilSquareIcon}
				iconColor="amber"
				title="Request Changes"
				description="The creator will be notified and can resubmit."
				onClose={onClose}
			/>

			<DialogBody>
				<div>
					<label htmlFor="changes-comment" className="block text-sm font-medium text-zinc-900 dark:text-white">
						Required changes
					</label>
					<Textarea
						id="changes-comment"
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="e.g., Please provide a clearer screenshot showing the order total..."
						rows={4}
						className="mt-2"
					/>
				</div>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose} disabled={requestChanges.isPending}>
					Cancel
				</Button>
				<Button color="amber" onClick={handleSubmit} disabled={requestChanges.isPending || !comment.trim()}>
					{requestChanges.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Sending...
						</>
					) : (
						<>
							<PencilSquareIcon className="size-4" />
							Send Request
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// ENROLLMENT SHOW PAGE
// =============================================================================

export function EnrollmentShow() {
	const { id: enrollmentId } = useParams({ strict: false }) as { id: string };
	const { organizationId, orgSlug } = useOrgContext();

	const canApproveGlobal = useCan("enrollment", "approve");
	const canRejectGlobal = useCan("enrollment", "reject");
	const canRequestChangesGlobal = useCan("enrollment", "request_changes");

	const { data: enrollment, loading, error, refetch } = useEnrollment(organizationId, undefined, enrollmentId);
	usePageTitle(enrollment?.displayId ?? null);

	const [activeDialog, setActiveDialog] = useState<"approve" | "reject" | "changes" | null>(null);

	const handleReviewSuccess = () => {
		refetch();
	};

	const costs = useMemo(() => {
		if (!enrollment) return null;
		return calculateCosts(enrollment);
	}, [enrollment]);

	if (loading) return <LoadingSkeleton />;
	if (error || !enrollment)
		return <ErrorState message="Failed to load enrollment details. Please try again." onRetry={refetch} />;

	const sc = getStatusConfig(enrollment.status);
	const StatusIcon = sc.icon;
	const isAwaitingReview = enrollment.status === "awaiting_review";

	const canApproveEnrollment = enrollment.allowedActions
		? enrollment.allowedActions.includes("approve")
		: canApproveGlobal;
	const canRejectEnrollment = enrollment.allowedActions
		? enrollment.allowedActions.includes("reject")
		: canRejectGlobal;
	const canRequestChanges = enrollment.allowedActions
		? enrollment.allowedActions.includes("request_changes")
		: canRequestChangesGlobal;

	const canReview = isAwaitingReview && (canApproveEnrollment || canRejectEnrollment || canRequestChanges);

	const creatorName = enrollment.creator?.profileName || "Creator";
	const campaignTitle = enrollment.campaign?.title || `Campaign ${enrollment.campaignId.slice(-8)}`;
	const platformName = enrollment.platform?.name;
	const PlatIcon = platformName ? getPlatformIcon(platformName) : null;

	const submittedTasks = enrollment.tasks?.filter((t) => !!t.submittedAt) || [];
	const totalTasks = enrollment.tasks?.length || 0;
	const taskProgress = totalTasks > 0 ? Math.round((submittedTasks.length / totalTasks) * 100) : 0;

	return (
		<div className="space-y-5 pb-24 sm:pb-0">
			{/* ================================================================
			    HERO CARD
			    ================================================================ */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className={clsx("relative bg-gradient-to-r p-5 sm:p-6", sc.gradient)}>
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="flex items-center gap-4">
							<div
								className={clsx(
									"flex size-13 shrink-0 items-center justify-center rounded-xl ring-1 ring-black/5",
									sc.bg
								)}
							>
								<StatusIcon className={clsx("size-6", sc.text)} />
							</div>
							<div>
								<div className="flex items-center gap-2.5">
									<h1 className="text-lg font-semibold text-zinc-900 sm:text-xl dark:text-white">
										{enrollment.displayId}
									</h1>
									<Badge color={sc.color} className="inline-flex items-center gap-1">
										<span className={clsx("size-1.5 rounded-full", sc.dot)} />
										{sc.label}
									</Badge>
								</div>
								<p className="mt-1 flex items-center gap-2 text-[13px] text-zinc-500 dark:text-zinc-400">
									<span>{creatorName}</span>
									{platformName && (
										<>
											<span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
											<span className="inline-flex items-center gap-1">
												{PlatIcon && <PlatIcon className={clsx("size-3.5", getPlatformColor(platformName))} />}
												{platformName}
											</span>
										</>
									)}
								</p>
								<div className="mt-2 flex flex-wrap items-center gap-1.5">
									<Badge color="zinc">{enrollment.paymentMode === "prefund" ? "Prefund" : "Post Submission"}</Badge>
									{enrollment.campaign?.type && (
										<Badge color="zinc" className="capitalize">
											{enrollment.campaign.type}
										</Badge>
									)}
								</div>
							</div>
						</div>
						{canReview && (
							<div className="hidden items-center gap-2 sm:flex">
								{canRequestChanges && (
									<Button outline onClick={() => setActiveDialog("changes")}>
										<PencilSquareIcon className="size-4" />
										Request Changes
									</Button>
								)}
								{canRejectEnrollment && (
									<Button color="red" onClick={() => setActiveDialog("reject")}>
										<XCircleIcon className="size-4" />
										Reject
									</Button>
								)}
								{canApproveEnrollment && (
									<Button color="emerald" onClick={() => setActiveDialog("approve")}>
										<CheckCircleIcon className="size-4" />
										Approve & Pay
									</Button>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Stats strip */}
				<div className="grid grid-cols-2 gap-px border-t border-zinc-200 bg-zinc-200 sm:grid-cols-4 dark:border-zinc-700 dark:bg-zinc-700">
					{[
						{ label: "Order Value", value: formatCurrency(enrollment.orderValueDecimal), highlight: true },
						{ label: "Order ID", value: enrollment.orderId, mono: true, copy: true },
						{ label: "Enrolled", value: formatRelativeTime(enrollment.createdAt) },
						{ label: "Expires", value: enrollment.expiresAt ? formatRelativeTime(enrollment.expiresAt) : "No expiry" },
					].map((stat) => (
						<div key={stat.label} className="bg-white px-4 py-3 sm:px-5 sm:py-3.5 dark:bg-zinc-900">
							<dt className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
								{stat.label}
							</dt>
							<dd className="mt-1 flex items-center gap-1.5">
								<span
									className={clsx(
										"truncate text-sm text-zinc-900 dark:text-zinc-100",
										stat.highlight && "font-semibold",
										stat.mono && "max-w-28 font-mono text-xs"
									)}
								>
									{stat.value}
								</span>
								{stat.copy && <CopyButton value={stat.value} label={stat.label} />}
							</dd>
						</div>
					))}
				</div>
			</div>

			{/* ================================================================
			    REJECTION BANNER
			    ================================================================ */}
			{enrollment.rejection && (
				<div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 ring-1 ring-red-200/60 dark:bg-red-950/20 dark:ring-red-900/40">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
						<XCircleIcon className="size-4 text-red-500" />
					</div>
					<div className="min-w-0 pt-0.5">
						<p className="text-[13px] font-semibold text-red-800 dark:text-red-300">Enrollment Rejected</p>
						<p className="mt-0.5 text-sm leading-relaxed text-red-700/80 dark:text-red-400/80">
							{enrollment.rejection.reason}
						</p>
						{enrollment.rejection.lastRejectedAt && (
							<p className="mt-2 text-[11px] text-red-500/70 dark:text-red-500/60">
								{formatDateTime(enrollment.rejection.lastRejectedAt)}
							</p>
						)}
					</div>
				</div>
			)}

			{/* ================================================================
			    MAIN GRID — equal columns, balanced content
			    ================================================================ */}
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
				{/* ============================================================
				    LEFT COLUMN — Order, Deliverables, OCR
				    ============================================================ */}
				<div className="space-y-5">
					{/* Order Details */}
					<ContentCard padding="none">
						<SectionHeader
							title="Order Details"
							icon={HashtagIcon}
							iconBg="bg-sky-50 dark:bg-sky-950/30"
							iconColor="text-sky-600 dark:text-sky-400"
						/>
						<dl className="divide-y divide-zinc-100 px-4 sm:px-5 dark:divide-zinc-800/60">
							<DetailRow label="Order ID" value={enrollment.orderId} copyValue={enrollment.orderId} mono />
							<DetailRow label="Display ID" value={enrollment.displayId} copyValue={enrollment.displayId} mono />
							<DetailRow
								label="Order Value"
								value={
									<span className="text-sm font-semibold text-zinc-900 dark:text-white">
										{formatCurrency(enrollment.orderValueDecimal)}
									</span>
								}
							/>
							<DetailRow label="Currency" value={enrollment.currency} />
							<DetailRow
								label="Purchase Date"
								value={enrollment.purchaseDate ? formatDateTime(enrollment.purchaseDate) : "\u2014"}
							/>
							<DetailRow
								label="Expires"
								value={enrollment.expiresAt ? formatDateTime(enrollment.expiresAt) : "No expiry"}
							/>
						</dl>
					</ContentCard>

					{/* Deliverables / Tasks */}
					{enrollment.tasks && enrollment.tasks.length > 0 && (
						<ContentCard padding="none">
							<SectionHeader
								title="Deliverables"
								icon={ShoppingBagIcon}
								iconBg="bg-zinc-100 dark:bg-zinc-800"
								iconColor="text-zinc-600 dark:text-zinc-400"
								actions={
									<div className="flex items-center gap-2">
										<span className="text-[11px] font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
											{submittedTasks.length} of {totalTasks}
										</span>
										<div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
											<div
												className={clsx(
													"h-full rounded-full transition-all duration-500",
													taskProgress === 100 ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-500"
												)}
												style={{ width: `${taskProgress}%` }}
											/>
										</div>
									</div>
								}
							/>
							<div>
								{(() => {
									const grouped: Record<string, typeof enrollment.tasks> = {};
									for (const task of enrollment.tasks) {
										const p = task.platformName || extractPlatformFromText(task.taskName || "") || "General";
										if (!grouped[p]) grouped[p] = [];
										grouped[p].push(task);
									}
									const platforms = Object.keys(grouped).sort((a, b) => {
										if (a === "General") return 1;
										if (b === "General") return -1;
										return a.localeCompare(b);
									});

									return platforms.map((pName) => {
										const tasks = grouped[pName];
										const GIcon = getPlatformIcon(pName);
										return (
											<div key={pName}>
												<div className="flex items-center gap-1.5 border-b border-zinc-100 bg-zinc-50/80 px-4 py-1.5 sm:px-5 dark:border-zinc-800/60 dark:bg-zinc-800/30">
													{GIcon ? (
														<GIcon className={clsx("size-3", getPlatformColor(pName))} />
													) : (
														<span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
													)}
													<span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
														{pName}
													</span>
												</div>
												{tasks.map((task) => {
													const done = !!task.submittedAt;
													const hasProof = task.proofLink || task.proofScreenshot;

													return (
														<div
															key={task.enrollmentTaskId}
															className="border-b border-zinc-100 px-4 py-2.5 last:border-b-0 sm:px-5 dark:border-zinc-800/60"
														>
															{/* Row 1: status + name + required + time */}
															<div className="flex items-center gap-2">
																{done ? (
																	<CheckCircleIcon className="size-4 shrink-0 text-emerald-500" />
																) : (
																	<div className="size-4 shrink-0 rounded-full ring-1.5 ring-zinc-300 dark:ring-zinc-600" />
																)}
																<span className="min-w-0 flex-1 truncate text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
																	{task.taskName}
																</span>
																{task.isRequired && (
																	<span className="shrink-0 text-[10px] font-medium text-red-500 dark:text-red-400">
																		Required
																	</span>
																)}
																{done && task.submittedAt && (
																	<span className="shrink-0 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
																		{formatRelativeTime(task.submittedAt)}
																	</span>
																)}
															</div>
															{/* Row 2: description (compact) */}
															{task.taskDescription && (
																<p className="mt-0.5 pl-6 text-xs leading-snug text-zinc-500 dark:text-zinc-400">
																	{task.taskDescription}
																</p>
															)}
															{/* Row 3: feedback */}
															{task.feedback && (
																<div className="mt-1.5 ml-6 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
																	{task.feedback}
																</div>
															)}
															{/* Row 4: proof inline */}
															{done && hasProof && (
																<div className="mt-1.5 flex items-center gap-1.5 pl-6">
																	{task.proofLink && (
																		<a
																			href={task.proofLink}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50"
																		>
																			<LinkIcon className="size-3" />
																			Proof Link
																		</a>
																	)}
																	{task.proofScreenshot && (
																		<LightGallery
																			plugins={[lgZoom]}
																			download={false}
																			backdropDuration={200}
																			elementClassNames="inline"
																		>
																			<a
																				href={getAssetUrl(task.proofScreenshot)}
																				className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/50 cursor-pointer"
																			>
																				<PhotoIcon className="size-3" />
																				Screenshot
																			</a>
																		</LightGallery>
																	)}
																</div>
															)}
														</div>
													);
												})}
											</div>
										);
									});
								})()}
							</div>
						</ContentCard>
					)}

					{/* OCR & Screenshot */}
					{enrollment.ocrData && (
						<ContentCard padding="none">
							<SectionHeader
								title="Order Verification"
								icon={PhotoIcon}
								iconBg="bg-violet-50 dark:bg-violet-950/30"
								iconColor="text-violet-600 dark:text-violet-400"
							/>
							<div className="p-4 sm:p-5">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									{enrollment.ocrData.screenshotUrl && (
										<div className="overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700">
											<ZoomableImage
												src={getAssetUrl(enrollment.ocrData.screenshotUrl)}
												alt="Order screenshot"
												className="h-52 w-full object-cover"
											/>
										</div>
									)}
									<div className="space-y-2">
										{[
											enrollment.ocrData.extractedOrderId && {
												label: "Order ID",
												value: <span className="font-mono text-xs">{enrollment.ocrData.extractedOrderId}</span>,
											},
											enrollment.ocrData.extractedOrderValue != null && {
												label: "Value",
												value: formatCurrency(enrollment.ocrData.extractedOrderValueDecimal ?? "0"),
											},
											enrollment.ocrData.extractedPurchaseDate && {
												label: "Date",
												value: formatDateTime(enrollment.ocrData.extractedPurchaseDate),
											},
											enrollment.ocrData.extractedProductName && {
												label: "Product",
												value: <span className="max-w-36 truncate">{enrollment.ocrData.extractedProductName}</span>,
											},
										]
											.filter(Boolean)
											.map((item) => (
												<div
													key={(item as { label: string }).label}
													className="flex items-center justify-between rounded-lg bg-zinc-50 px-3.5 py-2.5 dark:bg-zinc-800/40"
												>
													<span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
														{(item as { label: string }).label}
													</span>
													<span className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
														{(item as { label: string; value: React.ReactNode }).value}
													</span>
												</div>
											))}
										{enrollment.ocrData.confidence != null && (
											<div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3.5 py-2.5 dark:bg-zinc-800/40">
												<span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
													Confidence
												</span>
												<Badge color={enrollment.ocrData.confidence >= 80 ? "lime" : "amber"}>
													{Math.round(enrollment.ocrData.confidence)}%
												</Badge>
											</div>
										)}
										{enrollment.ocrData.validationPassed != null && (
											<div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3.5 py-2.5 dark:bg-zinc-800/40">
												<span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
													Validation
												</span>
												<Badge color={enrollment.ocrData.validationPassed ? "lime" : "red"}>
													{enrollment.ocrData.validationPassed ? "Passed" : "Failed"}
												</Badge>
											</div>
										)}
									</div>
								</div>
							</div>
						</ContentCard>
					)}
				</div>

				{/* ============================================================
				    RIGHT COLUMN — Campaign, Creator, Billing, Timeline
				    ============================================================ */}
				<div className="space-y-5">
					{/* Campaign */}
					<ContentCard padding="none">
						<SectionHeader
							title="Campaign"
							icon={MegaphoneIcon}
							iconBg="bg-indigo-50 dark:bg-indigo-950/30"
							iconColor="text-indigo-600 dark:text-indigo-400"
						/>
						<div className="p-4 sm:p-5">
							<Link
								href={`/${orgSlug}/campaigns/${enrollment.campaignId}`}
								className="group flex items-center gap-3.5 rounded-xl bg-zinc-50 p-3.5 transition-all hover:bg-zinc-100 hover:shadow-sm dark:bg-zinc-800/40 dark:hover:bg-zinc-800/60"
							>
								{enrollment.campaign?.listingImage ? (
									<img
										src={getAssetUrl(enrollment.campaign.listingImage)}
										alt={campaignTitle}
										className="size-11 rounded-lg bg-white object-cover ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:ring-zinc-700"
									/>
								) : (
									<div className="flex size-11 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
										<MegaphoneIcon className="size-5 text-indigo-400" />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{campaignTitle}</p>
									<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
										{enrollment.campaign?.type && <span className="capitalize">{enrollment.campaign.type}</span>}
										{enrollment.campaign?.listingName && <span> · {enrollment.campaign.listingName}</span>}
									</p>
								</div>
								<ArrowTopRightOnSquareIcon className="size-4 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
							</Link>
						</div>
					</ContentCard>

					{/* Creator */}
					{enrollment.creator && (
						<ContentCard padding="none">
							<SectionHeader
								title="Creator"
								icon={UserIcon}
								iconBg="bg-rose-50 dark:bg-rose-950/30"
								iconColor="text-rose-600 dark:text-rose-400"
							/>
							<div className="p-4 sm:p-5">
								<div className="flex items-center gap-3.5">
									<div
										className={clsx(
											"flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm",
											getAvatarColor(creatorName)
										)}
									>
										{getInitials(creatorName)}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-1.5">
											<span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
												{creatorName}
											</span>
											{enrollment.creator.approvalRate >= 90 && (
												<CheckCircleIcon className="size-4 shrink-0 text-emerald-500" />
											)}
										</div>
										<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
											{enrollment.creator.displayId}
											{enrollment.creator.city && ` · ${enrollment.creator.city}`}
										</p>
									</div>
								</div>

								<div className="mt-3 flex items-center gap-px overflow-hidden rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
									<div className="flex-1 bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/50">
										<p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
											{enrollment.creator.approvalRate}%
										</p>
										<p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
											Approval
										</p>
									</div>
									<div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
									<div className="flex-1 bg-zinc-50 px-3 py-2.5 text-center dark:bg-zinc-800/50">
										<p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
											{enrollment.creator.previousEnrollments}
										</p>
										<p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
											Past Orders
										</p>
									</div>
								</div>
							</div>
						</ContentCard>
					)}

					{/* Billing Breakdown */}
					{costs && (
						<ContentCard padding="none">
							<SectionHeader
								title="Billing Breakdown"
								icon={CurrencyRupeeIcon}
								iconBg="bg-emerald-50 dark:bg-emerald-950/30"
								iconColor="text-emerald-600 dark:text-emerald-400"
							/>
							<dl className="divide-y divide-zinc-100 px-4 sm:px-5 dark:divide-zinc-800/60">
								{[
									{
										label: `Bill Amount (${enrollment.lockedBillRate}%)`,
										value: costs.billAmount,
									},
									{ label: "GST (18%)", value: costs.gstAmount },
									{ label: "Platform Fee", value: costs.platformFee },
								].map((item) => (
									<div key={item.label} className="flex items-center justify-between py-2.5">
										<dt className="text-[13px] text-zinc-500 dark:text-zinc-400">{item.label}</dt>
										<dd className="text-[13px] font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
											{formatCurrency(item.value)}
										</dd>
									</div>
								))}
							</dl>
							<div className="mx-4 mb-4 flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-2.5 sm:mx-5 sm:mb-5 dark:bg-zinc-800">
								<span className="text-[13px] font-medium text-zinc-400">Total Cost</span>
								<span className="text-base font-bold tabular-nums text-white">{formatCurrency(costs.totalCost)}</span>
							</div>
						</ContentCard>
					)}

					{/* Timeline */}
					{enrollment.history && enrollment.history.length > 0 && (
						<ContentCard padding="none">
							<SectionHeader
								title="Activity Timeline"
								icon={ClockIcon}
								iconBg="bg-zinc-100 dark:bg-zinc-800"
								iconColor="text-zinc-500 dark:text-zinc-400"
							/>
							<div className="p-4 sm:p-5">
								{enrollment.history.map((item, index) => (
									<TimelineItem key={item.id} item={item} isLast={index === enrollment.history.length - 1} />
								))}
							</div>
						</ContentCard>
					)}
				</div>
			</div>

			{/* ================================================================
			    MOBILE BOTTOM BAR
			    ================================================================ */}
			{canReview && (
				<div
					className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur-xl sm:hidden dark:border-zinc-800 dark:bg-zinc-900/95"
					style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
				>
					<div className="flex items-center gap-2">
						{canRequestChanges && (
							<Button outline className="flex-1" onClick={() => setActiveDialog("changes")}>
								<PencilSquareIcon className="size-4" />
								Changes
							</Button>
						)}
						{canRejectEnrollment && (
							<Button color="red" className="flex-1" onClick={() => setActiveDialog("reject")}>
								<XCircleIcon className="size-4" />
								Reject
							</Button>
						)}
						{canApproveEnrollment && (
							<Button color="emerald" className="flex-[1.5]" onClick={() => setActiveDialog("approve")}>
								<CheckCircleIcon className="size-4" />
								Approve
							</Button>
						)}
					</div>
				</div>
			)}

			{/* Dialogs */}
			{activeDialog === "approve" && (
				<ApproveDialog
					open
					onClose={() => setActiveDialog(null)}
					enrollment={enrollment}
					organizationId={organizationId || ""}
					onSuccess={handleReviewSuccess}
				/>
			)}
			{activeDialog === "reject" && (
				<RejectDialog
					open
					onClose={() => setActiveDialog(null)}
					enrollment={enrollment}
					organizationId={organizationId || ""}
					onSuccess={handleReviewSuccess}
				/>
			)}
			{activeDialog === "changes" && (
				<RequestChangesDialog
					open
					onClose={() => setActiveDialog(null)}
					enrollment={enrollment}
					organizationId={organizationId || ""}
					onSuccess={handleReviewSuccess}
				/>
			)}
		</div>
	);
}
