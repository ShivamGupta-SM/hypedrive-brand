import * as Headless from "@headlessui/react";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { Link } from "@/components/link";
import { CopyButton } from "@/components/shared";
import { Card, CardGrid, StatCard } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/skeleton";
import { Text } from "@/components/text";
import {
	getAPIErrorMessage,
	getAssetUrl,
	useCurrentOrganization,
	useDeleteListing,
	useListing,
	useUpdateListing,
} from "@/hooks";
import { useOrgSlug } from "@/hooks/use-org-slug";
import type { brand } from "@/lib/brand-client";

type Listing = brand.ListingWithStats;

import {
	ArrowLeftIcon,
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
	CalendarIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	CubeIcon,
	CurrencyRupeeIcon,
	ExclamationTriangleIcon,
	EyeIcon,
	LinkIcon,
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
import { formatCurrency } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";
import { useCan } from "@/store/permissions-store";

const routeApi = getRouteApi("/_app/$orgSlug/listings_/$id");

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
				Failed to load listing details. Please try again.
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
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
				<Skeleton width={200} height={200} borderRadius={16} />
				<div className="flex-1 space-y-3">
					<Skeleton width={250} height={32} borderRadius={8} />
					<Skeleton width={150} height={20} borderRadius={6} />
					<div className="flex gap-2">
						<Skeleton width={80} height={24} borderRadius={12} />
						<Skeleton width={80} height={24} borderRadius={12} />
					</div>
					<Skeleton width={120} height={28} borderRadius={8} />
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} width="100%" height={100} borderRadius={12} />
				))}
			</div>

			{/* Content */}
			<div className="grid gap-6 lg:grid-cols-2">
				<Skeleton width="100%" height={300} borderRadius={12} />
				<Skeleton width="100%" height={300} borderRadius={12} />
			</div>
		</div>
	);
}

// =============================================================================
// IMAGE GALLERY
// =============================================================================

