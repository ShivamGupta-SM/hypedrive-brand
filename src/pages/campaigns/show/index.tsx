import {
	ArchiveBoxIcon,
	ArrowPathIcon,
	CalendarIcon,
	ChartBarIcon,
	ClipboardDocumentListIcon,
	ClockIcon,
	CubeIcon,
	ExclamationTriangleIcon,
	MegaphoneIcon,
	PaperAirplaneIcon,
	PauseCircleIcon,
	PencilIcon,
	PlayCircleIcon,
	StopCircleIcon,
	UserGroupIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Heading } from "@/components/heading";
import { useCan } from "@/components/shared/can";
import { ErrorState } from "@/components/shared/error-state";
import {
	useCampaign,
	useCampaignStats,
	useCampaignTasks,
	usePlatforms,
	useTaskTemplates,
} from "@/features/campaigns/hooks";
import {
	useAddCampaignTask,
	useArchiveCampaign,
	useEndCampaign,
	usePauseCampaign,
	useRemoveCampaignTask,
	useResumeCampaign,
	useSubmitCampaign,
	useUpdateCampaignTask,
} from "@/features/campaigns/mutations";
import { useCampaignEnrollments } from "@/features/enrollments/hooks";
import { useExportEnrollments } from "@/features/enrollments/mutations";
import { usePageTitle } from "@/hooks/use-breadcrumb";
import { useConfetti } from "@/hooks/use-confetti";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand, db } from "@/lib/brand-client";
import { showToast } from "@/lib/toast";
import { getStatusConfig } from "../utils";
import { CampaignEnrollments } from "./campaign-enrollments";
import { CampaignOverview } from "./campaign-overview";
import { CampaignTasks } from "./campaign-tasks";
import { EditCampaignModal } from "./edit-campaign-modal";
import { LoadingSkeleton } from "./loading-skeleton";
import { formatDate } from "./utils";

const routeApi = getRouteApi("/_app/$orgSlug/campaigns_/$id");

type CampaignEnrollment = brand.EnrollmentWithRelations;
type EnrollmentStatus = db.EnrollmentStatus;

