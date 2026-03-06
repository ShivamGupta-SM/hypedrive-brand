import {
	CheckCircleIcon,
	ClockIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	MegaphoneIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Badge } from "@/components/badge";
import { getPlatformColor, getPlatformIcon } from "@/components/icons/platform-icons";
import { Link } from "@/components/link";
import type { brand, db } from "@/lib/brand-client";
import { formatCurrency, formatDateCompact } from "@/lib/design-tokens";
import { SelectionCheckbox } from "@/components/shared/selection-checkbox";

// =============================================================================
// TYPES
// =============================================================================

type Enrollment = brand.EnrollmentWithRelations;
type EnrollmentStatus = db.EnrollmentStatus;

// =============================================================================
// AVATAR HELPER
// =============================================================================

/** Generate a DiceBear Micah avatar URL with diverse skin tones and gender-aware features */
function getAvatarUrl(seed: string, gender?: "male" | "female" | "other") {
	const base = `https://api.dicebear.com/9.x/micah/svg?seed=${encodeURIComponent(seed)}&baseColor=f9c9b6,e8b298,c89070,a67457,77311d,ac6651`;
	if (gender === "male") return `${base}&facialHairProbability=40&earringsProbability=5`;
	if (gender === "female") return `${base}&facialHairProbability=0&earringsProbability=50`;
	// Unknown/other — balanced defaults
	return `${base}&facialHairProbability=20&earringsProbability=30`;
}

// =============================================================================
// STATUS CONFIG (shared across all variants)
// =============================================================================

export function getEnrollmentStatusConfig(status: EnrollmentStatus): {
	label: string;
	icon: typeof CheckCircleIcon;
	color: "lime" | "sky" | "amber" | "red" | "zinc" | "emerald" | "orange";
} {
	const statusMap: Record<
		EnrollmentStatus,
		{
			label: string;
			icon: typeof CheckCircleIcon;
			color: "lime" | "sky" | "amber" | "red" | "zinc" | "emerald" | "orange";
		}
	> = {
		awaiting_submission: { label: "Awaiting Submission", icon: ClockIcon, color: "zinc" },
		awaiting_review: { label: "Awaiting Review", icon: ClockIcon, color: "amber" },
		changes_requested: { label: "Changes Requested", icon: ExclamationTriangleIcon, color: "orange" },
		approved: { label: "Approved", icon: CheckCircleIcon, color: "lime" },
		permanently_rejected: { label: "Rejected", icon: XCircleIcon, color: "red" },
		cancelled: { label: "Cancelled", icon: XCircleIcon, color: "zinc" },
		expired: { label: "Expired", icon: ClockIcon, color: "zinc" },
	};
	return statusMap[status] || { label: status, icon: ClockIcon, color: "zinc" };
}

// =============================================================================
// OVERDUE DETECTION
// =============================================================================

const OVERDUE_HOURS = 48;

export function isEnrollmentOverdue(createdAt: string, referenceTime: Date = new Date()): boolean {
	const created = new Date(createdAt);
	const hoursDiff = (referenceTime.getTime() - created.getTime()) / (1000 * 60 * 60);
	return hoursDiff > OVERDUE_HOURS;
}

// =============================================================================
// CARD VARIANT — Full card with avatar, footer stats, selection checkbox
// =============================================================================

interface CardVariantProps {
	enrollment: Enrollment;
	orgSlug: string;
	isSelected?: boolean;
	onSelect?: (id: string, selected: boolean) => void;
	showOverdueAlert?: boolean;
	campaignName?: string;
}

