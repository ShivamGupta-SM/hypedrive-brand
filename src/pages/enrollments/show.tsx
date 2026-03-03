import {
	ArrowLeftIcon,
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
	CalendarIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyRupeeIcon,
	ExclamationTriangleIcon,
	EyeIcon,
	HashtagIcon,
	LinkIcon,
	MegaphoneIcon,
	PencilSquareIcon,
	PhotoIcon,
	ShieldCheckIcon,
	ShoppingBagIcon,
	StarIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import { useParams } from "@tanstack/react-router";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Heading } from "@/components/heading";
import { extractPlatformFromText, getPlatformColor, getPlatformIcon } from "@/components/icons/platform-icons";
import { Link } from "@/components/link";
import { Card } from "@/components/shared/card";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import {
	useApproveEnrollment,
	useEnrollment,
	useOrgContext,
	useRejectEnrollment,
	useRequestChangesEnrollment,
} from "@/hooks";
import { getAssetUrl } from "@/hooks/api-client";
import { usePageTitle } from "@/hooks/use-breadcrumb";
import type { brand, db } from "@/lib/brand-client";
import { formatCurrency, formatDateTime, formatRelativeTime, getInitials } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";
import { useCan } from "@/store/permissions-store";

type EnrollmentStatus = db.EnrollmentStatus;

// =============================================================================
// STATUS CONFIG
// =============================================================================

function getStatusConfig(status: EnrollmentStatus): {
	label: string;
	icon: typeof CheckCircleIcon;
	color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange" | "sky";
	bgClass: string;
	iconColor: string;
} {
	const statusMap: Record<
		EnrollmentStatus,
		{
			label: string;
			icon: typeof CheckCircleIcon;
			color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange" | "sky";
			bgClass: string;
			iconColor: string;
		}
	> = {
		awaiting_submission: {
			label: "Awaiting Submission",
			icon: ClockIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
			iconColor: "text-zinc-500",
		},
		awaiting_review: {
			label: "Awaiting Review",
			icon: ClockIcon,
			color: "amber",
			bgClass: "bg-amber-50 dark:bg-amber-950/30",
			iconColor: "text-amber-500",
		},
		changes_requested: {
			label: "Changes Requested",
			icon: ExclamationTriangleIcon,
			color: "orange",
			bgClass: "bg-orange-50 dark:bg-orange-950/30",
			iconColor: "text-orange-500",
		},
		approved: {
			label: "Approved",
			icon: CheckCircleIcon,
			color: "emerald",
			bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
			iconColor: "text-emerald-500",
		},
		permanently_rejected: {
			label: "Rejected",
			icon: XCircleIcon,
			color: "red",
			bgClass: "bg-red-50 dark:bg-red-950/30",
			iconColor: "text-red-500",
		},
		cancelled: {
			label: "Cancelled",
			icon: XCircleIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
			iconColor: "text-zinc-400",
		},
		expired: {
			label: "Expired",
			icon: ClockIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
			iconColor: "text-zinc-400",
		},
	};
	return (
		statusMap[status] || {
			label: status,
			icon: ClockIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
			iconColor: "text-zinc-400",
		}
	);
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
		<div className="space-y-6 animate-fade-in">
			<Skeleton width={140} height={36} borderRadius={8} />
			<div className="flex items-start gap-4">
				<Skeleton width={80} height={80} borderRadius={16} />
				<div className="space-y-2">
					<Skeleton width={200} height={28} borderRadius={8} />
					<Skeleton width={150} height={20} borderRadius={6} />
					<Skeleton width={100} height={24} borderRadius={12} />
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} width="100%" height={100} borderRadius={12} />
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Skeleton width="100%" height={400} borderRadius={12} />
				</div>
				<Skeleton width="100%" height={400} borderRadius={12} />
			</div>
		</div>
	);
}

// =============================================================================
// INFO ROW (matches transaction detail pattern)
// =============================================================================

