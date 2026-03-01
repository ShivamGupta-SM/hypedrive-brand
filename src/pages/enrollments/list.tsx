import {
	ArrowDownTrayIcon,
	ArrowPathIcon,
	CheckCircleIcon,
	ChevronRightIcon,
	ClockIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	MegaphoneIcon,
	UserGroupIcon,
	XCircleIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useMemo, useState } from "react";
import { showToast } from "@/lib/toast";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { StatCard } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Text } from "@/components/text";
import {
	useBulkApproveEnrollments,
	useBulkRejectEnrollments,
	useCampaigns,
	useCurrentOrganization,
	useExportOrganizationEnrollments,
	useInfiniteEnrollments,
} from "@/hooks";
import { useOrgSlug } from "@/hooks/use-org-slug";
import type { brand, db } from "@/lib/brand-client";
import { formatCurrency } from "@/lib/design-tokens";

type Enrollment = brand.EnrollmentWithRelations;
type EnrollmentStatus = db.EnrollmentStatus;
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
	const statusMap: Record<
		EnrollmentStatus,
		{
			label: string;
			shortLabel: string;
			icon: typeof CheckCircleIcon;
			color: "lime" | "sky" | "amber" | "red" | "zinc" | "emerald" | "orange";
			bgClass: string;
			textClass: string;
		}
	> = {
		awaiting_submission: {
			label: "Awaiting Submission",
			shortLabel: "Pending",
			icon: ClockIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
			textClass: "text-zinc-600 dark:text-zinc-400",
		},
		awaiting_review: {
			label: "Awaiting Review",
			shortLabel: "In Review",
			icon: ClockIcon,
			color: "amber",
			bgClass: "bg-amber-50 dark:bg-amber-950/30",
			textClass: "text-amber-600 dark:text-amber-400",
		},
		changes_requested: {
			label: "Changes Requested",
			shortLabel: "Changes",
			icon: ExclamationTriangleIcon,
			color: "orange",
			bgClass: "bg-orange-50 dark:bg-orange-950/30",
			textClass: "text-orange-600 dark:text-orange-400",
		},
		approved: {
			label: "Approved",
			shortLabel: "Approved",
			icon: CheckCircleIcon,
			color: "lime",
			bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
			textClass: "text-emerald-600 dark:text-emerald-400",
		},
		permanently_rejected: {
			label: "Rejected",
			shortLabel: "Rejected",
			icon: XCircleIcon,
			color: "red",
			bgClass: "bg-red-50 dark:bg-red-950/30",
			textClass: "text-red-600 dark:text-red-400",
		},
		cancelled: {
			label: "Cancelled",
			shortLabel: "Cancelled",
			icon: XCircleIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
			textClass: "text-zinc-600 dark:text-zinc-400",
		},
		expired: {
			label: "Expired",
			shortLabel: "Expired",
			icon: ClockIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
			textClass: "text-zinc-600 dark:text-zinc-400",
		},
	};
	return (
		statusMap[status] || {
			label: status,
			shortLabel: status,
			icon: ClockIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
			textClass: "text-zinc-600 dark:text-zinc-400",
		}
	);
}

// =============================================================================
// OVERDUE DETECTION
// =============================================================================

const OVERDUE_HOURS = 48;

function isOverdue(createdAt: string, referenceTime: Date = new Date()): boolean {
	const created = new Date(createdAt);
	const hoursDiff = (referenceTime.getTime() - created.getTime()) / (1000 * 60 * 60);
	return hoursDiff > OVERDUE_HOURS;
}

// =============================================================================
// TRACKER COMPONENT
// =============================================================================

type TrackerStatus = "success" | "warning" | "error" | "neutral";

interface TrackerData {
	status: TrackerStatus;
	tooltip: string;
}

