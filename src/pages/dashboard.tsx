import {
	ArrowTrendingUpIcon,
	BanknotesIcon,
	CheckCircleIcon,
	ChevronRightIcon,
	ClockIcon,
	MegaphoneIcon,
	RocketLaunchIcon,
	ShoppingBagIcon,
	SparklesIcon,
	UserGroupIcon,
	WalletIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useMemo, useRef } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { AreaChart } from "@/components/charts";
import { EnrollmentCardInline } from "@/components/enrollment-card";
import { Link } from "@/components/link";
import { AlertBanner, ContentCard, PageHeader } from "@/components/page-header";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ErrorState } from "@/components/shared/error-state";
import { IconButton } from "@/components/shared/icon-button";
import { Skeleton } from "@/components/skeleton";
import {
	useDashboard,
	useOrganizationActivity,
	useSetupProgress,
	useSetupProgressStream,
} from "@/features/organization/hooks";
import { getAssetUrl } from "@/hooks/api-client";
import { useOrgContext } from "@/hooks/use-org-context";
import { formatCurrency, formatRelativeTime } from "@/lib/design-tokens";

// =============================================================================
// GREETING
// =============================================================================

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

// =============================================================================
// SECTION HEADER
// =============================================================================

const sectionIconColors = {
	emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "text-emerald-500" },
	sky: { bg: "bg-sky-100 dark:bg-sky-900/30", icon: "text-sky-500" },
	amber: { bg: "bg-amber-100 dark:bg-amber-900/30", icon: "text-amber-500" },
	violet: { bg: "bg-violet-100 dark:bg-violet-900/30", icon: "text-violet-500" },
	rose: { bg: "bg-rose-100 dark:bg-rose-900/30", icon: "text-rose-500" },
	zinc: { bg: "bg-zinc-100 dark:bg-zinc-800", icon: "text-zinc-500 dark:text-zinc-400" },
};

type SectionIconColor = keyof typeof sectionIconColors;

function SectionHeader({
	title,
	icon: Icon,
	img,
	iconColor = "zinc",
	children,
}: {
	title: string;
	icon?: React.ElementType;
	img?: string;
	iconColor?: SectionIconColor;
	children?: React.ReactNode;
}) {
	const colors = sectionIconColors[iconColor];
	return (
		<div className="flex items-center gap-2.5">
			{img ? (
				<img src={img} alt="" className="size-6 object-contain drop-shadow-sm" />
			) : Icon ? (
				<div className={`flex size-6 items-center justify-center rounded-md ${colors.bg}`}>
					<Icon className={`size-3.5 ${colors.icon}`} />
				</div>
			) : null}
			<h2 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h2>
			{children}
		</div>
	);
}

// =============================================================================
// ALERT BAR
// =============================================================================

function DashboardAlertBar({
	walletBalance,
	lowBalanceThreshold,
	avgDailySpend,
	overdueEnrollments,
	orgSlug,
}: {
	walletBalance: number;
	lowBalanceThreshold: number;
	avgDailySpend: number;
	overdueEnrollments: number;
	orgSlug: string;
}) {
	const isLowBalance = walletBalance < lowBalanceThreshold;
	const runwayDays = avgDailySpend > 0 ? Math.floor(walletBalance / avgDailySpend) : 0;
	const hasOverdue = overdueEnrollments > 0;

	if (!isLowBalance && !hasOverdue) return null;

	return (
		<div className="space-y-2">
			{isLowBalance && (
				<AlertBanner
					variant="warning"
					size="sm"
					title="Low wallet balance"
					description={
						runwayDays > 0
							? `~${runwayDays} day${runwayDays !== 1 ? "s" : ""} of runway remaining`
							: "Add funds to continue running campaigns"
					}
					icon={<WalletIcon className="size-4" />}
					action={{ label: "Add Funds", href: `/${orgSlug}/wallet` }}
				/>
			)}
			{hasOverdue && (
				<AlertBanner
					variant="warning"
					size="sm"
					title={`${overdueEnrollments} overdue enrollment${overdueEnrollments !== 1 ? "s" : ""}`}
					description="Pending review for more than 48 hours"
					action={{ label: "Review Now", href: `/${orgSlug}/enrollments` }}
				/>
			)}
		</div>
	);
}

// =============================================================================
// WALLET HERO — Compact balance card
// =============================================================================