function InfoRow({
	icon,
	iconBgClass,
	iconColorClass,
	label,
	sublabel,
	value,
	copyValue,
	isLast = false,
}: {
	icon: React.ReactNode;
	iconBgClass?: string;
	iconColorClass?: string;
	label: string;
	sublabel?: string;
	value: React.ReactNode;
	copyValue?: string;
	isLast?: boolean;
}) {
	return (
		<div
			className={clsx(
				"flex items-center justify-between",
				!isLast && "border-b border-zinc-200 pb-4 dark:border-zinc-700"
			)}
		>
			<div className="flex items-center gap-3">
				<div
					className={clsx(
						"flex size-10 items-center justify-center rounded-lg",
						iconBgClass || "bg-zinc-100 dark:bg-zinc-800"
					)}
				>
					<span className={clsx("size-5", iconColorClass || "text-zinc-500")}>{icon}</span>
				</div>
				<div>
					<p className="text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
					{sublabel && <p className="text-sm text-zinc-500 dark:text-zinc-400">{sublabel}</p>}
				</div>
			</div>
			<div className="flex items-center gap-1">
				{typeof value === "string" ? (
					<span className="max-w-50 truncate text-sm font-medium text-zinc-900 dark:text-white">{value}</span>
				) : (
					value
				)}
				{copyValue && <CopyButton value={copyValue} label={label} />}
			</div>
		</div>
	);
}

// =============================================================================
// DELIVERABLE ICON HELPER
// =============================================================================

function getDeliverableIcon(name: string) {
	const lower = name.toLowerCase();
	if (lower.includes("screenshot") || lower.includes("image") || lower.includes("photo")) return PhotoIcon;
	if (lower.includes("link") || lower.includes("url")) return LinkIcon;
	if (lower.includes("review") || lower.includes("rating") || lower.includes("star")) return StarIcon;
	return EyeIcon;
}

// =============================================================================
// STATUS TIMELINE
// =============================================================================