export function CampaignShow() {
	const { id: campaignId } = routeApi.useParams();
	const { organizationId, orgSlug } = useOrgContext();

	// Permission checks
	const canUpdateCampaign = useCan("campaign", "update");


	const {
		data: campaign,
		loading: campaignLoading,
		error: campaignError,
		refetch: refetchCampaign,
	} = useCampaign(organizationId, campaignId);
	const { data: stats, loading: statsLoading, refetch: refetchStats } = useCampaignStats(organizationId, campaignId);
	const {
		data: enrollments,
		loading: enrollmentsLoading,
		refetch: refetchEnrollments,
	} = useCampaignEnrollments(organizationId, campaignId, { take: 10 });
	const { data: tasks, loading: tasksLoading } = useCampaignTasks(organizationId, campaignId);

	// Set breadcrumb page title
	usePageTitle(campaign?.title);

	const submitCampaign = useSubmitCampaign();
	const pauseCampaign = usePauseCampaign();
	const resumeCampaign = useResumeCampaign();
	const endCampaign = useEndCampaign();
	const archiveCampaign = useArchiveCampaign();
	const addTask = useAddCampaignTask(organizationId, campaignId);
	const updateTask = useUpdateCampaignTask(organizationId, campaignId);
	const removeTask = useRemoveCampaignTask(organizationId, campaignId);
	const exportEnrollments = useExportEnrollments(organizationId);
	const { data: platforms } = usePlatforms();
	const [addTaskPlatformId, setAddTaskPlatformId] = useState("");
	const { data: taskTemplates } = useTaskTemplates(addTaskPlatformId ? { platformId: addTaskPlatformId } : undefined);

	// Filter templates: non-social platform templates must match listing's platform
	const listingPlatformId = campaign?.listing?.platformId;
	const filteredTemplates = useMemo(() => {
		return taskTemplates.filter((tpl) => {
			if (!tpl.platformId) return true; // generic template
			if (tpl.platformId === listingPlatformId) return true; // same platform
			const tplPlatform = platforms.find((p) => p.id === tpl.platformId);
			return tplPlatform?.type === "social"; // social = cross-platform allowed
		});
	}, [taskTemplates, listingPlatformId, platforms]);

	const [showEditModal, setShowEditModal] = useState(false);
	const [showAddTaskPicker, setShowAddTaskPicker] = useState(false);
	const [addTaskTemplateId, setAddTaskTemplateId] = useState("");
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editingTaskInstructions, setEditingTaskInstructions] = useState("");
	const [editingTaskRequirements, setEditingTaskRequirements] = useState<db.TaskRequirements>({});
	const [editingTaskCategory, setEditingTaskCategory] = useState<string | undefined>();
	const [hashtagInput, setHashtagInput] = useState("");
	const [mentionInput, setMentionInput] = useState("");
	const [showEndConfirm, setShowEndConfirm] = useState(false);

	const loading = campaignLoading || statsLoading;

	const handleRefetch = () => {
		refetchCampaign();
		refetchStats();
		refetchEnrollments();
	};

	const { fire: fireConfetti } = useConfetti();

	const handleSubmit = async () => {
		if (!organizationId || !campaignId) return;
		try {
			await submitCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign submitted for approval");
			fireConfetti("side-cannons");
		} catch (err) {
			showToast.error(err, "Failed to submit campaign");
		}
	};

	const handlePause = async () => {
		if (!organizationId || !campaignId) return;
		try {
			await pauseCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign paused");
		} catch (err) {
			showToast.error(err, "Failed to pause campaign");
		}
	};

	const handleResume = async () => {
		if (!organizationId || !campaignId) return;
		try {
			await resumeCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign resumed");
		} catch (err) {
			showToast.error(err, "Failed to resume campaign");
		}
	};

	const handleEnd = async () => {
		if (!organizationId || !campaignId) return;
		try {
			await endCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign ended");
			setShowEndConfirm(false);
		} catch (err) {
			showToast.error(err, "Failed to end campaign");
		}
	};

	const handleArchive = async () => {
		if (!organizationId || !campaignId) return;
		try {
			await archiveCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign archived");
		} catch (err) {
			showToast.error(err, "Failed to archive campaign");
		}
	};

	const navigate = useNavigate();

	const handleEnrollmentClick = (enrollment: CampaignEnrollment) => {
		navigate({
			to: "/$orgSlug/campaigns/$campaignId/enrollments/$id",
			params: { orgSlug, campaignId, id: enrollment.id },
		});
	};

	// Calculate days remaining
	const daysRemaining = useMemo(() => {
		if (!campaign?.endDate) return null;
		const end = new Date(campaign.endDate);
		const now = new Date();
		const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		return diff > 0 ? diff : 0;
	}, [campaign?.endDate]);

	const [activeTab, setActiveTab] = useState<"overview" | "enrollments" | "tasks">("overview");
	const [enrollmentFilter, setEnrollmentFilter] = useState<"all" | EnrollmentStatus>("all");

	const filteredEnrollments = useMemo(() => {
		if (enrollmentFilter === "all") return enrollments;
		return enrollments.filter((e) => e.status === enrollmentFilter);
	}, [enrollments, enrollmentFilter]);

	// Time progress
	const timeProgress = useMemo(() => {
		if (!campaign?.startDate || !campaign?.endDate) return null;
		const start = new Date(campaign.startDate).getTime();
		const end = new Date(campaign.endDate).getTime();
		const now = Date.now();
		if (now < start) return 0;
		if (now > end) return 100;
		return Math.round(((now - start) / (end - start)) * 100);
	}, [campaign?.startDate, campaign?.endDate]);

	// Enrollment distribution
	const enrollmentDistribution = useMemo(() => {
		const approved = stats?.approvedEnrollments ?? 0;
		const pending = stats?.pendingEnrollments ?? 0;
		const rejected = stats?.rejectedEnrollments ?? 0;
		const total = approved + pending + rejected;
		return { approved, pending, rejected, total: total || 1 };
	}, [stats]);

	if (loading) {
		return <LoadingSkeleton />;
	}

	if (campaignError || !campaign) {
		return <ErrorState message="Failed to load campaign details. Please try again." onRetry={handleRefetch} />;
	}

	const statusConfig = getStatusConfig(campaign.status);
	const StatusIcon = statusConfig.icon;

	// Get type badge color
	const getTypeColor = (type: string): "sky" | "emerald" | "zinc" => {
		const typeColors: Record<string, "sky" | "emerald" | "zinc"> = {
			cashback: "emerald",
			barter: "sky",
			hybrid: "zinc",
		};
		return typeColors[type] || "zinc";
	};

	const pendingCount = enrollments.filter((e) => e.status === "awaiting_review").length;

	const tabs = [
		{ key: "overview" as const, label: "Overview", icon: ChartBarIcon, iconColor: "text-sky-500" },
		{
			key: "enrollments" as const,
			label: "Enrollments",
			icon: UserGroupIcon,
			count: enrollments.length,
			iconColor: "text-emerald-500",
		},
		{
			key: "tasks" as const,
			label: "Tasks",
			icon: ClipboardDocumentListIcon,
			count: tasks.length,
			iconColor: "text-amber-500",
		},
	];

	return (
		<div className="space-y-4 sm:space-y-5">
			{/* Header Card */}
			<header className="relative overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className={clsx("pointer-events-none absolute inset-px top-px h-24 rounded-t-[11px] bg-linear-to-b sm:h-32", statusConfig.gradientClass)} />
				<div className="relative p-4 sm:p-5">
					{/* Thumbnail + Title row -- always side by side */}
					<div className="flex items-start gap-3 sm:gap-4">
						{/* Thumbnail */}
						{campaign.listing?.listingImages?.[0]?.imageUrl ? (
							<img
								src={campaign.listing.listingImages[0].imageUrl}
								alt={campaign.listing.name}
								className="size-12 shrink-0 rounded-lg bg-zinc-100 object-contain ring-1 ring-zinc-200 sm:size-20 sm:rounded-xl dark:bg-zinc-800 dark:ring-zinc-700"
							/>
						) : (
							<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 ring-1 ring-zinc-200 sm:size-20 sm:rounded-xl dark:bg-zinc-800 dark:ring-zinc-700">
								<MegaphoneIcon className="size-5 text-zinc-400 sm:size-8" />
							</div>
						)}

						{/* Title + meta -- beside thumbnail */}
						<div className="min-w-0 flex-1">
							<Heading className="text-base/snug sm:text-xl/snug">{campaign.title}</Heading>
							<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
								<Badge color={statusConfig.color} className="inline-flex items-center gap-1 text-[11px]">
									<StatusIcon className="size-3" />
									{statusConfig.label}
								</Badge>
								{campaign.displayId && (
									<Badge color="zinc" className="font-mono text-[11px]">
										{campaign.displayId}
									</Badge>
								)}
								<Badge color={getTypeColor(campaign.campaignType)} className="text-[11px]">
									{campaign.campaignType}
								</Badge>
								{campaign.listing?.name && (
									<span className="hidden items-center gap-1 text-xs text-zinc-500 sm:inline-flex dark:text-zinc-400">
										<CubeIcon className="size-3.5 shrink-0" />
										<span className="max-w-40 truncate">{campaign.listing.name}</span>
									</span>
								)}
							</div>
						</div>
					</div>

					{/* Description + date -- below thumbnail row */}
					<div className="mt-3 space-y-2 sm:ml-24">
						{campaign.description && (
							<p className="line-clamp-2 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
								{campaign.description}
							</p>
						)}
						<div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
							<span className="inline-flex items-center gap-1.5">
								<CalendarIcon className="size-3.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
								{formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
							</span>
							{daysRemaining !== null && daysRemaining > 0 && (
								<span
									className={clsx(
										"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
										daysRemaining <= 7
											? "bg-amber-50 text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800"
											: "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
									)}
								>
									<ClockIcon className="size-3" />
									{daysRemaining}d left
								</span>
							)}
							{pendingCount > 0 && (
								<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800">
									{pendingCount} pending
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Actions bar */}
				{canUpdateCampaign && (
					<div className="flex items-center gap-2 border-t border-zinc-200 px-4 py-2.5 sm:px-5 dark:border-zinc-800">
						{/* Primary actions -- driven by allowedActions from API */}
						{campaign.allowedActions?.includes("SUBMIT_FOR_APPROVAL") && (
							<button
								type="button"
								onClick={handleSubmit}
								disabled={submitCampaign.isPending}
								className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
							>
								<PaperAirplaneIcon className="size-3.5" />
								{submitCampaign.isPending ? "Submitting..." : "Submit for Review"}
							</button>
						)}
						{campaign.allowedActions?.includes("PAUSE") && (
							<button
								type="button"
								onClick={handlePause}
								disabled={pauseCampaign.isPending}
								className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md disabled:opacity-50 dark:bg-amber-500 dark:hover:bg-amber-400"
							>
								<PauseCircleIcon className="size-3.5" />
								{pauseCampaign.isPending ? "Pausing..." : "Pause"}
							</button>
						)}
						{campaign.allowedActions?.includes("RESUME") && (
							<button
								type="button"
								onClick={handleResume}
								disabled={resumeCampaign.isPending}
								className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-400"
							>
								<PlayCircleIcon className="size-3.5" />
								{resumeCampaign.isPending ? "Resuming..." : "Resume"}
							</button>
						)}
						{campaign.allowedActions?.includes("ARCHIVE") && (
							<button
								type="button"
								onClick={handleArchive}
								disabled={archiveCampaign.isPending}
								className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md disabled:opacity-50 dark:bg-zinc-600 dark:hover:bg-zinc-500"
							>
								<ArchiveBoxIcon className="size-3.5" />
								{archiveCampaign.isPending ? "Archiving..." : "Archive"}
							</button>
						)}

						<div className="ml-auto flex items-center gap-1.5">
							{campaign.allowedActions?.includes("END") && (
								<button
									type="button"
									onClick={() => setShowEndConfirm(true)}
									disabled={endCampaign.isPending}
									className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-400"
								>
									<StopCircleIcon className="size-3.5" />
									End
								</button>
							)}
							{(campaign.status === "draft" ||
								campaign.status === "rejected" ||
								campaign.status === "approved" ||
								campaign.status === "active" ||
								campaign.status === "paused") && (
								<button
									type="button"
									onClick={() => setShowEditModal(true)}
									className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md dark:bg-sky-500 dark:hover:bg-sky-400"
								>
									<PencilIcon className="size-3.5" />
									Edit
								</button>
							)}
						</div>
					</div>
				)}
			</header>

			{/* Status Alert Banners */}
			{campaign.status === "pending_approval" && (
				<div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 sm:p-4 dark:border-amber-700 dark:bg-amber-950/40">
					<div className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800">
						<ExclamationTriangleIcon className="size-4 sm:size-5 text-amber-700 dark:text-amber-300" />
					</div>
					<div className="min-w-0">
						<p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Pending Approval</p>
						<p className="mt-0.5 text-xs sm:text-sm text-amber-700 dark:text-amber-300">
							This campaign has been submitted and is waiting for admin review
						</p>
					</div>
				</div>
			)}

			{campaign.status === "rejected" && campaign.rejectionReason && (
				<div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 sm:px-4 sm:py-3 dark:border-red-900/50 dark:bg-red-950/30">
					<XCircleIcon className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
					<div className="min-w-0 flex-1">
						<p className="text-sm font-semibold text-red-900 dark:text-red-100">Campaign Rejected</p>
						<p className="mt-0.5 text-xs sm:text-sm text-red-700 dark:text-red-300">{campaign.rejectionReason}</p>
					</div>
				</div>
			)}

			{campaign.status === "paused" && (
				<div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:px-4 sm:py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
					<ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
					<div className="min-w-0 flex-1">
						<p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Campaign Paused</p>
						<p className="mt-0.5 text-xs sm:text-sm text-amber-700 dark:text-amber-300">
							This campaign is currently paused and not accepting new enrollments
						</p>
					</div>
				</div>
			)}

			{/* Tab Navigation */}
			<div className="-mx-1 flex gap-1 sm:gap-1.5 overflow-x-auto px-1 py-0.5 scrollbar-hide">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.key;
					return (
						<button
							key={tab.key}
							type="button"
							onClick={() => setActiveTab(tab.key)}
							className={clsx(
								"inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ring-1 transition-all duration-200 active:scale-95",
								isActive
									? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
									: "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800"
							)}
						>
							<Icon className={clsx("size-3.5", isActive ? "text-white dark:text-zinc-900" : tab.iconColor)} />
							{tab.label}
							{tab.count !== undefined && tab.count > 0 && (
								<span
									className={clsx(
										"inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
										isActive
											? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
											: "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
									)}
								>
									{tab.count}
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Tab Content */}
			{activeTab === "overview" && (
				<CampaignOverview
					campaign={campaign}
					stats={stats}
					enrollmentDistribution={enrollmentDistribution}
					daysRemaining={daysRemaining}
					timeProgress={timeProgress}
					enrollments={enrollments}
					tasks={tasks}
					onEnrollmentClick={handleEnrollmentClick}
					onSwitchToTab={setActiveTab}
				/>
			)}

			{activeTab === "enrollments" && (
				<CampaignEnrollments
					campaign={campaign}
					enrollments={enrollments}
					enrollmentFilter={enrollmentFilter}
					setEnrollmentFilter={setEnrollmentFilter}
					filteredEnrollments={filteredEnrollments}
					onEnrollmentClick={handleEnrollmentClick}
					exportEnrollments={exportEnrollments}
					enrollmentsLoading={enrollmentsLoading}
					orgSlug={orgSlug}
					campaignId={campaignId}
				/>
			)}

			{activeTab === "tasks" && (
				<CampaignTasks
					campaign={campaign}
					tasks={tasks}
					tasksLoading={tasksLoading}
					platforms={platforms}
					canUpdateCampaign={canUpdateCampaign}
					showAddTaskPicker={showAddTaskPicker}
					setShowAddTaskPicker={setShowAddTaskPicker}
					addTaskPlatformId={addTaskPlatformId}
					setAddTaskPlatformId={setAddTaskPlatformId}
					addTaskTemplateId={addTaskTemplateId}
					setAddTaskTemplateId={setAddTaskTemplateId}
					filteredTemplates={filteredTemplates}
					addTask={addTask}
					editingTaskId={editingTaskId}
					setEditingTaskId={setEditingTaskId}
					editingTaskInstructions={editingTaskInstructions}
					setEditingTaskInstructions={setEditingTaskInstructions}
					editingTaskRequirements={editingTaskRequirements}
					setEditingTaskRequirements={setEditingTaskRequirements}
					editingTaskCategory={editingTaskCategory}
					setEditingTaskCategory={setEditingTaskCategory}
					hashtagInput={hashtagInput}
					setHashtagInput={setHashtagInput}
					mentionInput={mentionInput}
					setMentionInput={setMentionInput}
					updateTask={updateTask}
					removeTask={removeTask}
				/>
			)}

			{/* Edit Campaign Modal */}
			<EditCampaignModal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				organizationId={organizationId}
				campaign={campaign}
				onSuccess={() => {
					refetchStats();
				}}
			/>

			{/* End Campaign Confirmation */}
			<Dialog open={showEndConfirm} onClose={() => setShowEndConfirm(false)} size="sm">
				<DialogHeader
					icon={StopCircleIcon}
					iconColor="red"
					title="End Campaign"
					onClose={() => setShowEndConfirm(false)}
				/>
				<DialogBody>
					<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
						<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
						<p className="text-sm text-red-700 dark:text-red-300">
							Are you sure you want to end <strong>{campaign.title}</strong>? This action cannot be undone and no new
							enrollments will be accepted.
						</p>
					</div>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setShowEndConfirm(false)}>
						Cancel
					</Button>
					<Button color="red" onClick={handleEnd} disabled={endCampaign.isPending}>
						{endCampaign.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Ending...
							</>
						) : (
							<>
								<StopCircleIcon className="size-4" />
								End Campaign
							</>
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