function WalletHero({
	stats,
	orgSlug,
}: {
	stats: {
		walletBalanceDecimal: string;
		availableBalanceDecimal: string;
		heldAmountDecimal: string;
		avgDailySpend: number;
		avgDailySpendDecimal: string;
		walletBalance: number;
		paymentMode: string;
		pendingCommitmentsDecimal?: string;
		walletBalanceStale?: boolean;
	};
	orgSlug: string;
}) {
	const runwayDays = stats.avgDailySpend > 0 ? Math.floor(stats.walletBalance / stats.avgDailySpend) : null;

	return (
		<div className="overflow-hidden rounded-xl bg-zinc-900 p-4 shadow-md ring-1 ring-zinc-950/10 sm:p-5 dark:bg-zinc-800 dark:ring-zinc-700">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-xs font-medium text-zinc-400">Available Balance</p>
					<p className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
						{stats.walletBalanceStale && <span className="mr-1 text-amber-400/80">~</span>}
						{formatCurrency(stats.availableBalanceDecimal)}
					</p>
					{stats.walletBalanceStale && <p className="mt-0.5 text-[10px] text-amber-400/70">Balance may be delayed</p>}
				</div>
				<Link
					href={`/${orgSlug}/wallet`}
					className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/15"
				>
					Manage Wallet
				</Link>
			</div>

			<div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
				<div className="min-w-0">
					<p className="text-[11px] text-zinc-500 dark:text-zinc-400">Wallet Balance</p>
					<p className="mt-0.5 truncate text-sm font-medium tabular-nums text-zinc-300">
						{formatCurrency(stats.walletBalanceDecimal)}
					</p>
				</div>
				<div className="min-w-0">
					<p className="text-[11px] text-zinc-500 dark:text-zinc-400">
						{stats.paymentMode === "post_submission" ? "Commitments" : "On Hold"}
					</p>
					<p className="mt-0.5 truncate text-sm font-medium tabular-nums text-zinc-300">
						{formatCurrency(
							stats.paymentMode === "post_submission" ? stats.pendingCommitmentsDecimal || "0" : stats.heldAmountDecimal
						)}
					</p>
				</div>
				<div className="min-w-0">
					<p className="text-[11px] text-zinc-500 dark:text-zinc-400">Runway</p>
					<p className="mt-0.5 text-sm font-medium tabular-nums text-zinc-300">
						{runwayDays !== null ? `${runwayDays}d` : "—"}
					</p>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// CAMPAIGN PULSE — Compact status breakdown
// =============================================================================

function CampaignPulse({
	stats,
	orgSlug,
}: {
	stats: {
		totalCampaigns: number;
		activeCampaigns: number;
		draftCampaigns: number;
		pausedCampaigns: number;
		endingSoon: number;
	};
	orgSlug: string;
}) {
	const items = [
		{ label: "Active", value: stats.activeCampaigns, dotClass: "bg-emerald-500" },
		{ label: "Draft", value: stats.draftCampaigns, dotClass: "bg-zinc-400 dark:bg-zinc-500" },
		{ label: "Paused", value: stats.pausedCampaigns, dotClass: "bg-amber-400" },
	];

	return (
		<ContentCard padding="none">
			<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
				<SectionHeader title="Campaigns" icon={MegaphoneIcon} iconColor="violet" />
				<Link
					href={`/${orgSlug}/campaigns`}
					className="group flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
				>
					View all
					<ChevronRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>
			<div className="px-3.5 py-3 sm:px-4">
				<div className="flex items-baseline gap-2">
					<span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">
						{stats.totalCampaigns}
					</span>
					<span className="text-sm text-zinc-500 dark:text-zinc-400">total</span>
				</div>

				<div className="mt-3 space-y-2">
					{items.map((item) => (
						<div key={item.label} className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className={`size-2 rounded-full ${item.dotClass}`} />
								<span className="text-sm text-zinc-600 dark:text-zinc-400">{item.label}</span>
							</div>
							<span className="text-sm font-medium tabular-nums text-zinc-900 dark:text-white">{item.value}</span>
						</div>
					))}
				</div>

				{stats.endingSoon > 0 && (
					<div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50/60 px-3 py-2 shadow-sm ring-1 ring-amber-200 dark:bg-amber-950/10 dark:ring-amber-800">
						<ClockIcon className="size-3.5 text-amber-500" />
						<span className="text-xs font-medium text-amber-700 dark:text-amber-400">{stats.endingSoon} ending soon</span>
					</div>
				)}
			</div>
		</ContentCard>
	);
}

// =============================================================================
// ENROLLMENT STATS — Distribution + approval rate
// =============================================================================

function EnrollmentStats({
	stats,
	orgSlug,
}: {
	stats: {
		totalEnrollments: number;
		approvedEnrollments: number;
		pendingEnrollments: number;
		rejectedEnrollments: number;
		enrollmentTrend: number;
		approvalRateTrend: number;
	};
	orgSlug: string;
}) {
	const approvalRate =
		stats.totalEnrollments > 0 ? Math.round((stats.approvedEnrollments / stats.totalEnrollments) * 100) : 0;

	const segments = [
		{ count: stats.approvedEnrollments, color: "bg-emerald-500", label: "Approved" },
		{ count: stats.pendingEnrollments, color: "bg-amber-400", label: "Pending" },
		{ count: stats.rejectedEnrollments, color: "bg-red-400", label: "Rejected" },
	].filter((s) => s.count > 0);

	const total = stats.totalEnrollments;

	return (
		<ContentCard padding="none">
			<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
				<SectionHeader title="Enrollments" icon={UserGroupIcon} iconColor="sky" />
				<Link
					href={`/${orgSlug}/enrollments`}
					className="group flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
				>
					View all
					<ChevronRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>
			<div className="px-3.5 py-3 sm:px-4">
				<div className="flex items-baseline gap-2">
					<span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-white">
						{stats.totalEnrollments.toLocaleString()}
					</span>
					{stats.enrollmentTrend !== 0 && (
						<span
							className={`flex items-center gap-0.5 text-xs font-medium ${
								stats.enrollmentTrend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
							}`}
						>
							<ArrowTrendingUpIcon className={`size-3.5 ${stats.enrollmentTrend < 0 ? "rotate-180" : ""}`} />
							{Math.abs(stats.enrollmentTrend)}%
						</span>
					)}
				</div>

				{/* Progress bar */}
				{total > 0 && (
					<div className="mt-3 space-y-2.5">
						<div className="flex h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
							{segments.map((seg) => (
								<div
									key={seg.label}
									className={`${seg.color} first:rounded-l-full last:rounded-r-full transition-all duration-500`}
									style={{ width: `${(seg.count / total) * 100}%` }}
								/>
							))}
						</div>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
							{segments.map((seg) => (
								<div key={seg.label} className="flex items-center gap-1.5">
									<div className={`size-2 rounded-full ${seg.color}`} />
									<span className="text-xs text-zinc-500 dark:text-zinc-400">{seg.label}</span>
									<span className="text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">{seg.count}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Approval rate */}
				<div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
					<span className="text-xs text-zinc-500 dark:text-zinc-400">Approval Rate</span>
					<div className="flex items-center gap-1.5">
						<span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">{approvalRate}%</span>
						{stats.approvalRateTrend !== 0 && (
							<span
								className={`text-[10px] font-medium ${
									stats.approvalRateTrend > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
								}`}
							>
								{stats.approvalRateTrend > 0 ? "+" : ""}
								{stats.approvalRateTrend}%
							</span>
						)}
					</div>
				</div>
			</div>
		</ContentCard>
	);
}

// =============================================================================
// ENROLLMENT TREND CHART
// =============================================================================

function EnrollmentTrendChart({
	chartData,
	orgSlug,
}: {
	chartData: Array<{
		date: string;
		enrollments: number;
		approved: number;
		rejected: number;
		pending: number;
	}>;
	orgSlug: string;
}) {
	if (!chartData || chartData.length < 2) return null;

	const formattedData = chartData.map((d) => ({
		...d,
		date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
	}));

	return (
		<ContentCard padding="none" className="overflow-hidden">
			<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
				<SectionHeader title="Enrollment Trend" icon={ArrowTrendingUpIcon} iconColor="emerald" />
				<Link
					href={`/${orgSlug}/enrollments`}
					className="group flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
				>
					View all
					<ChevronRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>
			<div className="px-3.5 py-3 sm:px-4">
				<div className="h-48 sm:h-56">
					<AreaChart
						data={formattedData}
						series={[
							{ dataKey: "enrollments", name: "Total" },
							{ dataKey: "approved", name: "Approved" },
						]}
						xAxisKey="date"
						height={224}
						showGrid
						showLegend
					/>
				</div>
			</div>
		</ContentCard>
	);
}

// =============================================================================
// TOP CAMPAIGNS
// =============================================================================

function TopCampaignsSection({
	campaigns,
	orgSlug,
}: {
	campaigns: Array<{
		id: string;
		name: string;
		listingImage: string | null;
		enrollments: number;
		approvalRate: number;
		status: "active" | "ending" | "paused";
		daysLeft: number;
	}>;
	orgSlug: string;
}) {
	if (campaigns.length === 0) return null;

	const statusConfig: Record<string, { label: string; color: "lime" | "amber" | "zinc" }> = {
		active: { label: "Active", color: "lime" },
		ending: { label: "Ending", color: "amber" },
		paused: { label: "Paused", color: "zinc" },
	};

	return (
		<ContentCard padding="none" className="overflow-hidden">
			<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
				<SectionHeader title="Top Campaigns" icon={MegaphoneIcon} iconColor="violet" />
				<Link
					href={`/${orgSlug}/campaigns`}
					className="group flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
				>
					View all
					<ChevronRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>
			<div className="px-3.5 py-3 sm:px-4">
				<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
				{campaigns.slice(0, 4).map((campaign) => {
					const sc = statusConfig[campaign.status] || statusConfig.active;
					return (
						<Link
							key={campaign.id}
							href={`/${orgSlug}/campaigns/${campaign.id}`}
							className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 transition-all hover:ring-zinc-300 hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
						>
							{/* Top section: image + info */}
							<div className="flex items-start gap-3 p-3">
								{campaign.listingImage ? (
									<div className="size-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100 ring-1 ring-zinc-200/80 p-1 dark:bg-zinc-800 dark:ring-zinc-700">
										<img src={getAssetUrl(campaign.listingImage)} alt="" className="size-full object-contain" />
									</div>
								) : (
									<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:ring-zinc-700">
										<MegaphoneIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
									</div>
								)}
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-2">
										<h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{campaign.name}</h3>
										<Badge color={sc.color} className="inline-flex shrink-0 items-center gap-0.5 text-[10px]!">
											{sc.label}
										</Badge>
									</div>
									<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
										{campaign.enrollments} enrolled · {campaign.approvalRate}% approved
									</p>
								</div>
							</div>

							{/* Footer stats */}
							<div className="mt-auto grid grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/30">
								<div className="flex flex-col items-center justify-center py-2">
									<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Enrolled</span>
									<span className="mt-0.5 text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">
										{campaign.enrollments}
									</span>
								</div>
								<div className="flex flex-col items-center justify-center py-2">
									<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Approval</span>
									<span className="mt-0.5 text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
										{campaign.approvalRate}%
									</span>
								</div>
								<div className="flex flex-col items-center justify-center py-2">
									<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Days Left</span>
									<span className={`mt-0.5 text-xs font-semibold tabular-nums ${campaign.daysLeft <= 3 ? "text-red-600 dark:text-red-400" : campaign.daysLeft <= 7 ? "text-amber-600 dark:text-amber-400" : "text-zinc-700 dark:text-zinc-300"}`}>
										{campaign.daysLeft > 0 ? campaign.daysLeft : "—"}
									</span>
								</div>
							</div>
						</Link>
					);
				})}
				</div>
			</div>
		</ContentCard>
	);
}

// =============================================================================
// PENDING REVIEWS
// =============================================================================

function PendingReviewsSection({
	items,
	totalPending,
	orgSlug,
}: {
	items: Array<{
		id: string;
		orderId: string;
		orderValueDecimal: string;
		createdAt: string;
		campaign: { id: string; title: string };
		creator: { id: string; name: string };
	}>;
	totalPending: number;
	orgSlug: string;
}) {
	if (items.length === 0 && totalPending === 0) return null;

	return (
		<ContentCard padding="none" className="overflow-hidden">
			<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
				<SectionHeader title="Pending Reviews" icon={ClockIcon} iconColor="amber">
					{totalPending > 0 && (
						<span className="flex size-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold tabular-nums text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
							{totalPending > 99 ? "99+" : totalPending}
						</span>
					)}
				</SectionHeader>
				<Link
					href={`/${orgSlug}/enrollments`}
					className="group flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-500 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
				>
					View all
					<ChevronRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>
			<div className="px-3.5 py-3 sm:px-4">
				{items.length > 0 ? (
					<div className="space-y-3">
						<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
							{items.slice(0, 4).map((item) => (
								<EnrollmentCardInline
									key={item.id}
									enrollment={item}
									orgSlug={orgSlug}
									formatRelativeTime={formatRelativeTime}
								/>
							))}
						</div>

						{totalPending > 4 && (
							<Link
								href={`/${orgSlug}/enrollments`}
								className="group flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-white"
							>
								View all {totalPending} pending
								<ChevronRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
							</Link>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center rounded-lg bg-zinc-50 py-6 text-center dark:bg-zinc-800/30">
						<div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
							<CheckCircleIcon className="size-5 text-emerald-500" />
						</div>
						<p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">All caught up</p>
						<p className="text-xs text-zinc-500 dark:text-zinc-400">No enrollments need review</p>
					</div>
				)}
			</div>
		</ContentCard>
	);
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

function QuickActions({ orgSlug }: { orgSlug: string }) {
	const links = [
		{
			label: "Campaigns",
			desc: "Create & manage",
			img: "/icons/3d/influencer.png",
			href: `/${orgSlug}/campaigns`,
		},
		{
			label: "Listings",
			desc: "Product catalog",
			img: "/icons/3d/shopping-basket.png",
			href: `/${orgSlug}/listings`,
		},
		{
			label: "Wallet",
			desc: "Funds & payouts",
			img: "/icons/3d/wallet.png",
			href: `/${orgSlug}/wallet`,
		},
		{
			label: "Enrollments",
			desc: "Review orders",
			img: "/icons/3d/punch-list.png",
			href: `/${orgSlug}/enrollments`,
		},
	];

	return (
		<ContentCard padding="none">
			<div className="grid grid-cols-4">
				{links.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="group flex flex-col items-center gap-2 rounded-xl px-1 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
					>
						<img src={link.img} alt="" className="size-11 object-contain sm:size-12" />
						<div className="text-center">
							<p className="text-label-sm font-semibold text-zinc-900 dark:text-white">{link.label}</p>
							<p className="text-[11px] text-zinc-500 dark:text-zinc-400">{link.desc}</p>
						</div>
					</Link>
				))}
			</div>
		</ContentCard>
	);
}

// =============================================================================
// ACTIVITY FEED
// =============================================================================

const activityIcons: Record<string, { icon: React.ElementType; iconColor: string; bgColor: string }> = {
	campaign: { icon: MegaphoneIcon, iconColor: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-100 dark:bg-violet-900/30" },
	enrollment: { icon: UserGroupIcon, iconColor: "text-sky-600 dark:text-sky-400", bgColor: "bg-sky-100 dark:bg-sky-900/30" },
	invoice: { icon: BanknotesIcon, iconColor: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
	listing: { icon: ShoppingBagIcon, iconColor: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-100 dark:bg-pink-900/30" },
	withdrawal: { icon: WalletIcon, iconColor: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
	organization: { icon: SparklesIcon, iconColor: "text-zinc-600 dark:text-zinc-400", bgColor: "bg-zinc-100 dark:bg-zinc-800" },
};

const ACTION_LABELS: Record<string, string> = {
	campaign_created: "Campaign Created",
	campaign_approved: "Campaign Approved",
	campaign_rejected: "Campaign Rejected",
	campaign_paused: "Campaign Paused",
	campaign_ended: "Campaign Ended",
	campaign_cancelled: "Campaign Cancelled",
	enrollment_created: "New Enrollment",
	enrollment_submitted: "Enrollment Submitted",
	enrollment_approved: "Enrollment Approved",
	enrollment_rejected: "Enrollment Rejected",
	enrollment_expired: "Enrollment Expired",
	enrollment_resubmitted: "Enrollment Resubmitted",
	withdrawal_requested: "Withdrawal Requested",
	withdrawal_completed: "Withdrawal Completed",
	withdrawal_failed: "Withdrawal Failed",
	withdrawal_approved: "Withdrawal Approved",
	invoice_generated: "Invoice Generated",
	organization_created: "Organization Created",
	organization_reinstated: "Organization Reinstated",
	deposit_received: "Deposit Received",
	credit: "Wallet Credited",
};

function formatAction(action: string): string {
	return ACTION_LABELS[action] ?? action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActivityLink(orgSlug: string, entityType: string, entityId: string, action: string): string | null {
	switch (entityType) {
		case "campaign":
			return `/${orgSlug}/campaigns/${entityId}`;
		case "enrollment":
			return `/${orgSlug}/enrollments/${entityId}`;
		case "withdrawal":
			return `/${orgSlug}/wallet/withdrawals`;
		case "invoice":
			return `/${orgSlug}/invoices/${entityId}`;
		case "listing":
			return `/${orgSlug}/listings/${entityId}`;
		case "organization":
			return null;
		default:
			return null;
	}
}

function ActivityFeed({ organizationId, orgSlug }: { organizationId: string; orgSlug: string }) {
	const { data, loading } = useOrganizationActivity(organizationId, { limit: 6 });

	if (loading) {
		return (
			<div className="space-y-1">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
						<div className="size-7 shrink-0 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
						<div className="flex-1 space-y-1.5">
							<div className="h-3.5 w-3/5 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
							<div className="h-3 w-2/5 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
						</div>
					</div>
				))}
			</div>
		);
	}

	const activities = data?.data ?? [];

	if (activities.length === 0) {
		return (
			<div className="flex flex-col items-center rounded-xl bg-zinc-50 px-4 py-6 text-center dark:bg-zinc-800/30">
				<div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
					<ClockIcon className="size-5 text-zinc-300 dark:text-zinc-600" />
				</div>
				<p className="mt-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">No recent activity</p>
				<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Actions will appear here as they happen</p>
			</div>
		);
	}

	return (
		<div className="relative space-y-0.5">
			<div className="pointer-events-none absolute bottom-3 left-[1.375rem] top-3 w-px bg-zinc-200 dark:bg-zinc-800" />
			{activities.map((entry) => {
				const meta = activityIcons[entry.entityType] ?? activityIcons.organization;
				const href = getActivityLink(orgSlug, entry.entityType, entry.entityId, entry.action);
				const inner = (
					<>
						<div className={`relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ring-2 ring-white dark:ring-zinc-900 ${meta.bgColor}`}>
							<meta.icon className={`size-3.5 ${meta.iconColor}`} />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm text-zinc-700 dark:text-zinc-300">
								<span className="font-medium text-zinc-900 dark:text-white">{formatAction(entry.action)}</span>
								{entry.details?.campaignTitle && (
									<span className="text-zinc-600 dark:text-zinc-400"> · {entry.details.campaignTitle}</span>
								)}
							</p>
							<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
								{formatRelativeTime(entry.createdAt)}
								{entry.adminName && (
									<>
										{" "}
										· <span className="text-zinc-600 dark:text-zinc-400">{entry.adminName}</span>
									</>
								)}
							</p>
						</div>
						{href && (
							<ChevronRightIcon className="mt-1 size-4 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
						)}
					</>
				);

				return href ? (
					<Link
						key={entry.id}
						to={href}
						className="group relative flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
					>
						{inner}
					</Link>
				) : (
					<div key={entry.id} className="group relative flex items-start gap-3 rounded-lg px-2 py-2">
						{inner}
					</div>
				);
			})}
		</div>
	);
}

// =============================================================================
// NEW USER WELCOME
// =============================================================================

const STEPS = [
	{
		n: 1,
		title: "Create a Campaign",
		desc: "Pick a listing, set a cashback reward, and publish your first campaign.",
		img: "/icons/3d/influencer.png",
	},
	{
		n: 2,
		title: "Shoppers Enroll",
		desc: "Buyers discover your campaign on Hypedrive and enroll automatically.",
		img: "/icons/3d/punch-list.png",
	},
	{
		n: 3,
		title: "Review & Approve",
		desc: "Verify purchase orders and approve to release cashback rewards.",
		img: "/icons/3d/wallet.png",
	},
] as const;

function NewUserWelcome({ brandName, orgSlug }: { brandName: string; orgSlug: string }) {
	return (
		<div className="space-y-4">
			{/* Hero banner */}
			<div className="relative overflow-hidden rounded-2xl bg-zinc-900 shadow-md ring-1 ring-zinc-800 dark:bg-zinc-800 dark:ring-zinc-700">
				<div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-emerald-500/8 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-16 -left-8 size-48 rounded-full bg-sky-500/6 blur-3xl" />

				<div className="relative p-5 sm:p-6">
					<p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400/80">
						Welcome to Hypedrive
					</p>
					<h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
						Hey {brandName} <span className="inline-block animate-[wave_1.5s_ease-in-out_1]">👋</span>
					</h2>
					<p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/50">
						Create your first campaign, attract shoppers, and grow your brand with cashback rewards.
					</p>
					<div className="mt-5 flex flex-wrap items-center gap-2.5">
						<Button href={`/${orgSlug}/campaigns`} color="white">
							<SparklesIcon className="size-3.5" />
							Create Campaign
						</Button>
						<Button
							href={`/${orgSlug}/listings`}
							outline
							className="border-white/15 text-white/60 hover:border-white/30 hover:text-white"
						>
							View Listings
						</Button>
					</div>
				</div>
			</div>

			{/* How it works */}
			<ContentCard padding="md">
				<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
					How it works
				</p>
				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
					{STEPS.map((step) => (
						<div key={step.n} className="flex items-start gap-3">
							<img src={step.img} alt="" className="mt-0.5 size-10 shrink-0 object-contain drop-shadow-sm" />
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold tabular-nums text-white dark:bg-zinc-700">
										{step.n}
									</span>
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">{step.title}</p>
								</div>
								<p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{step.desc}</p>
							</div>
						</div>
					))}
				</div>
			</ContentCard>

			{/* Quick Actions — same as returning user */}
			<QuickActions orgSlug={orgSlug} />

			{/* Setup progress (if available) */}
		</div>
	);
}

// =============================================================================
// SETUP PROGRESS CHECKLIST
// =============================================================================

function SetupProgressChecklist({ organizationId, orgSlug }: { organizationId: string; orgSlug: string }) {
	const { data, loading, refetch } = useSetupProgress(organizationId);
	const stream = useSetupProgressStream(organizationId);

	const lastUpdate = stream.latestUpdate;
	const lastUpdateRef = useRef(lastUpdate);
	useEffect(() => {
		if (lastUpdate && lastUpdate !== lastUpdateRef.current) {
			lastUpdateRef.current = lastUpdate;
			refetch();
		}
	}, [lastUpdate, refetch]);

	const hasAttemptedStream = useRef(false);
	const { connect: streamConnect, isConnected: streamIsConnected, error: streamError } = stream;
	useEffect(() => {
		if (data && !data.isComplete && !streamIsConnected && !streamError && !hasAttemptedStream.current) {
			hasAttemptedStream.current = true;
			streamConnect();
		}
	}, [data, streamConnect, streamIsConnected, streamError]);

	if (loading || !data || data.isComplete) return null;

	const completedCount = data.completedCount;
	const totalCount = data.totalCount;
	const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	return (
		<div className="rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="p-4 sm:p-5">
				<div className="flex items-center gap-3">
					<div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
						<RocketLaunchIcon className="size-4.5 text-zinc-500 dark:text-zinc-400" />
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center justify-between gap-3">
							<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Complete Your Setup</h3>
							<span className="shrink-0 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
								{progressPct}%
							</span>
						</div>
						<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
							{completedCount} of {totalCount} steps done
						</p>
					</div>
				</div>

				<div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
					<div
						className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
						style={{ width: `${progressPct}%` }}
					/>
				</div>

				<div className="mt-4 space-y-1.5">
					{data.steps.map((step) => (
						<div
							key={step.key}
							className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
								step.completed
									? "bg-emerald-50/60 dark:bg-emerald-950/15"
									: "bg-zinc-50 hover:bg-zinc-100/70 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/60"
							}`}
						>
							<div
								className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
									step.completed ? "bg-emerald-500" : "ring-2 ring-inset ring-zinc-300 dark:ring-zinc-600"
								}`}
							>
								{step.completed && <CheckCircleIcon className="size-5 text-white" />}
							</div>
							<span
								className={`text-sm font-medium ${
									step.completed
										? "text-emerald-700 line-through decoration-emerald-400/50 dark:text-emerald-400"
										: "text-zinc-700 dark:text-zinc-300"
								}`}
							>
								{step.label}
							</span>
							{step.required && !step.completed && (
								<span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
									Required
								</span>
							)}
						</div>
					))}
				</div>

				{!data.requiredComplete && (
					<div className="mt-4">
						<Button href={`/${orgSlug}/settings`} color="dark/zinc">
							Continue Setup
							<ChevronRightIcon className="size-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function DashboardSkeleton() {
	return (
		<div className="space-y-4 animate-in fade-in duration-300 sm:space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1.5">
					<Skeleton width={220} height={26} borderRadius={6} />
					<Skeleton width={160} height={14} borderRadius={6} />
				</div>
				<Skeleton width={130} height={36} borderRadius={8} />
			</div>

			{/* Wallet hero skeleton */}
			<div className="rounded-xl bg-zinc-900 p-4 sm:p-5 dark:bg-zinc-800">
				<div className="space-y-1">
					<div className="h-3 w-20 rounded bg-white/10" />
					<div className="h-8 w-40 rounded bg-white/10" />
				</div>
				<div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="space-y-1">
							<div className="h-3 w-14 rounded bg-white/10" />
							<div className="h-4 w-20 rounded bg-white/10" />
						</div>
					))}
				</div>
			</div>

			{/* Quick actions skeleton */}
			<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} width="100%" height={56} borderRadius={12} />
				))}
			</div>

			{/* Main grid skeleton */}
			<div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
				<Skeleton width="100%" height={240} borderRadius={12} />
				<Skeleton width="100%" height={240} borderRadius={12} />
			</div>

			{/* Bottom grid skeleton */}
			<div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
				<Skeleton width="100%" height={260} borderRadius={12} />
				<Skeleton width="100%" height={260} borderRadius={12} />
			</div>
		</div>
	);
}

// =============================================================================
// MAIN DASHBOARD
// =============================================================================

export function Dashboard() {
	const { organization, organizationId, orgSlug } = useOrgContext();

	const { data: dashboardData, loading, error, refetch } = useDashboard(organizationId);

	const brandName = organization?.name || "there";
	const stats = dashboardData?.stats;
	const isNewUser = !loading && !error && stats && stats.totalEnrollments === 0;

	const formattedDate = useMemo(() => {
		return new Date().toLocaleDateString("en-IN", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}, []);

	if (loading) return <DashboardSkeleton />;
	if (error || !dashboardData || !stats)
		return (
			<ErrorState
				message="We couldn't load your dashboard. Please check your connection and try again."
				onRetry={refetch}
			/>
		);

	return (
		<div className="min-w-0 space-y-4 sm:space-y-5">
			{/* Header */}
			<PageHeader
				title={`${getGreeting()}, ${brandName}`}
				description={isNewUser ? "Welcome to your dashboard" : formattedDate}
				actions={
					!isNewUser ? (
						<IconButton color="zinc" href={`/${orgSlug}/campaigns`}>
							<SparklesIcon className="size-5" />
						</IconButton>
					) : undefined
				}
			/>

			{/* Setup progress checklist */}
			{organizationId && <SetupProgressChecklist organizationId={organizationId} orgSlug={orgSlug} />}

			{isNewUser ? (
				<NewUserWelcome brandName={brandName} orgSlug={orgSlug} />
			) : (
				<>
					{/* Alert Bar */}
					<DashboardAlertBar
						walletBalance={stats.walletBalance}
						lowBalanceThreshold={stats.lowBalanceThreshold}
						avgDailySpend={stats.avgDailySpend}
						overdueEnrollments={stats.overdueEnrollments}
						orgSlug={orgSlug}
					/>

					{/* Wallet + Quick Actions */}
					<ErrorBoundary title="Failed to load wallet" compact>
						<WalletHero stats={stats} orgSlug={orgSlug} />
					</ErrorBoundary>
					<QuickActions orgSlug={orgSlug} />

					{/* Stats — Campaigns + Enrollments */}
					<div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
						<ErrorBoundary title="Failed to load campaign stats" compact>
							<CampaignPulse stats={stats} orgSlug={orgSlug} />
						</ErrorBoundary>
						<ErrorBoundary title="Failed to load enrollment stats" compact>
							<EnrollmentStats stats={stats} orgSlug={orgSlug} />
						</ErrorBoundary>
					</div>

					{/* Pending Reviews + Top Campaigns */}
					<div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
						<ErrorBoundary title="Failed to load pending reviews" compact>
							<PendingReviewsSection
								items={dashboardData.pendingEnrollments}
								totalPending={stats.pendingEnrollments}
								orgSlug={orgSlug}
							/>
						</ErrorBoundary>
						<ErrorBoundary title="Failed to load top campaigns" compact>
							<TopCampaignsSection campaigns={dashboardData.topCampaigns} orgSlug={orgSlug} />
						</ErrorBoundary>
					</div>

					{/* Enrollment Trend Chart */}
					{dashboardData.enrollmentChart && dashboardData.enrollmentChart.length > 1 && (
						<ErrorBoundary title="Failed to load chart" compact>
							<EnrollmentTrendChart chartData={dashboardData.enrollmentChart} orgSlug={orgSlug} />
						</ErrorBoundary>
					)}

					{/* Activity Feed */}
					{organizationId && (
						<ErrorBoundary title="Failed to load activity" compact>
							<ContentCard padding="none" className="overflow-hidden">
								<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
									<SectionHeader title="Recent Activity" icon={ClockIcon} iconColor="sky" />
								</div>
								<div className="px-3.5 py-3 sm:px-4">
									<ActivityFeed organizationId={organizationId} orgSlug={orgSlug} />
								</div>
							</ContentCard>
						</ErrorBoundary>
					)}
				</>
			)}
		</div>
	);
}
