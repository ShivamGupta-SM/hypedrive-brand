import {
	CheckCircleIcon,
	ClockIcon,
	ExclamationCircleIcon,
	MagnifyingGlassIcon,
	Squares2X2Icon,
	XCircleIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { Link, Outlet } from "@tanstack/react-router";
import { Button } from "@/components/button";
import { isEnrollmentOverdue } from "@/components/enrollment-card";
import { Input, InputGroup } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";
import { useInfiniteEnrollments } from "@/features/enrollments/hooks";
import { useOrgContext } from "@/hooks/use-org-context";
import { useOrgPath } from "@/hooks/use-org-slug";

import { Route } from "@/routes/_app/$orgSlug/enrollments";

// =============================================================================
// LOADING SKELETON
// =============================================================================

function EnrollmentsLayoutSkeleton() {
	return (
		<div className="space-y-5">
			{/* Header skeleton */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<div className="h-8 w-36 animate-pulse rounded-lg bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
					<div className="mt-2 h-4 w-48 animate-pulse rounded bg-zinc-200 skeleton-shimmer sm:w-56 dark:bg-zinc-800" />
				</div>
			</div>

			{/* Stats skeleton */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total", value: "" },
					{ name: "In Review", value: "" },
					{ name: "Approved", value: "" },
					{ name: "Rejected", value: "" },
				]}
				loading
				columns={4}
			/>

			{/* Search + Filters skeleton */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="h-9 w-full animate-pulse rounded-lg bg-zinc-200 skeleton-shimmer sm:w-52 dark:bg-zinc-800" />
				<div className="flex gap-2 overflow-x-auto">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-800"
						/>
					))}
				</div>
			</div>

			{/* Cards skeleton */}
			<div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 lg:gap-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
					>
						<div className="flex items-start gap-3 p-3 sm:p-4">
							<div className="size-11 shrink-0 animate-pulse rounded-lg bg-zinc-200 sm:size-12 dark:bg-zinc-700" />
							<div className="min-w-0 flex-1 space-y-2">
								<div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
								<div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
								<div className="h-3 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
							</div>
						</div>
						<div className="h-px bg-zinc-200 dark:bg-zinc-700" />
						<div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
							{[1, 2, 3].map((j) => (
								<div key={j} className="flex flex-col items-center gap-1 py-2.5">
									<div className="h-2.5 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
									<div className="h-3.5 w-14 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// ENROLLMENTS LAYOUT
// =============================================================================

export function EnrollmentsLayout() {
	const { organizationId } = useOrgContext();
	const orgPath = useOrgPath();
	const navigate = Route.useNavigate();
	const { q } = Route.useSearch();

	// All enrollments for stats + tab counts
	const { data: enrollments, loading, total } = useInfiniteEnrollments(organizationId, {});

	if (loading) return <EnrollmentsLayoutSkeleton />;

	const stats = {
		total: total || enrollments.length,
		awaitingReview: enrollments.filter((e) => e.status === "awaiting_review").length,
		approved: enrollments.filter((e) => e.status === "approved").length,
		rejected: enrollments.filter((e) => e.status === "permanently_rejected").length,
	};

	// Count overdue enrollments
	const referenceTime = new Date();
	const overdueCount = enrollments.filter(
		(e) => e.status === "awaiting_review" && isEnrollmentOverdue(e.createdAt, referenceTime),
	).length;

	const tabs: TabNavItem[] = [
		{
			label: "All",
			to: orgPath("/enrollments"),
			exact: true,
			count: stats.total,
			icon: Squares2X2Icon,
			iconColor: "text-sky-500",
		},
		{
			label: "Awaiting Review",
			to: orgPath("/enrollments/awaiting-review"),
			count: stats.awaitingReview,
			icon: ClockIcon,
			iconColor: "text-amber-500",
		},
		{
			label: "Approved",
			to: orgPath("/enrollments/approved"),
			count: stats.approved,
			icon: CheckCircleIcon,
			iconColor: "text-emerald-500",
		},
		{
			label: "Rejected",
			to: orgPath("/enrollments/rejected"),
			count: stats.rejected,
			icon: XCircleIcon,
			iconColor: "text-red-500",
		},
	];

	const setSearchQuery = (value: string) => {
		navigate({ search: (prev) => ({ ...prev, q: value || undefined }) });
	};

	return (
		<div className="space-y-5">
			{/* Header */}
			<PageHeader title="Enrollments" description="Review and manage campaign enrollments" />

			{/* Overdue Alert */}
			{overdueCount > 0 && (
				<div className="flex items-center gap-3 rounded-xl bg-red-50 p-3 shadow-sm ring-1 ring-red-200 dark:bg-red-950/30 dark:ring-red-800">
					<div className="flex size-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
						<ExclamationCircleIcon className="size-4 text-red-600 dark:text-red-400" />
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium text-red-800 dark:text-red-200">
							{overdueCount} enrollment{overdueCount !== 1 ? "s" : ""} overdue
						</p>
						<p className="text-xs text-red-600 dark:text-red-400">Pending review for more than 48 hours</p>
					</div>
					<Link to={orgPath("/enrollments/awaiting-review")}>
						<Button color="red" className="text-xs!">
							View
						</Button>
					</Link>
				</div>
			)}

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total", value: stats.total },
					{ name: "In Review", value: stats.awaitingReview },
					{ name: "Approved", value: stats.approved, changeType: "positive" },
					{ name: "Rejected", value: stats.rejected, changeType: "negative" },
				]}
				columns={4}
			/>

			{/* Search */}
			<div className="flex items-center gap-2">
				<div className="w-full sm:w-52 sm:shrink-0">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="text"
							value={q ?? ""}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search by shopper, campaign..."
							aria-label="Search enrollments"
						/>
						{q && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-4" />
							</button>
						)}
					</InputGroup>
				</div>
			</div>

			{/* Active search indicator */}
			{q && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
						"{q}"
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="ml-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50"
							aria-label="Remove search filter"
						>
							<XMarkIcon className="size-3.5" />
						</button>
					</span>
				</div>
			)}

			{/* URL-based tab navigation */}
			<TabNav tabs={tabs} />

			{/* Child route renders here */}
			<Outlet />
		</div>
	);
}