function EnrollmentCardFull({
	enrollment,
	orgSlug,
	isSelected = false,
	onSelect,
	showOverdueAlert = false,
	campaignName,
}: CardVariantProps) {
	const statusConfig = getEnrollmentStatusConfig(enrollment.status);
	const StatusIcon = statusConfig.icon;

	const handleCheckboxClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onSelect?.(enrollment.id, !isSelected);
	};

	const creatorName = enrollment.creator?.profileName || enrollment.creatorId.slice(-6);
	const avatarSeed = enrollment.creator?.id || enrollment.creatorId;
	const creatorGender = (enrollment.creator as { gender?: "male" | "female" | "other" } | undefined)?.gender;

	const platformName = enrollment.platform?.name;
	const PlatformIconComponent = platformName ? getPlatformIcon(platformName) : null;

	return (
		<div
			className={clsx(
				"group relative flex flex-col rounded-xl bg-white shadow-xs ring-1 transition-all dark:bg-zinc-900",
				isSelected
					? "ring-sky-300 bg-sky-50/50 dark:ring-sky-700 dark:bg-sky-950/20"
					: "ring-zinc-200 hover:ring-zinc-300 hover:shadow-md dark:ring-zinc-800 dark:hover:ring-zinc-700"
			)}
		>
			<Link
				href={`/${orgSlug}/campaigns/${enrollment.campaignId}/enrollments/${enrollment.id}`}
				className="flex flex-1 flex-col"
			>
				{/* Top section: avatar + info */}
				<div className="flex items-start gap-3.5 p-3.5 sm:gap-4 sm:p-4">
					{/* Avatar — bigger with platform overlay */}
					<div className="relative shrink-0">
						<img
							src={getAvatarUrl(avatarSeed, creatorGender)}
							alt={creatorName}
							className="size-12 rounded-full bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"
						/>
						{PlatformIconComponent && (
							<div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-white bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900">
								<PlatformIconComponent className={clsx("size-3", getPlatformColor(platformName || ""))} />
							</div>
						)}
					</div>

					{/* Content */}
					<div className="min-w-0 flex-1">
						{/* Row 1: Name + Status */}
						<div className="flex items-center justify-between gap-2">
							<h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{creatorName}</h3>
							<Badge color={statusConfig.color} className="inline-flex shrink-0 items-center gap-1 text-[11px]!">
								<StatusIcon className="size-3" />
								{statusConfig.label}
							</Badge>
						</div>

						{/* Row 2: Campaign */}
						<div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
							<MegaphoneIcon className="size-3 shrink-0" />
							<span className="truncate">{campaignName || enrollment.campaignId.slice(-8)}</span>
						</div>

						{/* Row 3: ID + date + city + overdue */}
						<div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
							<span className="font-mono">{enrollment.displayId}</span>
							<span>·</span>
							<span>{formatDateCompact(enrollment.createdAt)}</span>
							{enrollment.creator?.city && (
								<>
									<span>·</span>
									<span>{enrollment.creator.city}</span>
								</>
							)}
							{showOverdueAlert && (
								<span className="ml-0.5 inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-px text-[10px] font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400">
									<ExclamationCircleIcon className="size-2.5" />
									Overdue
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Footer stats */}
				<div className="mt-auto grid grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/30">
					<div className="flex flex-col items-center justify-center py-2.5 sm:py-3">
						<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Order Value</span>
						<span className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-900 sm:text-sm dark:text-white">
							{formatCurrency(enrollment.orderValueDecimal)}
						</span>
					</div>
					<div className="flex flex-col items-center justify-center py-2.5 sm:py-3">
						<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
							Fee ({enrollment.lockedBillRate}%)
						</span>
						<span className="mt-0.5 text-xs font-semibold tabular-nums text-emerald-600 sm:text-sm dark:text-emerald-400">
							{formatCurrency(enrollment.lockedPlatformFeeDecimal)}
						</span>
					</div>
					<div className="flex flex-col items-center justify-center py-2.5 sm:py-3">
						<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Submitted</span>
						<span className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-700 sm:text-sm dark:text-zinc-300">
							{formatDateCompact(enrollment.createdAt)}
						</span>
					</div>
				</div>
			</Link>

			{/* Selection checkbox — overlaid top-left, outside the Link */}
			{onSelect && (
				<SelectionCheckbox
					selected={isSelected}
					onToggle={handleCheckboxClick}
				/>
			)}
		</div>
	);
}

// =============================================================================
// COMPACT VARIANT — Mini card for campaign detail, dialogs (same shape as Full)
// =============================================================================

interface CompactVariantProps {
	enrollment: Enrollment;
	onClick?: () => void;
}