const timelineStatusConfig: Record<string, { icon: typeof CheckCircleIcon; color: string; bgColor: string }> = {
	enrolled: { icon: CheckCircleIcon, color: "text-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
	awaiting_submission: { icon: ClockIcon, color: "text-amber-500", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
	awaiting_review: { icon: ClockIcon, color: "text-sky-500", bgColor: "bg-sky-50 dark:bg-sky-950/30" },
	changes_requested: {
		icon: ExclamationTriangleIcon,
		color: "text-amber-500",
		bgColor: "bg-amber-50 dark:bg-amber-950/30",
	},
	approved: { icon: CheckCircleIcon, color: "text-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
	permanently_rejected: { icon: XCircleIcon, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/30" },
	rejected: { icon: XCircleIcon, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/30" },
	cancelled: { icon: XCircleIcon, color: "text-zinc-400", bgColor: "bg-zinc-50 dark:bg-zinc-800/50" },
	expired: { icon: ClockIcon, color: "text-zinc-400", bgColor: "bg-zinc-50 dark:bg-zinc-800/50" },
};

function getStatusLabel(status: string): string {
	const labels: Record<string, string> = {
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
	return labels[status] || status;
}

function TimelineItem({ item, isLast }: { item: brand.EnrollmentDetail["history"][number]; isLast: boolean }) {
	const config = timelineStatusConfig[item.toStatus] || {
		icon: ClockIcon,
		color: "text-zinc-400",
		bgColor: "bg-zinc-50 dark:bg-zinc-800/50",
	};
	const Icon = config.icon;

	return (
		<div className="relative flex gap-3">
			{!isLast && <div className="absolute left-4 top-8 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />}
			<div
				className={clsx("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full", config.bgColor)}
			>
				<Icon className={clsx("size-4", config.color)} />
			</div>
			<div className="flex-1 pb-4">
				<div className="flex items-start justify-between gap-2">
					<div>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">{getStatusLabel(item.toStatus)}</p>
						{item.reason && <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.reason}</p>}
					</div>
					<span className="whitespace-nowrap text-xs text-zinc-400 dark:text-zinc-500">
						{formatRelativeTime(item.changedAt)}
					</span>
				</div>
				<p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{item.changedByName || "System"}</p>
			</div>
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
				{/* Cost breakdown */}
				<div className="mb-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
					<div className="flex justify-between border-b border-zinc-100 px-4 py-2.5 text-xs dark:border-zinc-800">
						<span className="text-zinc-500 dark:text-zinc-400">Bill Amount ({enrollment.lockedBillRate}%)</span>
						<span className="font-medium text-zinc-900 dark:text-white">{formatCurrency(costs.billAmount)}</span>
					</div>
					<div className="flex justify-between border-b border-zinc-100 px-4 py-2.5 text-xs dark:border-zinc-800">
						<span className="text-zinc-500 dark:text-zinc-400">GST (18%)</span>
						<span className="font-medium text-zinc-900 dark:text-white">{formatCurrency(costs.gstAmount)}</span>
					</div>
					<div className="flex justify-between border-b border-zinc-100 px-4 py-2.5 text-xs dark:border-zinc-800">
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

	const canApproveEnrollment = useCan("enrollment", "approve");
	const canRejectEnrollment = useCan("enrollment", "reject");
	const canRequestChanges = useCan("enrollment", "request_changes");

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

	const statusConfig = getStatusConfig(enrollment.status);
	const StatusIcon = statusConfig.icon;
	const isAwaitingReview = enrollment.status === "awaiting_review";
	const canReview = isAwaitingReview && (canApproveEnrollment || canRejectEnrollment || canRequestChanges);

	const creatorName = enrollment.creator?.profileName || "Creator";
	const campaignTitle = enrollment.campaign?.title || `Campaign ${enrollment.campaignId.slice(-8)}`;
	const platformName = enrollment.platform?.name;
	const HeaderPlatformIcon = platformName ? getPlatformIcon(platformName) : null;

	const submittedTasks = enrollment.tasks?.filter((t) => !!t.submittedAt) || [];
	const totalTasks = enrollment.tasks?.length || 0;
	const taskProgress = totalTasks > 0 ? Math.round((submittedTasks.length / totalTasks) * 100) : 0;

	return (
		<div className="space-y-6 pb-24 sm:pb-0">
			{/* Back Button */}
			<Button href={`/${orgSlug}/enrollments`} color="zinc">
				<ArrowLeftIcon className="size-4" />
				Enrollments
			</Button>

			{/* Header — Large icon style matching transaction detail */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<div className={clsx("flex size-20 shrink-0 items-center justify-center rounded-2xl", statusConfig.bgClass)}>
						<StatusIcon className={clsx("size-10", statusConfig.iconColor)} />
					</div>
					<div>
						<Heading>{enrollment.displayId}</Heading>
						<Text className="mt-1 inline-flex items-center gap-1">
							{creatorName}
							{platformName && (
								<>
									{" on "}
									{HeaderPlatformIcon && <HeaderPlatformIcon className={`size-4 ${getPlatformColor(platformName)}`} />}
									{platformName}
								</>
							)}
						</Text>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<Badge color={statusConfig.color} className="inline-flex items-center gap-1">
								<StatusIcon className="size-3" />
								{statusConfig.label}
							</Badge>
							<Badge color="zinc" className="inline-flex items-center gap-1">
								{enrollment.paymentMode === "prefund" ? "Prefund" : "Post Submission"}
							</Badge>
							{enrollment.campaign?.type && (
								<Badge color="zinc" className="capitalize">
									{enrollment.campaign.type}
								</Badge>
							)}
						</div>
					</div>
				</div>

				{/* Desktop Action Buttons in header */}
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

			{/* Stats Row — FinancialStatsGridBordered */}
			{costs && (
				<FinancialStatsGridBordered
					stats={[
						{ name: "Order Value", value: formatCurrency(costs.orderValue) },
						{
							name: "Your Cost",
							value: formatCurrency(costs.totalCost),
							change: `${enrollment.lockedBillRate}% bill rate`,
							changeType: "neutral",
						},
						{ name: "Platform Fee", value: formatCurrency(costs.platformFee) },
						{
							name: "Tasks",
							value: `${submittedTasks.length}/${totalTasks}`,
							change: `${taskProgress}% done`,
							changeType: taskProgress === 100 ? "positive" : "neutral",
						},
					]}
					columns={4}
				/>
			)}

			{/* 3 Column Layout */}
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
				{/* Left Column — 2/3 width */}
				<div className="space-y-5 lg:col-span-2">
					{/* Enrollment Details Card */}
					<Card padding="none">
						<div className="p-6">
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Enrollment Details</h3>

							<div className="mt-6 space-y-4">
								<InfoRow
									icon={<HashtagIcon className="size-5" />}
									label="Order ID"
									sublabel="Marketplace order"
									value={
										<span className="max-w-45 truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">
											{enrollment.orderId}
										</span>
									}
									copyValue={enrollment.orderId}
								/>
								<InfoRow
									icon={<HashtagIcon className="size-5" />}
									label="Display ID"
									sublabel="Internal reference"
									value={
										<span className="font-mono text-xs text-zinc-600 dark:text-zinc-400">{enrollment.displayId}</span>
									}
									copyValue={enrollment.displayId}
								/>
								<InfoRow
									icon={<CurrencyRupeeIcon className="size-5" />}
									iconBgClass="bg-emerald-50 dark:bg-emerald-950/30"
									iconColorClass="text-emerald-500"
									label="Order Value"
									sublabel={enrollment.currency}
									value={
										<span className="text-lg font-bold text-zinc-900 dark:text-white">
											{formatCurrency(enrollment.orderValueDecimal)}
										</span>
									}
								/>
								<InfoRow
									icon={<CalendarIcon className="size-5" />}
									label="Purchase Date"
									sublabel="When the order was placed"
									value={enrollment.purchaseDate ? formatDateTime(enrollment.purchaseDate) : "—"}
								/>
								<InfoRow
									icon={<CalendarIcon className="size-5" />}
									iconBgClass="bg-sky-50 dark:bg-sky-950/30"
									iconColorClass="text-sky-500"
									label="Enrolled"
									sublabel="When the creator enrolled"
									value={formatDateTime(enrollment.createdAt)}
								/>
								{enrollment.submittedAt && (
									<InfoRow
										icon={<CheckCircleIcon className="size-5" />}
										iconBgClass="bg-emerald-50 dark:bg-emerald-950/30"
										iconColorClass="text-emerald-500"
										label="Submitted"
										sublabel="Proof submitted"
										value={formatDateTime(enrollment.submittedAt)}
									/>
								)}
								{enrollment.approvedAt && (
									<InfoRow
										icon={<CheckCircleIcon className="size-5" />}
										iconBgClass="bg-emerald-50 dark:bg-emerald-950/30"
										iconColorClass="text-emerald-500"
										label="Approved"
										sublabel="When approved"
										value={formatDateTime(enrollment.approvedAt)}
									/>
								)}
								<InfoRow
									icon={<ClockIcon className="size-5" />}
									iconBgClass="bg-amber-50 dark:bg-amber-950/30"
									iconColorClass="text-amber-500"
									label="Expires"
									sublabel="Submission deadline"
									value={enrollment.expiresAt ? formatDateTime(enrollment.expiresAt) : "No expiry"}
									isLast
								/>
							</div>
						</div>
					</Card>

					{/* Billing Breakdown Card */}
					{costs && (
						<Card padding="none">
							<div className="p-6">
								<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Billing Breakdown</h3>

								<div className="mt-6 space-y-4">
									<InfoRow
										icon={<ShieldCheckIcon className="size-5" />}
										label={`Bill Rate (${enrollment.lockedBillRate}%)`}
										sublabel="Cashback to creator"
										value={formatCurrency(costs.billAmount)}
									/>
									<InfoRow
										icon={<CurrencyRupeeIcon className="size-5" />}
										iconBgClass="bg-amber-50 dark:bg-amber-950/30"
										iconColorClass="text-amber-500"
										label="GST (18%)"
										sublabel="Goods & services tax"
										value={formatCurrency(costs.gstAmount)}
									/>
									<InfoRow
										icon={<ShieldCheckIcon className="size-5" />}
										iconBgClass="bg-sky-50 dark:bg-sky-950/30"
										iconColorClass="text-sky-500"
										label="Platform Fee"
										sublabel="Service charge"
										value={formatCurrency(costs.platformFee)}
										isLast
									/>
								</div>

								{/* Total Card */}
								<div className="mt-6 overflow-hidden rounded-xl bg-linear-to-br from-emerald-600 to-emerald-700 p-5 dark:from-emerald-700 dark:to-emerald-800">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-white/70">Total Cost to You</p>
											<p className="mt-1 text-3xl font-bold tracking-tight text-white">
												{formatCurrency(costs.totalCost)}
											</p>
										</div>
										<div className="flex size-14 items-center justify-center rounded-xl bg-white/20">
											<CurrencyRupeeIcon className="size-7 text-white" />
										</div>
									</div>
								</div>
							</div>
						</Card>
					)}

					{/* OCR Data */}
					{enrollment.ocrData && (
						<Card padding="none">
							<div className="p-6">
								<h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
									<PhotoIcon className="size-5 text-zinc-400" />
									Order Screenshot & OCR
								</h3>

								<div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
									{enrollment.ocrData.screenshotUrl && (
										<a
											href={getAssetUrl(enrollment.ocrData.screenshotUrl)}
											target="_blank"
											rel="noopener noreferrer"
											className="group relative overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700"
										>
											<img
												src={getAssetUrl(enrollment.ocrData.screenshotUrl)}
												alt="Order screenshot"
												className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
											/>
											<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/30">
												<div className="flex size-12 items-center justify-center rounded-xl bg-white/90 opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
													<EyeIcon className="size-6 text-zinc-900" />
												</div>
											</div>
										</a>
									)}
									<div className="space-y-3">
										{enrollment.ocrData.extractedOrderId && (
											<div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
												<span className="text-xs text-zinc-500 dark:text-zinc-400">Extracted Order ID</span>
												<span className="font-mono text-xs font-medium text-zinc-900 dark:text-white">
													{enrollment.ocrData.extractedOrderId}
												</span>
											</div>
										)}
										{enrollment.ocrData.extractedOrderValue != null && (
											<div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
												<span className="text-xs text-zinc-500 dark:text-zinc-400">Extracted Value</span>
												<span className="text-sm font-medium text-zinc-900 dark:text-white">
													{formatCurrency(enrollment.ocrData.extractedOrderValueDecimal ?? "0")}
												</span>
											</div>
										)}
										{enrollment.ocrData.extractedPurchaseDate && (
											<div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
												<span className="text-xs text-zinc-500 dark:text-zinc-400">Extracted Date</span>
												<span className="text-sm font-medium text-zinc-900 dark:text-white">
													{formatDateTime(enrollment.ocrData.extractedPurchaseDate)}
												</span>
											</div>
										)}
										{enrollment.ocrData.extractedProductName && (
											<div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
												<span className="text-xs text-zinc-500 dark:text-zinc-400">Product</span>
												<span className="max-w-40 truncate text-sm font-medium text-zinc-900 dark:text-white">
													{enrollment.ocrData.extractedProductName}
												</span>
											</div>
										)}
										{enrollment.ocrData.confidence != null && (
											<div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
												<span className="text-xs text-zinc-500 dark:text-zinc-400">Confidence</span>
												<Badge color={enrollment.ocrData.confidence >= 0.8 ? "lime" : "amber"}>
													{Math.round(enrollment.ocrData.confidence * 100)}%
												</Badge>
											</div>
										)}
										{enrollment.ocrData.validationPassed != null && (
											<div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800/50">
												<span className="text-xs text-zinc-500 dark:text-zinc-400">Validation</span>
												<Badge color={enrollment.ocrData.validationPassed ? "lime" : "red"}>
													{enrollment.ocrData.validationPassed ? "Passed" : "Failed"}
												</Badge>
											</div>
										)}
									</div>
								</div>
							</div>
						</Card>
					)}

					{/* Required Deliverables / Tasks */}
					{enrollment.tasks && enrollment.tasks.length > 0 && (
						<Card padding="none">
							<div className="p-6">
								<div className="flex items-center justify-between">
									<h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-white">
										<ShoppingBagIcon className="size-5 text-emerald-500" />
										Required Deliverables
									</h3>
									<span className="text-sm text-zinc-500 dark:text-zinc-400">
										{submittedTasks.length}/{totalTasks} completed
									</span>
								</div>

								{/* Progress bar */}
								<div className="mt-4 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
									<div
										className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
										style={{ width: `${taskProgress}%` }}
									/>
								</div>

								<div className="mt-6">
									{(() => {
										const groupedByPlatform: Record<string, typeof enrollment.tasks> = {};
										for (const task of enrollment.tasks) {
											const platform = task.platformName || extractPlatformFromText(task.taskName || "") || "General";
											if (!groupedByPlatform[platform]) groupedByPlatform[platform] = [];
											groupedByPlatform[platform].push(task);
										}

										const sortedPlatforms = Object.keys(groupedByPlatform).sort((a, b) => {
											if (a === "General") return 1;
											if (b === "General") return -1;
											return a.localeCompare(b);
										});

										return (
											<div className="space-y-5">
												{sortedPlatforms.map((pName) => {
													const tasks = groupedByPlatform[pName];
													return (
														<div key={pName}>
															<h4 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
																{(() => {
																	const GroupIcon = getPlatformIcon(pName);
																	return GroupIcon ? (
																		<GroupIcon className={`size-3.5 ${getPlatformColor(pName)}`} />
																	) : (
																		<span className="size-1.5 rounded-full bg-emerald-500" />
																	);
																})()}
																{pName}
															</h4>
															<div className="space-y-2">
																{tasks.map((task, index) => {
																	const taskPlatform = task.platformName || pName;
																	const PlatformTaskIcon =
																		taskPlatform && taskPlatform !== "General" ? getPlatformIcon(taskPlatform) : null;
																	const FallbackIcon = getDeliverableIcon(task.taskName);
																	const isSubmitted = !!task.submittedAt;

																	return (
																		<div
																			key={task.enrollmentTaskId}
																			className={clsx(
																				"flex items-start gap-3 rounded-xl border p-3 sm:p-4",
																				isSubmitted
																					? "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/10"
																					: "border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/30"
																			)}
																		>
																			<div
																				className={clsx(
																					"flex size-10 shrink-0 items-center justify-center rounded-xl",
																					isSubmitted
																						? "bg-emerald-100 dark:bg-emerald-900/30"
																						: "bg-zinc-100 dark:bg-zinc-800"
																				)}
																			>
																				{PlatformTaskIcon ? (
																					<PlatformTaskIcon
																						className={clsx(
																							"size-5",
																							isSubmitted
																								? getPlatformColor(taskPlatform)
																								: "text-zinc-500 dark:text-zinc-400"
																						)}
																					/>
																				) : (
																					<FallbackIcon
																						className={clsx(
																							"size-5",
																							isSubmitted ? "text-emerald-500" : "text-zinc-500 dark:text-zinc-400"
																						)}
																					/>
																				)}
																			</div>
																			<div className="min-w-0 flex-1">
																				<div className="mb-1 flex flex-wrap items-center gap-2">
																					<span className="text-sm font-medium text-zinc-900 dark:text-white">
																						{index + 1}. {task.taskName}
																					</span>
																					{task.isRequired ? (
																						<span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
																							Required
																						</span>
																					) : (
																						<span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
																							Optional
																						</span>
																					)}
																					{isSubmitted && (
																						<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
																							<CheckCircleIcon className="size-3" />
																							Done
																						</span>
																					)}
																				</div>
																				{task.taskDescription && (
																					<p className="text-xs text-zinc-500 dark:text-zinc-400">
																						{task.taskDescription}
																					</p>
																				)}
																				{task.instructions && (
																					<p className="mt-1 flex items-start gap-1 text-xs text-zinc-400 dark:text-zinc-500">
																						<ExclamationTriangleIcon className="mt-0.5 size-3 shrink-0" />
																						{task.instructions}
																					</p>
																				)}
																				{task.feedback && (
																					<div className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
																						Feedback: {task.feedback}
																					</div>
																				)}
																				{isSubmitted && (
																					<div className="mt-2 flex flex-wrap gap-2">
																						{task.proofLink && (
																							<a
																								href={task.proofLink}
																								target="_blank"
																								rel="noopener noreferrer"
																								className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-100 dark:bg-sky-950/30 dark:text-sky-400"
																							>
																								<LinkIcon className="size-3.5" />
																								View Link
																							</a>
																						)}
																						{task.proofScreenshot && (
																							<a
																								href={getAssetUrl(task.proofScreenshot)}
																								target="_blank"
																								rel="noopener noreferrer"
																								className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600 transition-colors hover:bg-sky-100 dark:bg-sky-950/30 dark:text-sky-400"
																							>
																								<PhotoIcon className="size-3.5" />
																								View Screenshot
																							</a>
																						)}
																						{task.submittedAt && (
																							<span className="inline-flex items-center text-xs text-zinc-400 dark:text-zinc-500">
																								{formatDateTime(task.submittedAt)}
																							</span>
																						)}
																					</div>
																				)}
																			</div>
																			<div className="shrink-0">
																				{isSubmitted ? (
																					<CheckCircleIcon className="size-5 text-emerald-500" />
																				) : (
																					<ClockIcon className="size-5 text-zinc-300 dark:text-zinc-600" />
																				)}
																			</div>
																		</div>
																	);
																})}
															</div>
														</div>
													);
												})}
											</div>
										);
									})()}
								</div>
							</div>
						</Card>
					)}
				</div>

				{/* Right Column — 1/3 width sidebar */}
				<div className="space-y-5">
					{/* Campaign Card */}
					<Card padding="none">
						<div className="p-5">
							<h4 className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Campaign
							</h4>
							<Link
								href={`/${orgSlug}/campaigns/${enrollment.campaignId}`}
								className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
							>
								{enrollment.campaign?.listingImage ? (
									<img
										src={getAssetUrl(enrollment.campaign.listingImage)}
										alt={campaignTitle}
										className="size-11 rounded-xl object-cover"
									/>
								) : (
									<div className="flex size-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
										<MegaphoneIcon className="size-5 text-zinc-500" />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{campaignTitle}</p>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										{enrollment.campaign?.type && <span className="capitalize">{enrollment.campaign.type}</span>}
										{enrollment.campaign?.listingName && <span> &middot; {enrollment.campaign.listingName}</span>}
									</p>
								</div>
								<ArrowTopRightOnSquareIcon className="size-4 shrink-0 text-zinc-400" />
							</Link>
						</div>
					</Card>

					{/* Creator Card */}
					{enrollment.creator && (
						<Card padding="none">
							<div className="p-5">
								<h4 className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
									Creator
								</h4>
								<div className="flex items-center gap-3">
									<div
										className={clsx(
											"flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
											getAvatarColor(creatorName)
										)}
									>
										{getInitials(creatorName)}
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-1.5">
											<span className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
												{creatorName}
											</span>
											{enrollment.creator.approvalRate >= 90 && (
												<CheckCircleIcon className="size-4 shrink-0 text-emerald-500" />
											)}
										</div>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											{enrollment.creator.displayId}
											{enrollment.creator.city && ` · ${enrollment.creator.city}`}
										</p>
									</div>
								</div>

								{/* Creator Stats Grid */}
								<div className="mt-4 grid grid-cols-2 gap-3">
									<div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
										<p className="text-lg font-semibold text-zinc-900 dark:text-white">
											{enrollment.creator.approvalRate}%
										</p>
										<p className="text-[11px] text-zinc-500 dark:text-zinc-400">Approval Rate</p>
									</div>
									<div className="rounded-lg bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
										<p className="text-lg font-semibold text-zinc-900 dark:text-white">
											{enrollment.creator.previousEnrollments}
										</p>
										<p className="text-[11px] text-zinc-500 dark:text-zinc-400">Past Enrollments</p>
									</div>
								</div>
							</div>
						</Card>
					)}

					{/* Rejection Info */}
					{enrollment.rejection && (
						<Card padding="none" className="border-red-200 dark:border-red-800/40">
							<div className="bg-red-50/50 p-5 dark:bg-red-950/10">
								<h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
									<XCircleIcon className="size-4" />
									Rejection Details
								</h4>
								<p className="text-sm text-red-600 dark:text-red-300">{enrollment.rejection.reason}</p>
								{enrollment.rejection.lastRejectedAt && (
									<p className="mt-2 text-xs text-red-400 dark:text-red-500">
										{formatDateTime(enrollment.rejection.lastRejectedAt)}
									</p>
								)}
							</div>
						</Card>
					)}

					{/* Status Timeline */}
					{enrollment.history && enrollment.history.length > 0 && (
						<Card padding="none">
							<div className="p-5">
								<h4 className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
									Status History
								</h4>
								<div>
									{enrollment.history.map((item, index) => (
										<TimelineItem key={item.id} item={item} isLast={index === enrollment.history.length - 1} />
									))}
								</div>
							</div>
						</Card>
					)}
				</div>
			</div>

			{/* Mobile Fixed Bottom Bar */}
			{canReview && costs && (
				<div
					className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/80 p-3 backdrop-blur-xl sm:hidden dark:border-zinc-700 dark:bg-zinc-900/80"
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
