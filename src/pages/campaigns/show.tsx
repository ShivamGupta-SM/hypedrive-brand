import {
	ArchiveBoxIcon,
	ArrowPathIcon,
	ArrowsRightLeftIcon,
	CalendarIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ClipboardDocumentListIcon,
	ClockIcon,
	CubeIcon,
	CurrencyRupeeIcon,
	ExclamationTriangleIcon,
	GlobeAltIcon,
	LockClosedIcon,
	MegaphoneIcon,
	PaperAirplaneIcon,
	PauseCircleIcon,
	PencilIcon,
	PencilSquareIcon,
	PlayCircleIcon,
	PlusIcon,
	SparklesIcon,
	StopCircleIcon,
	TableCellsIcon,
	TrashIcon,
	UserGroupIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { EnrollmentCardCompact } from "@/components/enrollment-card";
import { Description, Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { extractPlatformFromText, getPlatformGradient, getPlatformIcon } from "@/components/icons/platform-icons";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { NumberInput } from "@/components/number-input";
import { Select } from "@/components/select";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";
import { Switch } from "@/components/switch";
import { Textarea } from "@/components/textarea";
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
	useUpdateCampaign,
	useUpdateCampaignTask,
} from "@/features/campaigns/mutations";
import { useCampaignEnrollments } from "@/features/enrollments/hooks";
import { useExportEnrollments } from "@/features/enrollments/mutations";
import { getFriendlyErrorMessage } from "@/hooks/api-client";
import { usePageTitle } from "@/hooks/use-breadcrumb";
import { useConfetti } from "@/hooks/use-confetti";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand, db } from "@/lib/brand-client";
import { downloadExcel } from "@/lib/download";
import { formatCurrency } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";
import { getStatusConfig } from "./utils";

const routeApi = getRouteApi("/_app/$orgSlug/campaigns_/$id");

type CampaignEnrollment = brand.EnrollmentWithRelations;
type EnrollmentStatus = db.EnrollmentStatus;

const CAMPAIGN_TYPE_CONFIG: Record<
	string,
	{ label: string; color: "emerald" | "amber" | "sky"; icon: typeof CurrencyRupeeIcon }
