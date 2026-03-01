import * as Headless from "@headlessui/react";
import {
	ArrowDownTrayIcon,
	ArrowPathIcon,
	ArrowsRightLeftIcon,
	CurrencyRupeeIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ClockIcon,
	CubeIcon,
	EllipsisVerticalIcon,
	ExclamationTriangleIcon,
	GlobeAltIcon,
	LockClosedIcon,
	MagnifyingGlassIcon,
	MegaphoneIcon,
	PauseCircleIcon,
	PlayCircleIcon,
	PlusIcon,
	RocketLaunchIcon,
	SparklesIcon,
	UserGroupIcon,
	XCircleIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { StatCard } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton, StatCardSkeleton } from "@/components/skeleton";
import { Text } from "@/components/text";
import {
	getAPIErrorMessage,
	useCreateAndSubmitCampaign,
	useCreateCampaign,
	useCurrentOrganization,
	useDeleteCampaign,
	useDuplicateCampaign,
	useInfiniteCampaigns,
	useListings,
	useOrgSlug,
	usePauseCampaign,
	useResumeCampaign,
} from "@/hooks";
import type { brand, db } from "@/lib/brand-client";

type Campaign = brand.CampaignWithStats;
type CampaignStatus = db.CampaignStatus;
type StatusFilter = "all" | "active" | "paused" | "ended" | "draft";

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

// =============================================================================
// CAMPAIGN TYPE CONFIG (used in CreateCampaignModal)
// =============================================================================

const CAMPAIGN_TYPE_CONFIG: Record<
	string,
	{ label: string; color: "emerald" | "amber" | "sky"; icon: typeof CurrencyRupeeIcon }
> = {
	cashback: { label: "Cashback", color: "emerald", icon: CurrencyRupeeIcon },
	barter: { label: "Barter", color: "amber", icon: ArrowsRightLeftIcon },
	hybrid: { label: "Hybrid", color: "sky", icon: SparklesIcon },
};

// =============================================================================
// CSV EXPORT UTILITY
// =============================================================================

function exportCampaignsToCSV(campaigns: Campaign[]) {
	const headers = [
		"ID",
		"Title",
		"Status",
		"Type",
		"Start Date",
		"End Date",
		"Max Enrollments",
		"Created At",
	];

	const rows = campaigns.map((c) => [
		c.id,
		`"${c.title.replace(/"/g, '""')}"`,
		c.status,
		c.campaignType,
		c.startDate || "",
		c.endDate || "",
		c.maxEnrollments || "",
		c.createdAt,
	]);

	const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	const url = URL.createObjectURL(blob);
	link.setAttribute("href", url);
	link.setAttribute("download", `campaigns-${new Date().toISOString().split("T")[0]}.csv`);
	link.style.visibility = "hidden";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}


// =============================================================================
// FILTER BOTTOM SHEET - Mobile only

// =============================================================================
// CREATE CAMPAIGN MODAL
// =============================================================================

interface CampaignFormData {
	listingId: string;
	title: string;
	description: string;
	startDate: string;
	endDate: string;
	maxEnrollments: number;
	campaignType: db.CampaignType;
	isPublic: boolean;
	termsAndConditions: string;
	taskTemplateId: string;
	taskInstructions: string;
}

const initialFormData: CampaignFormData = {
	listingId: "",
	title: "",
	description: "",
	startDate: "",
	endDate: "",
	maxEnrollments: 100,
	campaignType: "cashback",
	isPublic: true,
	termsAndConditions: "",
	taskTemplateId: "",
	taskInstructions: "",
};

const STEPS = [
	{ id: 1, name: "Listing", description: "Select listing" },
	{ id: 2, name: "Details", description: "Campaign info" },
	{ id: 3, name: "Settings", description: "Configure" },
];

