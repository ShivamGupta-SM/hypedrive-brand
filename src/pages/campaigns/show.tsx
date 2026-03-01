import * as Headless from "@headlessui/react";
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
	PlayCircleIcon,
	PlusIcon,
	SparklesIcon,
	StopCircleIcon,
	TrashIcon,
	UserGroupIcon,
	XCircleIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiTable } from "react-icons/fi";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { EnrollmentCardCompact } from "@/components/enrollment-card";
import { Description, Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { extractPlatformFromText, getPlatformColor, getPlatformIcon } from "@/components/icons/platform-icons";
import { Input } from "@/components/input";
import { Link } from "@/components/link";
import { NumberInput } from "@/components/number-input";
import { Select } from "@/components/select";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";
import { Switch } from "@/components/switch";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import {
	getAPIErrorMessage,
	useAddCampaignTask,
	useApproveEnrollment,
	useArchiveCampaign,
	useCampaign,
	useCampaignEnrollments,
	useCampaignStats,
	useCampaignTasks,
	useConfetti,
	useCurrentOrganization,
	useEndCampaign,
	useExportEnrollments,
	usePauseCampaign,
	usePlatforms,
	useRejectEnrollment,
	useRemoveCampaignTask,
	useResumeCampaign,
	useSubmitCampaign,
	useTaskTemplates,
	useUpdateCampaign,
	useUpdateCampaignTask,
} from "@/hooks";
import { useOrgPath, useOrgSlug } from "@/hooks/use-org-slug";
import type { brand, db } from "@/lib/brand-client";
import { formatCurrency } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";
import { useCan } from "@/store/permissions-store";

const routeApi = getRouteApi("/_app/$orgSlug/campaigns_/$id");

type CampaignStatus = db.CampaignStatus;
type CampaignEnrollment = brand.EnrollmentWithRelations;
type EnrollmentStatus = db.EnrollmentStatus;

// =============================================================================
// STATUS CONFIG
// =============================================================================

function getStatusConfig(status: CampaignStatus): {
	label: string;
	icon: typeof CheckCircleIcon;
	color: "lime" | "sky" | "amber" | "zinc" | "emerald" | "red";
} {
	const statusMap: Record<
		string,
		{
			label: string;
			icon: typeof CheckCircleIcon;
			color: "lime" | "sky" | "amber" | "zinc" | "emerald" | "red";
		}
	> = {
		active: { label: "Active", icon: PlayCircleIcon, color: "lime" },
		draft: { label: "Draft", icon: ClockIcon, color: "zinc" },
		pending_approval: { label: "Pending", icon: ClockIcon, color: "amber" },
		approved: { label: "Approved", icon: CheckCircleIcon, color: "sky" },
		paused: { label: "Paused", icon: PauseCircleIcon, color: "amber" },
		ended: { label: "Ended", icon: CheckCircleIcon, color: "zinc" },
		completed: { label: "Completed", icon: CheckCircleIcon, color: "emerald" },
		cancelled: { label: "Cancelled", icon: XCircleIcon, color: "red" },
		rejected: { label: "Rejected", icon: XCircleIcon, color: "red" },
		expired: { label: "Expired", icon: ClockIcon, color: "zinc" },
		archived: { label: "Archived", icon: ClockIcon, color: "zinc" },
	};
	return statusMap[status] || { label: status, icon: ClockIcon, color: "zinc" };
}

const CAMPAIGN_TYPE_CONFIG: Record<
	string,
	{ label: string; color: "emerald" | "amber" | "sky"; icon: typeof CurrencyRupeeIcon }
> = {
	cashback: { label: "Cashback", color: "emerald", icon: CurrencyRupeeIcon },
	barter: { label: "Barter", color: "amber", icon: ArrowsRightLeftIcon },
	hybrid: { label: "Hybrid", color: "sky", icon: SparklesIcon },
};

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
				<ExclamationTriangleIcon className="size-8 text-red-400" />
			</div>
			<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">Something went wrong</p>
			<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
				Failed to load campaign details. Please try again.
			</p>
			<Button className="mt-6" onClick={onRetry} color="dark/zinc">
				<ArrowPathIcon className="size-4" />
				Try Again
			</Button>
		</div>
	);
}

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
					{ name: "Total Enrollments", value: "" },
					{ name: "Approved", value: "" },
					{ name: "Pending Review", value: "" },
					{ name: "Total Order Value", value: "" },
				]}
				loading
				columns={4}
			/>

			{/* Progress Cards */}
			<div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
				{[1, 2].map((i) => (
					<div
						key={i}
						className="rounded-xl bg-white p-3.5 sm:p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
					>
						<div className="flex items-center justify-between mb-3">
							<Skeleton width={120} height={14} borderRadius={6} />
							<Skeleton width={60} height={14} borderRadius={6} />
						</div>
						<Skeleton width="100%" height={8} borderRadius={4} />
						<Skeleton width={100} height={10} borderRadius={4} className="mt-2" />
					</div>
				))}
			</div>

			{/* Content Grid */}
			<div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2 space-y-4 sm:space-y-6">
					<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<div className="border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
							<Skeleton width={140} height={16} />
						</div>
						<div className="space-y-3 p-3.5 sm:p-5">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} width="100%" height={36} borderRadius={8} />
							))}
						</div>
					</div>
				</div>
				<div className="space-y-4 sm:space-y-6">
					<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<div className="border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
							<Skeleton width={120} height={16} />
						</div>
						<div className="space-y-2 p-3.5 sm:p-4">
							{[1, 2, 3, 4].map((i) => (
								<Skeleton key={i} width="100%" height={32} borderRadius={6} />
							))}
						</div>
					</div>
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
			console.error("Failed to update campaign:", getAPIErrorMessage(err));
		}
	}, [formData, organizationId, campaign, updateCampaign, onSuccess, onClose, validateStep]);

	const resetAndClose = useCallback(() => {
		setStep(1);
		setErrors({});
		onClose();
	}, [onClose]);

	if (!campaign) return null;

	return (
		<Headless.Dialog open={isOpen} onClose={resetAndClose} className="relative z-50">
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 bg-black/40 backdrop-blur-sm transition duration-200 ease-out data-closed:opacity-0"
			/>

			<div className="fixed inset-0 overflow-y-auto">
				<div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
					<Headless.DialogPanel
						transition
						className="w-full max-w-lg rounded-t-2xl bg-white transition duration-300 ease-out data-closed:translate-y-full sm:rounded-2xl sm:data-closed:translate-y-8 sm:data-closed:scale-95 dark:bg-zinc-900"
					>
						{/* Handle - mobile only */}
						<div className="flex justify-center py-3 sm:hidden">
							<div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
						</div>

						{/* Header */}
						<div className="flex items-center justify-between border-b border-zinc-200 px-5 pb-4 pt-2 sm:pt-5 dark:border-zinc-800">
							<div>
								<Headless.DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
									Edit Campaign
								</Headless.DialogTitle>
								<p className="mt-0.5 text-sm text-zinc-500">
									Step {step} of 2 · {EDIT_STEPS[step - 1].description}
								</p>
							</div>
							<button
								type="button"
								onClick={resetAndClose}
								className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
							>
								<XMarkIcon className="size-5" />
							</button>
						</div>

						{/* Progress Steps */}
						<div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
							<div className="flex items-center justify-center gap-4">
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
						</div>

						{/* Content */}
						<div className="max-h-[60vh] overflow-y-auto p-5">
							{/* Step 1: Campaign Details */}
							{step === 1 && (
								<div className="space-y-4">
									<div>
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
											Campaign Title <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											value={formData.title}
											onChange={(e) => updateField("title", e.target.value)}
											placeholder="e.g., Summer Sale Campaign"
											className={clsx(
												"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white",
												errors.title
													? "border-red-300 focus:border-red-500"
													: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
											)}
										/>
										{errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
									</div>

									<div>
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">Description</label>
										<textarea
											value={formData.description}
											onChange={(e) => updateField("description", e.target.value)}
											placeholder="Describe your campaign..."
											rows={3}
											className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
										/>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
												Start Date <span className="text-red-500">*</span>
											</label>
											<input
												type="date"
												value={formData.startDate}
												onChange={(e) => updateField("startDate", e.target.value)}
												className={clsx(
													"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none dark:bg-zinc-800 dark:text-white",
													errors.startDate
														? "border-red-300 focus:border-red-500"
														: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
												)}
											/>
											{errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
										</div>
										<div>
											<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
												End Date <span className="text-red-500">*</span>
											</label>
											<input
												type="date"
												value={formData.endDate}
												onChange={(e) => updateField("endDate", e.target.value)}
												min={formData.startDate}
												className={clsx(
													"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none dark:bg-zinc-800 dark:text-white",
													errors.endDate
														? "border-red-300 focus:border-red-500"
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
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
											Campaign Type
										</label>
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
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
											Max Enrollments
										</label>
										<input
											type="number"
											value={formData.maxEnrollments}
											onChange={(e) => updateField("maxEnrollments", parseInt(e.target.value) || 0)}
											min={1}
											className={clsx(
												"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 focus:outline-none dark:bg-zinc-800 dark:text-white",
												errors.maxEnrollments
													? "border-red-300 focus:border-red-500"
													: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
											)}
										/>
										{errors.maxEnrollments && <p className="mt-1 text-sm text-red-500">{errors.maxEnrollments}</p>}
										{/* Note: Current enrollment count is from stats, not campaign object */}
									</div>

									<div>
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">Visibility</label>
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
															formData.isPublic ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-500"
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
															!formData.isPublic ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-500"
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

						{/* Footer */}
						<div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
							<div>
								{step > 1 && (
									<Button outline onClick={handleBack}>
										<ChevronLeftIcon className="size-4" />
										Back
									</Button>
								)}
							</div>
							<div className="flex gap-2">
								<Button outline onClick={resetAndClose}>
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
							</div>
						</div>
					</Headless.DialogPanel>
				</div>
			</div>
		</Headless.Dialog>
	);
}

// =============================================================================
// ENROLLMENT REVIEW DIALOG
// =============================================================================

function EnrollmentReviewDialog({
	open,
	onClose,
	enrollment,
	organizationId,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	enrollment: CampaignEnrollment | null;
	organizationId: string;
	onSuccess: () => void;
}) {
	const [rejectReason, setRejectReason] = useState("");
	const [error, setError] = useState<string | null>(null);

	const approveEnrollment = useApproveEnrollment(organizationId);
	const rejectEnrollment = useRejectEnrollment(organizationId);

	const handleApprove = async () => {
		if (!enrollment) return;
		setError(null);
		try {
			await approveEnrollment.mutateAsync({
				enrollmentId: enrollment.id,
			});
			onSuccess();
			onClose();
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to approve enrollment"));
		}
	};

	const handleReject = async () => {
		if (!enrollment || !rejectReason.trim()) return;
		setError(null);
		try {
			await rejectEnrollment.mutateAsync({
				enrollmentId: enrollment.id,
				reason: rejectReason,
			});
			onSuccess();
			onClose();
			setRejectReason("");
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to reject enrollment"));
		}
	};

	if (!enrollment) return null;

	const isPending = approveEnrollment.isPending || rejectEnrollment.isPending;

	return (
		<Dialog open={open} onClose={onClose} size="md">
			<DialogTitle>Review Enrollment</DialogTitle>
			<DialogDescription>Review this enrollment request.</DialogDescription>

			<DialogBody>
				{error && (
					<div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
					</div>
				)}

				<div className="space-y-4">
					{/* Enrollment Details */}
					<div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Enrollment</p>
								<p className="mt-1 font-mono text-sm font-medium text-zinc-900 dark:text-white">{enrollment.displayId}</p>
							</div>
							<div>
								<p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Order Value</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{formatCurrency(enrollment.orderValueDecimal)}
								</p>
							</div>
							<div>
								<p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Bill Rate</p>
								<p className="mt-1 font-medium text-emerald-600 dark:text-emerald-400">{enrollment.lockedBillRate}%</p>
							</div>
							<div>
								<p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">Created</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{enrollment.createdAt
										? new Date(enrollment.createdAt).toLocaleDateString("en-IN", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})
										: "—"}
								</p>
							</div>
						</div>
					</div>

					{/* Reject Reason */}
					<div>
						<label htmlFor="reject-reason" className="block text-sm font-medium text-zinc-900 dark:text-white">
							Rejection Reason (required to reject)
						</label>
						<Textarea
							id="reject-reason"
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder="Enter reason for rejection..."
							rows={3}
							className="mt-2"
						/>
					</div>
				</div>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose} disabled={isPending}>
					Cancel
				</Button>
				<Button color="red" onClick={handleReject} disabled={isPending || !rejectReason.trim()}>
					{rejectEnrollment.isPending ? "Rejecting..." : "Reject"}
				</Button>
				<Button color="emerald" onClick={handleApprove} disabled={isPending}>
					{approveEnrollment.isPending ? "Approving..." : "Approve"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// CAMPAIGN SHOW PAGE
// =============================================================================

export function CampaignShow() {
	const { id: campaignId } = routeApi.useParams();
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgSlug = useOrgSlug();
	const orgPath = useOrgPath();

	// Permission checks
	const canUpdateCampaign = useCan("campaign", "update");
	const canApproveEnrollment = useCan("enrollment", "approve");

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
	const { data: taskTemplates } = useTaskTemplates(
		addTaskPlatformId ? { platformId: addTaskPlatformId } : undefined
	);

	const [selectedEnrollment, setSelectedEnrollment] = useState<CampaignEnrollment | null>(null);
	const [showReviewDialog, setShowReviewDialog] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showAddTaskPicker, setShowAddTaskPicker] = useState(false);
	const [addTaskTemplateId, setAddTaskTemplateId] = useState("");
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editingTaskInstructions, setEditingTaskInstructions] = useState("");
	const [editingTaskRequirements, setEditingTaskRequirements] = useState<db.TaskRequirements>({});
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
			refetchCampaign();
		} catch (err) {
			showToast.error(err, "Failed to submit campaign");
		}
	};

	const handlePause = async () => {
		if (!organizationId || !campaignId) return;
		try {
			await pauseCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign paused");
			refetchCampaign();
		} catch (err) {
			showToast.error(err, "Failed to pause campaign");
		}
	};

	const handleResume = async () => {
		if (!organizationId || !campaignId) return;
		try {
			await resumeCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign resumed");
			refetchCampaign();
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
			refetchCampaign();
		} catch (err) {
			showToast.error(err, "Failed to end campaign");
		}
	};

	const handleArchive = async () => {
		if (!organizationId || !campaignId) return;
		try {
			await archiveCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign archived");
			refetchCampaign();
		} catch (err) {
			showToast.error(err, "Failed to archive campaign");
		}
	};

	const handleEnrollmentClick = (enrollment: CampaignEnrollment) => {
		// Only allow opening review dialog if user has approve permission
		if (enrollment.status === "awaiting_review" && canApproveEnrollment) {
			setSelectedEnrollment(enrollment);
			setShowReviewDialog(true);
		}
	};

	const handleReviewSuccess = () => {
		refetchEnrollments();
		refetchStats();
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
		return <ErrorState onRetry={handleRefetch} />;
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
		{ key: "overview" as const, label: "Overview", icon: ChartBarIcon },
		{ key: "enrollments" as const, label: "Enrollments", icon: UserGroupIcon, count: enrollments.length },
		{ key: "tasks" as const, label: "Tasks", icon: ClipboardDocumentListIcon, count: tasks.length },
	];

	return (
		<div className="space-y-4 sm:space-y-5">
			{/* Back button */}
			<Button href={orgPath("/campaigns")} color="zinc">
				<ChevronLeftIcon className="size-4" />
				Campaigns
			</Button>

			{/* Header Card */}
			<header className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="p-4 sm:p-5">
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
										<span className="truncate">{campaign.listing.name}</span>
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
								<CalendarIcon className="size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
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
					<div className="flex items-center gap-2 border-t border-zinc-100 px-4 py-2.5 sm:px-5 dark:border-zinc-800">
						{/* Primary actions — solid colored */}
						{campaign.status === "draft" && (
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
						{campaign.status === "active" && (
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
						{campaign.status === "paused" && (
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
						{(campaign.status === "ended" || campaign.status === "cancelled") && (
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
							{campaign.status === "active" && (
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
			<div className="-mx-1 flex gap-1 sm:gap-1.5 overflow-x-auto px-1 py-0.5 scrollbar-none">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.key;
					return (
						<button
							key={tab.key}
							type="button"
							onClick={() => setActiveTab(tab.key)}
							className={clsx(
								"inline-flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium ring-1 transition-all duration-200",
								isActive
									? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
									: "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 active:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-700"
							)}
						>
							<Icon
								className={clsx("size-3.5 sm:size-4", isActive ? "text-white dark:text-zinc-900" : "text-zinc-400")}
							/>
							{tab.label}
							{tab.count !== undefined && tab.count > 0 && (
								<span
									className={clsx(
										"inline-flex h-4 sm:h-4.5 min-w-4 sm:min-w-4.5 items-center justify-center rounded-full px-1 text-[9px] sm:text-[10px] font-semibold",
										isActive
											? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
											: "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
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
				<div className="space-y-4 sm:space-y-6">
					{/* Key Metrics */}
					<FinancialStatsGridBordered
						stats={[
							{
								name: "Total Enrollments",
								value: stats?.totalEnrollments ?? 0,
								change: campaign.maxEnrollments ? `of ${campaign.maxEnrollments} max` : "no limit",
								changeType: "neutral",
							},
							{
								name: "Approved",
								value: stats?.approvedEnrollments ?? 0,
								change: "enrollments",
								changeType: "positive",
							},
							{
								name: "Pending Review",
								value: stats?.pendingEnrollments ?? 0,
								change: (stats?.pendingEnrollments ?? 0) > 0 ? "action needed" : undefined,
								changeType: (stats?.pendingEnrollments ?? 0) > 0 ? "negative" : undefined,
							},
							{ name: "Total Order Value", value: formatCurrency(stats?.totalOrderValueDecimal ?? "0") },
						]}
						columns={4}
					/>

					{/* Progress Cards */}
					<div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
						{/* Enrollment Progress */}
						<div className="rounded-xl bg-white p-3.5 sm:p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
							<div className="flex items-center justify-between">
								<span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
									<UserGroupIcon className="size-4" />
									<span className="text-xs sm:text-sm">Enrollment Progress</span>
								</span>
								<span className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white">
									{stats?.totalEnrollments ?? 0}
									{campaign.maxEnrollments ? ` / ${campaign.maxEnrollments}` : ""}
								</span>
							</div>
							<div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
								<div
									className={clsx(
										"h-full rounded-full transition-all",
										campaign.maxEnrollments
											? ((stats?.totalEnrollments ?? 0) / campaign.maxEnrollments) * 100 >= 90
												? "bg-red-500"
												: ((stats?.totalEnrollments ?? 0) / campaign.maxEnrollments) * 100 >= 70
													? "bg-amber-500"
													: "bg-emerald-500"
											: "bg-emerald-500"
									)}
									style={{
										width: campaign.maxEnrollments
											? `${Math.min(((stats?.totalEnrollments ?? 0) / campaign.maxEnrollments) * 100, 100)}%`
											: "0%",
									}}
								/>
							</div>
							<p className="mt-1.5 text-[10px] sm:text-xs text-zinc-400">
								{campaign.maxEnrollments
									? `${Math.min(Math.round(((stats?.totalEnrollments ?? 0) / campaign.maxEnrollments) * 100), 100)}% capacity used`
									: "No limit set"}
							</p>
						</div>

						{/* Duration Progress */}
						<div className="rounded-xl bg-white p-3.5 sm:p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
							<div className="flex items-center justify-between">
								<span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
									<ClockIcon className="size-4" />
									<span className="text-xs sm:text-sm">Campaign Duration</span>
								</span>
								<span className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-white">
									{daysRemaining !== null && daysRemaining > 0 ? `${daysRemaining}d left` : "\u2014"}
								</span>
							</div>
							<div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
								<div
									className="h-full rounded-full bg-sky-500 transition-all"
									style={{ width: `${timeProgress ?? 0}%` }}
								/>
							</div>
							<p className="mt-1.5 text-[10px] sm:text-xs text-zinc-400">
								{timeProgress !== null ? `${timeProgress}% time elapsed` : "Not started"}
							</p>
						</div>
					</div>

					{/* Main Content Grid */}
					<div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
						{/* Left Column */}
						<div className="space-y-4 sm:space-y-6 lg:col-span-2">
							{/* Enrollment Distribution */}
							<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
								<div className="flex items-center gap-2 border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
									<UserGroupIcon className="size-4 text-emerald-500" />
									<h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
										Enrollment Distribution
									</h3>
								</div>
								<div className="p-3.5 sm:p-5">
									<div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
										<div className="flex h-full">
											<div
												className="h-full bg-emerald-500 transition-all"
												style={{ width: `${(enrollmentDistribution.approved / enrollmentDistribution.total) * 100}%` }}
											/>
											<div
												className="h-full bg-amber-500 transition-all"
												style={{ width: `${(enrollmentDistribution.pending / enrollmentDistribution.total) * 100}%` }}
											/>
											<div
												className="h-full bg-red-500 transition-all"
												style={{ width: `${(enrollmentDistribution.rejected / enrollmentDistribution.total) * 100}%` }}
											/>
										</div>
									</div>
									<div className="mt-3 sm:mt-4 flex items-center gap-4 sm:gap-6">
										{[
											{ label: "Approved", count: enrollmentDistribution.approved, color: "bg-emerald-500" },
											{ label: "Pending", count: enrollmentDistribution.pending, color: "bg-amber-500" },
											{ label: "Rejected", count: enrollmentDistribution.rejected, color: "bg-red-500" },
										].map((item) => (
											<div key={item.label} className="flex items-center gap-2">
												<span className={`size-2 rounded-full ${item.color}`} />
												<span className="text-xs text-zinc-500 dark:text-zinc-400">{item.label}</span>
												<span className="text-xs font-bold tabular-nums text-zinc-900 dark:text-white">
													{item.count}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Financial Configuration */}
							<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
								<div className="flex items-center gap-2 border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
									<CurrencyRupeeIcon className="size-4 text-zinc-400" />
									<h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
										Financial Configuration
									</h3>
								</div>
								<div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
									<div className="p-3 sm:p-4 text-center">
										<p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Bill Rate</p>
										<p className="mt-1 text-lg sm:text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
											{campaign.billRateDecimal != null ? `${campaign.billRateDecimal}%` : "—"}
										</p>
										<p className="mt-0.5 text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">Brand Pays</p>
									</div>
									<div className="p-3 sm:p-4 text-center">
										<p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Platform Fee</p>
										<p className="mt-1 text-lg sm:text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
											{campaign.platformFeeDecimal ? formatCurrency(campaign.platformFeeDecimal) : "—"}
										</p>
										<p className="mt-0.5 text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">Per Enrollment</p>
									</div>
									<div className="p-3 sm:p-4 text-center">
										<p className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Max Slots</p>
										<p className="mt-1 text-lg sm:text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
											{campaign.maxEnrollments || "∞"}
										</p>
										<p className="mt-0.5 text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500">Enrollments</p>
									</div>
								</div>
							</div>

							{/* Recent Enrollments */}
							{enrollments.length > 0 && (
								<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
									<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
										<div className="flex items-center gap-2">
											<UserGroupIcon className="size-4 text-sky-500" />
											<h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
												Recent Enrollments
											</h3>
										</div>
										<button
											type="button"
											onClick={() => setActiveTab("enrollments")}
											className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-white"
										>
											View all &rarr;
										</button>
									</div>
									<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
										{enrollments.slice(0, 3).map((enrollment) => (
											<EnrollmentCardCompact
												key={enrollment.id}
												enrollment={enrollment}
												onClick={() => handleEnrollmentClick(enrollment)}
											/>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Right Column */}
						<div className="space-y-4 sm:space-y-6">
							{/* Campaign Details */}
							<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
								<div className="flex items-center gap-2 border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
									<CubeIcon className="size-4 text-violet-500" />
									<h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">Campaign Details</h3>
								</div>
								<div className="divide-y divide-zinc-200 dark:divide-zinc-700">
									<div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3">
										<div className="flex items-center gap-2">
											<CalendarIcon className="size-3.5 sm:size-4 shrink-0 text-zinc-400" />
											<span className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400">Duration</span>
										</div>
										<span className="text-xs sm:text-[13px] font-medium text-zinc-900 dark:text-white text-right">
											{formatDate(campaign.startDate)} &ndash; {formatDate(campaign.endDate)}
										</span>
									</div>
									<div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3">
										<div className="flex items-center gap-2">
											<CurrencyRupeeIcon className="size-3.5 sm:size-4 shrink-0 text-zinc-400" />
											<span className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400">Bill Rate</span>
										</div>
										<span className="text-xs sm:text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
											{campaign.billRateDecimal != null ? `${campaign.billRateDecimal}%` : "N/A"}
										</span>
									</div>
									<div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3">
										<div className="flex items-center gap-2">
											<ChartBarIcon className="size-3.5 sm:size-4 shrink-0 text-zinc-400" />
											<span className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400">Platform Fee</span>
										</div>
										<span className="text-xs sm:text-[13px] font-medium text-zinc-900 dark:text-white">
											{campaign.platformFeeDecimal ? formatCurrency(campaign.platformFeeDecimal) : "N/A"}
										</span>
									</div>
									<div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3">
										<div className="flex items-center gap-2">
											{campaign.isPublic ? (
												<GlobeAltIcon className="size-3.5 sm:size-4 shrink-0 text-zinc-400" />
											) : (
												<LockClosedIcon className="size-3.5 sm:size-4 shrink-0 text-zinc-400" />
											)}
											<span className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400">Visibility</span>
										</div>
										<span className="text-xs sm:text-[13px] font-medium text-zinc-900 dark:text-white">
											{campaign.isPublic ? "Public" : "Private"}
										</span>
									</div>
								</div>
							</div>

							{/* Activity Timeline */}
							<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
								<div className="flex items-center gap-2 border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
									<ClockIcon className="size-4 text-zinc-400" />
									<h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">Activity</h3>
								</div>
								<div className="p-3.5 sm:p-4">
									<CampaignTimeline campaign={campaign} />
								</div>
							</div>

							{/* Terms & Conditions */}
							{(campaign as brand.CampaignWithStats & { termsAndConditions?: string }).termsAndConditions && (
								<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
									<div className="flex items-center gap-2 border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
										<ClipboardDocumentListIcon className="size-4 text-zinc-400" />
										<h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
											Terms & Conditions
										</h3>
									</div>
									<div className="p-3.5 sm:p-4">
										<p className="whitespace-pre-wrap text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
											{(campaign as brand.CampaignWithStats & { termsAndConditions?: string }).termsAndConditions}
										</p>
									</div>
								</div>
							)}

							{/* Reference IDs */}
							<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
								<div className="flex items-center gap-2 border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
									<CubeIcon className="size-4 text-zinc-400" />
									<h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">Reference IDs</h3>
								</div>
								<div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
									<div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5">
										<span className="text-[10px] sm:text-xs text-zinc-500">Campaign</span>
										<code className="truncate rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
											{campaign.id.length > 16 ? `${campaign.id.slice(0, 8)}...${campaign.id.slice(-4)}` : campaign.id}
										</code>
									</div>
									{campaign.listing?.id && (
										<div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5">
											<span className="text-[10px] sm:text-xs text-zinc-500">Listing</span>
											<code className="truncate rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
												{campaign.listing.id.length > 16
													? `${campaign.listing.id.slice(0, 8)}...${campaign.listing.id.slice(-4)}`
													: campaign.listing.id}
											</code>
										</div>
									)}
									<div className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5">
										<span className="text-[10px] sm:text-xs text-zinc-500">Organization</span>
										<code className="truncate rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] sm:text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
											{campaign.organizationId.length > 16
												? `${campaign.organizationId.slice(0, 8)}...${campaign.organizationId.slice(-4)}`
												: campaign.organizationId}
										</code>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ============================================================= */}
			{/* ENROLLMENTS TAB */}
			{/* ============================================================= */}
			{activeTab === "enrollments" && (
				<div className="space-y-3 sm:space-y-4">
					{/* Enrollment Table */}
					<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						{/* Header */}
						<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 sm:px-4 py-2.5 sm:py-3 dark:border-zinc-700">
							<div className="flex items-center gap-2">
								<UserGroupIcon className="size-4 text-zinc-400" />
								<h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">Enrollments</h3>
								<Badge color="zinc">{enrollments.length}</Badge>
							</div>
							<div className="flex items-center gap-2">
								<Button
									color="emerald"
									onClick={async () => {
										try {
											const result = await exportEnrollments.mutateAsync({ campaignId });
											const blob = new Blob([result.csv], { type: "text/csv" });
											const url = URL.createObjectURL(blob);
											const a = document.createElement("a");
											a.href = url;
											a.download = result.filename || "enrollments.csv";
											a.click();
											URL.revokeObjectURL(url);
											showToast.success("Export downloaded");
										} catch (err) {
											showToast.error(err, "Failed to export enrollments");
										}
									}}
									disabled={exportEnrollments.isPending}
								>
									<FiTable data-slot="icon" className="size-4" />
									<span className="hidden sm:inline">
										{exportEnrollments.isPending ? "Exporting..." : "Export CSV"}
									</span>
								</Button>
								<Link
									href={`/${orgSlug}/enrollments?campaignId=${campaignId}`}
									className="hidden sm:inline text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
								>
									Full view →
								</Link>
							</div>
						</div>

						{/* Filter Tabs */}
						<div className="flex gap-1 overflow-x-auto scrollbar-none border-b border-zinc-200 px-3.5 sm:px-4 py-1.5 sm:py-2 dark:border-zinc-700">
							{(
								[
									{ value: "all" as const, label: "All", icon: UserGroupIcon },
									{ value: "awaiting_review" as const, label: "Pending", icon: ClockIcon },
									{ value: "approved" as const, label: "Approved", icon: CheckCircleIcon },
									{ value: "awaiting_submission" as const, label: "In Progress", icon: ArrowPathIcon },
									{ value: "permanently_rejected" as const, label: "Rejected", icon: XCircleIcon },
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
											"flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
											isActive
												? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
												: "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
										)}
									>
										<TabIcon className="size-3.5" />
										{tab.label}
									</button>
								);
							})}
						</div>

						{/* Table */}
						<div className="overflow-x-auto">
							{enrollmentsLoading ? (
								<div className="space-y-3 p-5">
									{[1, 2, 3, 4, 5].map((i) => (
										<Skeleton key={i} width="100%" height={56} borderRadius={8} />
									))}
								</div>
							) : filteredEnrollments.length === 0 ? (
								<div className="p-6">
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
								</div>
							) : (
								<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
									{filteredEnrollments.map((enrollment) => (
										<EnrollmentCardCompact
											key={enrollment.id}
											enrollment={enrollment}
											onClick={
												enrollment.status === "awaiting_review" && canApproveEnrollment
													? () => handleEnrollmentClick(enrollment)
													: undefined
											}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* ============================================================= */}
			{/* TASKS TAB */}
			{/* ============================================================= */}
			{activeTab === "tasks" && (
				<div className="space-y-3 sm:space-y-4">
					<div className="flex items-center justify-between">
						<Text className="text-xs sm:text-sm">
							{tasks.length} task{tasks.length !== 1 ? "s" : ""} configured
						</Text>
						{canUpdateCampaign && ["draft", "rejected", "paused"].includes(campaign.status) && (
							<Button outline onClick={() => setShowAddTaskPicker(true)} disabled={addTask.isPending}>
								<PlusIcon className="size-4" />
								Add Task
							</Button>
						)}
					</div>

					{tasksLoading ? (
						<div className="space-y-3">
							{[1, 2].map((i) => (
								<Skeleton key={i} width="100%" height={72} borderRadius={12} />
							))}
						</div>
					) : tasks.length === 0 ? (
						<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 p-6 dark:bg-zinc-900 dark:ring-zinc-800">
							<EmptyState
								title="No tasks configured"
								description="Add tasks that shoppers must complete for this campaign"
							/>
						</div>
					) : (
						<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
							<div className="divide-y divide-zinc-200 dark:divide-zinc-700">
								{tasks.map((task, idx) => {
									const taskPlatform =
										task.taskTemplate?.platformName || extractPlatformFromText(task.taskTemplate?.name || "");
									const TaskIcon = taskPlatform ? getPlatformIcon(taskPlatform) : null;
									return (
										<div key={task.id} className="group flex items-start gap-3 px-4 py-3">
											{/* Numbered icon */}
											<div className="relative shrink-0">
												<div
													className={`flex size-7 items-center justify-center rounded-lg ${TaskIcon ? "bg-zinc-100 dark:bg-zinc-800" : "bg-violet-100 dark:bg-violet-900/40"}`}
												>
													{TaskIcon ? (
														<TaskIcon className={`size-4 ${getPlatformColor(taskPlatform || "")}`} />
													) : (
														<ClipboardDocumentListIcon className="size-4 text-violet-600 dark:text-violet-400" />
													)}
												</div>
												<span className="absolute -top-1 -left-1 flex size-4 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-bold text-white ring-2 ring-white dark:bg-white dark:text-zinc-900 dark:ring-zinc-900">
													{idx + 1}
												</span>
											</div>
											{/* Content */}
											<div className="min-w-0 flex-1">
												<div className="flex items-start justify-between gap-2">
													<p className="text-sm font-medium text-zinc-900 dark:text-white">
														{task.taskTemplate?.name || `Task #${idx + 1}`}
													</p>
													<div className="flex shrink-0 items-center gap-1.5">
														{task.isRequired ? (
															<span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
																Required
															</span>
														) : (
															<span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
																Optional
															</span>
														)}
													</div>
												</div>
												{task.instructions && (
													<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
														{task.instructions}
													</p>
												)}
												{/* Platform / category chip + requirements badges */}
												<div className="mt-2 flex flex-wrap items-center gap-1.5">
													{(() => {
														const taskPlatformName =
															task.taskTemplate?.platformName || extractPlatformFromText(task.taskTemplate?.name || "");
														const TaskPlatformIcon = taskPlatformName ? getPlatformIcon(taskPlatformName) : null;
														return (
															<span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
																{TaskPlatformIcon && (
																	<TaskPlatformIcon className={`size-3 ${getPlatformColor(taskPlatformName || "")}`} />
																)}
																{taskPlatformName || task.taskTemplate?.category || "Task"}
															</span>
														);
													})()}
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
											</div>
											{/* Actions */}
											{canUpdateCampaign && ["draft", "rejected", "paused"].includes(campaign.status) && (
												<div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
													<button
														type="button"
														onClick={() => {
															setEditingTaskId(task.id);
															setEditingTaskInstructions(task.instructions || "");
															setEditingTaskRequirements(task.requirements || {});
															setHashtagInput("");
															setMentionInput("");
														}}
														className="rounded p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
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
						</div>
					)}
				</div>
			)}

			{/* Review Dialog */}
			<EnrollmentReviewDialog
				open={showReviewDialog}
				onClose={() => {
					setShowReviewDialog(false);
					setSelectedEnrollment(null);
				}}
				enrollment={selectedEnrollment}
				organizationId={organizationId || ""}
				onSuccess={handleReviewSuccess}
			/>

			{/* Edit Campaign Modal */}
			<EditCampaignModal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				organizationId={organizationId}
				campaign={campaign}
				onSuccess={() => {
					refetchCampaign();
					refetchStats();
				}}
			/>

			{/* Edit Task Dialog */}
			<Dialog open={!!editingTaskId} onClose={() => setEditingTaskId(null)} size="lg">
				<DialogTitle>Edit Task</DialogTitle>
				<DialogDescription>Update task instructions and requirements</DialogDescription>
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
						<div className="space-y-2">
							<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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

						{/* Content Requirements */}
						<div className="space-y-2">
							<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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

						{/* Media Requirements */}
						<div className="space-y-3">
							<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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
										onValueChange={(v) => setEditingTaskRequirements((prev) => ({ ...prev, minPhotos: v.floatValue }))}
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
										onValueChange={(v) => setEditingTaskRequirements((prev) => ({ ...prev, minVideos: v.floatValue }))}
										allowNegative={false}
										decimalScale={0}
										placeholder="1"
									/>
								</Field>
							)}
						</div>

						{/* Duration */}
						<div className="space-y-2">
							<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
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
						{updateTask.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Add Task Template Picker */}
			<Dialog open={showAddTaskPicker} onClose={() => { setShowAddTaskPicker(false); setAddTaskTemplateId(""); setAddTaskPlatformId(""); }} size="sm">
				<DialogTitle>Add Task</DialogTitle>
				<DialogDescription>Select a platform and task type to add</DialogDescription>
				<DialogBody className="space-y-4">
					<Field>
						<Label>Platform</Label>
						<Select value={addTaskPlatformId} onChange={(e) => { setAddTaskPlatformId(e.target.value); setAddTaskTemplateId(""); }}>
							<option value="">All platforms</option>
							{platforms.map((p) => (
								<option key={p.id} value={p.id}>{p.name}</option>
							))}
						</Select>
					</Field>
					<Field>
						<Label>Task Type</Label>
						{taskTemplates.length === 0 ? (
							<Select disabled>
								<option>{addTaskPlatformId ? "No tasks for this platform" : "Select a platform first"}</option>
							</Select>
						) : (
							<Select value={addTaskTemplateId} onChange={(e) => setAddTaskTemplateId(e.target.value)}>
								<option value="" disabled>Select task type…</option>
								{taskTemplates.map((tpl) => {
									const alreadyAdded = tasks.some((t) => t.taskTemplate?.id === tpl.id);
									return (
										<option key={tpl.id} value={tpl.id} disabled={alreadyAdded}>
											{tpl.name}{alreadyAdded ? " (already added)" : ""}
										</option>
									);
								})}
							</Select>
						)}
					</Field>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => { setShowAddTaskPicker(false); setAddTaskTemplateId(""); setAddTaskPlatformId(""); }}>
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
				<DialogTitle>End Campaign</DialogTitle>
				<DialogDescription>
					Are you sure you want to end <strong>{campaign.title}</strong>? This action cannot be undone and no new
					enrollments will be accepted.
				</DialogDescription>
				<DialogBody className="sr-only" />
				<DialogActions>
					<Button plain onClick={() => setShowEndConfirm(false)}>
						Cancel
					</Button>
					<Button color="red" onClick={handleEnd} disabled={endCampaign.isPending}>
						{endCampaign.isPending ? "Ending..." : "End Campaign"}
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
		iconBg: "bg-zinc-400",
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
							{event.description && <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{event.description}</p>}
							<p className="mt-1 text-[10px] text-zinc-400">{formatDateTime(event.date)}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
