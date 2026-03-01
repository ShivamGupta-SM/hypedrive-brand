import * as Headless from "@headlessui/react";
import {
	ArchiveBoxIcon,
	ArrowDownTrayIcon,
	ArrowLeftIcon,
	ArrowPathIcon,
	ArrowsRightLeftIcon,
	CalendarIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ClipboardDocumentListIcon,
	ClockIcon,
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
import { showToast } from "@/lib/toast";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
	Dialog,
	DialogActions,
	DialogBody,
	DialogDescription,
	DialogTitle,
} from "@/components/dialog";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { Card, CardGrid, StatCard } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/skeleton";
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
	useRejectEnrollment,
	useRemoveCampaignTask,
	useSubmitCampaign,
	useUpdateCampaign,
	useUpdateCampaignTask,
} from "@/hooks";
import { useOrgSlug } from "@/hooks/use-org-slug";
import type { brand, db } from "@/lib/brand-client";
import { formatCurrency } from "@/lib/design-tokens";
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

function getEnrollmentStatusConfig(status: EnrollmentStatus): {
	label: string;
	icon: typeof CheckCircleIcon;
	color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange";
} {
	const statusMap: Record<
		EnrollmentStatus,
		{
			label: string;
			icon: typeof CheckCircleIcon;
			color: "lime" | "amber" | "red" | "zinc" | "emerald" | "orange";
		}
	> = {
		awaiting_submission: { label: "Awaiting Submission", icon: ClockIcon, color: "zinc" },
		awaiting_review: { label: "Awaiting Review", icon: ClockIcon, color: "amber" },
		changes_requested: {
			label: "Changes Requested",
			icon: ExclamationTriangleIcon,
			color: "orange",
		},
		approved: { label: "Approved", icon: CheckCircleIcon, color: "lime" },
		permanently_rejected: { label: "Rejected", icon: XCircleIcon, color: "red" },
		cancelled: { label: "Cancelled", icon: XCircleIcon, color: "zinc" },
		expired: { label: "Expired", icon: ClockIcon, color: "zinc" },
	};
	return statusMap[status] || { label: status, icon: ClockIcon, color: "zinc" };
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
				<ExclamationTriangleIcon className="size-8 text-red-400" />
			</div>
			<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
				Something went wrong
			</p>
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
		<div className="space-y-6 animate-fade-in">
			{/* Back button */}
			<Skeleton width={120} height={36} borderRadius={8} />

			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<Skeleton width={80} height={80} borderRadius={16} />
					<div className="space-y-2">
						<Skeleton width={200} height={28} borderRadius={8} />
						<Skeleton width={150} height={20} borderRadius={6} />
						<div className="flex gap-2">
							<Skeleton width={80} height={24} borderRadius={12} />
							<Skeleton width={80} height={24} borderRadius={12} />
						</div>
					</div>
				</div>
				<Skeleton width={100} height={36} borderRadius={8} />
			</div>

			{/* Stats */}
			<div className="grid grid-cols-4 gap-4">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
					>
						<Skeleton width={48} height={16} />
						<Skeleton width={80} height={28} className="mt-2" />
					</div>
				))}
			</div>

			{/* Content */}
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
					<Skeleton width={150} height={24} />
					<div className="mt-4 space-y-3">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} width="100%" height={48} borderRadius={8} />
						))}
					</div>
				</div>
				<div className="rounded-xl bg-white p-6 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
					<Skeleton width={150} height={24} />
					<div className="mt-4 space-y-3">
						{[1, 2, 3].map((i) => (
							<Skeleton key={i} width="100%" height={48} borderRadius={8} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// ENROLLMENT PROGRESS BAR
// =============================================================================

function EnrollmentProgress({ current, max }: { current: number; max?: number }) {
	if (!max || max === 0) {
		return (
			<div>
				<div className="flex items-center justify-between text-sm">
					<span className="text-zinc-500 dark:text-zinc-400">Enrollments</span>
					<span className="font-medium text-zinc-900 dark:text-white">
						{current.toLocaleString("en-IN")} (No limit)
					</span>
				</div>
			</div>
		);
	}

	const percent = Math.min(100, (current / max) * 100);

	const colorClass =
		percent >= 90 ? "bg-red-500" : percent >= 70 ? "bg-amber-500" : "bg-emerald-500";

	return (
		<div>
			<div className="flex items-center justify-between text-sm">
				<span className="text-zinc-500 dark:text-zinc-400">Enrollments</span>
				<span className="font-medium text-zinc-900 dark:text-white">
					{current.toLocaleString("en-IN")} / {max.toLocaleString("en-IN")}
				</span>
			</div>
			<div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
				<div
					className={`h-full rounded-full transition-all ${colorClass}`}
					style={{ width: `${percent}%` }}
				/>
			</div>
			<p className="mt-1 text-right text-xs text-zinc-500 dark:text-zinc-400">
				{(100 - percent).toFixed(0)}% remaining
			</p>
		</div>
	);
}

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

	const updateField = useCallback(
		<K extends keyof EditCampaignFormData>(field: K, value: EditCampaignFormData[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		},
		[]
	);

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
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
											Description
										</label>
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
											{errors.startDate && (
												<p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
											)}
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
											{errors.endDate && (
												<p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
											)}
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
										{errors.maxEnrollments && (
											<p className="mt-1 text-sm text-red-500">{errors.maxEnrollments}</p>
										)}
										{/* Note: Current enrollment count is from stats, not campaign object */}
									</div>

									<div>
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
											Visibility
										</label>
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
															formData.isPublic
																? "text-zinc-400 dark:text-zinc-600"
																: "text-zinc-500"
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
															!formData.isPublic
																? "text-zinc-400 dark:text-zinc-600"
																: "text-zinc-500"
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
									<Button
										color="emerald"
										onClick={handleSubmit}
										disabled={updateCampaign.isPending}
									>
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
								<p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
									Order ID
								</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									#{enrollment.orderId.slice(-8)}
								</p>
							</div>
							<div>
								<p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
									Order Value
								</p>
								<p className="mt-1 font-medium text-zinc-900 dark:text-white">
									{formatCurrency(enrollment.orderValue / 100)}
								</p>
							</div>
							<div>
								<p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
									Bill Rate
								</p>
								<p className="mt-1 font-medium text-emerald-600 dark:text-emerald-400">
									{enrollment.lockedBillRate}%
								</p>
							</div>
							<div>
								<p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
									Created
								</p>
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
						<label
							htmlFor="reject-reason"
							className="block text-sm font-medium text-zinc-900 dark:text-white"
						>
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
// ENROLLMENT CARD
// =============================================================================

const ENROLLMENT_AVATAR_COLORS = [
	"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
	"bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
	"bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
	"bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
	"bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
];

function EnrollmentCard({
	enrollment,
	onClick,
}: {
	enrollment: CampaignEnrollment;
	onClick: () => void;
}) {
	const statusConfig = getEnrollmentStatusConfig(enrollment.status);
	const StatusIcon = statusConfig.icon;

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		return new Date(dateStr).toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
		});
	};

	const platformFeeAmount = useMemo(() => {
		const fee = enrollment.lockedPlatformFee;
		if (fee == null || Number.isNaN(fee)) return "0.00";
		return (fee / 100).toFixed(2);
	}, [enrollment.lockedPlatformFee]);

	const avatarColorClass =
		ENROLLMENT_AVATAR_COLORS[(enrollment.orderId.charCodeAt(0) || 0) % ENROLLMENT_AVATAR_COLORS.length];
	const initials = enrollment.orderId.slice(-2).toUpperCase();

	return (
		<button
			type="button"
			onClick={onClick}
			className="flex w-full items-center justify-between rounded-xl bg-zinc-50 p-3 text-left transition-colors hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
		>
			<div className="flex items-center gap-3">
				<div
					className={`flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${avatarColorClass}`}
				>
					{initials}
				</div>
				<div>
					<p className="font-mono text-sm font-semibold text-zinc-900 dark:text-white">
						{enrollment.orderId.slice(-12)}
					</p>
					<p className="text-xs text-zinc-500 dark:text-zinc-400">
						{formatDate(enrollment.createdAt)}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<div className="text-right">
					<p className="text-sm font-semibold text-zinc-900 dark:text-white">
						{formatCurrency(enrollment.orderValue / 100)}
					</p>
					<p className="text-xs text-emerald-600 dark:text-emerald-400">
						Fee: {formatCurrency(platformFeeAmount)}
					</p>
				</div>
				<Badge color={statusConfig.color} className="inline-flex items-center gap-1">
					<StatusIcon className="size-3" />
					{statusConfig.label}
				</Badge>
			</div>
		</button>
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

	// Permission checks
	const canUpdateCampaign = useCan("campaign", "update");
	const canApproveEnrollment = useCan("enrollment", "approve");

	const {
		data: campaign,
		loading: campaignLoading,
		error: campaignError,
		refetch: refetchCampaign,
	} = useCampaign(organizationId, campaignId);
	const {
		data: stats,
		loading: statsLoading,
		refetch: refetchStats,
	} = useCampaignStats(organizationId, campaignId);
	const {
		data: enrollments,
		loading: enrollmentsLoading,
		refetch: refetchEnrollments,
	} = useCampaignEnrollments(organizationId, campaignId, { take: 10 });
	const { data: tasks, loading: tasksLoading } = useCampaignTasks(organizationId, campaignId);

	const submitCampaign = useSubmitCampaign();
	const endCampaign = useEndCampaign();
	const archiveCampaign = useArchiveCampaign();
	const addTask = useAddCampaignTask(organizationId, campaignId);
	const updateTask = useUpdateCampaignTask(organizationId, campaignId);
	const removeTask = useRemoveCampaignTask(organizationId, campaignId);
	const exportEnrollments = useExportEnrollments(organizationId);

	const [selectedEnrollment, setSelectedEnrollment] = useState<CampaignEnrollment | null>(null);
	const [showReviewDialog, setShowReviewDialog] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editingTaskInstructions, setEditingTaskInstructions] = useState("");

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

	const handleEnd = async () => {
		if (!organizationId || !campaignId) return;
		if (!window.confirm("Are you sure you want to end this campaign? This cannot be undone."))
			return;
		try {
			await endCampaign.mutateAsync({ organizationId, campaignId });
			showToast.success("Campaign ended");
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

	return (
		<div className="space-y-6">
			{/* Back Button */}
			<Link
				href={`/${orgSlug}/campaigns`}
				className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
			>
				<ArrowLeftIcon className="size-4" />
				Back to Campaigns
			</Link>

			{/* Header */}
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					{/* Campaign Icon / Product Image */}
					{campaign.listing?.listingImages?.[0]?.imageUrl ? (
						<img
							src={campaign.listing.listingImages[0].imageUrl}
							alt={campaign.title}
							className="size-20 shrink-0 rounded-2xl object-cover ring-1 ring-inset ring-zinc-950/5"
						/>
					) : (
						<div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-zinc-800 dark:bg-zinc-700">
							<MegaphoneIcon className="size-10 text-white" />
						</div>
					)}

					<div>
						<div className="flex items-center gap-2">
							<Heading>{campaign.title}</Heading>
						</div>
						{campaign.description && <Text className="mt-1 max-w-xl">{campaign.description}</Text>}
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<Badge color={statusConfig.color} className="inline-flex items-center gap-1">
								<StatusIcon className="size-3" />
								{statusConfig.label}
							</Badge>
							<Badge color={getTypeColor(campaign.campaignType)}>{campaign.campaignType}</Badge>
							{pendingCount > 0 && <Badge color="amber">{pendingCount} pending review</Badge>}
						</div>
					</div>
				</div>

				{canUpdateCampaign && (
					<div className="flex flex-wrap gap-2">
						{campaign.status === "draft" && (
							<Button color="emerald" onClick={handleSubmit} disabled={submitCampaign.isPending}>
								<PaperAirplaneIcon className="size-4" />
								{submitCampaign.isPending ? "Submitting..." : "Submit"}
							</Button>
						)}
						{campaign.status === "active" && (
							<Button color="red" onClick={handleEnd} disabled={endCampaign.isPending}>
								<StopCircleIcon className="size-4" />
								{endCampaign.isPending ? "Ending..." : "End Campaign"}
							</Button>
						)}
						{(campaign.status === "ended" || campaign.status === "cancelled") && (
							<Button outline onClick={handleArchive} disabled={archiveCampaign.isPending}>
								<ArchiveBoxIcon className="size-4" />
								{archiveCampaign.isPending ? "Archiving..." : "Archive"}
							</Button>
						)}
						{(campaign.status === "draft" ||
							campaign.status === "rejected" ||
							campaign.status === "approved" ||
							campaign.status === "active" ||
							campaign.status === "paused") && (
							<Button onClick={() => setShowEditModal(true)} outline>
								<PencilIcon className="size-4" />
								Edit
							</Button>
						)}
					</div>
				)}
			</div>

			{/* Stats Row */}
			<CardGrid columns={4} gap="md">
				<StatCard
					icon={<UserGroupIcon className="size-5" />}
					label="Total Enrollments"
					value={stats?.totalEnrollments ?? 0}
					sublabel={campaign.maxEnrollments ? `of ${campaign.maxEnrollments} max` : "no limit"}
				/>
				<StatCard
					icon={<CheckCircleIcon className="size-5" />}
					label="Approved"
					value={stats?.approvedEnrollments ?? 0}
					sublabel="enrollments"
					variant="success"
				/>
				<StatCard
					icon={<ClockIcon className="size-5" />}
					label="Pending Review"
					value={stats?.pendingEnrollments ?? 0}
					sublabel="awaiting action"
					variant={(stats?.pendingEnrollments ?? 0) > 0 ? "warning" : "default"}
					badge={(stats?.pendingEnrollments ?? 0) > 0 ? { text: "Action needed", variant: "warning" } : undefined}
				/>
				<StatCard
					icon={<CurrencyRupeeIcon className="size-5" />}
					label="Total Order Value"
					value={formatCurrency((stats?.totalOrderValue ?? 0) / 100)}
					sublabel="across all enrollments"
					variant="info"
				/>
			</CardGrid>

			{/* Campaign Tasks */}
			{(tasks.length > 0 ||
				tasksLoading ||
				(canUpdateCampaign && ["draft", "rejected", "paused"].includes(campaign.status))) && (
				<Card>
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/30">
									<ClipboardDocumentListIcon className="size-5 text-violet-500" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
										Campaign Tasks
									</h3>
									<p className="text-sm text-zinc-500 dark:text-zinc-400">
										{tasks.length} task{tasks.length !== 1 ? "s" : ""} configured
									</p>
								</div>
							</div>
							{canUpdateCampaign && ["draft", "rejected", "paused"].includes(campaign.status) && (
								<Button
									outline
									onClick={() => {
										addTask.mutate(
											{ taskTemplateId: "", isRequired: false, instructions: "" },
											{
												onSuccess: () => showToast.success("Task added"),
												onError: (err) =>
													showToast.error(err, "Failed to add task"),
											}
										);
									}}
									disabled={addTask.isPending}
								>
									<PlusIcon className="size-4" />
									Add Task
								</Button>
							)}
						</div>

						{tasksLoading ? (
							<div className="mt-4 space-y-3">
								{[1, 2].map((i) => (
									<Skeleton key={i} width="100%" height={56} borderRadius={8} />
								))}
							</div>
						) : (
							<div className="mt-4 space-y-2">
								{tasks.map((task, idx) => (
									<div
										key={task.id}
										className="group flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50"
									>
										<div className="flex items-center gap-3">
											<span className="flex size-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
												{idx + 1}
											</span>
											<div>
												{editingTaskId === task.id ? (
													<form
														onSubmit={(e) => {
															e.preventDefault();
															updateTask.mutate(
																{ taskId: task.id, instructions: editingTaskInstructions },
																{
																	onSuccess: () => {
																		showToast.success("Task updated");
																		setEditingTaskId(null);
																	},
																	onError: (err) =>
																		showToast.error(err, "Failed to update task"),
																}
															);
														}}
														className="flex items-center gap-2"
													>
														<input
															type="text"
															value={editingTaskInstructions}
															onChange={(e) => setEditingTaskInstructions(e.target.value)}
															className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
															placeholder="Task instructions..."
														/>
														<Button type="submit" color="dark/zinc" disabled={updateTask.isPending}>
															Save
														</Button>
														<Button outline onClick={() => setEditingTaskId(null)}>
															Cancel
														</Button>
													</form>
												) : (
													<>
														<p className="text-sm font-medium text-zinc-900 dark:text-white">
															{task.taskTemplate?.name || `Task #${idx + 1}`}
														</p>
														{task.instructions && (
															<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
																{task.instructions}
															</p>
														)}
													</>
												)}
											</div>
										</div>
										<div className="flex items-center gap-2">
											{task.isRequired && <Badge color="red">Required</Badge>}
											<Badge color="zinc">
												{task.taskTemplate?.platformName || task.taskTemplate?.category || "Task"}
											</Badge>
											{canUpdateCampaign &&
												["draft", "rejected", "paused"].includes(campaign.status) &&
												editingTaskId !== task.id && (
													<div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
														<button
															type="button"
															onClick={() => {
																setEditingTaskId(task.id);
																setEditingTaskInstructions(task.instructions || "");
															}}
															className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
															title="Edit instructions"
														>
															<PencilIcon className="size-3.5" />
														</button>
														<button
															type="button"
															onClick={() => {
																removeTask.mutate(task.id, {
																	onSuccess: () => showToast.success("Task removed"),
																	onError: (err) =>
																		showToast.error(err, "Failed to remove task"),
																});
															}}
															disabled={removeTask.isPending}
															className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
															title="Remove task"
														>
															<TrashIcon className="size-3.5" />
														</button>
													</div>
												)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</Card>
			)}

			{/* Main Content */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Campaign Details */}
				<Card>
					<div className="p-6">
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
							Campaign Details
						</h3>

						<div className="mt-6 space-y-4">
							{/* Duration */}
							<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/30">
										<CalendarIcon className="size-5 text-sky-500" />
									</div>
									<div>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">Duration</p>
										<p className="text-sm text-zinc-500 dark:text-zinc-400">
											{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
										</p>
									</div>
								</div>
								{daysRemaining !== null && (
									<Badge color={daysRemaining <= 7 ? "amber" : "zinc"}>
										{daysRemaining > 0 ? `${daysRemaining} days left` : "Ended"}
									</Badge>
								)}
							</div>

							{/* Bill Rate */}
							<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
										<CurrencyRupeeIcon className="size-5 text-emerald-500" />
									</div>
									<div>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">Bill Rate</p>
										<p className="text-sm text-zinc-500 dark:text-zinc-400">Rate per enrollment</p>
									</div>
								</div>
								<span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
									{campaign.billRate != null ? `${campaign.billRate / 100}%` : "N/A"}
								</span>
							</div>

							{/* Platform Fee */}
							<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
										<ChartBarIcon className="size-5 text-amber-500" />
									</div>
									<div>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">
											Platform Fee
										</p>
										<p className="text-sm text-zinc-500 dark:text-zinc-400">Per enrollment</p>
									</div>
								</div>
								<span className="text-lg font-semibold text-zinc-900 dark:text-white">
									{campaign.platformFee ? formatCurrency(campaign.platformFee / 100) : "N/A"}
								</span>
							</div>

							{/* Enrollment Progress */}
							<div className="pt-2">
								<EnrollmentProgress
									current={stats?.totalEnrollments ?? 0}
									max={campaign.maxEnrollments}
								/>
							</div>
						</div>
					</div>
				</Card>

				{/* Recent Enrollments */}
				<Card>
					<div className="p-6">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
								Recent Enrollments
							</h3>
							<div className="flex items-center gap-2">
								<Button
									outline
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
									<ArrowDownTrayIcon className="size-4" />
									{exportEnrollments.isPending ? "Exporting..." : "Export"}
								</Button>
								<Link
									href={`/${orgSlug}/enrollments?campaignId=${campaignId}`}
									className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
								>
									View all
								</Link>
							</div>
						</div>

						{enrollmentsLoading ? (
							<div className="mt-4 space-y-3">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} width="100%" height={64} borderRadius={8} />
								))}
							</div>
						) : enrollments.length === 0 ? (
							<div className="mt-6">
								<EmptyState
									preset="enrollments"
									title="No enrollments yet"
									description="Enrollments will appear here when shoppers join this campaign"
								/>
							</div>
						) : (
							<div className="mt-4 space-y-2">
								{enrollments.slice(0, 5).map((enrollment) => (
									<EnrollmentCard
										key={enrollment.id}
										enrollment={enrollment}
										onClick={() => handleEnrollmentClick(enrollment)}
									/>
								))}
							</div>
						)}
					</div>
				</Card>
			</div>

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
		</div>
	);
}