function ImageGallery({ images }: { images: string[] }) {
	if (images.length === 0) {
		return (
			<div className="flex aspect-square w-full max-w-sm items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
				<CubeIcon className="size-20 text-zinc-300 dark:text-zinc-600" />
			</div>
		);
	}

	const primaryImage = images[0];
	const otherImages = images.slice(1);

	return (
		<div className="space-y-3">
			{/* Main image */}
			<div className="aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
				<img src={getAssetUrl(primaryImage)} alt="Listing" className="h-full w-full object-cover" />
			</div>

			{/* Thumbnails */}
			{otherImages.length > 0 && (
				<div className="flex gap-2 overflow-x-auto pb-1">
					{otherImages.slice(0, 4).map((imgUrl, i) => (
						<div
							key={`${imgUrl}-${i}`}
							className="size-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
						>
							<img
								src={getAssetUrl(imgUrl)}
								alt={`Listing ${i + 2}`}
								className="h-full w-full object-cover"
							/>
						</div>
					))}
					{otherImages.length > 4 && (
						<div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
							+{otherImages.length - 4}
						</div>
					)}
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
				price: (listing.price / 100).toFixed(2),
				link: listing.link || "",
				listingImages: listing.listingImages?.map((img) => img.imageUrl) || [],
			});
			setStep(1);
			setErrors({});
			setImageUrl("");
		}
	}, [isOpen, listing]);

	const updateField = useCallback(
		<K extends keyof EditListingFormData>(field: K, value: EditListingFormData[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		},
		[]
	);

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
					formData.listingImages.length > 0
						? formData.listingImages.map((url) => ({ imageUrl: url }))
						: undefined,
			});
			onSuccess();
			onClose();
		} catch (err) {
			console.error("Failed to update listing:", getAPIErrorMessage(err));
		}
	}, [formData, organizationId, listing, updateListing, onSuccess, onClose, validateStep]);

	const resetAndClose = useCallback(() => {
		setStep(1);
		setErrors({});
		setImageUrl("");
		onClose();
	}, [onClose]);

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
									Edit Listing
								</Headless.DialogTitle>
								<p className="mt-0.5 text-sm text-zinc-500">
									Step {step} of 2 · {EDIT_LISTING_STEPS[step - 1].description}
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
						</div>

						{/* Content */}
						<div className="max-h-[60vh] overflow-y-auto p-5">
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
												"w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white",
												errors.name
													? "border-red-300 focus:border-red-500"
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
													"w-full rounded-xl border bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white",
													errors.identifier
														? "border-red-300 focus:border-red-500"
														: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
												)}
											/>
										</div>
										{errors.identifier && (
											<p className="mt-1 text-sm text-red-500">{errors.identifier}</p>
										)}
									</div>

									{/* Price */}
									<div>
										<label
											htmlFor="edit-listing-price"
											className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
										>
											Price (₹) <span className="text-red-500">*</span>
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
													"w-full rounded-xl border bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white",
													errors.price
														? "border-red-300 focus:border-red-500"
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
											className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
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
													"w-full rounded-xl border bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:bg-zinc-800 dark:text-white",
													errors.link
														? "border-red-300 focus:border-red-500"
														: "border-zinc-200 focus:border-zinc-400 dark:border-zinc-700"
												)}
											/>
										</div>
										{errors.link && <p className="mt-1 text-sm text-red-500">{errors.link}</p>}
									</div>

									{/* Image URLs */}
									<div>
										<span className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
											Listing Images
										</span>
										<p className="mb-3 text-xs text-zinc-500">
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
													className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
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
															className="size-12 rounded-lg object-cover"
															onError={(e) => {
																(e.target as HTMLImageElement).src =
																	"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath fill='%23a1a1aa' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'/%3E%3C/svg%3E";
															}}
														/>
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm text-zinc-900 dark:text-white">
																{imgUrl.split("/").pop()}
															</p>
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
																{idx === 0 ? "✓ Primary" : "Set as primary"}
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
												<PhotoIcon className="mx-auto size-8 text-zinc-400" />
												<p className="mt-2 text-sm text-zinc-500">No images added yet</p>
												<p className="text-xs text-zinc-400">
													Add image URLs above to showcase your listing
												</p>
											</div>
										)}
									</div>
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4 dark:border-zinc-800">
							<div>
								{step > 1 && (
									<Button type="button" onClick={handleBack} outline>
										<ChevronLeftIcon className="size-4" />
										Back
									</Button>
								)}
							</div>
							<div className="flex gap-2">
								<Button type="button" onClick={resetAndClose} outline>
									Cancel
								</Button>
								{step < 2 ? (
									<Button type="button" onClick={handleNext} color="emerald">
										Next
										<ChevronRightIcon className="size-4" />
									</Button>
								) : (
									<Button
										type="button"
										onClick={handleSubmit}
										color="emerald"
										disabled={updateListing.isPending}
									>
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
							</div>
						</div>
					</Headless.DialogPanel>
				</div>
			</div>
		</Headless.Dialog>
	);
}

// =============================================================================
// PRODUCT SHOW PAGE
// =============================================================================

