import {
	CalendarDaysIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyRupeeIcon,
	EllipsisVerticalIcon,
	MegaphoneIcon,
	UsersIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { getPlatformColor, getPlatformIcon } from "@/components/icons/platform-icons";
import { Link } from "@/components/link";
import { Skeleton } from "@/components/skeleton";
import type { brand } from "@/lib/brand-client";
import { formatDateCompact, formatPrice } from "@/lib/design-tokens";
import { type StatusColor, getStatusConfig } from "./utils";

type Campaign = brand.CampaignWithStats;

// Chip color classes — solid bg with white text for strong visibility
const chipColors: Record<StatusColor, string> = {
	lime: "bg-lime-600 text-white dark:bg-lime-500",
	sky: "bg-sky-600 text-white dark:bg-sky-500",
	amber: "bg-amber-500 text-white dark:bg-amber-500",
	zinc: "bg-zinc-500 text-white dark:bg-zinc-500",
	emerald: "bg-emerald-600 text-white dark:bg-emerald-500",
	red: "bg-red-600 text-white dark:bg-red-500",
};

// =============================================================================
// HELPERS
// =============================================================================

function getDaysLeft(endDate?: string): number | null {
	if (!endDate) return null;
	const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
	return diff > 0 ? diff : 0;
}

// =============================================================================
// DEADLINE GAUGE — semicircle SVG (ported from shopper enrollment-card)
// =============================================================================

function DeadlineGauge({ daysRemaining, maxDays = 30 }: { daysRemaining: number; maxDays?: number }) {
	const percent = Math.min((daysRemaining / maxDays) * 100, 100);
	const isUrgent = daysRemaining <= 3;
	const isWarning = daysRemaining <= 7;

	const strokeColor = isUrgent ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";
	const textColor = isUrgent
		? "text-red-600 dark:text-red-400"
		: isWarning
			? "text-amber-600 dark:text-amber-400"
			: "text-emerald-600 dark:text-emerald-400";

	const size = 52;
	const strokeWidth = 4;
	const radius = (size - strokeWidth) / 2;
	const circumference = Math.PI * radius;
	const offset = circumference - (percent / 100) * circumference;

	return (
		<div className="flex flex-col items-center">
			<div className="relative" style={{ width: size, height: size / 2 + strokeWidth }}>
				<svg
					width={size}
					height={size / 2 + strokeWidth}
					viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
					className="overflow-visible"
					aria-hidden="true"
				>
					<path
						d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
						fill="none"
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						className="stroke-zinc-200 dark:stroke-zinc-700"
					/>
					<path
						d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
						fill="none"
						stroke={strokeColor}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
					/>
				</svg>
				<div className={`absolute inset-x-0 bottom-0 flex flex-col items-center ${textColor}`}>
					<span className="text-sm font-bold tabular-nums leading-none">{daysRemaining}</span>
					<span className="text-[7px] font-semibold uppercase tracking-wide opacity-70">days</span>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// CAMPAIGN CARD
// =============================================================================

export interface CampaignCardProps {
	campaign: Campaign;
	orgSlug: string;
	onPause: (id: string) => void;
	onResume: (id: string) => void;
	onDelete: (id: string) => void;
	onDuplicate: (id: string) => void;
	isActionPending?: boolean;
	canPause?: boolean;
	canResume?: boolean;
	canDelete?: boolean;
	canCreate?: boolean;
}

export function CampaignCard({
	campaign,
	orgSlug,
	onPause,
	onResume,
	onDelete,
	onDuplicate,
	isActionPending,
	canPause: canPauseAction,
	canResume: canResumeAction,
	canDelete: canDeleteAction,
	canCreate: canDuplicateAction,
}: CampaignCardProps) {
	const statusConfig = getStatusConfig(campaign.status);
	const StatusIcon = statusConfig.icon;
	const daysLeft = getDaysLeft(campaign.endDate);
	const productImage = campaign.listing?.listingImages?.[0]?.imageUrl ?? null;
	const listingName = campaign.listing?.name;
	const displayPrice = formatPrice(campaign.listing?.priceDecimal);

	const primaryPlatform = campaign.tasks?.find((t) => t.platformName)?.platformName;
	const PlatformIcon = primaryPlatform ? getPlatformIcon(primaryPlatform) : null;
	const platformColor = primaryPlatform ? getPlatformColor(primaryPlatform) : "";

	const isLive = ["active", "paused"].includes(campaign.status);
	const hasCap = campaign.maxEnrollments > 0;
	const progress = hasCap
		? Math.min(100, Math.round((campaign.currentEnrollments / campaign.maxEnrollments) * 100))
		: 0;

	const showGauge = isLive && daysLeft !== null && daysLeft > 0;

	const dropdownMenu = (
		<Dropdown>
			<DropdownButton
				plain
				aria-label="Campaign actions"
				className="flex size-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
				disabled={isActionPending}
				onClick={(e: React.MouseEvent) => e.preventDefault()}
			>
				<EllipsisVerticalIcon className="size-4" />
			</DropdownButton>
			<DropdownMenu anchor="bottom end">
				<DropdownItem href={`/${orgSlug}/campaigns/${campaign.id}`}>View details</DropdownItem>
				{canDuplicateAction && <DropdownItem onClick={() => onDuplicate(campaign.id)}>Duplicate</DropdownItem>}
				{campaign.status === "active" && canPauseAction && (
					<DropdownItem onClick={() => onPause(campaign.id)}>Pause campaign</DropdownItem>
				)}
				{campaign.status === "paused" && canResumeAction && (
					<DropdownItem onClick={() => onResume(campaign.id)}>Resume campaign</DropdownItem>
				)}
				{canDeleteAction && (
					<DropdownItem onClick={() => onDelete(campaign.id)} className="text-red-600 dark:text-red-400">
						Cancel Campaign
					</DropdownItem>
				)}
			</DropdownMenu>
		</Dropdown>
	);

	return (
		<Link
			href={`/${orgSlug}/campaigns/${campaign.id}`}
			className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 transition-all hover:shadow-md hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
		>
			{/* Header: product image + title + meta */}
			<div className="flex flex-1 flex-col">
				<div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
					{/* Product Image — responsive 56px / 80px */}
					<div className="relative shrink-0">
						<div className="size-14 overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-zinc-200/80 sm:size-20 dark:bg-zinc-800 dark:ring-zinc-700">
							{productImage ? (
								<img src={productImage} alt={listingName ?? "Product"} className="size-full object-contain p-1 sm:p-1.5" />
							) : (
								<div className="flex size-full items-center justify-center">
									<MegaphoneIcon className="size-6 text-zinc-300 sm:size-7 dark:text-zinc-600" />
								</div>
							)}
						</div>
						{PlatformIcon && (
							<div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-md border-2 border-white bg-white shadow-sm sm:size-6 sm:rounded-lg dark:border-zinc-900 dark:bg-zinc-900">
								<PlatformIcon className={clsx("size-3 sm:size-3.5", platformColor)} />
							</div>
						)}
					</div>

					{/* Title + Meta */}
					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-2">
							<h3 className="line-clamp-2 text-sm/5 font-semibold text-zinc-900 dark:text-white">{campaign.title}</h3>
							{dropdownMenu}
						</div>
						{listingName && <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">{listingName}</p>}

						{/* Chips row */}
						<div className="mt-2 flex flex-wrap items-center gap-1.5">
							<span
								className={clsx(
									"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
									chipColors[statusConfig.color]
								)}
							>
								<StatusIcon className="size-3 shrink-0" />
								{statusConfig.label}
							</span>
							{displayPrice && (
								<span
									className={clsx(
										"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
										chipColors.emerald
									)}
								>
									<CurrencyRupeeIcon className="size-3 shrink-0" />
									{displayPrice.replace("₹", "")}
								</span>
							)}
							<span
								className={clsx(
									"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
									chipColors.sky
								)}
							>
								<CalendarDaysIcon className="size-3 shrink-0" />
								{formatDateCompact(campaign.startDate)} – {formatDateCompact(campaign.endDate)}
							</span>
						</div>
					</div>
				</div>

				{/* Progress bar (live campaigns with caps) */}
				{isLive && hasCap && (
					<div className="px-3 pb-3 sm:px-4">
						<div className="flex items-center justify-between pb-1">
							<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Enrollment Progress</span>
							<span className="text-[10px] font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
								{campaign.currentEnrollments}/{campaign.maxEnrollments}
							</span>
						</div>
						<div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
							<div
								className={clsx(
									"h-full rounded-full transition-all duration-500",
									progress >= 90 ? "bg-red-500" : progress >= 70 ? "bg-amber-500" : "bg-emerald-500"
								)}
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				)}

				{/* Divider */}
				<div className="mt-auto h-px bg-zinc-200 dark:bg-zinc-700" />

				{/* Footer stats: 3-col */}
				<div className="grid grid-cols-3 divide-x divide-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:bg-zinc-800/30">
					<div className="flex flex-col items-center justify-center py-2.5 sm:py-3">
						<span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
							<UsersIcon className="size-3 shrink-0" />
							Enrolled
						</span>
						<span className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-900 sm:text-sm dark:text-white">
							{campaign.currentEnrollments}
							{hasCap && (
								<span className="text-[10px] font-normal text-zinc-500 sm:text-xs dark:text-zinc-400">/{campaign.maxEnrollments}</span>
							)}
						</span>
					</div>

					<div className="flex flex-col items-center justify-center py-2.5 sm:py-3">
						<span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
							<ClockIcon className="size-3 shrink-0" />
							Pending
						</span>
						<span className="mt-0.5 text-xs font-semibold tabular-nums text-amber-600 sm:text-sm dark:text-amber-400">
							{campaign.pendingCount}
						</span>
					</div>

					<div className="flex flex-col items-center justify-center py-2 sm:py-2.5">
						{showGauge && daysLeft !== null ? (
							<DeadlineGauge daysRemaining={daysLeft} />
						) : (
							<>
								<span className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
									<CheckCircleIcon className="size-3 shrink-0" />
									Approved
								</span>
								<span className="mt-0.5 text-xs font-semibold tabular-nums text-emerald-600 sm:text-sm dark:text-emerald-400">
									{campaign.approvedCount}
								</span>
							</>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}

// =============================================================================
// CAMPAIGN CARD SKELETON
// =============================================================================

export function CampaignCardSkeleton() {
	return (
		<div className="overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
				<div className="size-14 shrink-0 animate-pulse rounded-xl bg-zinc-200 skeleton-shimmer sm:size-20 dark:bg-zinc-700" />
				<div className="min-w-0 flex-1">
					<Skeleton width="80%" height={18} borderRadius={4} />
					<Skeleton width="55%" height={14} borderRadius={3} className="mt-1" />
					<div className="mt-2 flex items-center gap-1.5">
						<Skeleton width={56} height={20} borderRadius={6} />
						<Skeleton width={50} height={20} borderRadius={6} />
						<Skeleton width={90} height={20} borderRadius={6} />
					</div>
				</div>
			</div>
			<div className="px-3 pb-3 sm:px-4">
				<div className="flex items-center justify-between pb-1">
					<Skeleton width={90} height={10} borderRadius={3} />
					<Skeleton width={30} height={10} borderRadius={3} />
				</div>
				<Skeleton height={6} borderRadius={999} />
			</div>
			<div className="h-px bg-zinc-200 dark:bg-zinc-700" />
			<div className="grid grid-cols-3 divide-x divide-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:bg-zinc-800/30">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex flex-col items-center gap-1 py-2.5 sm:py-3">
						<Skeleton width={48} height={10} borderRadius={3} />
						<Skeleton width={32} height={18} borderRadius={4} />
					</div>
				))}
			</div>
		</div>
	);
}
