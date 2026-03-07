import {
	ArrowPathIcon,
	ArrowUpRightIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	CubeIcon,
	CurrencyRupeeIcon,
	ExclamationTriangleIcon,
	LinkIcon,
	MegaphoneIcon,
	PencilIcon,
	PhotoIcon,
	PlusIcon,
	TagIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Heading } from "@/components/heading";
import { extractPlatformFromText, getPlatformColor, getPlatformIcon } from "@/components/icons/platform-icons";
import { CopyButton } from "@/components/shared";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";
import { useCampaigns } from "@/features/campaigns/hooks";
import { useCancelCampaign, useDuplicateCampaign, usePauseCampaign, useResumeCampaign } from "@/features/campaigns/mutations";
import { useListing } from "@/features/listings/hooks";
import { useDeleteListing, useUpdateListing } from "@/features/listings/mutations";
import { getFriendlyErrorMessage, getAssetUrl } from "@/hooks/api-client";
import { usePageTitle } from "@/hooks/use-breadcrumb";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand } from "@/lib/brand-client";
import { formatCurrency } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";
import { CampaignCard, CampaignCardSkeleton } from "@/pages/campaigns/campaign-card";

type Listing = brand.ListingWithStats;

const routeApi = getRouteApi("/_app/$orgSlug/listings_/$id");

// =============================================================================
// HELPERS
// =============================================================================

function detectPlatform(listing: Listing) {
	const platform = extractPlatformFromText(listing.link) || extractPlatformFromText(listing.name);
	if (!platform) return null;
	const PlatformIcon = getPlatformIcon(platform);
	const colorClass = getPlatformColor(platform);
	const label = platform.charAt(0).toUpperCase() + platform.slice(1);
	return { name: platform, label, Icon: PlatformIcon, colorClass };
}

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("en-IN", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
	return (
		<div className="animate-fade-in space-y-4 sm:space-y-5">
			{/* Hero Card */}
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="flex flex-col lg:flex-row">
					{/* Image area */}
					<div className="shrink-0 border-b border-zinc-200 bg-zinc-50/50 p-3 sm:p-4 lg:w-80 lg:border-b-0 lg:border-r lg:p-5 xl:w-96 dark:border-zinc-800 dark:bg-zinc-800/20">
						<Skeleton width="100%" height={0} borderRadius={12} className="aspect-square!" />
					</div>
					{/* Info area */}
					<div className="flex-1 p-4 sm:p-5">
						<div className="flex items-start justify-between gap-3">
							<Skeleton width={200} height={24} borderRadius={8} />
							<Skeleton width={80} height={32} borderRadius={8} />
						</div>
						<div className="mt-3 flex gap-1.5">
							<Skeleton width={55} height={20} borderRadius={12} />
							<Skeleton width={70} height={20} borderRadius={12} />
							<Skeleton width={80} height={20} borderRadius={12} />
						</div>
						<Skeleton width="80%" height={14} borderRadius={6} className="mt-3" />
						<Skeleton width="60%" height={14} borderRadius={6} className="mt-1.5" />
						<div className="mt-5 grid grid-cols-2 gap-3">
							{[1, 2, 3, 4].map((i) => (
								<div key={i} className="space-y-1">
									<Skeleton width={50} height={10} borderRadius={4} />
									<Skeleton width={80} height={16} borderRadius={6} />
								</div>
							))}
						</div>
						<Skeleton width={140} height={36} borderRadius={8} className="mt-5" />
					</div>
				</div>
			</div>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total Views", value: "" },
					{ name: "Campaigns", value: "" },
					{ name: "Price", value: "" },
					{ name: "Created", value: "" },
				]}
				loading
				columns={4}
			/>

			{/* Campaigns card */}
			<Skeleton width="100%" height={100} borderRadius={12} />
		</div>
	);
}

// =============================================================================
// IMAGE GALLERY
// =============================================================================

