import {
	CalendarIcon,
	ChevronRightIcon,
	ClipboardDocumentListIcon,
	ClockIcon,
	CubeIcon,
	GlobeAltIcon,
	LockClosedIcon,
	UserGroupIcon,
} from "@heroicons/react/16/solid";
import { EnrollmentCardCompact } from "@/components/enrollment-card";
import { extractPlatformFromText, getPlatformGradient, getPlatformIcon } from "@/components/icons/platform-icons";
import { EmptyState } from "@/components/shared/empty-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import type { brand } from "@/lib/brand-client";
import { formatCurrency } from "@/lib/design-tokens";
import { CampaignTimeline } from "./campaign-timeline";
import { formatDate } from "./utils";

interface CampaignOverviewProps {
	campaign: brand.CampaignWithStats;
	stats: brand.CampaignStats | null;
	enrollmentDistribution: { approved: number; pending: number; rejected: number; total: number };
	daysRemaining: number | null;
	timeProgress: number | null;
	enrollments: brand.EnrollmentWithRelations[];
	tasks: brand.CampaignTaskResponse[];
	onEnrollmentClick: (enrollment: brand.EnrollmentWithRelations) => void;
	onSwitchToTab: (tab: "enrollments" | "tasks") => void;
}

export function CampaignOverview({
	campaign,
	stats,
	enrollmentDistribution,
	daysRemaining,
	timeProgress,
	enrollments,
	tasks,
	onEnrollmentClick,
	onSwitchToTab,
}: CampaignOverviewProps) {
	return (
		<div className="space-y-4 sm:space-y-5">
			{/* Stats Row */}
			<FinancialStatsGridBordered
				stats={[
					{
						name: "Order Value",
						value: formatCurrency(stats?.totalOrderValueDecimal ?? "0"),
						changeType: "positive" as const,
					},
					{
						name: "Avg. Order",
						value: formatCurrency(stats?.averageOrderValueDecimal ?? "0"),
					},
					{
						name: "Enrollments",
						value: `${stats?.totalEnrollments ?? 0}${campaign.maxEnrollments ? ` / ${campaign.maxEnrollments}` : ""}`,
					},
					{
						name: "Approved",
						value: stats?.approvedEnrollments ?? 0,
						changeType: "positive" as const,
					},
					{
						name: "Pending",
						value: stats?.pendingEnrollments ?? 0,
						changeType: (stats?.pendingEnrollments ?? 0) > 0 ? ("negative" as const) : undefined,
					},
				]}
				columns={5}
			/>

			{/* Progress Bars */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="grid divide-y divide-zinc-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-zinc-700">
					{/* Enrollment Slots */}
					<div className="p-3.5 sm:p-4">
						<div className="mb-2.5 flex items-center justify-between">
							<span className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
								<UserGroupIcon className="size-3.5 text-emerald-500" />
								Enrollment Slots
							</span>
							<span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">
								{campaign.maxEnrollments
									? `${Math.min(Math.round(((stats?.totalEnrollments ?? 0) / campaign.maxEnrollments) * 100), 100)}%`
									: `${stats?.totalEnrollments ?? 0} total`}
							</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
							<div className="flex h-full">
								<div
									className="h-full bg-emerald-500 transition-all"
									style={{
										width: campaign.maxEnrollments
											? `${Math.min(((stats?.approvedEnrollments ?? 0) / campaign.maxEnrollments) * 100, 100)}%`
											: "0%",
									}}
								/>
								<div
									className="h-full bg-amber-400 transition-all"
									style={{
										width: campaign.maxEnrollments
											? `${Math.min(((stats?.pendingEnrollments ?? 0) / campaign.maxEnrollments) * 100, 100)}%`
											: "0%",
									}}
								/>
							</div>
						</div>
						<div className="mt-2 flex items-center gap-3">
							{[
								{ label: "Approved", count: enrollmentDistribution.approved, color: "bg-emerald-500" },
								{ label: "Pending", count: enrollmentDistribution.pending, color: "bg-amber-400" },
								{ label: "Rejected", count: enrollmentDistribution.rejected, color: "bg-red-500" },
							].map((item) => (
								<div key={item.label} className="flex items-center gap-1">
									<span className={`size-1.5 rounded-full ${item.color}`} />
									<span className="text-[10px] text-zinc-500 dark:text-zinc-400">
										{item.label} {item.count}
									</span>
								</div>
							))}
						</div>
					</div>
					{/* Timeline */}
					<div className="p-3.5 sm:p-4">
						<div className="mb-2.5 flex items-center justify-between">
							<span className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
								<CalendarIcon className="size-3.5 text-sky-500" />
								Timeline
							</span>
							<span className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">
								{daysRemaining !== null && daysRemaining > 0
									? `${daysRemaining}d left`
									: timeProgress !== null && timeProgress >= 100
										? "Ended"
										: "Not started"}
							</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
							<div
								className="h-full rounded-full bg-sky-500 transition-all"
								style={{ width: `${timeProgress ?? 0}%` }}
							/>
						</div>
						<div className="mt-2 flex items-center justify-between">
							<span className="text-[10px] text-zinc-500 dark:text-zinc-400">{formatDate(campaign.startDate)}</span>
							<span className="text-[10px] text-zinc-500 dark:text-zinc-400">{formatDate(campaign.endDate)}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Two-column layout */}
			<div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
				{/* Left -- Enrollments */}
				<div className="flex flex-col gap-4 sm:gap-5">
					{/* Task Summary */}
					{tasks.length > 0 && (
						<button
							type="button"
							onClick={() => onSwitchToTab("tasks")}
							className="flex w-full items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50 sm:p-3.5 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:bg-zinc-800/80"
						>
							<div className="flex -space-x-1.5">
								{tasks.slice(0, 3).map((task) => {
									const taskPlatform =
										task.taskTemplate?.platformName || extractPlatformFromText(task.taskTemplate?.name || "");
									const TaskIcon = taskPlatform ? getPlatformIcon(taskPlatform) : null;
									return (
										<div
											key={task.id}
											className={`flex size-7 items-center justify-center rounded-full bg-gradient-to-br ring-2 ring-white dark:ring-zinc-900 ${getPlatformGradient(taskPlatform || "")}`}
										>
											{TaskIcon ? (
												<TaskIcon className="size-3.5 text-white" />
											) : (
												<ClipboardDocumentListIcon className="size-3.5 text-white" />
											)}
										</div>
									);
								})}
								{tasks.length > 3 && (
									<div className="flex size-7 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600 ring-2 ring-white dark:bg-zinc-700 dark:text-zinc-300 dark:ring-zinc-900">
										+{tasks.length - 3}
									</div>
								)}
							</div>
							<div className="min-w-0 flex-1 text-left">
								<p className="text-sm font-medium text-zinc-900 dark:text-white">
									{tasks.length} task{tasks.length !== 1 ? "s" : ""}
								</p>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									{tasks.filter((t) => t.isRequired).length} required
								</p>
							</div>
							<ChevronRightIcon className="size-4 text-zinc-400" />
						</button>
					)}

					{/* Recent Enrollments */}
					{enrollments.length > 0 ? (
						<div className="flex-1">
							<div className="flex items-center justify-between px-0.5 pb-2.5">
								<div className="flex items-center gap-2.5">
									<UserGroupIcon className="size-4 text-sky-500" />
									<h3 className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
										Recent Enrollments
									</h3>
								</div>
								<button
									type="button"
									onClick={() => onSwitchToTab("enrollments")}
									className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
								>
									View all &rarr;
								</button>
							</div>
							<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
								{enrollments.slice(0, 4).map((enrollment) => (
									<EnrollmentCardCompact
										key={enrollment.id}
										enrollment={enrollment}
										onClick={() => onEnrollmentClick(enrollment)}
									/>
								))}
							</div>
						</div>
					) : (
						<EmptyState
							preset="enrollments"
							title="No enrollments yet"
							description="Enrollments will appear here when shoppers join this campaign"
						/>
					)}
				</div>

				{/* Right -- Details */}
				<div className="flex flex-col gap-4 sm:gap-5">
					{/* Configuration */}
					<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<div className="flex items-center gap-2.5 border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
							<CubeIcon className="size-4 text-violet-500" />
							<h3 className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">Configuration</h3>
						</div>
						<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
							{[
								{
									label: "Bill Rate",
									value: campaign.billRateDecimal != null ? `${campaign.billRateDecimal}%` : "\u2014",
									valueClass: "text-emerald-600 font-semibold dark:text-emerald-400",
								},
								{
									label: "Platform Fee",
									value: campaign.platformFeeDecimal ? formatCurrency(campaign.platformFeeDecimal) : "\u2014",
								},
								{
									label: "Max Slots",
									value: campaign.maxEnrollments ? String(campaign.maxEnrollments) : "Unlimited",
								},
								{
									label: "Visibility",
									value: campaign.isPublic ? "Public" : "Private",
									icon: campaign.isPublic ? GlobeAltIcon : LockClosedIcon,
								},
							].map((row) => {
								const RowIcon = row.icon;
								return (
									<div key={row.label} className="flex items-center justify-between px-3.5 py-2.5 sm:px-4">
										<span className="text-xs text-zinc-500 dark:text-zinc-400">{row.label}</span>
										<span
											className={`inline-flex items-center gap-1 text-xs font-medium ${row.valueClass || "text-zinc-900 dark:text-white"}`}
										>
											{RowIcon && <RowIcon className="size-3 text-zinc-400" />}
											{row.value}
										</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Activity Timeline */}
					<div className="flex-1 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<div className="flex items-center gap-2.5 border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
							<ClockIcon className="size-4 text-amber-500" />
							<h3 className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">Activity</h3>
						</div>
						<div className="p-3.5 sm:p-4">
							<CampaignTimeline campaign={campaign} />
						</div>
					</div>

					{/* Terms & Conditions */}
					{(campaign as brand.CampaignWithStats & { termsAndConditions?: string }).termsAndConditions && (
						<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
							<div className="flex items-center gap-2.5 border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
								<ClipboardDocumentListIcon className="size-4 text-emerald-500" />
								<h3 className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
									Terms & Conditions
								</h3>
							</div>
							<div className="p-3.5 sm:p-4">
								<p className="whitespace-pre-wrap text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
									{(campaign as brand.CampaignWithStats & { termsAndConditions?: string }).termsAndConditions}
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
