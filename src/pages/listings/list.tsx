import * as Headless from "@headlessui/react";
import {
	ArrowPathIcon,
	CheckCircleIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	CubeIcon,
	CurrencyRupeeIcon,
	EllipsisVerticalIcon,
	ExclamationTriangleIcon,
	EyeIcon,
	LinkIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	TagIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/button";
import { StatCard } from "@/components/shared/card";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { FileDropzone } from "@/components/file-dropzone";
import { Heading } from "@/components/heading";

import { Link } from "@/components/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Text } from "@/components/text";
import {
	getAPIErrorMessage,
	getAssetUrl,
	useCreateListing,
	useCurrentOrganization,
	useFileUpload,
	useInfiniteListings,
	useOrgSlug,
} from "@/hooks";
import type { brand } from "@/lib/brand-client";
import { useCan } from "@/store/permissions-store";

type Listing = brand.ListingWithStats;

// =============================================================================
// SHIMMER COMPONENT
// =============================================================================

function Shimmer({ className }: { className?: string }) {
	return (
		<div className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700 ${className || ""}`} />
	);
}

// =============================================================================
// FILTER CHIP
// =============================================================================

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
			{label}
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					onRemove();
				}}
				className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
			>
				<XMarkIcon className="size-3" />
			</button>
		</span>
	);
}

// =============================================================================
// FILTER BOTTOM SHEET - Mobile

// =============================================================================
// CREATE PRODUCT MODAL
// =============================================================================

interface ListingFormData {
	name: string;
	description: string;
	identifier: string;
	price: string;
	link: string;
	listingImages: string[];
}

const initialListingFormData: ListingFormData = {
	name: "",
	description: "",
	identifier: "",
	price: "",
	link: "",
	listingImages: [],
};

const LISTING_STEPS = [
	{ id: 1, name: "Details", description: "Listing info" },
	{ id: 2, name: "Media", description: "Images & links" },
];

function CreateListingModal({
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
	const [formData, setFormData] = useState<ListingFormData>(initialListingFormData);
	const [errors, setErrors] = useState<Partial<Record<keyof ListingFormData, string>>>({});
	const [uploadingCount, setUploadingCount] = useState(0);

	const createListing = useCreateListing(organizationId);
	const fileUpload = useFileUpload();
	const navigate = useNavigate();
	const orgSlug = useOrgSlug();

	const updateField = useCallback(
		<K extends keyof ListingFormData>(field: K, value: ListingFormData[K]) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		},
		[]
	);

	const validateStep = useCallback(
		(currentStep: number): boolean => {
			const newErrors: Partial<Record<keyof ListingFormData, string>> = {};

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

	const handleFilesChange = useCallback(
		async (files: File[]) => {
			if (files.length === 0) return;
			setUploadingCount((n) => n + files.length);
			await Promise.all(
				files.map(async (file) => {
					try {
						const { fileUrl } = await fileUpload.mutateAsync({
							file,
							folder: "listing-images",
						});
						setFormData((prev) => ({
							...prev,
							listingImages: [...prev.listingImages, fileUrl],
						}));
					} catch {
						// silent — individual file failure doesn't block others
					} finally {
						setUploadingCount((n) => n - 1);
					}
				})
			);
		},
		[fileUpload]
	);

	const removeImage = useCallback((index: number) => {
		setFormData((prev) => ({
			...prev,
			listingImages: prev.listingImages.filter((_, i) => i !== index),
		}));
	}, []);

	const handleSubmit = useCallback(async () => {
		if (!validateStep(2) || !organizationId) return;

		try {
			const listing = await createListing.mutateAsync({
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
			navigate({ to: "/$orgSlug/listings/$id", params: { orgSlug, id: listing.id } });
		} catch (err) {
			console.error("Failed to create listing:", getAPIErrorMessage(err));
		}
	}, [
		formData,
		organizationId,
		createListing,
		onSuccess,
		onClose,
		navigate,
		validateStep,
		orgSlug,
	]);

	const resetAndClose = useCallback(() => {
		setStep(1);
		setFormData(initialListingFormData);
		setErrors({});
		setUploadingCount(0);
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
									Add Listing
								</Headless.DialogTitle>
								<p className="mt-0.5 text-sm text-zinc-500">
									Step {step} of 2 · {LISTING_STEPS[step - 1].description}
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
								{LISTING_STEPS.map((s, idx) => (
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
										{idx < LISTING_STEPS.length - 1 && (
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
											htmlFor="listing-name"
											className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
										>
											Listing Name <span className="text-red-500">*</span>
										</label>
										<input
											id="listing-name"
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
											htmlFor="listing-identifier"
											className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
										>
											SKU <span className="text-red-500">*</span>
										</label>
										<div className="relative">
											<TagIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
											<input
												id="listing-identifier"
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
											htmlFor="listing-price"
											className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
										>
											Price (₹) <span className="text-red-500">*</span>
										</label>
										<div className="relative">
											<CurrencyRupeeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
											<input
												id="listing-price"
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
											htmlFor="listing-description"
											className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
										>
											Description
										</label>
										<textarea
											id="listing-description"
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
											htmlFor="listing-link"
											className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
										>
											Listing Link <span className="text-red-500">*</span>
										</label>
										<div className="relative">
											<LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
											<input
												id="listing-link"
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

									{/* Image Upload */}
									<div>
										<span className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
											Listing Images
										</span>
										<p className="mb-3 text-xs text-zinc-500">
											Upload images for your listing. The first image will be the primary.
										</p>
										<FileDropzone
											accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp", ".gif"] }}
											label={
												uploadingCount > 0
													? `Uploading ${uploadingCount} image${uploadingCount > 1 ? "s" : ""}…`
													: "Drop images here or click to browse"
											}
											description="PNG, JPG, WEBP — up to 10 MB each"
											variant="compact"
											disabled={uploadingCount > 0}
											showPreviews={false}
											onFilesChange={handleFilesChange}
										/>
										{/* Uploaded image list */}
										{formData.listingImages.length > 0 && (
											<div className="mt-3 space-y-2">
												{formData.listingImages.map((imgUrl, idx) => (
													<div
														key={imgUrl}
														className="flex items-center gap-3 rounded-xl bg-zinc-50 p-2 dark:bg-zinc-800/50"
													>
														<img
															src={imgUrl}
															alt={`Listing ${idx + 1}`}
															className="size-12 shrink-0 rounded-lg object-cover"
														/>
														<div className="min-w-0 flex-1">
															<p className="truncate text-xs text-zinc-500">
																{imgUrl.split("/").pop()}
															</p>
															<span
																className={clsx(
																	"text-xs font-medium",
																	idx === 0
																		? "text-emerald-600 dark:text-emerald-400"
																		: "text-zinc-400"
																)}
															>
																{idx === 0 ? "Primary image" : `Image ${idx + 1}`}
															</span>
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
										disabled={createListing.isPending}
									>
										{createListing.isPending ? (
											<>
												<ArrowPathIcon className="size-4 animate-spin" />
												Creating...
											</>
										) : (
											<>
												<PlusIcon className="size-4" />
												Create Listing
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
// PRODUCT CARD - iOS-style with 3-column footer
// =============================================================================

interface ListingCardProps {
	listing: Listing;
	orgSlug: string;
	canEdit?: boolean;
}

function ListingCard({ listing, orgSlug, canEdit }: ListingCardProps) {
	const imageUrl = listing.listingImages?.[0]
		? getAssetUrl(listing.listingImages[0].imageUrl)
		: null;

	return (
		<div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			{/* Listing Image */}
			<div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
				{imageUrl ? (
					<img src={imageUrl} alt={listing.name} className="h-full w-full object-cover" />
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<CubeIcon className="size-12 text-zinc-300 dark:text-zinc-600" />
					</div>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
				<Link href={`/${orgSlug}/listings/${listing.id}`}>
					<h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
						{listing.name}
					</h3>
				</Link>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">SKU: {listing.identifier}</p>
				<p className="mt-auto text-base font-bold text-zinc-900 dark:text-white">
					₹{(listing.price / 100).toLocaleString("en-IN")}
				</p>
			</div>

			{/* Edge-to-edge divider */}
			<div className="h-px bg-zinc-200 dark:bg-zinc-700" />

			{/* Footer Stats - 2-column layout: Views | Link */}
			<div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700">
				{/* Views */}
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] text-zinc-400 dark:text-zinc-500">Views</span>
					<span className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
						{listing.views.toLocaleString("en-IN")}
					</span>
				</div>

				{/* Listing Link */}
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] text-zinc-400 dark:text-zinc-500">Link</span>
					{listing.link ? (
						<a
							href={listing.link}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs font-semibold text-sky-600 hover:text-sky-700 sm:text-sm dark:text-sky-400 dark:hover:text-sky-300"
						>
							<LinkIcon className="size-4" />
						</a>
					) : (
						<span className="text-xs text-zinc-400 sm:text-sm">—</span>
					)}
				</div>
			</div>

			{/* Actions footer */}
			<div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
				<Link
					href={`/${orgSlug}/listings/${listing.id}`}
					className="text-xs font-medium text-zinc-500 hover:text-zinc-900 sm:text-sm dark:text-zinc-400 dark:hover:text-zinc-200"
				>
					View details
				</Link>
				<Dropdown>
					<DropdownButton plain aria-label="More options" className="-m-1 p-1">
						<EllipsisVerticalIcon className="size-5 text-zinc-400 dark:text-zinc-500" />
					</DropdownButton>
					<DropdownMenu anchor="bottom end">
						<DropdownItem href={`/${orgSlug}/listings/${listing.id}`}>View details</DropdownItem>
						{canEdit && (
							<DropdownItem href={`/${orgSlug}/listings/${listing.id}/edit`}>
								Edit listing
							</DropdownItem>
						)}
						{listing.link && (
							<DropdownItem href={listing.link} target="_blank">
								Open listing link
							</DropdownItem>
						)}
					</DropdownMenu>
				</Dropdown>
			</div>
		</div>
	);
}

// =============================================================================
// LISTING CARD SKELETON
// =============================================================================

function ListingCardSkeleton() {
	return (
		<div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			{/* Image */}
			<div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
				<Shimmer className="h-full w-full rounded-none" />
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-2.5 sm:p-3">
				<Shimmer className="h-4 w-3/4" />
				<Shimmer className="mt-1.5 h-3 w-1/2" />
				<Shimmer className="mt-2 h-5 w-20" />
			</div>

			<div className="h-px bg-zinc-200 dark:bg-zinc-700" />

			{/* Footer Stats - 3 columns */}
			<div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex flex-col items-center justify-center py-2">
						<Shimmer className="h-2.5 w-8" />
						<Shimmer className="mt-0.5 h-3.5 w-10" />
					</div>
				))}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
				<Shimmer className="h-3 w-16" />
				<Shimmer className="size-5 rounded" />
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
			<p className="mt-1 text-sm text-zinc-500">Unable to load listings</p>
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

function ListingsListSkeleton() {
	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Shimmer className="h-8 w-32" />
					<Shimmer className="mt-2 h-4 w-64" />
				</div>
				<Shimmer className="h-10 w-32 rounded-lg" />
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<Shimmer className="size-10 rounded-lg" />
						<div>
							<Shimmer className="h-5 w-10" />
							<Shimmer className="mt-1 h-3 w-14" />
						</div>
					</div>
				))}
			</div>

			{/* Search + Filter Row */}
			<div className="flex items-center gap-3">
				<div className="min-w-0 flex-1">
					<Shimmer className="h-10 w-full rounded-lg sm:h-9 sm:max-w-xs" />
				</div>
				<Shimmer className="size-10 shrink-0 rounded-lg sm:hidden" />
				<Shimmer className="hidden h-9 w-36 rounded-lg sm:block" />
			</div>

			{/* Tabs */}
			<div className="hidden items-center gap-1.5 sm:flex">
				{[1, 2, 3].map((i) => (
					<Shimmer key={i} className="h-8 w-20 rounded-full" />
				))}
			</div>

			{/* Results count */}
			<div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
				<Shimmer className="h-4 w-24" />
			</div>

			{/* Cards Grid */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
				{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
					<ListingCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

// =============================================================================
// PRODUCTS LIST
// =============================================================================

export function ListingsList() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgSlug = useOrgSlug();

	// Permission checks
	const canCreateListing = useCan("listing", "create");
	const canUpdateListing = useCan("listing", "update");

	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("date");
	const [showCreateModal, setShowCreateModal] = useState(false);

	const {
		data: listings,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteListings(organizationId);

	// Filter and sort listings locally
	const filteredListings = useMemo(() => {
		let result = [...listings];

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(listing) =>
					listing.name.toLowerCase().includes(query) ||
					listing.identifier?.toLowerCase().includes(query) ||
					listing.description?.toLowerCase().includes(query)
			);
		}

		// Sort
		result.sort((a, b) => {
			if (sortBy === "name") return a.name.localeCompare(b.name);
			if (sortBy === "price") return b.price - a.price;
			if (sortBy === "views") return b.views - a.views;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

		return result;
	}, [listings, searchQuery, sortBy]);

	// Stats
	const stats = useMemo(() => {
		const totalViews = listings.reduce((sum, p) => sum + p.views, 0);
		return { total: listings.length, totalViews };
	}, [listings]);

	// Active filters for chips
	const activeFilters = useMemo(() => {
		const filters: { key: string; label: string; onRemove: () => void }[] = [];
		if (searchQuery) {
			filters.push({
				key: "search",
				label: `"${searchQuery}"`,
				onRemove: () => setSearchQuery(""),
			});
		}
		return filters;
	}, [searchQuery]);

	const clearAllFilters = () => {
		setSearchQuery("");
		setSortBy("date");
	};

	const hasActiveFilters = !!searchQuery;
	const listingCount = filteredListings.length;

	if (loading) {
		return <ListingsListSkeleton />;
	}

	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Heading>Listings</Heading>
					<Text className="mt-1">
						Manage your listing catalog for campaigns
					</Text>
				</div>
				{canCreateListing && (
					<Button
						onClick={() => setShowCreateModal(true)}
						color="emerald"
						className="w-full sm:w-auto"
					>
						<PlusIcon className="size-4" />
						Add Listing
					</Button>
				)}
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				<StatCard icon={<CubeIcon className="size-5" />} label="Total" value={stats.total} size="sm" />
				<StatCard
					icon={<EyeIcon className="size-5" />}
					label="Total Views"
					value={stats.totalViews.toLocaleString("en-IN")}
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
						placeholder="Search listings..."
						className="h-9 w-full rounded-lg bg-white pl-9 pr-8 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700 dark:focus:ring-white"
						aria-label="Search listings"
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

				{/* Sort pills */}
				<div className="min-w-0 flex-1 overflow-x-auto">
					<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
					{(
						[
							{ value: "date", label: "Newest" },
							{ value: "name", label: "Name A-Z" },
							{ value: "price", label: "Price" },
							{ value: "views", label: "Most Viewed" },
						] as { value: string; label: string }[]
					).map((opt) => {
						const isActive = sortBy === opt.value;
						return (
							<button
								type="button"
								key={opt.value}
								onClick={() => setSortBy(opt.value)}
								className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${isActive ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
							>
								{opt.label}
							</button>
						);
					})}
					</div>
				</div>
			</div>

			{/* Active filter chips */}
			{activeFilters.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					{activeFilters.map((filter) => (
						<FilterChip key={filter.key} label={filter.label} onRemove={filter.onRemove} />
					))}
					<button
						type="button"
						onClick={clearAllFilters}
						className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
					>
						Clear all
					</button>
				</div>
			)}

			{/* Results Grid */}
			{error ? (
				<ErrorState onRetry={refetch} />
			) : filteredListings.length > 0 ? (
				<div className="rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 overflow-hidden dark:bg-zinc-900 dark:ring-white/10">
					<div className="flex items-center justify-between px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
						<span className="text-sm text-zinc-500">
							{listingCount} listing{listingCount !== 1 ? "s" : ""}
						</span>
					</div>
					<div className="p-3 sm:p-4">
						<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
							{filteredListings.map((listing) => (
								<ListingCard
									key={listing.id}
									listing={listing}
									orgSlug={orgSlug}
									canEdit={canUpdateListing}
								/>
							))}
						</div>

						{/* Load More */}
						{hasMore && (
							<div className="flex justify-center pt-4">
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
				</div>
			) : (
				<EmptyState
					preset="listings"
					title={hasActiveFilters ? "No listings found" : "No listings yet"}
					description={
						hasActiveFilters
							? "Try adjusting your filters or search query"
							: "Add your first listing to use in campaigns"
					}
					action={
						hasActiveFilters
							? { label: "Clear filters", onClick: clearAllFilters }
							: canCreateListing
								? { label: "Add Listing", onClick: () => setShowCreateModal(true) }
								: undefined
					}
				/>
			)}

			{/* Create Listing Modal */}
			<CreateListingModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				organizationId={organizationId}
				onSuccess={refetch}
			/>
		</div>
	);
}