function CreateCampaignModal({
	isOpen,
	onClose,
	organizationId,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	organizationId: string | undefined;
	onSuccess: () => void;
}) {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<CampaignFormData>(initialFormData);
	const [errors, setErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({});
	const [listingSearch, setListingSearch] = useState("");

	const { data: listings, loading: listingsLoading } = useListings(organizationId, {
		search: listingSearch || undefined,
		take: 20,
	});

	const createCampaign = useCreateCampaign(organizationId);
	const createAndSubmit = useCreateAndSubmitCampaign(organizationId);
	const navigate = useNavigate();
	const orgSlug = useOrgSlug();

	const selectedListing = listings.find((p) => p.id === formData.listingId);

	const updateField = useCallback(
		<K extends keyof CampaignFormData>(field: K, value: CampaignFormData[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		},
		[]
	);

	const validateStep = useCallback(
		(currentStep: number): boolean => {
			const newErrors: Partial<Record<keyof CampaignFormData, string>> = {};

			if (currentStep === 1) {
				if (!formData.listingId) {
					newErrors.listingId = "Please select a listing";
				}
			}

			if (currentStep === 2) {
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

			if (currentStep === 3) {
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
			setStep((s) => Math.min(s + 1, 3));
		}
	}, [step, validateStep]);

	const handleBack = useCallback(() => {
		setStep((s) => Math.max(s - 1, 1));
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!validateStep(3) || !organizationId) return;

		try {
			const campaign = await createCampaign.mutateAsync({
				listingId: formData.listingId,
				title: formData.title,
				description: formData.description || undefined,
				startDate: formData.startDate,
				endDate: formData.endDate,
				maxEnrollments: formData.maxEnrollments,
				campaignType: formData.campaignType,
				isPublic: formData.isPublic,
				termsAndConditions: formData.termsAndConditions || undefined,
			});
			onSuccess();
			onClose();
			// Navigate to new campaign
			navigate({ to: "/$orgSlug/campaigns/$id", params: { orgSlug, id: campaign.id } });
		} catch (err) {
			console.error("Failed to create campaign:", getAPIErrorMessage(err));
		}
	}, [
		formData,
		organizationId,
		createCampaign,
		onSuccess,
		onClose,
		navigate,
		validateStep,
		orgSlug,
	]);

	const handleCreateAndSubmit = useCallback(async () => {
		if (!validateStep(3) || !organizationId) return;
		if (!formData.taskTemplateId.trim()) {
			setErrors((prev) => ({ ...prev, taskTemplateId: "At least one task is required to submit" }));
			return;
		}

		try {
			const campaign = await createAndSubmit.mutateAsync({
				listingId: formData.listingId,
				title: formData.title,
				description: formData.description || undefined,
				startDate: formData.startDate,
				endDate: formData.endDate,
				maxEnrollments: formData.maxEnrollments,
				campaignType: formData.campaignType,
				isPublic: formData.isPublic,
				termsAndConditions: formData.termsAndConditions || undefined,
				tasks: [
					{
						taskTemplateId: formData.taskTemplateId.trim(),
						instructions: formData.taskInstructions.trim() || undefined,
					},
				],
			});
			onSuccess();
			onClose();
			navigate({ to: "/$orgSlug/campaigns/$id", params: { orgSlug, id: campaign.id } });
		} catch (err) {
			console.error("Failed to create & submit campaign:", getAPIErrorMessage(err));
		}
	}, [
		formData,
		organizationId,
		createAndSubmit,
		onSuccess,
		onClose,
		navigate,
		validateStep,
		orgSlug,
	]);

	const resetAndClose = useCallback(() => {
		setStep(1);
		setFormData(initialFormData);
		setErrors({});
		setListingSearch("");
		onClose();
	}, [onClose]);

	// Format date for input
	const today = new Date().toISOString().split("T")[0];

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
									Create Campaign
								</Headless.DialogTitle>
								<p className="mt-0.5 text-sm text-zinc-500">
									Step {step} of 3 · {STEPS[step - 1].description}
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
							<div className="flex items-center justify-between">
								{STEPS.map((s, idx) => (
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
										{idx < STEPS.length - 1 && (
											<div
												className={clsx(
													"mx-2 h-0.5 w-8 rounded-full transition-colors sm:w-16",
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
							{/* Step 1: Listing Selection */}
							{step === 1 && (
								<div className="space-y-4">
									<div>
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
											Select Listing <span className="text-red-500">*</span>
										</label>
										<div className="relative mb-3">
											<MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
											<input
												type="text"
												value={listingSearch}
												onChange={(e) => setListingSearch(e.target.value)}
												placeholder="Search listings..."
												className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
											/>
										</div>
										{errors.listingId && (
											<p className="mb-2 text-sm text-red-500">{errors.listingId}</p>
										)}
										<div className="max-h-64 space-y-2 overflow-y-auto">
											{listingsLoading ? (
												<div className="flex items-center justify-center py-8">
													<ArrowPathIcon className="size-5 animate-spin text-zinc-400" />
												</div>
											) : listings.length === 0 ? (
												<div className="rounded-xl bg-zinc-50 py-8 text-center dark:bg-zinc-800/50">
													<CubeIcon className="mx-auto size-8 text-zinc-400" />
													<p className="mt-2 text-sm text-zinc-500">No listings found</p>
													<p className="mt-1 text-xs text-zinc-400">
														Create a listing first to start a campaign
													</p>
												</div>
											) : (
												listings.map((listing) => (
													<button
														key={listing.id}
														type="button"
														onClick={() => updateField("listingId", listing.id)}
														className={clsx(
															"flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors",
															formData.listingId === listing.id
																? "bg-emerald-50 ring-2 ring-emerald-500 dark:bg-emerald-950/30"
																: "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
														)}
													>
														{listing.listingImages?.[0]?.imageUrl ? (
															<img
																src={listing.listingImages[0].imageUrl}
																alt={listing.name}
																className="size-12 rounded-lg object-cover"
															/>
														) : (
															<div className="flex size-12 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
																<CubeIcon className="size-6 text-zinc-400" />
															</div>
														)}
														<div className="min-w-0 flex-1">
															<p className="truncate font-medium text-zinc-900 dark:text-white">
																{listing.name}
															</p>
															<p className="text-sm text-zinc-500">
																₹{(listing.price / 100).toFixed(2)}
															</p>
														</div>
														{formData.listingId === listing.id && (
															<CheckCircleIcon className="size-5 text-emerald-500" />
														)}
													</button>
												))
											)}
										</div>
									</div>

									{/* Selected listing preview */}
									{selectedListing && (
										<div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
											<p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
												Selected Listing
											</p>
											<p className="mt-1 font-medium text-zinc-900 dark:text-white">
												{selectedListing.name}
											</p>
										</div>
									)}
								</div>
							)}

							{/* Step 2: Campaign Details */}
							{step === 2 && (
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
												min={today}
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
												min={formData.startDate || today}
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

							{/* Step 3: Settings */}
							{step === 3 && (
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

									<div>
										<label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
											Terms & Conditions
										</label>
										<textarea
											value={formData.termsAndConditions}
											onChange={(e) => updateField("termsAndConditions", e.target.value)}
											placeholder="Enter campaign terms..."
											rows={3}
											className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
										/>
									</div>

									{/* Task for Quick Submit */}
									<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
										<p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
											Task (optional)
										</p>
										<p className="mb-3 text-xs text-zinc-400">
											Select a task type to create and submit for approval in one step.
										</p>
										<div className="space-y-3">
											<div>
												<p className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">
													Task Type
												</p>
												<div className="flex flex-wrap gap-2">
													{[
														{ id: "instagram_post", label: "Instagram Post" },
														{ id: "instagram_reel", label: "Instagram Reel" },
														{ id: "instagram_story", label: "Instagram Story" },
														{ id: "youtube_video", label: "YouTube Video" },
														{ id: "youtube_short", label: "YouTube Short" },
														{ id: "product_review", label: "Product Review" },
														{ id: "unboxing", label: "Unboxing" },
														{ id: "blog_post", label: "Blog Post" },
													].map((task) => (
														<button
															key={task.id}
															type="button"
															onClick={() =>
																updateField(
																	"taskTemplateId",
																	formData.taskTemplateId === task.id ? "" : task.id
																)
															}
															className={clsx(
																"rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
																formData.taskTemplateId === task.id
																	? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
																	: "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-700"
															)}
														>
															{task.label}
														</button>
													))}
												</div>
												{errors.taskTemplateId && (
													<p className="mt-2 text-sm text-red-500">{errors.taskTemplateId}</p>
												)}
											</div>

											{formData.taskTemplateId && (
												<div>
													<label
														htmlFor="task-instructions"
														className="mb-1 block text-sm font-medium text-zinc-900 dark:text-white"
													>
														Instructions{" "}
														<span className="font-normal text-zinc-400">(optional)</span>
													</label>
													<textarea
														id="task-instructions"
														rows={2}
														value={formData.taskInstructions}
														onChange={(e) => updateField("taskInstructions", e.target.value)}
														placeholder="Any specific instructions for the creator..."
														className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
													/>
												</div>
											)}
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
								{step < 3 ? (
									<Button color="emerald" onClick={handleNext}>
										Next
										<ChevronRightIcon className="size-4" />
									</Button>
								) : (
									<>
										{formData.taskTemplateId.trim() && (
											<Button
												color="dark/zinc"
												onClick={handleCreateAndSubmit}
												disabled={createAndSubmit.isPending || createCampaign.isPending}
											>
												{createAndSubmit.isPending ? (
													<>
														<ArrowPathIcon className="size-4 animate-spin" />
														Submitting...
													</>
												) : (
													<>
														<RocketLaunchIcon className="size-4" />
														Create & Submit
													</>
												)}
											</Button>
										)}
										<Button
											color="emerald"
											onClick={handleSubmit}
											disabled={createCampaign.isPending || createAndSubmit.isPending}
										>
											{createCampaign.isPending ? (
												<>
													<ArrowPathIcon className="size-4 animate-spin" />
													Creating...
												</>
											) : (
												<>
													<PlusIcon className="size-4" />
													Create Draft
												</>
											)}
										</Button>
									</>
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
// CAMPAIGN CARD
// =============================================================================

interface CampaignCardProps {
	campaign: Campaign;
	orgSlug: string;
	onPause: (id: string) => void;
	onResume: (id: string) => void;
	onDelete: (id: string) => void;
	onDuplicate: (id: string) => void;
	isActionPending?: boolean;
}

function CampaignCard({
	campaign,
	orgSlug,
	onPause,
	onResume,
	onDelete,
	onDuplicate,
	isActionPending,
}: CampaignCardProps) {
	const statusConfig = getStatusConfig(campaign.status);
	const StatusIcon = statusConfig.icon;
	const getDaysLeft = () => {
		if (!campaign.endDate) return null;
		const now = new Date();
		const end = new Date(campaign.endDate);
		const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
		return diff > 0 ? diff : 0;
	};

	const daysLeft = getDaysLeft();

	const formatDate = (dateStr?: string) => {
		if (!dateStr) return "—";
		return new Date(dateStr).toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
		});
	};

	const productImage = campaign.listing?.listingImages?.[0]?.imageUrl ?? null;
	const showStats = ["active", "paused", "ended", "completed"].includes(campaign.status);
	const showProgress = ["active", "paused"].includes(campaign.status);
	const progress =
		campaign.maxEnrollments > 0
			? Math.min(100, Math.round((campaign.currentEnrollments / campaign.maxEnrollments) * 100))
			: 0;

	const footerMessage = (() => {
		switch (campaign.status) {
			case "draft": return "Not yet submitted for approval";
			case "pending_approval": return "Awaiting admin review";
			case "approved": return "Ready to activate";
			case "active": return `${campaign.maxEnrollments - campaign.currentEnrollments} slots remaining`;
			case "paused": return "Campaign is paused";
			case "ended": return "Campaign has ended";
			case "completed": return "Campaign completed";
			case "rejected": return "Submission was rejected";
			case "archived": return "Campaign archived";
			default: return "";
		}
	})();

	return (
		<div className="flex h-full flex-col rounded-2xl bg-white ring-1 ring-inset ring-zinc-950/5 transition-shadow duration-200 hover:shadow-md hover:ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10 dark:hover:ring-white/20">
			{/* Header — product thumbnail + title + badges */}
			<div className="p-4 pb-3">
				<div className="flex gap-3">
					{/* Product thumbnail */}
					<div className="shrink-0">
						{productImage ? (
							<img
								src={productImage}
								alt={campaign.listing?.name ?? "Product"}
								className="size-14 rounded-xl object-contain p-1 ring-1 ring-inset ring-zinc-950/5 dark:ring-white/10"
							/>
						) : (
							<div className="flex size-14 items-center justify-center rounded-xl bg-zinc-100 ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-800 dark:ring-white/10">
								<MegaphoneIcon className="size-6 text-zinc-400 dark:text-zinc-500" />
							</div>
						)}
					</div>

					{/* Title + status + date */}
					<div className="flex min-w-0 flex-1 items-start justify-between gap-2">
						<div className="min-w-0">
							<Link href={`/${orgSlug}/campaigns/${campaign.id}`} className="block">
								<h3 className="truncate text-sm font-semibold text-zinc-900 hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300">
									{campaign.title}
								</h3>
							</Link>
							<div className="mt-1.5 flex flex-wrap items-center gap-2">
								<Badge color={statusConfig.color} className="inline-flex items-center gap-1">
									<StatusIcon className="size-3" />
									{statusConfig.label}
								</Badge>
								{daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
									<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
										{daysLeft}d left
									</span>
								)}
							</div>
							<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
								{formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
							</p>
						</div>

						{/* Actions dropdown */}
						<Dropdown>
							<DropdownButton
								plain
								aria-label="More options"
								className="-mr-1 shrink-0 p-1"
								disabled={isActionPending}
							>
								<EllipsisVerticalIcon className="size-4 text-zinc-400" />
							</DropdownButton>
							<DropdownMenu anchor="bottom end">
								<DropdownItem href={`/${orgSlug}/campaigns/${campaign.id}`}>View details</DropdownItem>
								<DropdownItem href={`/${orgSlug}/campaigns/${campaign.id}`}>Edit campaign</DropdownItem>
								<DropdownItem onClick={() => onDuplicate(campaign.id)}>Duplicate</DropdownItem>
								{campaign.status === "active" && (
									<DropdownItem onClick={() => onPause(campaign.id)}>Pause campaign</DropdownItem>
								)}
								{campaign.status === "paused" && (
									<DropdownItem onClick={() => onResume(campaign.id)}>Resume campaign</DropdownItem>
								)}
								<DropdownItem
									onClick={() => onDelete(campaign.id)}
									className="text-red-600 dark:text-red-400"
								>
									Delete
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				</div>
			</div>

			{/* Stats grid — only for active/paused/ended/completed */}
			{showStats ? (
				<div className="px-4 pb-4">
					<div className="grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
						<div className="text-center">
							<div className="text-base font-semibold text-zinc-900 dark:text-white">
								{campaign.currentEnrollments}
							</div>
							<div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Enrolled
							</div>
						</div>
						<div className="border-x border-zinc-200 text-center dark:border-zinc-700">
							<div className="text-base font-semibold text-amber-600 dark:text-amber-400">
								{campaign.pendingCount}
							</div>
							<div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Pending
							</div>
						</div>
						<div className="text-center">
							<div className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
								{campaign.approvedCount}
							</div>
							<div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								Approved
							</div>
						</div>
					</div>

					{/* Progress bar */}
					{showProgress && (
						<div className="mt-3">
							<div className="mb-1.5 flex items-center justify-between">
								<span className="text-xs text-zinc-500 dark:text-zinc-400">Capacity</span>
								<span className="text-xs font-medium text-zinc-900 dark:text-white">
									{campaign.currentEnrollments}/{campaign.maxEnrollments}
								</span>
							</div>
							<div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
								<div
									className="h-full rounded-full bg-emerald-500 transition-all duration-300"
									style={{ width: `${progress}%` }}
								/>
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="flex-1 px-4 pb-4">
					<div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
						<UserGroupIcon className="size-4 text-zinc-400 dark:text-zinc-500" />
						<span className="text-xs text-zinc-600 dark:text-zinc-400">
							<span className="font-medium text-zinc-900 dark:text-white">
								{campaign.maxEnrollments?.toLocaleString("en-IN") ?? "—"}
							</span>{" "}
							max enrollments
						</span>
						{campaign.isPublic ? (
							<span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
								<GlobeAltIcon className="size-3" />
								Public
							</span>
						) : (
							<span className="ml-auto inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
								<LockClosedIcon className="size-3" />
								Private
							</span>
						)}
					</div>
				</div>
			)}

			{/* Footer */}
			<div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
				<span className="min-w-0 truncate text-xs text-zinc-500 dark:text-zinc-400">
					{footerMessage}
				</span>
				<Link
					href={`/${orgSlug}/campaigns/${campaign.id}`}
					className="shrink-0 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
				>
					View Details →
				</Link>
			</div>
		</div>
	);
}

// =============================================================================
// CAMPAIGN CARD SKELETON
// =============================================================================

function CampaignCardSkeleton() {
	return (
		<div className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
			<div className="p-4">
				<div className="flex items-center justify-between">
					<Skeleton width={60} height={20} borderRadius={9999} />
					<Skeleton width={60} height={20} borderRadius={9999} />
				</div>
				<Skeleton width="85%" height={18} className="mt-3" />
				<Skeleton width={100} height={14} className="mt-2" />
			</div>
			<div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
				<div className="flex items-center justify-between">
					<Skeleton width={60} height={12} />
					<Skeleton width={50} height={12} />
				</div>
				<Skeleton width="100%" height={6} borderRadius={9999} className="mt-2" />
			</div>
			<div className="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex flex-col items-center gap-1 py-2.5">
						<Skeleton width={36} height={10} />
						<Skeleton width={28} height={16} />
					</div>
				))}
			</div>
			<div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
				<Skeleton width={70} height={14} />
				<Skeleton width={20} height={20} />
			</div>
		</div>
	);
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center rounded-xl bg-zinc-50 py-16 dark:bg-zinc-900/50">
			<div className="flex size-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
				<ExclamationTriangleIcon className="size-6 text-red-500" />
			</div>
			<p className="mt-4 font-semibold text-zinc-900 dark:text-white">Something went wrong</p>
			<p className="mt-1 text-sm text-zinc-500">Unable to load campaigns</p>
			<Button onClick={onRetry} outline className="mt-5">
				<ArrowPathIcon className="size-4" />
				Try again
			</Button>
		</div>
	);
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function CampaignsListSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Skeleton width={130} height={32} borderRadius={8} />
					<Skeleton width={280} height={16} borderRadius={6} className="mt-2" />
				</div>
				<Skeleton width={150} height={40} borderRadius={8} />
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				{[1, 2, 3, 4].map((i) => (
					<StatCardSkeleton key={i} />
				))}
			</div>

			{/* Toolbar */}
			<div className="space-y-3">
				<div className="flex gap-2">
					<Skeleton height={40} borderRadius={8} containerClassName="flex-1" />
					<Skeleton width={40} height={40} borderRadius={8} className="sm:hidden" />
					<Skeleton width={140} height={40} borderRadius={8} className="hidden sm:block" />
				</div>
				<div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
					<Skeleton width={380} height={40} borderRadius={8} />
				</div>
			</div>

			{/* Results */}
			<Skeleton width={90} height={16} />

			{/* Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<CampaignCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

// =============================================================================
// CAMPAIGNS LIST
// =============================================================================

export function CampaignsList() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgSlug = useOrgSlug();

	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sortBy, setSortBy] = useState("date");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [actionPendingId, setActionPendingId] = useState<string | null>(null);

	// Campaign action mutations
	const pauseCampaign = usePauseCampaign();
	const resumeCampaign = useResumeCampaign();
	const deleteCampaign = useDeleteCampaign();
	const duplicateCampaign = useDuplicateCampaign();

	// Map UI filter to API status
	const apiStatus = useMemo((): db.CampaignStatus | undefined => {
		if (statusFilter === "all") return undefined;
		return statusFilter as db.CampaignStatus;
	}, [statusFilter]);

	const {
		data: campaigns,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteCampaigns(organizationId, {
		status: apiStatus,
	});

	// Filter and sort campaigns
	const filteredCampaigns = useMemo(() => {
		let result = [...campaigns];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(campaign) =>
					campaign.title.toLowerCase().includes(query) ||
					campaign.campaignType.toLowerCase().includes(query)
			);
		}

		result.sort((a, b) => {
			if (sortBy === "name") return a.title.localeCompare(b.title);
			// Stats not available on Campaign type, sort by date instead
			if (sortBy === "enrollments")
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

		return result;
	}, [campaigns, searchQuery, sortBy]);

	// Status counts for filter
	const statusCounts = useMemo(() => {
		return {
			all: campaigns.length,
			active: campaigns.filter((c) => c.status === "active").length,
			paused: campaigns.filter((c) => c.status === "paused").length,
			ended: campaigns.filter((c) => c.status === "ended").length,
			draft: campaigns.filter((c) => c.status === "draft").length,
		};
	}, [campaigns]);

	// Stats
	const stats = useMemo(() => {
		const active = statusCounts.active;
		const totalEnrollments = campaigns.reduce((sum, c) => sum + (c.currentEnrollments ?? 0), 0);
		const endingSoon = campaigns.filter((c) => {
			if (c.status !== "active" || !c.endDate) return false;
			const diff = Math.ceil(
				(new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
			);
			return diff >= 0 && diff <= 7;
		}).length;
		return { total: campaigns.length, active, totalEnrollments, endingSoon };
	}, [campaigns, statusCounts]);

	// Campaign action handlers
	const handlePauseCampaign = async (campaignId: string) => {
		if (!organizationId) return;
		setActionPendingId(campaignId);
		try {
			await pauseCampaign.mutateAsync({
				organizationId,
				campaignId,
				reason: "Paused by user",
			});
			refetch();
		} catch (err) {
			console.error("Failed to pause campaign:", getAPIErrorMessage(err));
		} finally {
			setActionPendingId(null);
		}
	};

	const handleResumeCampaign = async (campaignId: string) => {
		if (!organizationId) return;
		setActionPendingId(campaignId);
		try {
			await resumeCampaign.mutateAsync({ organizationId, campaignId });
			refetch();
		} catch (err) {
			console.error("Failed to resume campaign:", getAPIErrorMessage(err));
		} finally {
			setActionPendingId(null);
		}
	};

	const handleDeleteCampaign = async (campaignId: string) => {
		if (!organizationId) return;
		if (
			!window.confirm(
				"Are you sure you want to delete this campaign? This action cannot be undone."
			)
		) {
			return;
		}
		setActionPendingId(campaignId);
		try {
			await deleteCampaign.mutateAsync({ organizationId, campaignId });
			refetch();
		} catch (err) {
			console.error("Failed to delete campaign:", getAPIErrorMessage(err));
		} finally {
			setActionPendingId(null);
		}
	};

	const handleDuplicateCampaign = async (campaignId: string) => {
		if (!organizationId) return;
		setActionPendingId(campaignId);
		try {
			await duplicateCampaign.mutateAsync({ organizationId, campaignId });
			refetch();
		} catch (err) {
			console.error("Failed to duplicate campaign:", getAPIErrorMessage(err));
		} finally {
			setActionPendingId(null);
		}
	};

	const clearAllFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
		setSortBy("date");
	};

	const hasActiveFilters = searchQuery || statusFilter !== "all" || sortBy !== "date";
	const campaignCount = filteredCampaigns.length;

	if (loading) {
		return <CampaignsListSkeleton />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Heading>Campaigns</Heading>
					<Text className="mt-1">
						Manage your marketing campaigns and track performance
					</Text>
				</div>
				<div className="flex items-center gap-2">
					{campaigns.length > 0 && (
						<Button outline onClick={() => exportCampaignsToCSV(filteredCampaigns)}>
							<ArrowDownTrayIcon className="size-4" />
							<span className="hidden sm:inline">Export</span>
						</Button>
					)}
					<Button color="emerald" onClick={() => setShowCreateModal(true)}>
						<PlusIcon className="size-4" />
						Create Campaign
					</Button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				<StatCard
					icon={<MegaphoneIcon className="size-5" />}
					label="Campaigns"
					value={stats.total}
					size="sm"
				/>
				<StatCard
					icon={<RocketLaunchIcon className="size-5" />}
					label="Active"
					value={stats.active}
					variant="success"
					size="sm"
				/>
				<StatCard
					icon={<ClockIcon className="size-5" />}
					label="Ending Soon"
					value={stats.endingSoon}
					variant={stats.endingSoon > 0 ? "warning" : "default"}
					size="sm"
				/>
				<StatCard
					icon={<UserGroupIcon className="size-5" />}
					label="Enrollments"
					value={stats.totalEnrollments.toLocaleString("en-IN")}
					variant="info"
					size="sm"
				/>
			</div>

			{/* Search + Filter Row */}
			<div className="flex items-center gap-3">
				<div className="relative w-52 shrink-0">
					<MagnifyingGlassIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search campaigns..."
						className="h-9 w-full rounded-lg bg-white pl-9 pr-8 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700 dark:focus:ring-white"
						aria-label="Search campaigns"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700"
							aria-label="Clear search"
						>
							<XMarkIcon className="size-3.5" />
						</button>
					)}
				</div>

				{/* Tab filters */}
				<div className="min-w-0 flex-1 overflow-x-auto">
					<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
					{(
						[
							{ value: "all", label: "All", count: statusCounts.all },
							{ value: "active", label: "Active", count: statusCounts.active },
							{ value: "paused", label: "Paused", count: statusCounts.paused },
							{ value: "ended", label: "Ended", count: statusCounts.ended },
							{ value: "draft", label: "Draft", count: statusCounts.draft },
						] as { value: StatusFilter; label: string; count: number }[]
					).map((tab) => {
						const isActive = statusFilter === tab.value;
						return (
							<button
								type="button"
								key={tab.value}
								onClick={() => setStatusFilter(tab.value)}
								className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${isActive ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
							>
								{tab.label}
								<span
									className={`inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold ${isActive ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"}`}
								>
									{tab.count}
								</span>
							</button>
						);
					})}
					</div>
				</div>
			</div>

			{/* Active filters indicator */}
			{(searchQuery || statusFilter !== "all") && (
				<div className="flex flex-wrap items-center gap-2">
					{searchQuery && (
						<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
							"{searchQuery}"
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="ml-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50"
								aria-label="Remove search filter"
							>
								<XMarkIcon className="size-3.5" />
							</button>
						</span>
					)}
					{statusFilter !== "all" && (
						<span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{getStatusConfig(statusFilter).label}
							<button
								type="button"
								onClick={() => setStatusFilter("all")}
								className="ml-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700"
								aria-label="Remove status filter"
							>
								<XMarkIcon className="size-3.5" />
							</button>
						</span>
					)}
					<button
						type="button"
						onClick={clearAllFilters}
						className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						Clear all
					</button>
				</div>
			)}

			{/* Results — wrapped in card */}
			<div className="rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 overflow-hidden dark:bg-zinc-900 dark:ring-white/10">
				{/* Results header */}
				<div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-100 sm:px-4 sm:py-3 dark:border-zinc-800">
					<span className="text-sm text-zinc-500 dark:text-zinc-400">
						{campaignCount} campaign{campaignCount !== 1 ? "s" : ""}
						{searchQuery && ` matching "${searchQuery}"`}
					</span>
					{hasActiveFilters && (
						<button
							type="button"
							onClick={clearAllFilters}
							className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
						>
							Clear filters
						</button>
					)}
				</div>

				{/* Results body */}
				{error ? (
					<div className="p-4">
						<ErrorState onRetry={refetch} />
					</div>
				) : filteredCampaigns.length > 0 ? (
					<div className="p-3 sm:p-4">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{filteredCampaigns.map((campaign) => (
								<CampaignCard
									key={campaign.id}
									campaign={campaign}
									orgSlug={orgSlug}
									onPause={handlePauseCampaign}
									onResume={handleResumeCampaign}
									onDelete={handleDeleteCampaign}
									onDuplicate={handleDuplicateCampaign}
									isActionPending={actionPendingId === campaign.id}
								/>
							))}
						</div>

						{/* Load More */}
						{hasMore && (
							<div className="flex justify-center pt-6">
								<Button outline onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
									{isFetchingNextPage ? (
										<>
											<ArrowPathIcon className="size-4 animate-spin" />
											Loading...
										</>
									) : (
										"Load More"
									)}
								</Button>
							</div>
						)}
					</div>
				) : (
					<div className="p-8 sm:p-12">
						<EmptyState
							preset="campaigns"
							title={hasActiveFilters ? "No campaigns found" : "No campaigns yet"}
							description={
								hasActiveFilters
									? "Try adjusting your filters or search query"
									: "Create your first campaign to start driving results"
							}
							action={
								hasActiveFilters
									? { label: "Clear filters", onClick: clearAllFilters }
									: { label: "Create Campaign", onClick: () => setShowCreateModal(true) }
							}
						/>
					</div>
				)}
			</div>

			{/* Create Campaign Modal */}
			<CreateCampaignModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				organizationId={organizationId}
				onSuccess={refetch}
			/>
		</div>
	);
}