function Tracker({ data, className = "" }: { data: TrackerData[]; className?: string }) {
	const getStatusColor = (status: TrackerStatus) => {
		switch (status) {
			case "success":
				return "bg-emerald-500";
			case "warning":
				return "bg-amber-500";
			case "error":
				return "bg-red-500";
			default:
				return "bg-zinc-300 dark:bg-zinc-600";
		}
	};

	if (data.length === 0) {
		return (
			<div
				className={`flex h-2 w-full items-center gap-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 ${className}`}
			>
				<div className="h-full w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
			</div>
		);
	}

	return (
		<div
			className={`flex h-2 w-full items-center gap-px overflow-hidden rounded-full ${className}`}
		>
			{data.map((item, idx) => (
				<div
					key={`${item.status}-${item.tooltip ?? idx}`}
					className={`h-full flex-1 ${getStatusColor(item.status)} first:rounded-l-full last:rounded-r-full transition-colors`}
					title={item.tooltip}
				/>
			))}
		</div>
	);
}

// =============================================================================
// EXPORT FUNCTIONALITY
// =============================================================================

function exportEnrollmentsToCSV(enrollments: Enrollment[], filename = "enrollments") {
	const headers = [
		"Order ID",
		"Status",
		"Campaign",
		"Shopper",
		"Platform",
		"Order Value",
		"Rebate %",
		"Rebate Amount",
		"Created At",
	];

	const rows = enrollments.map((e) => {
		const orderValue = e.orderValue / 100; // Convert from paise to rupees
		const platformFee = (e.lockedPlatformFee / 100).toFixed(2);

		return [
			e.orderId,
			getStatusConfig(e.status).label,
			e.campaignId,
			e.creatorId,
			e.platform?.name || "",
			orderValue.toFixed(2),
			`${e.lockedBillRate}%`,
			platformFee,
			new Date(e.createdAt).toISOString(),
		];
	});

	const csvContent = [
		headers.join(","),
		...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
	].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
	link.click();
	URL.revokeObjectURL(link.href);
}

// =============================================================================
// BULK ACTIONS BAR
// =============================================================================

function BulkActionsBar({
	selectedCount,
	onApprove,
	onReject,
	onClear,
	isLoading,
}: {
	selectedCount: number;
	onApprove: () => void;
	onReject: () => void;
	onClear: () => void;
	isLoading: boolean;
}) {
	if (selectedCount === 0) return null;

	return (
		<div className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-between gap-3 bg-zinc-900 px-4 py-3 text-white shadow-lg dark:bg-white dark:text-zinc-900 sm:-mx-0 sm:rounded-xl">
			<div className="flex items-center gap-3">
				<span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-sm font-semibold dark:bg-zinc-900/20">
					{selectedCount}
				</span>
				<span className="text-sm font-medium">
					{selectedCount} enrollment{selectedCount !== 1 ? "s" : ""} selected
				</span>
			</div>
			<div className="flex items-center gap-2">
				<Button color="emerald" onClick={onApprove} disabled={isLoading} className="text-xs!">
					{isLoading ? (
						<ArrowPathIcon className="size-4 animate-spin" />
					) : (
						<CheckCircleIcon className="size-4" />
					)}
					Approve
				</Button>
				<Button color="red" onClick={onReject} disabled={isLoading} className="text-xs!">
					<XCircleIcon className="size-4" />
					Reject
				</Button>
				<button
					type="button"
					onClick={onClear}
					className="ml-2 rounded-full p-1.5 hover:bg-white/10 dark:hover:bg-zinc-900/10"
					aria-label="Clear selection"
				>
					<XMarkIcon className="size-4" />
				</button>
			</div>
		</div>
	);
}

// =============================================================================
// OVERDUE ALERT BADGE
// =============================================================================

function OverdueAlert() {
	return (
		<span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
			<ExclamationCircleIcon className="size-3" />
			Overdue
		</span>
	);
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
					<div
						key={i}
						className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-800"
					/>
				))}
			</div>

			{/* Cards skeleton */}
			<div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="h-44 animate-pulse rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800"
					/>
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
// ENROLLMENT CARD (Desktop/Tablet)
// =============================================================================

