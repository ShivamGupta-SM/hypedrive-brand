import {
	ArrowPathIcon,
	BanknotesIcon,
	CheckCircleIcon,
	ChevronRightIcon,
	ClockIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	MegaphoneIcon,
	RocketLaunchIcon,
	ShoppingBagIcon,
	SparklesIcon,
	UserGroupIcon,
	WalletIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/button";
import { chartColors, DonutChart } from "@/components/charts";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Card, StatCard } from "@/components/shared/card";
import { Skeleton } from "@/components/skeleton";
import {
	useCurrentOrganization,
	useDashboard,
	useOrganizationActivity,
	useSetupProgress,
	useSetupProgressStream,
} from "@/hooks";
import { useOrgSlug } from "@/hooks/use-org-slug";
import { formatCurrency, formatDateTime } from "@/lib/design-tokens";

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
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
			<div className="flex size-20 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-950/30">
				<ExclamationTriangleIcon className="size-10 text-red-500 dark:text-red-400" />
			</div>
			<h2 className="mt-6 text-xl font-semibold text-zinc-900 dark:text-white">
				Something went wrong
			</h2>
			<p className="mx-auto mt-2 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
				We couldn't load your dashboard. Please check your connection and try again.
			</p>
			<Button className="mt-8" onClick={onRetry} color="dark/zinc">
				<ArrowPathIcon className="size-4" />
				Try Again
			</Button>
		</div>
	);
}

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({
	title,
	viewAllHref,
	viewAllLabel = "View all",
	children,
}: {
	title: string;
	viewAllHref?: string;
	viewAllLabel?: string;
	children?: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4">
			<h2 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h2>
			<div className="flex items-center gap-3">
				{children}
				{viewAllHref && (
					<Link
						href={viewAllHref}
						className="flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
					>
						{viewAllLabel}
						<ChevronRightIcon className="size-4" />
					</Link>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// ALERT BAR — Proactive warnings for low wallet balance / overdue enrollments
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
	const runwayDays =
		avgDailySpend > 0 ? Math.floor(walletBalance / avgDailySpend) : 0;
	const hasOverdue = overdueEnrollments > 0;

	if (!isLowBalance && !hasOverdue) return null;

	return (
		<div className="space-y-2">
			{isLowBalance && (
				<div className="flex items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-inset ring-amber-200/60 dark:bg-amber-950/20 dark:ring-amber-800/40">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
						<WalletIcon className="size-4" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium text-amber-900 dark:text-amber-200">
							Low wallet balance
						</p>
						<p className="text-xs text-amber-700/80 dark:text-amber-300/70">
							{runwayDays > 0
								? `~${runwayDays} days of runway remaining`
								: "Add funds to continue running campaigns"}
						</p>
					</div>
					<Link
						href={`/${orgSlug}/wallet`}
						className="shrink-0 text-xs font-medium text-amber-700 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-100"
					>
						Add Funds
					</Link>
				</div>
			)}
			{hasOverdue && (
				<div className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-inset ring-red-200/60 dark:bg-red-950/20 dark:ring-red-800/40">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500 text-white">
						<ExclamationCircleIcon className="size-4" />
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium text-red-900 dark:text-red-200">
							{overdueEnrollments} overdue enrollment{overdueEnrollments !== 1 ? "s" : ""}
						</p>
						<p className="text-xs text-red-700/80 dark:text-red-300/70">
							Enrollments pending review for more than 48 hours
						</p>
					</div>
					<Link
						href={`/${orgSlug}/enrollments`}
						className="shrink-0 text-xs font-medium text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
					>
						Review Now
					</Link>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// ENROLLMENT TRACKER — Horizontal colored bar showing status distribution
// =============================================================================

function EnrollmentTracker({
	approved,
	pending,
	rejected,
}: {
	approved: number;
	pending: number;
	rejected: number;
}) {
	const total = approved + pending + rejected;
	if (total === 0) return null;

	const segments = [
		{ count: approved, color: "bg-emerald-500", label: "Approved" },
		{ count: pending, color: "bg-amber-400", label: "Pending" },
		{ count: rejected, color: "bg-red-500", label: "Rejected" },
	].filter((s) => s.count > 0);

	return (
		<div className="space-y-2">
			{/* Bar */}
			<div className="flex h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
				{segments.map((seg) => (
					<div
						key={seg.label}
						className={`${seg.color} transition-all duration-500`}
						style={{ width: `${(seg.count / total) * 100}%` }}
					/>
				))}
			</div>
			{/* Legend */}
			<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
				{segments.map((seg) => (
					<div key={seg.label} className="flex items-center gap-1.5">
						<div className={`size-2 rounded-full ${seg.color}`} />
						<span className="text-xs text-zinc-500 dark:text-zinc-400">
							{seg.label}{" "}
							<span className="font-medium text-zinc-700 dark:text-zinc-300">
								{seg.count}
							</span>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// PRIORITY REVIEW QUEUE — Pending enrollments needing attention
// =============================================================================

function PriorityQueue({
	pendingEnrollments,
	orgSlug,
}: {
	pendingEnrollments: number;
	orgSlug: string;
}) {
	if (pendingEnrollments === 0) return null;

	return (
		<Card padding="md">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/30">
						<ClockIcon className="size-5 text-amber-600 dark:text-amber-400" />
					</div>
					<div>
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
							Pending Reviews
						</h3>
						<p className="text-xs text-zinc-500 dark:text-zinc-400">
							{pendingEnrollments} enrollment{pendingEnrollments !== 1 ? "s" : ""} awaiting your review
						</p>
					</div>
				</div>
				<Link
					href={`/${orgSlug}/enrollments`}
					className="flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
				>
					Review All
					<ChevronRightIcon className="size-4" />
				</Link>
			</div>
		</Card>
	);
}

// =============================================================================
// QUICK LINKS SECTION
// =============================================================================

function QuickLinksSection() {
	const orgSlug = useOrgSlug();
	const links = [
		{
			label: "View Enrollments",
			href: `/${orgSlug}/enrollments`,
			icon: UserGroupIcon,
			color: "amber" as const,
		},
		{
			label: "View Campaigns",
			href: `/${orgSlug}/campaigns`,
			icon: MegaphoneIcon,
			color: "sky" as const,
		},
	];

	return (
		<section className="space-y-4">
			<SectionHeader title="Quick Links" />
			<div className="space-y-2 sm:space-y-3">
				{links.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="group flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/80 transition-all hover:shadow-md hover:ring-zinc-300 sm:gap-4 sm:p-4 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
					>
						<div
							className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
								link.color === "amber"
									? "bg-amber-100 dark:bg-amber-950/30"
									: "bg-sky-100 dark:bg-sky-950/30"
							} sm:size-12`}
						>
							<link.icon
								className={`size-5 sm:size-6 ${
									link.color === "amber"
										? "text-amber-600 dark:text-amber-400"
										: "text-sky-600 dark:text-sky-400"
								}`}
							/>
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium text-zinc-900 dark:text-white">{link.label}</p>
						</div>
						<ChevronRightIcon className="size-5 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
					</Link>
				))}
			</div>
		</section>
	);
}

// =============================================================================
// NEW USER WELCOME
// =============================================================================

const STEPS = [
	{
		n: 1,
		title: "Create a Campaign",
		desc: "Pick a listing, set a cashback reward, and publish.",
		icon: MegaphoneIcon,
		iconBg: "bg-sky-100 dark:bg-sky-950/40",
		iconColor: "text-sky-600 dark:text-sky-400",
		numBg: "bg-sky-600",
	},
	{
		n: 2,
		title: "Shoppers Enroll",
		desc: "Buyers discover your campaign and join automatically.",
		icon: UserGroupIcon,
		iconBg: "bg-amber-100 dark:bg-amber-950/40",
		iconColor: "text-amber-600 dark:text-amber-400",
		numBg: "bg-amber-500",
	},
	{
		n: 3,
		title: "Review & Approve",
		desc: "Verify orders and approve to release cashback.",
		icon: CheckCircleIcon,
		iconBg: "bg-emerald-100 dark:bg-emerald-950/40",
		iconColor: "text-emerald-600 dark:text-emerald-400",
		numBg: "bg-emerald-600",
	},
] as const;

function NewUserWelcome({ brandName, orgSlug }: { brandName: string; orgSlug: string }) {
	return (
		<div className="space-y-4">
			{/* Hero banner — compact, two-column on sm+ */}
			<div className="relative overflow-hidden rounded-2xl bg-zinc-900 dark:bg-zinc-800">
				{/* Subtle orbs */}
				<div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-emerald-500/10 blur-3xl" />
				<div className="pointer-events-none absolute -bottom-10 left-0 size-40 rounded-full bg-sky-500/8 blur-2xl" />

				<div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
					{/* Left: icon + copy */}
					<div className="flex items-start gap-4">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-white/10">
							<RocketLaunchIcon className="size-5 text-emerald-400" />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80">
								Welcome aboard
							</p>
							<h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
								Hey {brandName} 👋
							</h2>
							<p className="mt-1 text-sm leading-relaxed text-white/60">
								You're all set. Create your first campaign to start getting enrollments.
							</p>
						</div>
					</div>

					{/* Right: CTA */}
					<div className="flex shrink-0 items-center gap-2 pl-15 sm:pl-0">
						<Button href={`/${orgSlug}/campaigns`} color="white">
							<SparklesIcon className="size-3.5" />
							Create Campaign
						</Button>
						<Button href={`/${orgSlug}/listings`} outline className="border-white/20 text-white/70 hover:border-white/40 hover:text-white">
							View Listings
						</Button>
					</div>
				</div>
			</div>

			{/* How it works — compact 3-step row */}
			<div className="rounded-xl bg-white ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
					<p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">How it works</p>
				</div>
				<div className="grid grid-cols-1 divide-y divide-zinc-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-zinc-800">
					{STEPS.map((step) => (
						<div key={step.n} className="flex items-start gap-3 p-4">
							{/* Number badge */}
							<div className={`flex size-6 shrink-0 items-center justify-center rounded-full ${step.numBg} mt-0.5`}>
								<span className="text-[10px] font-bold text-white">{step.n}</span>
							</div>
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<step.icon className={`size-3.5 shrink-0 ${step.iconColor}`} />
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">{step.title}</p>
								</div>
								<p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{step.desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Quick links */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{[
					{ label: "Campaigns", desc: "Create & manage", href: `/${orgSlug}/campaigns`, icon: MegaphoneIcon, color: "text-sky-500" },
					{ label: "Listings", desc: "Your product catalog", href: `/${orgSlug}/listings`, icon: ShoppingBagIcon, color: "text-violet-500" },
					{ label: "Wallet", desc: "Add funds", href: `/${orgSlug}/wallet`, icon: WalletIcon, color: "text-emerald-500" },
				].map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className="group flex items-center gap-3 rounded-xl bg-white p-3.5 ring-1 ring-zinc-200/80 transition-all hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
					>
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
							<link.icon className={`size-4 ${link.color}`} />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{link.label}</p>
							<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{link.desc}</p>
						</div>
						<ChevronRightIcon className="size-4 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
					</Link>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// SETUP PROGRESS CHECKLIST
// =============================================================================

function SetupProgressChecklist({
	organizationId,
	orgSlug,
}: {
	organizationId: string;
	orgSlug: string;
}) {
	const { data, loading, refetch } = useSetupProgress(organizationId);
	const stream = useSetupProgressStream(organizationId);

	// Auto-refresh when stream sends an update
	const lastUpdate = stream.latestUpdate;
	const lastUpdateRef = useRef(lastUpdate);
	useEffect(() => {
		if (lastUpdate && lastUpdate !== lastUpdateRef.current) {
			lastUpdateRef.current = lastUpdate;
			refetch();
		}
	}, [lastUpdate, refetch]);

	// Connect stream when component mounts (for orgs still in setup)
	// Only attempt once — don't retry if stream errored (prevents infinite WebSocket loop)
	const hasAttemptedStream = useRef(false);
	const { connect: streamConnect, isConnected: streamIsConnected, error: streamError } = stream;
	useEffect(() => {
		if (
			data &&
			!data.isComplete &&
			!streamIsConnected &&
			!streamError &&
			!hasAttemptedStream.current
		) {
			hasAttemptedStream.current = true;
			streamConnect();
		}
	}, [data, streamConnect, streamIsConnected, streamError]);

	if (loading || !data || data.isComplete) return null;

	const completedCount = data.completedCount;
	const totalCount = data.totalCount;
	const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	return (
		<div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:p-6 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h3 className="font-semibold text-zinc-900 dark:text-white">Complete Your Setup</h3>
					<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
						{completedCount} of {totalCount} steps done
					</p>
				</div>
				<div className="text-right">
					<span className="text-2xl font-bold text-zinc-900 dark:text-white">{progressPct}%</span>
				</div>
			</div>

			{/* Progress bar */}
			<div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
				<div
					className="h-full rounded-full bg-emerald-500 transition-all duration-500"
					style={{ width: `${progressPct}%` }}
				/>
			</div>

			{/* Steps */}
			<div className="mt-4 space-y-2">
				{data.steps.map((step) => (
					<div
						key={step.key}
						className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
							step.completed
								? "bg-emerald-50/50 dark:bg-emerald-950/20"
								: "bg-zinc-50 dark:bg-zinc-800/50"
						}`}
					>
						<CheckCircleIcon
							className={`size-5 shrink-0 ${
								step.completed
									? "text-emerald-500 dark:text-emerald-400"
									: "text-zinc-300 dark:text-zinc-600"
							}`}
						/>
						<span
							className={`text-sm font-medium ${
								step.completed
									? "text-emerald-700 line-through dark:text-emerald-400"
									: "text-zinc-700 dark:text-zinc-300"
							}`}
						>
							{step.label}
						</span>
						{step.required && !step.completed && (
							<span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
								Required
							</span>
						)}
					</div>
				))}
			</div>

			{/* CTA if required steps incomplete */}
			{!data.requiredComplete && (
				<div className="mt-4">
					<Button href={`/${orgSlug}/settings`} outline>
						Continue Setup
						<ChevronRightIcon className="size-4" />
					</Button>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// ACTIVITY FEED
// =============================================================================

const activityIcons: Record<string, { icon: React.ElementType; color: string }> = {
	campaign: { icon: MegaphoneIcon, color: "text-sky-500" },
	enrollment: { icon: UserGroupIcon, color: "text-amber-500" },
	invoice: { icon: BanknotesIcon, color: "text-emerald-500" },
	listing: { icon: ShoppingBagIcon, color: "text-violet-500" },
	withdrawal: { icon: BanknotesIcon, color: "text-red-500" },
	organization: { icon: SparklesIcon, color: "text-zinc-500" },
};

function formatAction(action: string): string {
	return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function ActivityFeed({ organizationId }: { organizationId: string }) {
	const { data, loading } = useOrganizationActivity(organizationId, { limit: 8 });

	if (loading) {
		return (
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex gap-3">
						<div className="size-8 shrink-0 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
						<div className="flex-1 space-y-1.5">
							<div className="h-3.5 w-3/4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
							<div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
						</div>
					</div>
				))}
			</div>
		);
	}

	const activities = data?.data ?? [];

	if (activities.length === 0) {
		return (
			<div className="flex flex-col items-center rounded-xl bg-zinc-50 p-6 text-center dark:bg-zinc-800/50">
				<ClockIcon className="size-8 text-zinc-300 dark:text-zinc-600" />
				<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No recent activity</p>
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{activities.map((entry) => {
				const meta = activityIcons[entry.entityType] ?? activityIcons.organization;
				return (
					<div
						key={entry.id}
						className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
					>
						<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
							<meta.icon className={`size-3.5 ${meta.color}`} />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-sm text-zinc-700 dark:text-zinc-300">
								<span className="font-medium text-zinc-900 dark:text-white">
									{formatAction(entry.action)}
								</span>
								{entry.details?.campaignTitle && (
									<span className="text-zinc-500"> · {entry.details.campaignTitle}</span>
								)}
							</p>
							<p className="text-xs text-zinc-400 dark:text-zinc-500">
								{formatDateTime(entry.createdAt)}
								{entry.adminName && ` · by ${entry.adminName}`}
							</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function DashboardSkeleton() {
	return (
		<div className="space-y-5 animate-in fade-in duration-300">
			{/* Header */}
			<div className="space-y-1">
				<Skeleton width={240} height={28} borderRadius={6} />
				<Skeleton width={180} height={16} borderRadius={6} />
			</div>

			{/* Stats Row skeleton */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} width="100%" height={72} borderRadius={12} />
				))}
			</div>

			{/* Charts */}
			<div className="grid gap-4 lg:grid-cols-3">
				<Skeleton width="100%" height={280} borderRadius={12} className="lg:col-span-2" />
				<Skeleton width="100%" height={280} borderRadius={12} />
			</div>

			{/* Lists */}
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="space-y-3">
					<Skeleton width={140} height={18} />
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} width="100%" height={64} borderRadius={12} />
					))}
				</div>
				<div className="space-y-3">
					<Skeleton width={120} height={18} />
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} width="100%" height={64} borderRadius={12} />
					))}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// MAIN DASHBOARD
// =============================================================================

export function Dashboard() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgSlug = useOrgSlug();

	const { data: dashboardData, loading, error, refetch } = useDashboard(organizationId);

	const brandName = organization?.name || "there";
	const stats = dashboardData?.stats;
	const isNewUser = !loading && !error && stats && stats.totalEnrollments === 0;

	// Derive enrollment distribution from stats (safe to call before early returns)
	const enrollmentDistribution = useMemo(() => {
		if (!stats) return { approved: 0, pending: 0, rejected: 0 };
		return {
			approved: stats.approvedEnrollments,
			pending: stats.pendingEnrollments,
			rejected: Math.max(0, stats.totalEnrollments - stats.approvedEnrollments - stats.pendingEnrollments),
		};
	}, [stats]);

	const approvalRate = useMemo(() => {
		if (!stats || stats.totalEnrollments === 0) return 0;
		return Math.round((stats.approvedEnrollments / stats.totalEnrollments) * 100);
	}, [stats]);

	// Formatted date for subtitle
	const formattedDate = useMemo(() => {
		return new Date().toLocaleDateString("en-IN", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}, []);

	if (loading) return <DashboardSkeleton />;
	if (error || !dashboardData || !stats) return <ErrorState onRetry={refetch} />;

	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<Heading>
						{getGreeting()}, {brandName}
					</Heading>
					<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
						{isNewUser ? "Welcome to your dashboard" : formattedDate}
					</p>
				</div>
				{!isNewUser && (
					<div className="flex shrink-0 items-center gap-2">
						<Button href={`/${orgSlug}/campaigns`} color="dark/zinc">
							<SparklesIcon className="size-4" />
							<span className="hidden sm:inline">New Campaign</span>
						</Button>
					</div>
				)}
			</div>

			{/* Setup progress checklist for incomplete onboarding */}
			{organizationId && (
				<SetupProgressChecklist organizationId={organizationId} orgSlug={orgSlug} />
			)}

			{isNewUser ? (
				<NewUserWelcome brandName={brandName} orgSlug={orgSlug} />
			) : (
				<>
					{/* Alert Bar — Low balance / Overdue warnings */}
					<DashboardAlertBar
						walletBalance={stats.walletBalance}
						lowBalanceThreshold={50000}
						avgDailySpend={stats.totalEnrollments > 0 ? stats.walletBalance / 30 : 0}
						overdueEnrollments={0}
						orgSlug={orgSlug}
					/>

					{/* Stats Cards — 2x2 on mobile, 4-col on desktop */}
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
						<StatCard
							icon={<BanknotesIcon className="size-5" />}
							label="Wallet Balance"
							value={formatCurrency(stats.walletBalance)}
							variant="primary"
							size="sm"
							href={`/${orgSlug}/wallet`}
							action={{ label: "View wallet", href: `/${orgSlug}/wallet` }}
							className="col-span-2 sm:col-span-1"
						/>
						<StatCard
							icon={<UserGroupIcon className="size-5" />}
							label="Total Enrollments"
							value={stats.totalEnrollments}
							variant="default"
							size="sm"
							href={`/${orgSlug}/enrollments`}
						/>
						<StatCard
							icon={<MegaphoneIcon className="size-5" />}
							label="Active Campaigns"
							value={stats.activeCampaigns}
							sublabel={`of ${stats.totalCampaigns} total`}
							variant="info"
							size="sm"
							href={`/${orgSlug}/campaigns`}
						/>
						<StatCard
							icon={<CheckCircleIcon className="size-5" />}
							label="Approved"
							value={stats.approvedEnrollments}
							sublabel={`${approvalRate}% rate`}
							variant="success"
							size="sm"
							href={`/${orgSlug}/enrollments`}
						/>
					</div>

					{/* Main Grid — Enrollment trend + Distribution */}
					<div className="grid gap-4 lg:grid-cols-12">
						{/* Enrollment Distribution with Tracker */}
						<Card padding="md" className="lg:col-span-8">
							<SectionHeader
								title="Enrollment Overview"
								viewAllHref={`/${orgSlug}/enrollments`}
							/>
							<div className="mt-4">
								<EnrollmentTracker
									approved={enrollmentDistribution.approved}
									pending={enrollmentDistribution.pending}
									rejected={enrollmentDistribution.rejected}
								/>
							</div>
							<div className="mt-5">
								<DonutChart
									data={[
										{
											name: "Approved",
											value: enrollmentDistribution.approved,
											color: chartColors.success,
										},
										{
											name: "Pending",
											value: enrollmentDistribution.pending,
											color: chartColors.warning,
										},
										{
											name: "Other",
											value: enrollmentDistribution.rejected,
											color: chartColors.danger,
										},
									]}
									height={220}
									thickness={24}
									outerRadius={70}
								/>
							</div>
						</Card>

						{/* Quick Links + Campaign Summary */}
						<div className="space-y-4 lg:col-span-4">
							<QuickLinksSection />
						</div>
					</div>

					{/* Priority Queue */}
					<PriorityQueue
						pendingEnrollments={stats.pendingEnrollments}
						orgSlug={orgSlug}
					/>

					{/* Activity Feed */}
					{organizationId && (
						<Card padding="md">
							<SectionHeader title="Recent Activity" />
							<div className="mt-3">
								<ActivityFeed organizationId={organizationId} />
							</div>
						</Card>
					)}
				</>
			)}
		</div>
	);
}