> = {
	cashback: { label: "Cashback", color: "emerald", icon: CurrencyRupeeIcon },
	barter: { label: "Barter", color: "amber", icon: ArrowsRightLeftIcon },
	hybrid: { label: "Hybrid", color: "sky", icon: SparklesIcon },
};

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
	return (
		<div className="space-y-4 sm:space-y-6 animate-fade-in">
			{/* Header Card */}
			<div className="overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:p-6 dark:bg-zinc-900 dark:ring-zinc-800">
				{/* Breadcrumb + Actions row */}
				<div className="mb-4 flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Skeleton width={80} height={14} borderRadius={6} />
						<Skeleton width={10} height={14} borderRadius={2} />
						<Skeleton width={120} height={14} borderRadius={6} />
					</div>
					<div className="flex gap-2">
						<Skeleton width={36} height={36} borderRadius={8} className="sm:hidden" />
						<Skeleton width={90} height={36} borderRadius={8} className="hidden sm:block" />
						<Skeleton width={90} height={36} borderRadius={8} className="hidden sm:block" />
					</div>
				</div>
				{/* Title + badges */}
				<div className="flex flex-wrap items-center gap-2.5">
					<Skeleton width={220} height={26} borderRadius={8} />
					<Skeleton width={65} height={22} borderRadius={12} />
					<Skeleton width={65} height={22} borderRadius={12} />
				</div>
				{/* Description */}
				<Skeleton width="70%" height={16} borderRadius={6} className="mt-1.5" />
				{/* Meta info */}
				<div className="mt-3 flex gap-4">
					<Skeleton width={100} height={16} borderRadius={6} />
					<Skeleton width={170} height={16} borderRadius={6} />
					<Skeleton width={70} height={16} borderRadius={6} />
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 sm:gap-1.5">
				<Skeleton width={90} height={32} borderRadius={999} />
				<Skeleton width={100} height={32} borderRadius={999} />
				<Skeleton width={70} height={32} borderRadius={999} />
			</div>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Order Value", value: "" },
					{ name: "Avg. Order", value: "" },
					{ name: "Enrollments", value: "" },
					{ name: "Approved", value: "" },
					{ name: "Pending", value: "" },
				]}
				loading
				columns={5}
			/>

			{/* Progress Card */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="grid sm:grid-cols-2">
					{[1, 2].map((i) => (
						<div key={i} className="p-3.5 sm:p-4">
							<div className="mb-2.5 flex items-center justify-between">
								<Skeleton width={110} height={14} borderRadius={6} />
								<Skeleton width={50} height={14} borderRadius={6} />
							</div>
							<Skeleton width="100%" height={8} borderRadius={4} />
							<div className="mt-2 flex gap-3">
								<Skeleton width={60} height={10} borderRadius={4} />
								<Skeleton width={60} height={10} borderRadius={4} />
								<Skeleton width={60} height={10} borderRadius={4} />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Content Grid */}
			<div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
				<div className="space-y-4 sm:space-y-5">
					<Skeleton width="100%" height={52} borderRadius={12} />
					<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} width="100%" height={120} borderRadius={12} />
						))}
					</div>
				</div>
				<div className="space-y-4 sm:space-y-5">
					{[1, 2].map((i) => (
						<div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
							<div className="border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
								<Skeleton width={100 + i * 20} height={16} />
							</div>
							<div className="space-y-2 p-3.5 sm:p-4">
								{[1, 2, 3, 4].map((j) => (
									<Skeleton key={j} width="100%" height={32} borderRadius={6} />
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// ENROLLMENT PROGRESS BAR
// =============================================================================

// =============================================================================
// EDIT CAMPAIGN MODAL
// =============================================================================

interface EditCampaignFormData {
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	maxEnrollments: number;
	campaignType: db.CampaignType;
	isPublic: boolean;
}

const EDIT_STEPS = [
	{ id: 1, name: "Details", description: "Campaign info" },
	{ id: 2, name: "Settings", description: "Configure" },
];

function EditCampaignModal({
	isOpen,
	onClose,
	organizationId,
	campaign,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	organizationId: string | undefined;
	campaign: brand.CampaignWithStats | null;
	onSuccess: () => void;
}) {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<EditCampaignFormData>({
		title: "",
		description: "",
		startDate: "",
		endDate: "",
		maxEnrollments: 100,
		campaignType: "cashback",
		isPublic: true,
	});
	const [errors, setErrors] = useState<Partial<Record<keyof EditCampaignFormData, string>>>({});

	const updateCampaign = useUpdateCampaign(organizationId);

	// Pre-populate form when campaign changes
	useEffect(() => {
		if (campaign && isOpen) {
			setFormData({
				title: campaign.title || "",
				description: campaign.description || "",
				startDate: campaign.startDate ? campaign.startDate.split("T")[0] : "",
				endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "",
				maxEnrollments: campaign.maxEnrollments || 100,
				campaignType: campaign.campaignType || "cashback",
				isPublic: campaign.isPublic ?? true,
			});
			setStep(1);
			setErrors({});
		}
	}, [campaign, isOpen]);

	const updateField = useCallback(<K extends keyof EditCampaignFormData>(field: K, value: EditCampaignFormData[K]) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}, []);

	const validateStep = useCallback(
		(currentStep: number): boolean => {
			const newErrors: Partial<Record<keyof EditCampaignFormData, string>> = {};

			if (currentStep === 1) {
				if (!formData.title.trim()) {
					newErrors.title = "Title is required";
				}
				if (!formData.startDate) {
					newErrors.startDate = "Start date is required";
				}
				if (!formData.endDate) {
					newErrors.endDate = "End date is required";
				}
				if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
					newErrors.endDate = "End date must be after start date";
				}
			}

			if (currentStep === 2) {
				if (formData.maxEnrollments < 1) {
					newErrors.maxEnrollments = "Must be at least 1";
				}
			}

			setErrors(newErrors);
			return Object.keys(newErrors).length === 0;
		},
		[formData]
	);

	const handleNext = useCallback(() => {
		if (validateStep(step)) {
			setStep((s) => Math.min(s + 1, 2));
		}
	}, [step, validateStep]);

	const handleBack = useCallback(() => {
		setStep((s) => Math.max(s - 1, 1));
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!validateStep(2) || !organizationId || !campaign) return;

		try {
			await updateCampaign.mutateAsync({
				campaignId: campaign.id,
				title: formData.title,
				description: formData.description || undefined,
				maxEnrollments: formData.maxEnrollments,
				isPublic: formData.isPublic,
			});
			onSuccess();
			onClose();
		} catch (err) {
			console.error("Failed to update campaign:", getFriendlyErrorMessage(err));
		}
	}, [formData, organizationId, campaign, updateCampaign, onSuccess, onClose, validateStep]);

	const resetAndClose = useCallback(() => {
		setStep(1);
		setErrors({});
		onClose();
	}, [onClose]);

	if (!campaign) return null;

	return (
		<Dialog open={isOpen} onClose={resetAndClose} size="lg">
			<DialogHeader
				icon={PencilIcon}
				iconColor="amber"
				title="Edit Campaign"
				description={`Step ${step} of 2 · ${EDIT_STEPS[step - 1].description}`}
				onClose={resetAndClose}
			/>

			{/* Progress Steps */}
			<div className="mt-5 flex items-center justify-center gap-4">
				{EDIT_STEPS.map((s, idx) => (
					<div key={s.id} className="flex items-center">
						<div
							className={clsx(
								"flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
								step > s.id
									? "bg-emerald-500 text-white"
									: step === s.id
										? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
										: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
							)}
						>
							{step > s.id ? <CheckCircleIcon className="size-5" /> : s.id}
						</div>
						{idx < EDIT_STEPS.length - 1 && (
							<div
								className={clsx(
									"mx-2 h-0.5 w-16 rounded-full transition-colors",
									step > s.id ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
								)}
							/>
						)}
					</div>
				))}
			</div>

			<DialogBody>
				<div className="max-h-[60vh] overflow-y-auto">
					{/* Step 1: Campaign Details */}
					{step === 1 && (
						<div className="space-y-4">
							<div>
								<label
									htmlFor="edit-campaign-title"
									className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
								>
									Campaign Title <span className="text-red-500">*</span>
								</label>
								<input
									id="edit-campaign-title"
									type="text"
									value={formData.title}
									onChange={(e) => updateField("title", e.target.value)}
									placeholder="e.g., Summer Sale Campaign"
									className={clsx(
										"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
										errors.title
											? "border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400"
											: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
									)}
								/>
								{errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
							</div>

							<div>
								<label
									htmlFor="edit-campaign-description"
									className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
								>
									Description
								</label>
								<textarea
									id="edit-campaign-description"
									value={formData.description}
									onChange={(e) => updateField("description", e.target.value)}
									placeholder="Describe your campaign..."
									rows={3}
									className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label
										htmlFor="edit-campaign-start-date"
										className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
									>
										Start Date <span className="text-red-500">*</span>
									</label>
									<input
										id="edit-campaign-start-date"
										type="date"
										value={formData.startDate}
										onChange={(e) => updateField("startDate", e.target.value)}
										className={clsx(
											"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none dark:bg-zinc-800 dark:text-white",
											errors.startDate
												? "border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400"
												: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
										)}
									/>
									{errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
								</div>
								<div>
									<label
										htmlFor="edit-campaign-end-date"
										className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
									>
										End Date <span className="text-red-500">*</span>
									</label>
									<input
										id="edit-campaign-end-date"
										type="date"
										value={formData.endDate}
										onChange={(e) => updateField("endDate", e.target.value)}
										min={formData.startDate}
										className={clsx(
											"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none dark:bg-zinc-800 dark:text-white",
											errors.endDate
												? "border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400"
												: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
										)}
									/>
									{errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
								</div>
							</div>
						</div>
					)}

					{/* Step 2: Settings */}
					{step === 2 && (
						<div className="space-y-4">
							<div>
								<span className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">Campaign Type</span>
								<div className="grid grid-cols-3 gap-2">
									{(["cashback", "barter", "hybrid"] as const).map((type) => {
										const config = CAMPAIGN_TYPE_CONFIG[type];
										const Icon = config.icon;
										return (
											<button
												key={type}
												type="button"
												onClick={() => updateField("campaignType", type as db.CampaignType)}
												className={clsx(
													"flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors",
													formData.campaignType === type
														? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
														: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
												)}
											>
												<Icon className="size-5" />
												<span className="text-xs font-medium">{config.label}</span>
											</button>
										);
									})}
								</div>
							</div>

							<div>
								<label
									htmlFor="edit-campaign-max-enrollments"
									className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
								>
									Max Enrollments
								</label>
								<input
									id="edit-campaign-max-enrollments"
									type="number"
									value={formData.maxEnrollments}
									onChange={(e) => updateField("maxEnrollments", parseInt(e.target.value, 10) || 0)}
									min={1}
									className={clsx(
										"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none dark:bg-zinc-800 dark:text-white",
										errors.maxEnrollments
											? "border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400"
											: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
									)}
								/>
								{errors.maxEnrollments && <p className="mt-1 text-sm text-red-500">{errors.maxEnrollments}</p>}
								{/* Note: Current enrollment count is from stats, not campaign object */}
							</div>

							<div>
								<span className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">Visibility</span>
								<div className="grid grid-cols-2 gap-2">
									<button
										type="button"
										onClick={() => updateField("isPublic", true)}
										className={clsx(
											"flex items-center gap-2 rounded-xl p-3 transition-colors",
											formData.isPublic
												? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
												: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
										)}
									>
										<GlobeAltIcon className="size-5" />
										<div className="text-left">
											<p className="text-sm font-medium">Public</p>
											<p
												className={clsx(
													"text-xs",
													formData.isPublic ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
												)}
											>
												Anyone can join
											</p>
										</div>
									</button>
									<button
										type="button"
										onClick={() => updateField("isPublic", false)}
										className={clsx(
											"flex items-center gap-2 rounded-xl p-3 transition-colors",
											!formData.isPublic
												? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
												: "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
										)}
									>
										<LockClosedIcon className="size-5" />
										<div className="text-left">
											<p className="text-sm font-medium">Private</p>
											<p
												className={clsx(
													"text-xs",
													!formData.isPublic ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
												)}
											>
												Invite only
											</p>
										</div>
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</DialogBody>

			{/* Footer */}
			<DialogActions>
				<div className="flex flex-1 items-center">
					{step > 1 && (
						<Button outline onClick={handleBack}>
							<ChevronLeftIcon className="size-4" />
							Back
						</Button>
					)}
				</div>
				<Button plain onClick={resetAndClose}>
					Cancel
				</Button>
				{step < 2 ? (
					<Button color="emerald" onClick={handleNext}>
						Next
						<ChevronRightIcon className="size-4" />
					</Button>
				) : (
					<Button color="emerald" onClick={handleSubmit} disabled={updateCampaign.isPending}>
						{updateCampaign.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Saving...
							</>
						) : (
							<>
								<CheckCircleIcon className="size-4" />
								Save Changes
							</>
						)}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// CAMPAIGN SHOW PAGE
// =============================================================================

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

	// Format dates
	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "Not set";
		return new Date(dateStr).toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
			year: "numeric",
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
					{/* Thumbnail + Title row — always side by side */}
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

						{/* Title + meta — beside thumbnail */}
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

					{/* Description + date — below thumbnail row */}
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
						{/* Primary actions — driven by allowedActions from API */}
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

			{/* ============================================================= */}
			{/* OVERVIEW TAB */}
			{/* ============================================================= */}
			{activeTab === "overview" && (
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
						{/* Left — Enrollments */}
						<div className="flex flex-col gap-4 sm:gap-5">
							{/* Task Summary */}
							{tasks.length > 0 && (
								<button
									type="button"
									onClick={() => setActiveTab("tasks")}
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
											<div className="flex size-6 items-center justify-center rounded-md bg-sky-100 dark:bg-sky-900/30">
												<UserGroupIcon className="size-3.5 text-sky-500" />
											</div>
											<h3 className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
												Recent Enrollments
											</h3>
										</div>
										<button
											type="button"
											onClick={() => setActiveTab("enrollments")}
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
												onClick={() => handleEnrollmentClick(enrollment)}
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

						{/* Right — Details */}
						<div className="flex flex-col gap-4 sm:gap-5">
							{/* Configuration */}
							<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
								<div className="flex items-center gap-2.5 border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
									<div className="flex size-6 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
										<CubeIcon className="size-3.5 text-violet-500" />
									</div>
									<h3 className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">Configuration</h3>
								</div>
								<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
									{[
										{
											label: "Bill Rate",
											value: campaign.billRateDecimal != null ? `${campaign.billRateDecimal}%` : "—",
											valueClass: "text-emerald-600 font-semibold dark:text-emerald-400",
										},
										{
											label: "Platform Fee",
											value: campaign.platformFeeDecimal ? formatCurrency(campaign.platformFeeDecimal) : "—",
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
									<div className="flex size-6 items-center justify-center rounded-md bg-sky-100 dark:bg-sky-900/30">
										<ClockIcon className="size-3.5 text-sky-500" />
									</div>
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
										<div className="flex size-6 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
											<ClipboardDocumentListIcon className="size-3.5 text-violet-500" />
										</div>
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
			)}

			{/* ============================================================= */}
			{/* ENROLLMENTS TAB */}
			{/* ============================================================= */}
			{activeTab === "enrollments" && (
				<div className="space-y-4">
					{/* Header + Actions */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-2.5">
							<div className="flex size-6 items-center justify-center rounded-md bg-sky-100 dark:bg-sky-900/30">
								<UserGroupIcon className="size-3.5 text-sky-500" />
							</div>
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
									onClick={() => handleEnrollmentClick(enrollment)}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{/* ============================================================= */}
			{/* TASKS TAB */}
			{/* ============================================================= */}
			{activeTab === "tasks" && (
				<div className="space-y-4">
					{/* Header + Actions */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-2.5">
							<div className="flex size-6 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/30">
								<ClipboardDocumentListIcon className="size-3.5 text-amber-500" />
							</div>
							<div>
								<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Campaign Tasks</h3>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									{tasks.length} task{tasks.length !== 1 ? "s" : ""} · {tasks.filter((t) => t.isRequired).length} required
								</p>
							</div>
						</div>
						{canUpdateCampaign && ["draft", "rejected", "paused"].includes(campaign.status) && (
							<Button outline onClick={() => setShowAddTaskPicker(true)} disabled={addTask.isPending}>
								<PlusIcon className="size-4" />
								Add Task
							</Button>
						)}
					</div>

					{/* Stats Summary */}
					<FinancialStatsGridBordered
						stats={[
							{ name: "Total Tasks", value: tasks.length },
							{ name: "Required", value: tasks.filter((t) => t.isRequired).length },
							{ name: "Optional", value: tasks.filter((t) => !t.isRequired).length },
							{
								name: "Platforms",
								value: new Set(
									tasks
										.map((t) => t.taskTemplate?.platformName || extractPlatformFromText(t.taskTemplate?.name || ""))
										.filter(Boolean),
								).size,
							},
						]}
						columns={4}
					/>

					{/* Task Cards */}
					{tasksLoading ? (
						<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
							{[1, 2].map((i) => (
								<div
									key={i}
									className="overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
								>
									<div className="flex items-start gap-3 p-3.5 sm:p-4">
										<div className="size-9 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
										<div className="min-w-0 flex-1 space-y-2">
											<div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
											<div className="h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
										</div>
									</div>
								</div>
							))}
						</div>
					) : tasks.length === 0 ? (
						<EmptyState
							title="No tasks configured"
							description="Add tasks that shoppers must complete for this campaign"
						/>
					) : (
						<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
							{tasks.map((task, idx) => {
								const taskPlatform =
									task.taskTemplate?.platformName || extractPlatformFromText(task.taskTemplate?.name || "");
								const TaskIcon = taskPlatform ? getPlatformIcon(taskPlatform) : null;
								return (
									<div
										key={task.id}
										className="group relative overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 transition-all hover:ring-zinc-300 hover:shadow-md dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
									>
										{/* Main content */}
										<div className="flex items-start gap-3 p-3.5 sm:p-4">
											{/* Gradient platform icon with step number */}
											<div className="relative shrink-0">
												<div
													className={`flex size-10 items-center justify-center rounded-full bg-gradient-to-br ${getPlatformGradient(taskPlatform || "")}`}
												>
													{TaskIcon ? (
														<TaskIcon className="size-4.5 text-white" />
													) : (
														<ClipboardDocumentListIcon className="size-4.5 text-white" />
													)}
												</div>
												<span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white ring-2 ring-white dark:bg-white dark:text-zinc-900 dark:ring-zinc-900">
													{idx + 1}
												</span>
											</div>
											{/* Content */}
											<div className="min-w-0 flex-1">
												<div className="flex items-start justify-between gap-2">
													<p className="text-sm font-semibold text-zinc-900 dark:text-white">
														{task.taskTemplate?.name || `Task #${idx + 1}`}
													</p>
													{task.isRequired ? (
														<span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
															Required
														</span>
													) : (
														<span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
															Optional
														</span>
													)}
												</div>
												{task.instructions && (
													<p className="mt-1 text-xs leading-relaxed text-zinc-500 line-clamp-2 dark:text-zinc-400">
														{task.instructions}
													</p>
												)}
												{/* Requirements badges */}
												{(task.requirements?.requiredHashtags?.length ||
													task.requirements?.requiredMentions?.length ||
													task.requirements?.requirePhotosInReview ||
													task.requirements?.requireVideosInReview ||
													task.requirements?.minWordCount ||
													task.requirements?.minRating ||
													task.requirements?.minDuration ||
													task.requirements?.maxDuration) && (
													<div className="mt-2 flex flex-wrap items-center gap-1.5">
														{task.requirements?.requiredHashtags?.map((t) => (
															<Badge key={t} color="sky" className="text-[10px]">
																#{t}
															</Badge>
														))}
														{task.requirements?.requiredMentions?.map((m) => (
															<Badge key={m} color="violet" className="text-[10px]">
																@{m}
															</Badge>
														))}
														{task.requirements?.requirePhotosInReview && (
															<Badge color="amber" className="text-[10px]">
																Photos{task.requirements.minPhotos ? ` (${task.requirements.minPhotos}+)` : ""}
															</Badge>
														)}
														{task.requirements?.requireVideosInReview && (
															<Badge color="rose" className="text-[10px]">
																Videos{task.requirements.minVideos ? ` (${task.requirements.minVideos}+)` : ""}
															</Badge>
														)}
														{task.requirements?.minWordCount ? (
															<Badge color="zinc" className="text-[10px]">
																{task.requirements.minWordCount}+ words
															</Badge>
														) : null}
														{task.requirements?.minRating ? (
															<Badge color="emerald" className="text-[10px]">
																{task.requirements.minRating}+ stars
															</Badge>
														) : null}
														{task.requirements?.minDuration || task.requirements?.maxDuration ? (
															<Badge color="zinc" className="text-[10px]">
																{task.requirements.minDuration ? `${task.requirements.minDuration}s` : ""}
																{task.requirements.minDuration && task.requirements.maxDuration ? "–" : ""}
																{task.requirements.maxDuration ? `${task.requirements.maxDuration}s` : ""}
															</Badge>
														) : null}
													</div>
												)}
											</div>
										</div>

										{/* Edit/Remove actions — floating top-right */}
										{canUpdateCampaign && ["draft", "rejected", "paused"].includes(campaign.status) && (
											<div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-lg bg-white/80 p-0.5 opacity-0 shadow-sm ring-1 ring-zinc-200 backdrop-blur-sm transition-opacity group-hover:opacity-100 dark:bg-zinc-900/80 dark:ring-zinc-700">
												<button
													type="button"
													onClick={() => {
														setEditingTaskId(task.id);
														setEditingTaskInstructions(task.instructions || "");
														setEditingTaskRequirements(task.requirements || {});
														setEditingTaskCategory(task.taskTemplate?.category);
														setHashtagInput("");
														setMentionInput("");
													}}
													className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
													title="Edit task"
												>
													<PencilIcon className="size-3.5" />
												</button>
												<button
													type="button"
													onClick={() => {
														removeTask.mutate(task.id, {
															onSuccess: () => showToast.success("Task removed"),
															onError: (err) => showToast.error(err, "Failed to remove task"),
														});
													}}
													disabled={removeTask.isPending}
													className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
													title="Remove task"
												>
													<TrashIcon className="size-3.5" />
												</button>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
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

			{/* Edit Task Dialog */}
			<Dialog open={!!editingTaskId} onClose={() => setEditingTaskId(null)} size="lg">
				<DialogHeader
					icon={PencilSquareIcon}
					iconColor="amber"
					title="Edit Task"
					description="Update task instructions and requirements"
					onClose={() => setEditingTaskId(null)}
				/>
				<DialogBody>
					<div className="space-y-4">
						{/* Instructions */}
						<Field>
							<Label>Instructions</Label>
							<Textarea
								value={editingTaskInstructions}
								onChange={(e) => setEditingTaskInstructions(e.target.value)}
								placeholder="Specific instructions for the creator…"
								rows={3}
								resizable={false}
							/>
						</Field>

						{/* Social Media */}
						{(!editingTaskCategory || editingTaskCategory === "social" || editingTaskCategory === "video") && (
							<div className="space-y-2">
								<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
									Social Media
								</p>
								<Field>
									<Label>Required Hashtags</Label>
									<div className="flex gap-2">
										<Input
											type="text"
											value={hashtagInput}
											onChange={(e) => setHashtagInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													const tag = hashtagInput.trim().replace(/^#/, "");
													if (tag && !editingTaskRequirements.requiredHashtags?.includes(tag)) {
														setEditingTaskRequirements((prev) => ({
															...prev,
															requiredHashtags: [...(prev.requiredHashtags || []), tag],
														}));
														setHashtagInput("");
													}
												}
											}}
											placeholder="#hashtag"
										/>
										<Button
											type="button"
											outline
											onClick={() => {
												const tag = hashtagInput.trim().replace(/^#/, "");
												if (tag && !editingTaskRequirements.requiredHashtags?.includes(tag)) {
													setEditingTaskRequirements((prev) => ({
														...prev,
														requiredHashtags: [...(prev.requiredHashtags || []), tag],
													}));
													setHashtagInput("");
												}
											}}
										>
											<PlusIcon className="size-4" />
										</Button>
									</div>
									{(editingTaskRequirements.requiredHashtags?.length ?? 0) > 0 && (
										<div className="mt-1.5 flex flex-wrap gap-1.5">
											{editingTaskRequirements.requiredHashtags?.map((tag) => (
												<FilterChip
													key={tag}
													label={`#${tag}`}
													onRemove={() =>
														setEditingTaskRequirements((prev) => ({
															...prev,
															requiredHashtags: prev.requiredHashtags?.filter((t) => t !== tag) || [],
														}))
													}
												/>
											))}
										</div>
									)}
								</Field>
								<Field>
									<Label>Required Mentions</Label>
									<div className="flex gap-2">
										<Input
											type="text"
											value={mentionInput}
											onChange={(e) => setMentionInput(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													const mention = mentionInput.trim().replace(/^@/, "");
													if (mention && !editingTaskRequirements.requiredMentions?.includes(mention)) {
														setEditingTaskRequirements((prev) => ({
															...prev,
															requiredMentions: [...(prev.requiredMentions || []), mention],
														}));
														setMentionInput("");
													}
												}
											}}
											placeholder="@username"
										/>
										<Button
											type="button"
											outline
											onClick={() => {
												const mention = mentionInput.trim().replace(/^@/, "");
												if (mention && !editingTaskRequirements.requiredMentions?.includes(mention)) {
													setEditingTaskRequirements((prev) => ({
														...prev,
														requiredMentions: [...(prev.requiredMentions || []), mention],
													}));
													setMentionInput("");
												}
											}}
										>
											<PlusIcon className="size-4" />
										</Button>
									</div>
									{(editingTaskRequirements.requiredMentions?.length ?? 0) > 0 && (
										<div className="mt-1.5 flex flex-wrap gap-1.5">
											{editingTaskRequirements.requiredMentions?.map((m) => (
												<FilterChip
													key={m}
													label={`@${m}`}
													onRemove={() =>
														setEditingTaskRequirements((prev) => ({
															...prev,
															requiredMentions: prev.requiredMentions?.filter((t) => t !== m) || [],
														}))
													}
												/>
											))}
										</div>
									)}
								</Field>
							</div>
						)}

						{/* Content Requirements */}
						{(!editingTaskCategory || editingTaskCategory === "review" || editingTaskCategory === "feedback") && (
							<div className="space-y-2">
								<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
									Content
								</p>
								<div className="grid grid-cols-2 gap-3">
									<Field>
										<Label>Min Word Count</Label>
										<NumberInput
											value={editingTaskRequirements.minWordCount ?? undefined}
											onValueChange={(v) =>
												setEditingTaskRequirements((prev) => ({ ...prev, minWordCount: v.floatValue }))
											}
											allowNegative={false}
											decimalScale={0}
											placeholder="0"
										/>
									</Field>
									<Field>
										<Label>Min Rating</Label>
										<Select
											value={editingTaskRequirements.minRating?.toString() ?? ""}
											onChange={(e) =>
												setEditingTaskRequirements((prev) => ({
													...prev,
													minRating: e.target.value ? Number(e.target.value) : undefined,
												}))
											}
										>
											<option value="">None</option>
											<option value="1">1 Star</option>
											<option value="2">2 Stars</option>
											<option value="3">3 Stars</option>
											<option value="4">4 Stars</option>
											<option value="5">5 Stars</option>
										</Select>
									</Field>
								</div>
							</div>
						)}

						{/* Media Requirements */}
						{(!editingTaskCategory ||
							editingTaskCategory === "review" ||
							editingTaskCategory === "feedback" ||
							editingTaskCategory === "photo") && (
							<div className="space-y-3">
								<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
									Media
								</p>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Require Photos</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">Creator must include photos in review</p>
									</div>
									<Switch
										color="emerald"
										checked={editingTaskRequirements.requirePhotosInReview ?? false}
										onChange={(v) => setEditingTaskRequirements((prev) => ({ ...prev, requirePhotosInReview: v }))}
									/>
								</div>
								{editingTaskRequirements.requirePhotosInReview && (
									<Field>
										<Label>Min Photos</Label>
										<NumberInput
											value={editingTaskRequirements.minPhotos ?? undefined}
											onValueChange={(v) =>
												setEditingTaskRequirements((prev) => ({ ...prev, minPhotos: v.floatValue }))
											}
											allowNegative={false}
											decimalScale={0}
											placeholder="1"
										/>
									</Field>
								)}
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Require Videos</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">Creator must include videos in review</p>
									</div>
									<Switch
										color="emerald"
										checked={editingTaskRequirements.requireVideosInReview ?? false}
										onChange={(v) => setEditingTaskRequirements((prev) => ({ ...prev, requireVideosInReview: v }))}
									/>
								</div>
								{editingTaskRequirements.requireVideosInReview && (
									<Field>
										<Label>Min Videos</Label>
										<NumberInput
											value={editingTaskRequirements.minVideos ?? undefined}
											onValueChange={(v) =>
												setEditingTaskRequirements((prev) => ({ ...prev, minVideos: v.floatValue }))
											}
											allowNegative={false}
											decimalScale={0}
											placeholder="1"
										/>
									</Field>
								)}
							</div>
						)}

						{/* Duration */}
						{(!editingTaskCategory || editingTaskCategory === "social" || editingTaskCategory === "video") && (
							<div className="space-y-2">
								<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
									Duration (seconds)
								</p>
								<div className="grid grid-cols-2 gap-3">
									<Field>
										<Label>Min Duration</Label>
										<NumberInput
											value={editingTaskRequirements.minDuration ?? undefined}
											onValueChange={(v) =>
												setEditingTaskRequirements((prev) => ({ ...prev, minDuration: v.floatValue }))
											}
											allowNegative={false}
											decimalScale={0}
											placeholder="0"
										/>
									</Field>
									<Field>
										<Label>Max Duration</Label>
										<NumberInput
											value={editingTaskRequirements.maxDuration ?? undefined}
											onValueChange={(v) =>
												setEditingTaskRequirements((prev) => ({ ...prev, maxDuration: v.floatValue }))
											}
											allowNegative={false}
											decimalScale={0}
											placeholder="0"
										/>
									</Field>
								</div>
							</div>
						)}

						{/* Seller Instructions */}
						<Field>
							<Label>Seller Instructions</Label>
							<Description>Additional instructions visible only to the brand</Description>
							<Textarea
								value={editingTaskRequirements.sellerInstructions ?? ""}
								onChange={(e) =>
									setEditingTaskRequirements((prev) => ({ ...prev, sellerInstructions: e.target.value }))
								}
								placeholder="Internal notes about this task…"
								rows={2}
								resizable={false}
							/>
						</Field>
					</div>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setEditingTaskId(null)}>
						Cancel
					</Button>
					<Button
						color="emerald"
						disabled={updateTask.isPending}
						onClick={() => {
							if (!editingTaskId) return;
							// Build clean requirements object
							const req: db.TaskRequirements = {};
							if (editingTaskRequirements.requiredHashtags?.length)
								req.requiredHashtags = editingTaskRequirements.requiredHashtags;
							if (editingTaskRequirements.requiredMentions?.length)
								req.requiredMentions = editingTaskRequirements.requiredMentions;
							if (editingTaskRequirements.minRating) req.minRating = editingTaskRequirements.minRating;
							if (editingTaskRequirements.minWordCount) req.minWordCount = editingTaskRequirements.minWordCount;
							if (editingTaskRequirements.requirePhotosInReview) req.requirePhotosInReview = true;
							if (editingTaskRequirements.requireVideosInReview) req.requireVideosInReview = true;
							if (editingTaskRequirements.minPhotos) req.minPhotos = editingTaskRequirements.minPhotos;
							if (editingTaskRequirements.minVideos) req.minVideos = editingTaskRequirements.minVideos;
							if (editingTaskRequirements.minDuration) req.minDuration = editingTaskRequirements.minDuration;
							if (editingTaskRequirements.maxDuration) req.maxDuration = editingTaskRequirements.maxDuration;
							if (editingTaskRequirements.sellerInstructions?.trim())
								req.sellerInstructions = editingTaskRequirements.sellerInstructions.trim();

							const hasRequirements = Object.keys(req).length > 0;

							updateTask.mutate(
								{
									taskId: editingTaskId,
									instructions: editingTaskInstructions || undefined,
									requirements: hasRequirements ? req : undefined,
								},
								{
									onSuccess: () => {
										showToast.success("Task updated");
										setEditingTaskId(null);
									},
									onError: (err) => showToast.error(err, "Failed to update task"),
								}
							);
						}}
					>
						{updateTask.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Add Task Template Picker */}
			<Dialog
				open={showAddTaskPicker}
				onClose={() => {
					setShowAddTaskPicker(false);
					setAddTaskTemplateId("");
					setAddTaskPlatformId("");
				}}
				size="sm"
			>
				<DialogHeader
					icon={PlusIcon}
					iconColor="emerald"
					title="Add Task"
					description="Select a platform and task type to add"
					onClose={() => {
						setShowAddTaskPicker(false);
						setAddTaskTemplateId("");
						setAddTaskPlatformId("");
					}}
				/>
				<DialogBody className="space-y-4">
					<Field>
						<Label>Platform</Label>
						<Select
							value={addTaskPlatformId}
							onChange={(e) => {
								setAddTaskPlatformId(e.target.value);
								setAddTaskTemplateId("");
							}}
						>
							<option value="">All platforms</option>
							{platforms.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name}
								</option>
							))}
						</Select>
					</Field>
					<Field>
						<Label>Task Type</Label>
						{filteredTemplates.length === 0 ? (
							<Select disabled>
								<option>{addTaskPlatformId ? "No tasks for this platform" : "Select a platform first"}</option>
							</Select>
						) : (
							<Select value={addTaskTemplateId} onChange={(e) => setAddTaskTemplateId(e.target.value)}>
								<option value="" disabled>
									Select task type…
								</option>
								{filteredTemplates.map((tpl) => {
									const alreadyAdded = tasks.some((t) => t.taskTemplate?.id === tpl.id);
									return (
										<option key={tpl.id} value={tpl.id} disabled={alreadyAdded}>
											{tpl.name}
											{alreadyAdded ? " (already added)" : ""}
										</option>
									);
								})}
							</Select>
						)}
					</Field>
				</DialogBody>
				<DialogActions>
					<Button
						plain
						onClick={() => {
							setShowAddTaskPicker(false);
							setAddTaskTemplateId("");
							setAddTaskPlatformId("");
						}}
					>
						Cancel
					</Button>
					<Button
						color="emerald"
						disabled={!addTaskTemplateId || addTask.isPending}
						onClick={() => {
							addTask.mutate(
								{ taskTemplateId: addTaskTemplateId, isRequired: false },
								{
									onSuccess: () => {
										showToast.success("Task added");
										setShowAddTaskPicker(false);
										setAddTaskTemplateId("");
										setAddTaskPlatformId("");
									},
									onError: (err) => showToast.error(err, "Failed to add task"),
								}
							);
						}}
					>
						{addTask.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Adding...
							</>
						) : (
							<>
								<PlusIcon className="size-4" />
								Add Task
							</>
						)}
					</Button>
				</DialogActions>
			</Dialog>

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

// =============================================================================
// CAMPAIGN TIMELINE
// =============================================================================

function CampaignTimeline({ campaign }: { campaign: brand.CampaignWithStats }) {
	const formatDateTime = (dateStr?: string) => {
		if (!dateStr) return "";
		return new Date(dateStr).toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const events: Array<{
		label: string;
		date: string;
		icon: typeof CheckCircleIcon;
		iconBg: string;
		description?: string;
	}> = [];

	events.push({
		label: "Created",
		date: campaign.createdAt,
		icon: ClipboardDocumentListIcon,
		iconBg: "bg-zinc-400 dark:bg-zinc-500",
	});

	if (
		campaign.status === "pending_approval" ||
		campaign.status === "approved" ||
		campaign.status === "active" ||
		campaign.status === "paused" ||
		campaign.status === "ended"
	) {
		events.push({
			label: "Submitted",
			date: campaign.updatedAt,
			icon: PaperAirplaneIcon,
			iconBg: "bg-sky-500",
		});
	}

	if (campaign.status === "rejected" && campaign.rejectionReason) {
		events.push({
			label: "Rejected",
			date: campaign.updatedAt,
			icon: XCircleIcon,
			iconBg: "bg-red-500",
			description: campaign.rejectionReason,
		});
	}

	if (campaign.status === "active" || campaign.status === "paused" || campaign.status === "ended") {
		const startDate = new Date(campaign.startDate);
		if (startDate <= new Date()) {
			events.push({
				label: "Started",
				date: campaign.startDate,
				icon: PlayCircleIcon,
				iconBg: "bg-emerald-500",
			});
		}
	}

	if (campaign.status === "paused") {
		events.push({
			label: "Paused",
			date: campaign.updatedAt,
			icon: PauseCircleIcon,
			iconBg: "bg-amber-500",
		});
	}

	if (campaign.status === "ended") {
		events.push({
			label: "Ended",
			date: campaign.endDate,
			icon: CheckCircleIcon,
			iconBg: "bg-zinc-500",
		});
	}

	events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return (
		<div className="relative">
			{events.map((event, index) => {
				const isLast = index === events.length - 1;
				const Icon = event.icon;
				return (
					<div key={`${event.label}-${event.date}`} className="relative flex gap-3 pb-4 last:pb-0">
						{!isLast && (
							<div className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-zinc-200 dark:bg-zinc-700" />
						)}
						<div
							className={clsx(
								"relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
								event.iconBg
							)}
						>
							<Icon className="size-3 text-white" />
						</div>
						<div className="min-w-0 flex-1 pt-0.5">
							<p className="text-sm font-medium text-zinc-900 dark:text-white">{event.label}</p>
							{event.description && <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{event.description}</p>}
							<p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">{formatDateTime(event.date)}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