function EnrollmentCard({
	enrollment,
	searchQuery: _searchQuery = "",
	isSelected = false,
	onSelect,
	showOverdueAlert = false,
	campaignName,
}: {
	enrollment: Enrollment;
	searchQuery?: string;
	isSelected?: boolean;
	onSelect?: (id: string, selected: boolean) => void;
	campaignName?: string;
	showOverdueAlert?: boolean;
}) {
	const orgSlug = useOrgSlug();
	const statusConfig = getStatusConfig(enrollment.status);
	const StatusIcon = statusConfig.icon;

	// Format date
	const formatDate = (dateStr: string | undefined) => {
		if (!dateStr) return "—";
		return new Date(dateStr).toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	// Calculate platform fee from locked values
	const platformFeeDisplay = useMemo(() => {
		return enrollment.lockedPlatformFeeDecimal || (enrollment.lockedPlatformFee / 100).toFixed(2);
	}, [enrollment.lockedPlatformFee, enrollment.lockedPlatformFeeDecimal]);

	const handleCheckboxClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onSelect?.(enrollment.id, !isSelected);
	};

	// Avatar color based on order ID (deterministic)
	const avatarColors = [
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
		"bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
		"bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
		"bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
		"bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
	];
	const avatarColorClass = avatarColors[(enrollment.orderId.charCodeAt(0) || 0) % avatarColors.length];
	const initials = enrollment.orderId.slice(-2).toUpperCase();

	return (
		<div
			className={`group relative hidden flex-col overflow-hidden rounded-2xl bg-white ring-1 transition-all hover:shadow-md sm:flex ${isSelected ? "ring-2 ring-zinc-900 dark:ring-white" : "ring-inset ring-zinc-950/5 hover:ring-zinc-950/10 dark:ring-white/10 dark:hover:ring-white/20"}`}
		>
			{/* Selection Checkbox */}
			{onSelect && (
				<button
					type="button"
					onClick={handleCheckboxClick}
					className="absolute left-3 top-3 z-10 flex size-5 items-center justify-center rounded border border-zinc-300 bg-white transition-colors hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-zinc-500"
				>
					{isSelected && <CheckCircleIcon className="size-4 text-zinc-900 dark:text-white" />}
				</button>
			)}

			<Link
				href={`/${orgSlug}/campaigns/${enrollment.campaignId}/enrollments/${enrollment.id}`}
				className="flex flex-1 flex-col"
			>
				{/* Main Content */}
				<div className={`p-4 ${onSelect ? "pl-10" : ""}`}>
					<div className="flex items-start gap-3">
						{/* Avatar with initials */}
						<div className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${avatarColorClass}`}>
							{initials}
						</div>

						{/* Info */}
						<div className="min-w-0 flex-1">
							{/* Order ID + Status */}
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-mono text-sm font-medium text-zinc-900 dark:text-white">
											{enrollment.orderId}
										</span>
										{showOverdueAlert && <OverdueAlert />}
									</div>
									<div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
										<MegaphoneIcon className="size-3 shrink-0" />
										<span className="line-clamp-1">
											{campaignName || `Campaign: ${enrollment.campaignId.slice(-8)}`}
										</span>
									</div>
								</div>
								<Badge
									color={statusConfig.color}
									className="inline-flex shrink-0 items-center gap-1 text-xs!"
								>
									<StatusIcon className="size-3" />
									{statusConfig.label}
								</Badge>
							</div>
						</div>
					</div>
				</div>

				{/* Stats Footer */}
				<div className="relative border-t border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
					<div className="grid grid-cols-3 items-center px-4 py-3">
						{/* Order Value */}
						<div className="text-center">
							<p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Order Value
							</p>
							<p className="mt-0.5 text-sm font-semibold text-zinc-900 dark:text-white">
								{formatCurrency(enrollment.orderValue / 100)}
							</p>
						</div>

						{/* Platform Fee */}
						<div className="border-x border-zinc-200 text-center dark:border-zinc-700">
							<p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Fee ({enrollment.lockedBillRate}%)
							</p>
							<p className="mt-0.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
								{formatCurrency(platformFeeDisplay)}
							</p>
						</div>

						{/* Created */}
						<div className="text-center">
							<p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Submitted
							</p>
							<p className="mt-0.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
								{formatDate(enrollment.createdAt)}
							</p>
						</div>
					</div>
				</div>
			</Link>
		</div>
	);
}

// =============================================================================
// ENROLLMENT LIST ITEM (Mobile)
// =============================================================================

function EnrollmentListItem({
	enrollment,
	searchQuery: _searchQuery = "",
	campaignName,
}: {
	enrollment: Enrollment;
	searchQuery?: string;
	campaignName?: string;
}) {
	const orgSlug = useOrgSlug();
	const statusConfig = getStatusConfig(enrollment.status);
	const StatusIcon = statusConfig.icon;

	const avatarColors = [
		"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
		"bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
		"bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
		"bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
		"bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
	];
	const avatarColorClass =
		avatarColors[(enrollment.orderId.charCodeAt(0) || 0) % avatarColors.length];
	const initials = enrollment.orderId.slice(-2).toUpperCase();

	return (
		<Link
			href={`/${orgSlug}/campaigns/${enrollment.campaignId}/enrollments/${enrollment.id}`}
			className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-inset ring-zinc-950/5 transition-all active:scale-[0.98] dark:bg-zinc-900 dark:ring-zinc-800 sm:hidden"
		>
			{/* Avatar */}
			<div
				className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${avatarColorClass}`}
			>
				{initials}
			</div>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center justify-between gap-2">
					<h3 className="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-white">
						{enrollment.orderId.slice(-12)}
					</h3>
					<span
						className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig.bgClass} ${statusConfig.textClass}`}
					>
						<StatusIcon className="size-2.5" />
						{statusConfig.shortLabel}
					</span>
				</div>

				<div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
					<MegaphoneIcon className="size-3 shrink-0" />
					<span className="truncate">
						{campaignName || enrollment.campaignId.slice(-8)}
					</span>
				</div>

				<div className="mt-1.5 flex items-center gap-3 text-xs">
					<span className="font-semibold text-zinc-900 dark:text-white">
						{formatCurrency(enrollment.orderValue / 100)}
					</span>
					<span className="font-medium text-emerald-600 dark:text-emerald-400">
						+{enrollment.lockedBillRate}% fee
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
			className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
				isActive
					? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
					: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
			}`}
		>
			{Icon && <Icon className="size-3.5" />}
			{label}
			<span
				className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${isActive ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"}`}
			>
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

	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBulkLoading, setIsBulkLoading] = useState(false);

	// Campaign name lookup
	const { data: campaigns } = useCampaigns(organizationId, { take: 100 });
	const campaignNameMap = useMemo(() => {
		const map = new Map<string, string>();
		for (const c of campaigns) {
			map.set(c.id, c.title);
		}
		return map;
	}, [campaigns]);

	// Bulk action mutations
	const bulkApprove = useBulkApproveEnrollments(organizationId);
	const bulkReject = useBulkRejectEnrollments(organizationId);
	const exportEnrollments = useExportOrganizationEnrollments(organizationId);

	// Map UI filter to API status
	const apiStatus = useMemo((): EnrollmentStatus | undefined => {
		if (statusFilter === "all") return undefined;
		return statusFilter;
	}, [statusFilter]);

	const {
		data: enrollments,
		loading,
		error,
		refetch,
		total,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteEnrollments(organizationId, {
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
					enrollment.orderId.toLowerCase().includes(query) ||
					campaignNameMap.get(enrollment.campaignId)?.toLowerCase().includes(query)
			);
		}

		return result;
	}, [enrollments, searchQuery, campaignNameMap]);

	// Stats - count from current filtered or all enrollments
	const stats = useMemo(() => {
		const awaitingReview = enrollments.filter((e) => e.status === "awaiting_review").length;
		const approved = enrollments.filter((e) => e.status === "approved").length;
		const rejected = enrollments.filter((e) => e.status === "permanently_rejected").length;
		return { total: total || enrollments.length, awaitingReview, approved, rejected };
	}, [enrollments, total]);

	// Tracker data for status visualization
	const trackerData = useMemo((): TrackerData[] => {
		return enrollments.map((e) => {
			switch (e.status) {
				case "approved":
					return {
						status: "success" as TrackerStatus,
						tooltip: `Order #${e.orderId.slice(-8)} - Approved`,
					};
				case "awaiting_review":
				case "awaiting_submission":
					return {
						status: "warning" as TrackerStatus,
						tooltip: `Order #${e.orderId.slice(-8)} - Pending`,
					};
				case "permanently_rejected":
					return {
						status: "error" as TrackerStatus,
						tooltip: `Order #${e.orderId.slice(-8)} - Rejected`,
					};
				default:
					return {
						status: "neutral" as TrackerStatus,
						tooltip: `Order #${e.orderId.slice(-8)} - ${e.status}`,
					};
			}
		});
	}, [enrollments]);

	// Reference time for overdue calculation (stable during render)
	const referenceTime = useMemo(() => new Date(), []);

	// Count overdue enrollments
	const overdueCount = useMemo(() => {
		return enrollments.filter(
			(e) => e.status === "awaiting_review" && isOverdue(e.createdAt, referenceTime)
		).length;
	}, [enrollments, referenceTime]);

	// Selection handlers
	const handleSelect = useCallback((id: string, selected: boolean) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (selected) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	}, []);

	const handleSelectAll = useCallback(() => {
		// Only select enrollments that can be actioned (awaiting_review)
		const actionableIds = filteredEnrollments
			.filter((e) => e.status === "awaiting_review")
			.map((e) => e.id);

		if (selectedIds.size === actionableIds.length && actionableIds.length > 0) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(actionableIds));
		}
	}, [filteredEnrollments, selectedIds.size]);

	const clearSelection = useCallback(() => {
		setSelectedIds(new Set());
	}, []);

	// Bulk action handlers
	const handleBulkApprove = useCallback(async () => {
		if (selectedIds.size === 0) return;
		setIsBulkLoading(true);
		try {
			await bulkApprove.mutateAsync({ enrollmentIds: Array.from(selectedIds) });
			setSelectedIds(new Set());
			refetch();
		} catch (error) {
			console.error("Failed to approve enrollments:", error);
		} finally {
			setIsBulkLoading(false);
		}
	}, [selectedIds, bulkApprove, refetch]);

	const handleBulkReject = useCallback(async () => {
		if (selectedIds.size === 0) return;
		setIsBulkLoading(true);
		try {
			await bulkReject.mutateAsync({
				enrollmentIds: Array.from(selectedIds),
				reason: "Bulk rejected",
			});
			setSelectedIds(new Set());
			refetch();
		} catch (error) {
			console.error("Failed to reject enrollments:", error);
		} finally {
			setIsBulkLoading(false);
		}
	}, [selectedIds, bulkReject, refetch]);

	// Export handler — tries API export first, falls back to client-side CSV
	const handleExport = useCallback(async () => {
		try {
			const result = await exportEnrollments.mutateAsync({
				status: apiStatus,
			});
			// If the API returns a download URL, open it
			const url = (result as { url?: string })?.url;
			if (url) {
				window.open(url, "_blank");
				showToast.exported();
			} else {
				// Fallback to client-side export
				exportEnrollmentsToCSV(filteredEnrollments, "enrollments");
				showToast.exportedLocally();
			}
		} catch {
			// Fallback to client-side CSV on API failure
			exportEnrollmentsToCSV(filteredEnrollments, "enrollments");
			showToast.exportedLocally();
		}
	}, [exportEnrollments, apiStatus, filteredEnrollments]);

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

	// Count actionable enrollments for select all
	const actionableCount = filteredEnrollments.filter((e) => e.status === "awaiting_review").length;

	return (
		<div className="space-y-5">
			{/* Bulk Actions Bar */}
			<BulkActionsBar
				selectedCount={selectedIds.size}
				onApprove={handleBulkApprove}
				onReject={handleBulkReject}
				onClear={clearSelection}
				isLoading={isBulkLoading}
			/>

			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Heading>Enrollments</Heading>
					<Text className="mt-1">Review and manage campaign enrollments</Text>
				</div>
				<Button
					outline
					onClick={handleExport}
					disabled={exportEnrollments.isPending}
					className="hidden shrink-0 sm:flex"
				>
					{exportEnrollments.isPending ? (
						<ArrowPathIcon className="size-4 animate-spin" />
					) : (
						<ArrowDownTrayIcon className="size-4" />
					)}
					{exportEnrollments.isPending ? "Exporting..." : "Export"}
				</Button>
			</div>

			{/* Tracker Visualization */}
			{enrollments.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
							Status Overview
						</span>
						<div className="flex items-center gap-3 text-[10px] font-medium">
							<span className="flex items-center gap-1">
								<span className="size-2 rounded-full bg-emerald-500" />
								Approved
							</span>
							<span className="flex items-center gap-1">
								<span className="size-2 rounded-full bg-amber-500" />
								Pending
							</span>
							<span className="flex items-center gap-1">
								<span className="size-2 rounded-full bg-red-500" />
								Rejected
							</span>
						</div>
					</div>
					<Tracker data={trackerData} />
				</div>
			)}

			{/* Overdue Alert */}
			{overdueCount > 0 && (
				<div className="flex items-center gap-3 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<div className="flex size-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
						<ExclamationCircleIcon className="size-4 text-red-600 dark:text-red-400" />
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium text-red-800 dark:text-red-200">
							{overdueCount} enrollment{overdueCount !== 1 ? "s" : ""} overdue
						</p>
						<p className="text-xs text-red-600 dark:text-red-400">
							Pending review for more than 48 hours
						</p>
					</div>
					<Button
						color="red"
						onClick={() => setStatusFilter("awaiting_review")}
						className="text-xs!"
					>
						View
					</Button>
				</div>
			)}

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				<StatCard icon={<UserGroupIcon className="size-5" />} label="Total" value={stats.total} size="sm" />
				<StatCard
					icon={<ClockIcon className="size-5" />}
					label="In Review"
					value={stats.awaitingReview}
					variant="warning"
					size="sm"
				/>
				<StatCard
					icon={<CheckCircleIcon className="size-5" />}
					label="Approved"
					value={stats.approved}
					variant="success"
					size="sm"
				/>
				<StatCard
					icon={<XCircleIcon className="size-5" />}
					label="Rejected"
					value={stats.rejected}
					variant="danger"
					size="sm"
				/>
			</div>

			{/* Search + Filter Row */}
			<div className="flex items-center gap-3">
				<div className="relative w-52 shrink-0">
					<MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search by shopper, campaign..."
						className="h-9 w-full rounded-lg bg-white pl-9 pr-8 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700 dark:focus:ring-white"
						aria-label="Search enrollments"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700"
							aria-label="Clear search"
						>
							<XMarkIcon className="size-3.5" />
						</button>
					)}
				</div>

				{/* Tab Filters */}
				<div className="min-w-0 flex-1 overflow-x-auto">
					<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
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
				</div>
			</div>

			{/* Active filter chips */}
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

			{/* Enrollments List */}
			{filteredEnrollments.length === 0 ? (
				<EmptyState
					preset="enrollments"
					title={
						searchQuery || statusFilter !== "all" ? "No enrollments found" : "No enrollments yet"
					}
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
				<div className="rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 overflow-hidden dark:bg-zinc-900 dark:ring-white/10">
					{/* Results header with Select All */}
					<div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
						<div className="flex items-center gap-3">
							{actionableCount > 0 && (
								<button
									type="button"
									onClick={handleSelectAll}
									className="hidden items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:flex"
								>
									<span
										className={`flex size-4 items-center justify-center rounded border transition-colors ${
											selectedIds.size === actionableCount && actionableCount > 0
												? "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white"
												: "border-zinc-300 dark:border-zinc-600"
										}`}
									>
										{selectedIds.size === actionableCount && actionableCount > 0 && (
											<CheckCircleIcon className="size-3 text-white dark:text-zinc-900" />
										)}
									</span>
									Select all ({actionableCount})
								</button>
							)}
							<span className="text-sm text-zinc-500">
								{filteredEnrollments.length} enrollment{filteredEnrollments.length !== 1 ? "s" : ""}
							</span>
						</div>
					</div>

					<div className="p-3 sm:p-4">
						{/* Cards Grid - Desktop */}
						<div className="hidden grid-cols-1 gap-4 sm:grid md:grid-cols-2">
							{filteredEnrollments.map((enrollment) => (
								<EnrollmentCard
									key={enrollment.id}
									enrollment={enrollment}
									searchQuery={searchQuery}
									isSelected={selectedIds.has(enrollment.id)}
									onSelect={enrollment.status === "awaiting_review" ? handleSelect : undefined}
									showOverdueAlert={
										enrollment.status === "awaiting_review" &&
										isOverdue(enrollment.createdAt, referenceTime)
									}
									campaignName={campaignNameMap.get(enrollment.campaignId)}
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
									campaignName={campaignNameMap.get(enrollment.campaignId)}
								/>
							))}
						</div>

						{/* Load More */}
						{hasMore && (
							<div className="flex justify-center pt-4">
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
					</div>
				</div>
			)}

		</div>
	);
}
