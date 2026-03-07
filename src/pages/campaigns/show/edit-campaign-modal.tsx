import {
	ArrowPathIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	GlobeAltIcon,
	LockClosedIcon,
	PencilIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { useUpdateCampaign } from "@/features/campaigns/mutations";
import { getFriendlyErrorMessage } from "@/hooks/api-client";
import type { brand, db } from "@/lib/brand-client";
import { CAMPAIGN_TYPE_CONFIG } from "./utils";

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

export interface EditCampaignModalProps {
	isOpen: boolean;
	onClose: () => void;
	organizationId: string | undefined;
	campaign: brand.CampaignWithStats | null;
	onSuccess: () => void;
}

export function EditCampaignModal({
	isOpen,
	onClose,
	organizationId,
	campaign,
	onSuccess,
}: EditCampaignModalProps) {
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
