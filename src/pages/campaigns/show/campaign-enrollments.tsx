import {
	ArrowPathIcon,
	CheckCircleIcon,
	ClockIcon,
	TableCellsIcon,
	UserGroupIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Button } from "@/components/button";
import { EnrollmentCardCompact } from "@/components/enrollment-card";
import { Link } from "@/components/link";
import { EmptyState } from "@/components/shared/empty-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import type { brand, db } from "@/lib/brand-client";
import { downloadExcel } from "@/lib/download";
import { showToast } from "@/lib/toast";

type EnrollmentStatus = db.EnrollmentStatus;

interface CampaignEnrollmentsProps {
	campaign: brand.CampaignWithStats;
	enrollments: brand.EnrollmentWithRelations[];
	enrollmentFilter: "all" | EnrollmentStatus;
	setEnrollmentFilter: (filter: "all" | EnrollmentStatus) => void;
	filteredEnrollments: brand.EnrollmentWithRelations[];
	onEnrollmentClick: (enrollment: brand.EnrollmentWithRelations) => void;
	exportEnrollments: {
		mutateAsync: (params: { campaignId: string }) => Promise<{ data: string; filename?: string }>;
		isPending: boolean;
	};
	enrollmentsLoading: boolean;
	orgSlug: string;
	campaignId: string;
}

export function CampaignEnrollments({
	enrollments,
	enrollmentFilter,
	setEnrollmentFilter,
	filteredEnrollments,
	onEnrollmentClick,
	exportEnrollments,
	enrollmentsLoading,
	orgSlug,
	campaignId,
}: CampaignEnrollmentsProps) {
	return (
		<div className="space-y-4">
			{/* Header + Actions */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-2.5">
					<UserGroupIcon className="size-4 text-sky-500" />
					<div>
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Enrollments</h3>
						<p className="text-xs text-zinc-500 dark:text-zinc-400">
							{enrollments.length} total enrollment{enrollments.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						outline
						onClick={async () => {
							try {
								const result = await exportEnrollments.mutateAsync({ campaignId });
								downloadExcel(result.data, result.filename || "enrollments.xlsx");
								showToast.success("Export downloaded");
							} catch (err) {
								showToast.error(err, "Failed to export enrollments");
							}
						}}
						disabled={exportEnrollments.isPending}
					>
						<TableCellsIcon data-slot="icon" className="size-4" />
						<span className="hidden sm:inline">
							{exportEnrollments.isPending ? "Exporting..." : "Export Excel"}
						</span>
					</Button>
					<Link
						href={`/${orgSlug}/enrollments?campaignId=${campaignId}`}
						className="hidden rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:inline dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
					>
						Full view →
					</Link>
				</div>
			</div>

			{/* Stats Summary */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total", value: enrollments.length },
					{
						name: "Pending",
						value: enrollments.filter((e) => e.status === "awaiting_review").length,
					},
					{
						name: "Approved",
						value: enrollments.filter((e) => e.status === "approved").length,
						changeType: "positive" as const,
					},
					{
						name: "Rejected",
						value: enrollments.filter((e) => e.status === "permanently_rejected").length,
						changeType: "negative" as const,
					},
				]}
				columns={4}
			/>

			{/* Filter Pills */}
			<div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
				{(
					[
						{
							value: "all" as const,
							label: "All",
							icon: UserGroupIcon,
							count: enrollments.length,
						},
						{
							value: "awaiting_review" as const,
							label: "Pending",
							icon: ClockIcon,
							count: enrollments.filter((e) => e.status === "awaiting_review").length,
						},
						{
							value: "approved" as const,
							label: "Approved",
							icon: CheckCircleIcon,
							count: enrollments.filter((e) => e.status === "approved").length,
						},
						{
							value: "awaiting_submission" as const,
							label: "In Progress",
							icon: ArrowPathIcon,
							count: enrollments.filter((e) => e.status === "awaiting_submission").length,
						},
						{
							value: "permanently_rejected" as const,
							label: "Rejected",
							icon: XCircleIcon,
							count: enrollments.filter((e) => e.status === "permanently_rejected").length,
						},
					] as const
				).map((tab) => {
					const TabIcon = tab.icon;
					const isActive = enrollmentFilter === tab.value;
					return (
						<button
							key={tab.value}
							type="button"
							onClick={() => setEnrollmentFilter(tab.value)}
							className={clsx(
								"flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
								isActive
									? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
									: "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
							)}
						>
							<TabIcon className="size-3.5" />
							{tab.label}
							{tab.count > 0 && (
								<span
									className={clsx(
										"ml-0.5 inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
										isActive
											? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
											: "bg-zinc-200/70 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
									)}
								>
									{tab.count}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Enrollment Cards Grid */}
			{enrollmentsLoading ? (
				<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
						>
							<div className="flex items-start gap-3 p-3 sm:gap-3.5 sm:p-3.5">
								<div className="size-10 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
								<div className="min-w-0 flex-1 space-y-2">
									<div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
									<div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
								</div>
							</div>
							<div className="h-px bg-zinc-200 dark:bg-zinc-700" />
							<div className="grid grid-cols-3 divide-x divide-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:bg-zinc-800/30">
								{[1, 2, 3].map((j) => (
									<div key={j} className="flex flex-col items-center gap-1 py-2">
										<div className="h-2.5 w-8 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
										<div className="h-3 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			) : filteredEnrollments.length === 0 ? (
				<EmptyState
					preset="enrollments"
					title={
						enrollmentFilter === "all"
							? "No enrollments yet"
							: `No ${enrollmentFilter.replace(/_/g, " ")} enrollments`
					}
					description={
						enrollmentFilter === "all"
							? "Enrollments will appear here when shoppers join this campaign"
							: "Try selecting a different filter"
					}
				/>
			) : (
				<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
					{filteredEnrollments.map((enrollment) => (
						<EnrollmentCardCompact
							key={enrollment.id}
							enrollment={enrollment}
							onClick={() => onEnrollmentClick(enrollment)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
