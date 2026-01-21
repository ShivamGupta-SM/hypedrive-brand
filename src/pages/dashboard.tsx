import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { ReactSelect, type SelectOption } from "@/components/react-select";
import {
  Skeleton,
  StatCardSkeleton,
  ListItemSkeleton,
} from "@/components/skeleton";
import { Text } from "@/components/text";
import { StatCard, CardGrid, Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { AreaChart, DonutChart, chartColors } from "@/components/charts";
import { useDashboard, useCurrentOrganization } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/design-tokens";
import type { organizations } from "@/lib/brand-client";
import { useState } from "react";
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  RocketLaunchIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UserGroupIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

type PendingEnrollment = organizations.PendingEnrollmentItem;
type TopCampaign = organizations.TopCampaign;

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
      <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950/50 dark:to-red-950/30">
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
// HERO WALLET CARD - Gradient design with decorative elements
// =============================================================================

function HeroWalletCard({
  walletBalance,
  heldAmount,
  totalEnrollments,
}: {
  walletBalance: string;
  heldAmount: string;
  totalEnrollments: number;
}) {
  const hasBalance = parseFloat(walletBalance) > 0;
  const hasHeld = parseFloat(heldAmount) > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-5 shadow-lg shadow-emerald-500/20 sm:p-6 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-600 dark:shadow-emerald-900/30">
      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-black/5 blur-2xl" />
      <div className="absolute right-4 top-4 opacity-20 sm:right-6 sm:top-6">
        <CurrencyRupeeIcon className="size-16 sm:size-20" />
      </div>

      <div className="relative">
        {/* Label */}
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
            <BanknotesIcon className="size-4 text-white" />
          </div>
          <span className="text-sm font-medium text-white/80">Wallet Balance</span>
        </div>

        {/* Balance */}
        <p className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {formatCurrency(walletBalance)}
        </p>

        {/* Quick stats */}
        <div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-6">
          {hasHeld && (
            <div className="flex items-center gap-2">
              <ClockIcon className="size-4 text-amber-300" />
              <span className="text-sm text-white/70">On Hold:</span>
              <span className="font-semibold text-white">{formatCurrency(heldAmount)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <UserGroupIcon className="size-4 text-white/60" />
            <span className="text-sm text-white/70">Enrollments:</span>
            <span className="font-semibold text-white">{totalEnrollments.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Action */}
        {hasBalance && (
          <div className="mt-5 sm:mt-6">
            <Button
              href="/wallet"
              className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
            >
              <ArrowTrendingUpIcon className="size-4" />
              View Wallet Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// QUICK STATS GRID - Colorful stat cards
// =============================================================================

function QuickStatsGrid({
  approved,
  pending,
  rejected,
}: {
  approved: number;
  pending: number;
  rejected: number;
}) {
  const stats = [
    {
      label: "Approved",
      value: approved,
      icon: CheckCircleIcon,
      gradient: "from-emerald-500 to-green-500",
      bgLight: "bg-emerald-50",
      bgDark: "dark:bg-emerald-950/30",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Pending",
      value: pending,
      icon: ClockIcon,
      gradient: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50",
      bgDark: "dark:bg-amber-950/30",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircleIcon,
      gradient: "from-red-500 to-rose-500",
      bgLight: "bg-red-50",
      bgDark: "dark:bg-red-950/30",
      textColor: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-xl ${stat.bgLight} ${stat.bgDark} p-3 sm:p-4`}
        >
          {/* Decorative gradient */}
          <div className={`absolute -right-4 -top-4 size-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`} />

          <div className="relative">
            <stat.icon className={`size-5 ${stat.textColor}`} />
            <p className={`mt-2 text-xl font-bold sm:text-2xl ${stat.textColor}`}>
              {stat.value.toLocaleString("en-IN")}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
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
      <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
        {title}
      </h2>
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
// PENDING ENROLLMENT CARD
// =============================================================================

function PendingEnrollmentCard({ enrollment }: { enrollment: PendingEnrollment }) {
  return (
    <Link
      href={`/enrollments/${enrollment.id}`}
      className="group flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/80 transition-all hover:shadow-md hover:ring-zinc-300 sm:gap-4 sm:p-4 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
    >
      {/* Status icon */}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 sm:size-12 dark:from-amber-900/30 dark:to-amber-950/20">
        <ClockIcon className="size-5 text-amber-600 sm:size-6 dark:text-amber-400" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-zinc-900 dark:text-white">
          {enrollment.campaign.title}
        </p>
        <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
          {enrollment.shopper.name}
        </p>
      </div>

      {/* Value and date */}
      <div className="shrink-0 text-right">
        <p className="font-semibold tabular-nums text-zinc-900 dark:text-white">
          {formatCurrency(enrollment.orderValueDecimal)}
        </p>
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
          {new Date(enrollment.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
        </p>
      </div>

      {/* Chevron */}
      <ChevronRightIcon className="size-5 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
    </Link>
  );
}

// =============================================================================
// PENDING ENROLLMENTS SECTION
// =============================================================================

function PendingEnrollmentsSection({ enrollments }: { enrollments: PendingEnrollment[] }) {
  if (enrollments.length === 0) {
    return (
      <section className="space-y-4">
        <SectionHeader title="Pending Enrollments" />
        <EmptyState
          preset="enrollments"
          title="No pending enrollments"
          description="All enrollments have been reviewed. New enrollments will appear here."
          action={{ label: "View All Enrollments", href: "/enrollments" }}
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeader title="Pending Enrollments" viewAllHref="/enrollments?status=pending" />
      <div className="space-y-2 sm:space-y-3">
        {enrollments.slice(0, 5).map((enrollment) => (
          <PendingEnrollmentCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// TOP CAMPAIGN CARD
// =============================================================================

function TopCampaignCard({ campaign, rank }: { campaign: TopCampaign; rank: number }) {
  const statusConfig = {
    active: { color: "lime" as const, label: "Active" },
    ending: { color: "amber" as const, label: "Ending Soon" },
    paused: { color: "zinc" as const, label: "Paused" },
  };
  const config = statusConfig[campaign.status];

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200/80 transition-all hover:shadow-md hover:ring-zinc-300 sm:gap-4 sm:p-4 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
    >
      {/* Rank badge */}
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        #{rank}
      </div>

      {/* Campaign image/icon */}
      {campaign.productImage ? (
        <Avatar src={campaign.productImage} className="size-10 shrink-0 sm:size-12" />
      ) : (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 sm:size-12 dark:from-indigo-900/30 dark:to-indigo-950/20">
          <MegaphoneIcon className="size-5 text-indigo-600 sm:size-6 dark:text-indigo-400" />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-zinc-900 dark:text-white">
            {campaign.name}
          </p>
          <Badge color={config.color} className="shrink-0">{config.label}</Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span>{campaign.enrollments} enrollments</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">{campaign.approvalRate}% approval</span>
        </div>
      </div>

      {/* Days left */}
      {campaign.daysLeft > 0 && (
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {campaign.daysLeft}d left
          </p>
        </div>
      )}

      {/* Chevron */}
      <ChevronRightIcon className="size-5 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-400" />
    </Link>
  );
}

// =============================================================================
// TOP CAMPAIGNS SECTION
// =============================================================================

function TopCampaignsSection({ campaigns }: { campaigns: TopCampaign[] }) {
  if (campaigns.length === 0) {
    return (
      <section className="space-y-4">
        <SectionHeader title="Top Campaigns" />
        <EmptyState
          preset="campaigns"
          title="No campaigns yet"
          description="Create your first campaign to start driving sales."
          action={{ label: "Create Campaign", href: "/campaigns/create" }}
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeader title="Top Campaigns" viewAllHref="/campaigns" />
      <div className="space-y-2 sm:space-y-3">
        {campaigns.slice(0, 5).map((campaign, index) => (
          <TopCampaignCard key={campaign.id} campaign={campaign} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// NEW USER WELCOME
// =============================================================================

function NewUserWelcome({ brandName }: { brandName: string }) {
  return (
    <div className="space-y-6">
      {/* Welcome hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-6 text-white sm:p-8">
        <div className="absolute -right-12 -top-12 size-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 size-48 rounded-full bg-black/10 blur-3xl" />

        <div className="relative">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm sm:size-16">
            <RocketLaunchIcon className="size-7 sm:size-8" />
          </div>

          <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
            Welcome to Hypedrive, {brandName}!
          </h2>
          <p className="mt-2 max-w-lg text-white/80">
            Start your influencer marketing journey by creating your first campaign.
            Connect with shoppers and grow your brand.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/campaigns/create" className="bg-white text-indigo-600 hover:bg-white/90">
              <SparklesIcon className="size-4" />
              Create Your First Campaign
            </Button>
            <Button href="/help" className="bg-white/20 backdrop-blur-sm hover:bg-white/30">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Quick start tips */}
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:p-6 dark:bg-zinc-900 dark:ring-zinc-800">
        <h3 className="font-semibold text-zinc-900 dark:text-white">Quick Start Guide</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { step: 1, title: "Create Campaign", desc: "Set up your product and reward" },
            { step: 2, title: "Get Enrollments", desc: "Shoppers will discover you" },
            { step: 3, title: "Track & Earn", desc: "Review and approve orders" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                {item.step}
              </div>
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PERIOD OPTIONS
// =============================================================================

const periodOptions: SelectOption[] = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

// =============================================================================
// LOADING SKELETON
// =============================================================================

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton width={280} height={36} borderRadius={8} />
        <Skeleton width={200} height={18} borderRadius={8} />
      </div>

      {/* Hero wallet card skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-600/20 to-teal-500/20 p-5 sm:p-6 dark:from-emerald-800/20 dark:to-teal-700/20">
        <Skeleton width={120} height={20} />
        <Skeleton width={200} height={48} className="mt-3" />
        <div className="mt-5 flex gap-6">
          <Skeleton width={100} height={20} />
          <Skeleton width={120} height={20} />
        </div>
      </div>

      {/* Quick stats skeleton */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-zinc-100/50 p-3 sm:p-4 dark:bg-zinc-800/50">
            <Skeleton width={20} height={20} />
            <Skeleton width={60} height={28} className="mt-2" />
            <Skeleton width={50} height={14} className="mt-1" />
          </div>
        ))}
      </div>

      {/* Performance section */}
      <div className="flex items-center justify-between">
        <Skeleton width={100} height={20} />
        <Skeleton width={140} height={38} borderRadius={8} />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton width={160} height={20} />
          {[1, 2, 3].map((i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton width={140} height={20} />
          {[1, 2, 3].map((i) => (
            <ListItemSkeleton key={i} />
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
  const [selectedPeriod, setSelectedPeriod] = useState<SelectOption>(periodOptions[0]);

  const { data, loading, error, refetch } = useDashboard(organizationId);

  // Get organization name for greeting
  const brandName = organization?.name || "there";
  const isNewUser = !loading && !error && data && data.stats.totalEnrollments === 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!data) {
    return <ErrorState onRetry={refetch} />;
  }

  const { stats, enrollmentDistribution, pendingEnrollments, topCampaigns } = data;

  // Generate enrollment trends data for the chart (mock data based on distribution)
  const enrollmentTrendsData = (() => {
    const days = parseInt(selectedPeriod.value, 10);
    const data = [];
    const total = enrollmentDistribution.approved + enrollmentDistribution.pending + enrollmentDistribution.rejected;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

      // Distribute values with some variation
      const factor = total > 0 ? (1 + (Math.random() - 0.5) * 0.4) / days : 0;
      data.push({
        date: dateStr,
        approved: Math.round(enrollmentDistribution.approved * factor),
        pending: Math.round(enrollmentDistribution.pending * factor),
        rejected: Math.round(enrollmentDistribution.rejected * factor),
      });
    }
    return data;
  })();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <Heading className="text-2xl sm:text-3xl">
          {getGreeting()}, {brandName}
        </Heading>
        <Text className="mt-1">
          {isNewUser ? "Welcome to your dashboard" : "Here's how your business is doing"}
        </Text>
      </div>

      {isNewUser ? (
        <NewUserWelcome brandName={brandName} />
      ) : (
        <>
          {/* Hero Wallet Card */}
          <HeroWalletCard
            walletBalance={stats.walletBalanceDecimal}
            heldAmount={stats.heldAmountDecimal}
            totalEnrollments={stats.totalEnrollments}
          />

          {/* Quick Stats Grid */}
          <QuickStatsGrid
            approved={enrollmentDistribution.approved}
            pending={enrollmentDistribution.pending}
            rejected={enrollmentDistribution.rejected}
          />

          {/* Performance Section */}
          <section className="space-y-4">
            <SectionHeader title="Performance">
              <ReactSelect
                options={periodOptions}
                value={selectedPeriod}
                onChange={(option) => option && setSelectedPeriod(option)}
                isSearchable={false}
                containerClassName="w-36 sm:w-40"
              />
            </SectionHeader>

            <CardGrid columns={4} gap="md">
              <StatCard
                icon={<BanknotesIcon className="size-5" />}
                label="Wallet Balance"
                value={formatCurrency(stats.walletBalanceDecimal)}
                variant="success"
              />
              <StatCard
                icon={<UserGroupIcon className="size-5" />}
                label="Total Enrollments"
                value={stats.totalEnrollments.toLocaleString("en-IN")}
              />
              <StatCard
                icon={<MegaphoneIcon className="size-5" />}
                label="Active Campaigns"
                value={stats.activeCampaigns.toLocaleString("en-IN")}
                variant="info"
              />
              <StatCard
                icon={<ShoppingBagIcon className="size-5" />}
                label="Total Campaigns"
                value={stats.totalCampaigns.toLocaleString("en-IN")}
              />
            </CardGrid>

            {/* Charts Grid */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Enrollment Trends Chart */}
              <Card className="lg:col-span-2" padding="lg">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
                  Enrollment Trends
                </h3>
                <AreaChart
                  data={enrollmentTrendsData}
                  series={[
                    { dataKey: "approved", name: "Approved", color: chartColors.success },
                    { dataKey: "pending", name: "Pending", color: chartColors.warning },
                    { dataKey: "rejected", name: "Rejected", color: chartColors.danger },
                  ]}
                  xAxisKey="date"
                  height={240}
                  showLegend
                  stacked
                />
              </Card>

              {/* Enrollment Distribution Donut */}
              <Card padding="lg">
                <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-white">
                  Enrollment Distribution
                </h3>
                <DonutChart
                  data={[
                    { name: "Approved", value: enrollmentDistribution.approved, color: chartColors.success },
                    { name: "Pending", value: enrollmentDistribution.pending, color: chartColors.warning },
                    { name: "Rejected", value: enrollmentDistribution.rejected, color: chartColors.danger },
                  ]}
                  height={240}
                  thickness={24}
                  outerRadius={70}
                />
              </Card>
            </div>
          </section>

          {/* Content Grid - Two columns on large screens */}
          <div className="grid gap-6 lg:grid-cols-2">
            <PendingEnrollmentsSection enrollments={pendingEnrollments} />
            <TopCampaignsSection campaigns={topCampaigns} />
          </div>
        </>
      )}
    </div>
  );
}