export function ListingShow() {
	const { id: listingId } = routeApi.useParams();
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgSlug = useOrgSlug();

	// Permission checks
	const canUpdateListing = useCan("listing", "update");
	const canDeleteListing = useCan("listing", "delete");

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

	const loading = listingLoading;

	const handleRefetch = () => {
		refetchListing();
	};

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

	if (loading) {
		return <LoadingSkeleton />;
	}

	if (listingError || !listing) {
		return <ErrorState onRetry={handleRefetch} />;
	}

	return (
		<div className="space-y-6">
			{/* Back Button */}
			<Link
				href={`/${orgSlug}/listings`}
				className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
			>
				<ArrowLeftIcon className="size-4" />
				Back to Listings
			</Link>

			{/* Header */}
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-start">
					{/* Listing Images */}
					<div className="shrink-0">
						<ImageGallery images={listing.listingImages?.map((img) => img.imageUrl) || []} />
					</div>

					{/* Listing Info */}
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Heading>{listing.name}</Heading>
						</div>

						<div className="flex items-center gap-1">
						<p className="text-sm text-zinc-500 dark:text-zinc-400">SKU: {listing.identifier}</p>
						<CopyButton value={listing.identifier} label="SKU" />
					</div>

						<p className="text-2xl font-bold text-zinc-900 dark:text-white">
							{formatCurrency(listing.price / 100)}
						</p>

						{listing.description && <Text className="max-w-lg">{listing.description}</Text>}

						{listing.link && (
							<a
								href={listing.link}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
							>
								<LinkIcon className="size-4" />
								View Listing Page
								<ArrowTopRightOnSquareIcon className="size-3" />
							</a>
						)}
					</div>
				</div>

				{/* Actions */}
				{(canUpdateListing || canDeleteListing) && (
					<div className="flex gap-2">
						{canUpdateListing && (
							<Button onClick={() => setShowEditModal(true)} outline>
								<PencilIcon className="size-4" />
								Edit
							</Button>
						)}
						{canDeleteListing && (
							<Button onClick={() => setShowDeleteConfirm(true)} outline>
								<TrashIcon className="size-4 text-red-500" />
								<span className="text-red-600 dark:text-red-400">Delete</span>
							</Button>
						)}
					</div>
				)}
			</div>

			{/* Stats Row */}
			<CardGrid columns={3} gap="md">
				<StatCard
					icon={<EyeIcon className="size-5" />}
					label="Total Views"
					value={listing.views.toLocaleString("en-IN")}
				/>
				<StatCard
					icon={<TagIcon className="size-5" />}
					label="Price"
					value={formatCurrency(listing.price / 100)}
					variant="success"
				/>
				<StatCard
					icon={<CalendarIcon className="size-5" />}
					label="Created"
					value={new Date(listing.createdAt).toLocaleDateString("en-IN", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				/>
			</CardGrid>

			{/* Main Content */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Listing Details */}
				<Card>
					<div className="p-6">
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Listing Details</h3>

						<div className="mt-6 space-y-4">
							{/* SKU */}
							<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
										<TagIcon className="size-5 text-zinc-500" />
									</div>
									<div>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">SKU</p>
										<p className="text-sm text-zinc-500 dark:text-zinc-400">Listing identifier</p>
									</div>
								</div>
								<div className="flex items-center gap-1">
								<span className="font-mono text-sm text-zinc-900 dark:text-white">
									{listing.identifier}
								</span>
								<CopyButton value={listing.identifier} label="SKU" />
							</div>
							</div>

							{/* Created/Updated */}
							<div className="flex items-center justify-between pt-2">
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/30">
										<CalendarIcon className="size-5 text-sky-500" />
									</div>
									<div>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">
											Last Updated
										</p>
										<p className="text-sm text-zinc-500 dark:text-zinc-400">
											{new Date(listing.updatedAt).toLocaleDateString("en-IN", {
												month: "long",
												day: "numeric",
												year: "numeric",
											})}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Card>

				{/* Associated Campaigns */}
				<Card>
					<div className="p-6">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Campaigns</h3>
						</div>

						<div className="mt-6">
							<EmptyState
								preset="campaigns"
								title="View campaigns"
								description="Browse campaigns associated with this listing"
								action={{
									label: "View Campaigns",
									href: `/${orgSlug}/campaigns`,
								}}
							/>
						</div>
					</div>
				</Card>
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
			<Headless.Dialog
				open={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				className="relative z-50"
			>
				<Headless.DialogBackdrop
					transition
					className="fixed inset-0 bg-black/40 backdrop-blur-sm transition duration-200 ease-out data-closed:opacity-0"
				/>
				<div className="fixed inset-0 flex items-center justify-center p-4">
					<Headless.DialogPanel
						transition
						className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-900"
					>
						<div className="flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
							<TrashIcon className="size-6 text-red-600 dark:text-red-400" />
						</div>
						<Headless.DialogTitle className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
							Delete Listing
						</Headless.DialogTitle>
						<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
							Are you sure you want to delete{" "}
							<strong className="text-zinc-700 dark:text-zinc-300">{listing.name}</strong>? This
							action cannot be undone.
						</p>
						<div className="mt-6 flex gap-3">
							<Button outline onClick={() => setShowDeleteConfirm(false)} className="flex-1">
								Cancel
							</Button>
							<Button
								color="red"
								onClick={handleDelete}
								disabled={deleteListing.isPending}
								className="flex-1"
							>
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
						</div>
					</Headless.DialogPanel>
				</div>
			</Headless.Dialog>
		</div>
	);
}