function EnrollmentCardCompact({ enrollment, onClick }: CompactVariantProps) {
	const statusConfig = getEnrollmentStatusConfig(enrollment.status);
	const StatusIcon = statusConfig.icon;

	const platformName = enrollment.platform?.name;
	const PlatformIconComponent = platformName ? getPlatformIcon(platformName) : null;
	const creatorName = enrollment.creator?.profileName || enrollment.creatorId.slice(-6);
	const avatarSeed = enrollment.creator?.id || enrollment.creatorId;
	const creatorGender = (enrollment.creator as { gender?: "male" | "female" | "other" } | undefined)?.gender;

	const Wrapper = onClick ? "button" : "div";

	return (
		<Wrapper
			{...(onClick ? { type: "button" as const, onClick } : {})}
			className={clsx(
				"group relative flex w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-xs ring-1 transition-all dark:bg-zinc-900",
				onClick
					? "ring-zinc-200 hover:ring-zinc-300 hover:shadow-md dark:ring-zinc-800 dark:hover:ring-zinc-700 cursor-pointer"
					: "ring-zinc-200 dark:ring-zinc-800"
			)}
		>
			{/* Top section: avatar + info */}
			<div className="flex items-start gap-3 p-3 sm:gap-3.5 sm:p-3.5">
				{/* Avatar with platform overlay */}
				<div className="relative shrink-0">
					<img
						src={getAvatarUrl(avatarSeed, creatorGender)}
						alt={creatorName}
						className="size-10 rounded-full bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"
					/>
					{PlatformIconComponent && (
						<div className="absolute -bottom-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full border-2 border-white bg-white shadow-sm dark:border-zinc-900 dark:bg-zinc-900">
							<PlatformIconComponent className={clsx("size-2.5", getPlatformColor(platformName || ""))} />
						</div>
					)}
				</div>

				{/* Content */}
				<div className="min-w-0 flex-1">
					{/* Row 1: Name + Status */}
					<div className="flex items-center justify-between gap-2">
						<h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{creatorName}</h3>
						<Badge color={statusConfig.color} className="inline-flex shrink-0 items-center gap-0.5 text-[10px]!">
							<StatusIcon className="size-2.5" />
							{statusConfig.label}
						</Badge>
					</div>

					{/* Row 2: ID + date + platform */}
					<div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
						<span className="font-mono">{enrollment.displayId}</span>
						<span>·</span>
						<span>{formatDateCompact(enrollment.createdAt)}</span>
						{enrollment.creator?.city && (
							<>
								<span>·</span>
								<span>{enrollment.creator.city}</span>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Footer stats — same structure as Full variant */}
			<div className="mt-auto grid grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/30">
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Order Value</span>
					<span className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">
						{formatCurrency(enrollment.orderValueDecimal)}
					</span>
				</div>
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
						Fee ({enrollment.lockedBillRate}%)
					</span>
					<span className="mt-0.5 text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
						{formatCurrency(enrollment.lockedPlatformFeeDecimal)}
					</span>
				</div>
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Submitted</span>
					<span className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
						{formatDateCompact(enrollment.createdAt)}
					</span>
				</div>
			</div>
		</Wrapper>
	);
}

// =============================================================================
// INLINE VARIANT — Mini card for dashboard pending reviews (limited data shape)
// =============================================================================

interface InlineVariantProps {
	enrollment: {
		id: string;
		orderId: string;
		orderValueDecimal: string;
		createdAt: string;
		campaign: { id: string; title: string };
		creator: { id: string; name: string; gender?: "male" | "female" | "other" };
	};
	orgSlug: string;
	formatRelativeTime: (date: string) => string;
}

function EnrollmentCardInline({ enrollment, orgSlug, formatRelativeTime }: InlineVariantProps) {
	return (
		<Link
			href={`/${orgSlug}/enrollments/${enrollment.id}`}
			className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 transition-all hover:ring-zinc-300 hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
		>
			{/* Top section: avatar + info */}
			<div className="flex items-start gap-3 p-3">
				<img
					src={getAvatarUrl(enrollment.creator.id, enrollment.creator.gender)}
					alt={enrollment.creator.name}
					className="size-10 shrink-0 rounded-full bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"
				/>
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
							{enrollment.creator.name}
						</h3>
						<Badge color="amber" className="inline-flex shrink-0 items-center gap-0.5 text-[10px]!">
							<ClockIcon className="size-2.5" />
							Pending
						</Badge>
					</div>
					<div className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
						<MegaphoneIcon className="size-3 shrink-0" />
						<span className="truncate">{enrollment.campaign.title}</span>
					</div>
				</div>
			</div>

			{/* Footer stats */}
			<div className="mt-auto grid grid-cols-2 divide-x divide-zinc-200 border-t border-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/30">
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Order Value</span>
					<span className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">
						{formatCurrency(enrollment.orderValueDecimal)}
					</span>
				</div>
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Submitted</span>
					<span className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
						{formatRelativeTime(enrollment.createdAt)}
					</span>
				</div>
			</div>
		</Link>
	);
}

// =============================================================================
// EXPORTED COMPONENTS
// =============================================================================

export { EnrollmentCardFull, EnrollmentCardCompact, EnrollmentCardInline };
export type { Enrollment, EnrollmentStatus, CardVariantProps, CompactVariantProps, InlineVariantProps };