function ImageGallery({ images }: { images: string[] }) {
	const [activeIndex, setActiveIndex] = useState(0);

	if (images.length === 0) {
		return (
			<div className="flex aspect-square w-full items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
				<CubeIcon className="size-12 text-zinc-300 dark:text-zinc-600" />
			</div>
		);
	}

	const thumbnails = images.length > 1 ? images : null;

	return (
		<div className="space-y-2">
			{/* Main image + vertical thumbs on sm+ */}
			<div className="flex gap-2.5">
				{/* Vertical thumbnail strip — sm+ only */}
				{thumbnails && (
					<div className="-m-1 hidden shrink-0 flex-col gap-1.5 overflow-y-auto p-1 sm:flex">
						{thumbnails.map((imgUrl, i) => (
							<button
								key={`${imgUrl}-${i}`}
								type="button"
								onClick={() => setActiveIndex(i)}
								className={clsx(
									"size-12 shrink-0 overflow-hidden rounded-lg bg-white ring-1 transition-all dark:bg-zinc-800",
									i === activeIndex
										? "ring-2 ring-zinc-900 dark:ring-white"
										: "ring-zinc-200 hover:ring-zinc-300 dark:ring-zinc-700 dark:hover:ring-zinc-500"
								)}
							>
								<img
									src={getAssetUrl(imgUrl)}
									alt={`Listing ${i + 1}`}
									className="h-full w-full object-contain p-0.5"
								/>
							</button>
						))}
					</div>
				)}

				{/* Main image */}
				<div className="aspect-square w-full overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-800/50 dark:ring-zinc-700">
					<img
						src={getAssetUrl(images[activeIndex])}
						alt="Listing"
						className="h-full w-full object-contain p-3 sm:p-4"
					/>
				</div>
			</div>

			{/* Horizontal thumbnails — mobile only, below main image */}
			{thumbnails && (
				<div className="scrollbar-hide -m-1 flex gap-1.5 overflow-x-auto p-1 sm:hidden">
					{thumbnails.map((imgUrl, i) => (
						<button
							key={`thumb-${imgUrl}-${i}`}
							type="button"
							onClick={() => setActiveIndex(i)}
							className={clsx(
								"size-11 shrink-0 overflow-hidden rounded-lg bg-white ring-1 transition-all dark:bg-zinc-800",
								i === activeIndex
									? "ring-2 ring-zinc-900 dark:ring-white"
									: "ring-zinc-200 hover:ring-zinc-300 dark:ring-zinc-700"
							)}
						>
							<img src={getAssetUrl(imgUrl)} alt={`Listing ${i + 1}`} className="h-full w-full object-contain p-0.5" />
						</button>
					))}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// EDIT PRODUCT MODAL
// =============================================================================

interface EditListingFormData {
	name: string;
	description: string;
	identifier: string;
	price: string;
	link: string;
	listingImages: string[];
}

const EDIT_LISTING_STEPS = [
	{ id: 1, name: "Details", description: "Listing info" },
	{ id: 2, name: "Media", description: "Images & links" },
];

function EditListingModal({
	isOpen,
	onClose,
	organizationId,
	listing,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	organizationId: string | undefined;
	listing: Listing;
	onSuccess: () => void;
}) {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState<EditListingFormData>({
		name: "",
		description: "",
		identifier: "",
		price: "",
		link: "",
		listingImages: [],
	});
	const [errors, setErrors] = useState<Partial<Record<keyof EditListingFormData, string>>>({});
	const [imageUrl, setImageUrl] = useState("");

	const updateListing = useUpdateListing(organizationId);

	// Initialize form when listing changes or modal opens
	useEffect(() => {
		if (isOpen && listing) {
			setFormData({
				name: listing.name,
				description: listing.description || "",
				identifier: listing.identifier || "",
				price: listing.priceDecimal,
				link: listing.link || "",
				listingImages: listing.listingImages?.map((img) => img.imageUrl) || [],
			});
			setStep(1);
			setErrors({});
			setImageUrl("");
		}
	}, [isOpen, listing]);

	const updateField = useCallback(<K extends keyof EditListingFormData>(field: K, value: EditListingFormData[K]) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: undefined }));
	}, []);

	const validateStep = useCallback(
		(currentStep: number): boolean => {
			const newErrors: Partial<Record<keyof EditListingFormData, string>> = {};

			if (currentStep === 1) {
				if (!formData.name.trim()) {
					newErrors.name = "Name is required";
				}
				if (!formData.identifier.trim()) {
					newErrors.identifier = "Identifier is required";
				}
				if (!formData.price || parseFloat(formData.price) <= 0) {
					newErrors.price = "Valid price is required";
				}
			}

			if (currentStep === 2) {
				if (!formData.link.trim()) {
					newErrors.link = "Listing link is required";
				} else if (!formData.link.startsWith("http")) {
					newErrors.link = "Must be a valid URL";
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

	const addImage = useCallback(() => {
		if (imageUrl.trim() && imageUrl.startsWith("http")) {
			setFormData((prev) => ({
				...prev,
				listingImages: [...prev.listingImages, imageUrl.trim()],
			}));
			setImageUrl("");
		}
	}, [imageUrl]);

	const removeImage = useCallback((index: number) => {
		setFormData((prev) => ({
			...prev,
			listingImages: prev.listingImages.filter((_, i) => i !== index),
		}));
	}, []);

	const setPrimaryImage = useCallback((index: number) => {
		setFormData((prev) => {
			const newImages = [...prev.listingImages];
			const [primaryImage] = newImages.splice(index, 1);
			return { ...prev, listingImages: [primaryImage, ...newImages] };
		});
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!validateStep(2) || !organizationId || !listing) return;

		try {
			await updateListing.mutateAsync({
				listingId: listing.id,
				name: formData.name.trim(),
				description: formData.description.trim() || undefined,
				identifier: formData.identifier.trim(),
				price: Math.round(parseFloat(formData.price) * 100),
				link: formData.link.trim(),
				listingImages:
					formData.listingImages.length > 0 ? formData.listingImages.map((url) => ({ imageUrl: url })) : undefined,
			});
			onSuccess();
			onClose();
		} catch (err) {
			console.error("Failed to update listing:", getFriendlyErrorMessage(err));
		}
	}, [formData, organizationId, listing, updateListing, onSuccess, onClose, validateStep]);

	const resetAndClose = useCallback(() => {
		setStep(1);
		setErrors({});
		setImageUrl("");
		onClose();
	}, [onClose]);

	return (
		<Dialog open={isOpen} onClose={resetAndClose} size="lg">
			<DialogHeader
				icon={PencilIcon}
				iconColor="amber"
				title="Edit Listing"
				description={`Step ${step} of 2 · ${EDIT_LISTING_STEPS[step - 1].description}`}
				onClose={resetAndClose}
			/>

			{/* Progress Steps */}
			<div className="mt-5 flex items-center justify-center gap-4">
				{EDIT_LISTING_STEPS.map((s, idx) => (
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
						{idx < EDIT_LISTING_STEPS.length - 1 && (
							<div
								className={clsx(
									"mx-3 h-0.5 w-12 rounded-full transition-colors sm:w-20",
									step > s.id ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
								)}
							/>
						)}
					</div>
				))}
			</div>

			<DialogBody>
				<div className="max-h-[60vh] overflow-y-auto">
					{/* Step 1: Listing Details */}
					{step === 1 && (
						<div className="space-y-4">
							{/* Name */}
							<div>
								<label
									htmlFor="edit-listing-name"
									className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
								>
									Listing Name <span className="text-red-500">*</span>
								</label>
								<input
									id="edit-listing-name"
									type="text"
									value={formData.name}
									onChange={(e) => updateField("name", e.target.value)}
									placeholder="e.g., Premium Wireless Headphones"
									className={clsx(
										"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
										errors.name
											? "border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400"
											: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
									)}
								/>
								{errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
							</div>

							{/* Identifier */}
							<div>
								<label
									htmlFor="edit-listing-identifier"
									className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
								>
									SKU <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<TagIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
									<input
										id="edit-listing-identifier"
										type="text"
										value={formData.identifier}
										onChange={(e) => updateField("identifier", e.target.value.toUpperCase())}
										placeholder="e.g., WH-001"
										className={clsx(
											"w-full rounded-xl border bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
											errors.identifier
												? "border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400"
												: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
										)}
									/>
								</div>
								{errors.identifier && <p className="mt-1 text-sm text-red-500">{errors.identifier}</p>}
							</div>

							{/* Price */}
							<div>
								<label
									htmlFor="edit-listing-price"
									className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
								>
									Price ({listing.currency === "INR" ? "\u20B9" : listing.currency}){" "}
									<span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<CurrencyRupeeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
									<input
										id="edit-listing-price"
										type="number"
										step="0.01"
										min="0"
										value={formData.price}
										onChange={(e) => updateField("price", e.target.value)}
										placeholder="0.00"
										className={clsx(
											"w-full rounded-xl border bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
											errors.price
												? "border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400"
												: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
										)}
									/>
								</div>
								{errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
							</div>

							{/* Description */}
							<div>
								<label
									htmlFor="edit-listing-description"
									className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
								>
									Description
								</label>
								<textarea
									id="edit-listing-description"
									value={formData.description}
									onChange={(e) => updateField("description", e.target.value)}
									rows={3}
									placeholder="Brief listing description..."
									className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
								/>
							</div>
						</div>
					)}

					{/* Step 2: Media & Links */}
					{step === 2 && (
						<div className="space-y-4">
							{/* Listing Link */}
							<div>
								<label
									htmlFor="edit-listing-link"
									className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
								>
									Listing Link <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
									<input
										id="edit-listing-link"
										type="url"
										value={formData.link}
										onChange={(e) => updateField("link", e.target.value)}
										placeholder="https://example.com/listing"
										className={clsx(
											"w-full rounded-xl border bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500",
											errors.link
												? "border-red-300 focus:border-red-500 dark:border-red-500/60 dark:focus:border-red-400"
												: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
										)}
									/>
								</div>
								{errors.link && <p className="mt-1 text-sm text-red-500">{errors.link}</p>}
							</div>

							{/* Image URLs */}
							<div>
								<span className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">Listing Images</span>
								<p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
									Add image URLs for your listing. The first image will be the primary image.
								</p>

								{/* Add image input */}
								<div className="flex gap-2">
									<div className="relative flex-1">
										<PhotoIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
										<input
											type="url"
											value={imageUrl}
											onChange={(e) => setImageUrl(e.target.value)}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													addImage();
												}
											}}
											placeholder="https://example.com/image.jpg"
											className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
										/>
									</div>
									<Button type="button" onClick={addImage} outline>
										<PlusIcon className="size-4" />
									</Button>
								</div>

								{/* Image list */}
								{formData.listingImages.length > 0 && (
									<div className="mt-3 space-y-2">
										{formData.listingImages.map((imgUrl, idx) => (
											<div
												key={imgUrl}
												className="flex items-center gap-3 rounded-xl bg-zinc-50 p-2 dark:bg-zinc-800/50"
											>
												<img
													src={getAssetUrl(imgUrl)}
													alt={`Listing ${idx + 1}`}
													className="size-12 rounded-lg bg-zinc-100 object-contain dark:bg-zinc-800"
													onError={(e) => {
														(e.target as HTMLImageElement).src =
															"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath fill='%23a1a1aa' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E";
													}}
												/>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm text-zinc-900 dark:text-white">{imgUrl.split("/").pop()}</p>
													<button
														type="button"
														onClick={() => setPrimaryImage(idx)}
														className={clsx(
															"text-xs font-medium",
															idx === 0
																? "text-emerald-600 dark:text-emerald-400"
																: "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
														)}
													>
														{idx === 0 ? "Primary" : "Set as primary"}
													</button>
												</div>
												<button
													type="button"
													onClick={() => removeImage(idx)}
													className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
												>
													<XMarkIcon className="size-4" />
												</button>
											</div>
										))}
									</div>
								)}

								{formData.listingImages.length === 0 && (
									<div className="mt-3 rounded-xl border-2 border-dashed border-zinc-200 p-6 text-center dark:border-zinc-700">
										<PhotoIcon className="mx-auto size-8 text-zinc-500 dark:text-zinc-400" />
										<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No images added yet</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											Add image URLs above to showcase your listing
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</DialogBody>

			<DialogActions>
				<div className="flex flex-1 items-center">
					{step > 1 && (
						<Button type="button" onClick={handleBack} outline>
							<ChevronLeftIcon className="size-4" />
							Back
						</Button>
					)}
				</div>
				<Button plain onClick={resetAndClose}>
					Cancel
				</Button>
				{step < 2 ? (
					<Button type="button" onClick={handleNext} color="emerald">
						Next
						<ChevronRightIcon className="size-4" />
					</Button>
				) : (
					<Button type="button" onClick={handleSubmit} color="emerald" disabled={updateListing.isPending}>
						{updateListing.isPending ? (
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
// LISTING SHOW PAGE
// =============================================================================

export function ListingShow() {
	const { id: listingId } = routeApi.useParams();
	const { organizationId, orgSlug } = useOrgContext();

	// Permission checks — prefer server-driven allowedActions, fallback to useCan
	const canUpdateGlobal = useCan("listing", "update");
	const canDeleteGlobal = useCan("listing", "delete");

	// Modal state
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	// Mutations
	const deleteListing = useDeleteListing(organizationId);

	const navigate = useNavigate();

	const {
		data: listing,
		loading: listingLoading,
		error: listingError,
		refetch: refetchListing,
	} = useListing(organizationId, listingId);
	usePageTitle(listing?.name ?? null);

	// Campaigns for this listing
	const {
		data: campaigns,
		loading: campaignsLoading,
	} = useCampaigns(organizationId, { listingId, take: 6 });

	const pauseCampaign = usePauseCampaign();
	const resumeCampaign = useResumeCampaign();
	const cancelCampaign = useCancelCampaign();
	const duplicateCampaign = useDuplicateCampaign();

	const canPauseCampaign = useCan("campaign", "update");
	const canResumeCampaign = useCan("campaign", "update");
	const canDeleteCampaign = useCan("campaign", "delete");
	const canCreateCampaign = useCan("campaign", "create");

	const handlePauseCampaign = useCallback(async (id: string) => {
		if (!organizationId) return;
		try {
			await pauseCampaign.mutateAsync({ organizationId, campaignId: id });
			showToast.success("Campaign paused");
		} catch (err) {
			showToast.error(err, "Failed to pause campaign");
		}
	}, [organizationId, pauseCampaign]);

	const handleResumeCampaign = useCallback(async (id: string) => {
		if (!organizationId) return;
		try {
			await resumeCampaign.mutateAsync({ organizationId, campaignId: id });
			showToast.success("Campaign resumed");
		} catch (err) {
			showToast.error(err, "Failed to resume campaign");
		}
	}, [organizationId, resumeCampaign]);

	const handleCancelCampaign = useCallback(async (id: string) => {
		if (!organizationId) return;
		try {
			await cancelCampaign.mutateAsync({ organizationId, campaignId: id });
			showToast.success("Campaign cancelled");
		} catch (err) {
			showToast.error(err, "Failed to cancel campaign");
		}
	}, [organizationId, cancelCampaign]);

	const handleDuplicateCampaign = useCallback(async (id: string) => {
		if (!organizationId) return;
		try {
			await duplicateCampaign.mutateAsync({ organizationId, campaignId: id });
			showToast.success("Campaign duplicated");
		} catch (err) {
			showToast.error(err, "Failed to duplicate campaign");
		}
	}, [organizationId, duplicateCampaign]);

	const handleDelete = useCallback(async () => {
		if (!listingId) return;
		try {
			await deleteListing.mutateAsync(listingId);
			showToast.success("Listing deleted");
			navigate({ to: "/$orgSlug/listings", params: { orgSlug } });
		} catch (err) {
			showToast.error(err, "Failed to delete listing");
			setShowDeleteConfirm(false);
		}
	}, [listingId, deleteListing, navigate, orgSlug]);

	if (listingLoading) {
		return <LoadingSkeleton />;
	}

	if (listingError || !listing) {
		return <ErrorState message="Failed to load listing details. Please try again." onRetry={refetchListing} />;
	}

	const platform = detectPlatform(listing);
	const canUpdate = listing.allowedActions ? (listing.allowedActions as string[]).includes("update") : canUpdateGlobal;
	const canDelete = listing.allowedActions ? (listing.allowedActions as string[]).includes("delete") : canDeleteGlobal;
	const images = listing.listingImages?.map((img) => img.imageUrl) || [];

	return (
		<div className="space-y-4 sm:space-y-5">
			{/* Product Hero Card */}
			<div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className={clsx("pointer-events-none absolute inset-px top-px h-24 rounded-t-[11px] bg-linear-to-b sm:h-32", listing.isActive ? "from-emerald-500/20 via-emerald-500/5 to-transparent dark:from-emerald-500/15 dark:via-emerald-500/5" : "from-zinc-500/15 via-zinc-500/5 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5")} />
				<div className="relative flex flex-col lg:flex-row">
					{/* Image gallery */}
					<div className="shrink-0 border-b border-zinc-200 bg-zinc-50/50 p-3 sm:p-4 lg:w-80 lg:border-b-0 lg:border-r lg:p-5 xl:w-96 dark:border-zinc-800 dark:bg-zinc-800/20">
						<ImageGallery images={images} />
					</div>

					{/* Product info */}
					<div className="flex min-w-0 flex-1 flex-col">
						<div className="flex-1 space-y-4 p-4 sm:p-5">
							{/* Title + price */}
							<div className="flex items-start justify-between gap-2">
								<Heading className="text-base/snug sm:text-lg/snug">{listing.name}</Heading>
								<span className="shrink-0 rounded-lg bg-emerald-50 px-2 py-0.5 text-sm font-bold text-emerald-700 sm:px-2.5 sm:py-1 sm:text-base dark:bg-emerald-950/30 dark:text-emerald-400">
									{formatCurrency(listing.priceDecimal)}
								</span>
							</div>

							{/* Badges */}
							<div className="flex flex-wrap items-center gap-1.5">
								<Badge color={listing.isActive ? "emerald" : "zinc"} className="text-[11px]">
									{listing.isActive ? "Active" : "Inactive"}
								</Badge>
								{listing.identifier && (
									<Badge color="zinc" className="font-mono text-[11px]">
										{listing.identifier}
									</Badge>
								)}
								{platform?.Icon && (
									<Badge color="zinc" className="inline-flex items-center gap-1 text-[11px]">
										<platform.Icon className={clsx("size-3", platform.colorClass)} />
										{platform.label}
									</Badge>
								)}
								{listing.campaignCount > 0 && (
									<Badge color="sky" className="text-[11px]">
										{listing.campaignCount} campaign{listing.campaignCount !== 1 ? "s" : ""}
									</Badge>
								)}
							</div>

							{/* Description */}
							{listing.description && (
								<p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{listing.description}</p>
							)}

							{/* Quick details */}
							<dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-zinc-200 pt-4 dark:border-zinc-800">
								<div>
									<dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										SKU
									</dt>
									<dd className="mt-0.5 flex items-center gap-1">
										<span className="font-mono text-sm text-zinc-900 dark:text-white">{listing.identifier}</span>
										<CopyButton value={listing.identifier ?? ""} label="SKU" />
									</dd>
								</div>
								{platform && (
									<div>
										<dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
											Platform
										</dt>
										<dd className="mt-0.5 flex items-center gap-1.5">
											{platform.Icon && <platform.Icon className={clsx("size-3.5", platform.colorClass)} />}
											<span className="text-sm text-zinc-900 dark:text-white">{platform.label}</span>
										</dd>
									</div>
								)}
								<div>
									<dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										Created
									</dt>
									<dd className="mt-0.5 text-sm text-zinc-900 dark:text-white">{formatDate(listing.createdAt)}</dd>
								</div>
								<div>
									<dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										Updated
									</dt>
									<dd className="mt-0.5 text-sm text-zinc-900 dark:text-white">{formatDate(listing.updatedAt)}</dd>
								</div>
							</dl>

							{/* Platform link */}
							{listing.link && (
								<div className="flex items-center gap-1.5">
									<a
										href={listing.link}
										target="_blank"
										rel="noopener noreferrer"
										className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 sm:px-3.5 sm:py-2 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600"
									>
										{platform?.Icon ? (
											<platform.Icon className={clsx("size-3.5 sm:size-4", platform.colorClass)} />
										) : (
											<LinkIcon className="size-3.5 text-zinc-400 sm:size-4" />
										)}
										{platform ? `View on ${platform.label}` : "View Listing"}
										<ArrowUpRightIcon className="size-3 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-3.5" />
									</a>
									<CopyButton value={listing.link} label="Link" />
								</div>
							)}
						</div>

						{/* Actions bar */}
						{(canUpdate || canDelete) && (
							<div className="flex items-center gap-1.5 border-t border-zinc-200 px-4 py-2.5 sm:px-5 dark:border-zinc-800">
								<div className="ml-auto flex items-center gap-1.5">
									{canDelete && (
										<button
											type="button"
											onClick={() => setShowDeleteConfirm(true)}
											className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 dark:border-zinc-700 dark:text-red-400 dark:hover:bg-red-950/30"
										>
											<TrashIcon className="size-3.5" />
											Delete
										</button>
									)}
									{canUpdate && (
										<button
											type="button"
											onClick={() => setShowEditModal(true)}
											className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
										>
											<PencilIcon className="size-3.5" />
											Edit Listing
										</button>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Stats Grid */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total Views", value: listing.views.toLocaleString("en-IN") },
					{ name: "Campaigns", value: listing.campaignCount.toString() },
					{ name: "Price", value: formatCurrency(listing.priceDecimal) },
					{ name: "Created", value: formatDate(listing.createdAt) },
				]}
				columns={4}
			/>

			{/* Campaigns */}
			<div>
				<div className="flex items-center justify-between px-0.5 pb-2.5">
					<div className="flex items-center gap-2.5">
						<div className="flex size-6 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/30">
							<MegaphoneIcon className="size-3.5 text-violet-500" />
						</div>
						<h3 className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
							Campaigns
							{listing.campaignCount > 0 && (
								<span className="ml-1.5 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:ring-sky-800">
									{listing.campaignCount}
								</span>
							)}
						</h3>
					</div>
					{listing.campaignCount > 0 && (
						<button
							type="button"
							onClick={() => navigate({ to: "/$orgSlug/campaigns", params: { orgSlug } })}
							className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
						>
							View all &rarr;
						</button>
					)}
				</div>
				{campaignsLoading ? (
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
						{[1, 2, 3].map((i) => (
							<CampaignCardSkeleton key={i} />
						))}
					</div>
				) : campaigns.length > 0 ? (
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
						{campaigns.map((campaign) => (
							<CampaignCard
								key={campaign.id}
								campaign={campaign}
								orgSlug={orgSlug}
								onPause={handlePauseCampaign}
								onResume={handleResumeCampaign}
								onDelete={handleCancelCampaign}
								onDuplicate={handleDuplicateCampaign}
								canPause={canPauseCampaign}
								canResume={canResumeCampaign}
								canDelete={canDeleteCampaign}
								canCreate={canCreateCampaign}
							/>
						))}
					</div>
				) : (
					<EmptyState
						preset="campaigns"
						title="No campaigns"
						description="Create a campaign to promote this listing"
						action={{
							label: "Create Campaign",
							href: `/${orgSlug}/campaigns`,
						}}
					/>
				)}
			</div>

			{/* Edit Listing Modal */}
			{listing && (
				<EditListingModal
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
					organizationId={organizationId}
					listing={listing}
					onSuccess={refetchListing}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
				<DialogHeader
					icon={TrashIcon}
					iconColor="red"
					title="Delete Listing"
					description={`Are you sure you want to delete "${listing.name}"? This action cannot be undone.`}
					onClose={() => setShowDeleteConfirm(false)}
				/>
				<DialogBody>
					<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
						<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
						<p className="text-sm text-red-700 dark:text-red-300">
							This will permanently remove <strong>{listing.name}</strong> and all associated data. This action is
							irreversible.
						</p>
					</div>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setShowDeleteConfirm(false)}>
						Cancel
					</Button>
					<Button color="red" onClick={handleDelete} disabled={deleteListing.isPending}>
						{deleteListing.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Deleting...
							</>
						) : (
							<>
								<TrashIcon className="size-4" />
								Delete
							</>
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
