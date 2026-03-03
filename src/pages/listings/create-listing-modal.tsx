import {
	ArrowPathIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	CubeIcon,
	LinkIcon,
	PencilSquareIcon,
	PlusIcon,
	TagIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Description, ErrorMessage, Field, FieldGroup, Label } from "@/components/fieldset";
import { FileDropzone } from "@/components/file-dropzone";
import { Input, InputGroup } from "@/components/input";
import { CurrencyInput } from "@/components/number-input";
import { WizardStepper } from "@/components/shared/wizard-stepper";
import { Textarea } from "@/components/textarea";
import { useCreateListing, useFileUpload, useOrgSlug } from "@/hooks";
import { showToast } from "@/lib/toast";

// =============================================================================
// SCHEMA
// =============================================================================

const listingSchema = z.object({
	name: z.string().min(1, "Name is required").max(120, "Name too long"),
	identifier: z
		.string()
		.min(1, "SKU is required")
		.max(40, "SKU too long")
		.regex(/^[A-Z0-9_-]+$/, "Only uppercase letters, numbers, hyphens, underscores"),
	price: z.number({ error: "Price is required" }).positive("Must be greater than 0"),
	description: z.string().max(500, "Max 500 characters").optional(),
	link: z.string().min(1, "Link is required").url("Must be a valid URL"),
});

type ListingFormValues = z.infer<typeof listingSchema>;

const STEPS = ["Details", "Media & Link", "Review"] as const;

// =============================================================================
// INLINE HELPERS
// =============================================================================

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex items-start justify-between gap-3">
			<dt className="shrink-0 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">{label}</dt>
			<dd className="min-w-0 text-right text-xs font-medium text-zinc-900 sm:text-sm dark:text-white">{value}</dd>
		</div>
	);
}

function ReviewCard({
	icon: Icon,
	title,
	onEdit,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	title: string;
	onEdit: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border border-zinc-200 p-3 sm:p-4 dark:border-zinc-700/50">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon className="size-4 text-zinc-400" />
					<h4 className="text-xs font-medium text-zinc-900 sm:text-sm dark:text-white">{title}</h4>
				</div>
				<button
					type="button"
					onClick={onEdit}
					className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
				>
					<PencilSquareIcon className="size-3" />
					Edit
				</button>
			</div>
			{children}
		</div>
	);
}

// =============================================================================
// CREATE LISTING MODAL
// =============================================================================

export function CreateListingModal({
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
	const [step, setStep] = useState(0);
	const [images, setImages] = useState<string[]>([]);
	const [uploadingCount, setUploadingCount] = useState(0);
	const [completedSteps, setCompletedSteps] = useState<boolean[]>(() => Array(STEPS.length).fill(false));
	const stepTopRef = useRef<HTMLDivElement>(null);

	const createListing = useCreateListing(organizationId);
	const fileUpload = useFileUpload();
	const navigate = useNavigate();
	const orgSlug = useOrgSlug();

	const {
		register,
		control,
		handleSubmit,
		trigger,
		reset,
		watch,
		formState: { errors },
	} = useForm<ListingFormValues>({
		resolver: zodResolver(listingSchema),
		defaultValues: { name: "", identifier: "", description: "", link: "" },
		mode: "onSubmit",
	});

	const name = watch("name");
	const identifier = watch("identifier");
	const price = watch("price");
	const description = watch("description") ?? "";
	const link = watch("link");

	// ---- Scroll to top on step change ----

	// biome-ignore lint/correctness/useExhaustiveDependencies: step is intentionally the trigger
	useEffect(() => {
		stepTopRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}, [step]);

	// ---- Step navigation ----

	const goToStep = useCallback(
		(targetStep: number) => {
			setStep((current) => {
				if (targetStep < current || completedSteps[targetStep]) {
					return targetStep;
				}
				return current;
			});
		},
		[completedSteps]
	);

	const stepRef = useRef(step);
	stepRef.current = step;

	const goNext = useCallback(async () => {
		const s = stepRef.current;
		let valid = false;
		if (s === 0) {
			valid = await trigger(["name", "identifier", "price", "description"]);
		} else if (s === 1) {
			valid = await trigger(["link"]);
		}

		if (valid) {
			setCompletedSteps((prev) => {
				const next = [...prev];
				next[s] = true;
				return next;
			});
			setStep(s + 1);
		}
	}, [trigger]);

	// ---- File handling ----

	const handleFilesChange = useCallback(
		async (files: File[]) => {
			if (!files.length) return;
			setUploadingCount((n) => n + files.length);
			await Promise.all(
				files.map(async (file) => {
					try {
						const { fileUrl } = await fileUpload.mutateAsync({ file, folder: "uploads" });
						setImages((prev) => [...prev, fileUrl]);
					} catch {
						showToast.error(`Failed to upload ${file.name}`);
					} finally {
						setUploadingCount((n) => n - 1);
					}
				})
			);
		},
		[fileUpload]
	);

	const removeImage = useCallback((index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const setPrimaryImage = useCallback((index: number) => {
		if (index === 0) return;
		setImages((prev) => {
			const next = [...prev];
			const [moved] = next.splice(index, 1);
			next.unshift(moved);
			return next;
		});
	}, []);

	// ---- Reset & close ----

	const handleClose = useCallback(() => {
		setStep(0);
		setImages([]);
		setUploadingCount(0);
		setCompletedSteps(Array(STEPS.length).fill(false));
		reset();
		onClose();
	}, [onClose, reset]);

	// ---- Submit ----

	const onSubmit = useCallback(
		async (data: ListingFormValues) => {
			if (!organizationId) return;
			try {
				const listing = await createListing.mutateAsync({
					name: data.name.trim(),
					description: data.description?.trim() || undefined,
					identifier: data.identifier.trim(),
					price: Math.round(data.price * 100),
					link: data.link.trim(),
					listingImages:
						images.length > 0
							? images.map((url, i) => ({ imageUrl: url, isPrimary: i === 0, sortOrder: i }))
							: undefined,
				});
				showToast.success("Listing created");
				onSuccess();
				handleClose();
				navigate({ to: "/$orgSlug/listings/$id", params: { orgSlug, id: listing.id } });
			} catch (err) {
				showToast.error(err, "Failed to create listing");
			}
		},
		[organizationId, createListing, images, onSuccess, handleClose, navigate, orgSlug]
	);

	return (
		<Dialog open={isOpen} onClose={handleClose} size="xl">
			<form
				onSubmit={handleSubmit(onSubmit)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault();
				}}
			>
				<DialogHeader
					icon={CubeIcon}
					iconColor="emerald"
					title="Add Listing"
					description={`Step ${step + 1} of ${STEPS.length} · ${STEPS[step]}`}
					onClose={handleClose}
				/>

				{/* Stepper */}
				<div className="mt-4" ref={stepTopRef}>
					<WizardStepper steps={STEPS} currentStep={step} completedSteps={completedSteps} onStepClick={goToStep} />
				</div>

				{/* Body */}
				<DialogBody>
					{/* Step 0: Details */}
					{step === 0 && (
						<FieldGroup>
							<Field>
								<Label>
									Name <span className="text-red-500">*</span>
								</Label>
								<Input {...register("name")} placeholder="e.g., Premium Wireless Headphones" invalid={!!errors.name} />
								{errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
							</Field>

							<Field>
								<Label>
									SKU <span className="text-red-500">*</span>
								</Label>
								<InputGroup>
									<TagIcon data-slot="icon" />
									<Input
										{...register("identifier", {
											onChange: (e) => {
												e.target.value = e.target.value.toUpperCase();
											},
										})}
										placeholder="WH-001"
										invalid={!!errors.identifier}
									/>
								</InputGroup>
								{errors.identifier && <ErrorMessage>{errors.identifier.message}</ErrorMessage>}
							</Field>

							<Field>
								<Label>
									Price (₹) <span className="text-red-500">*</span>
								</Label>
								<Controller
									name="price"
									control={control}
									render={({ field }) => (
										<CurrencyInput
											currency="₹"
											decimals={2}
											placeholder="0.00"
											value={field.value ?? ""}
											onValueChange={(vals) => field.onChange(vals.floatValue)}
											onBlur={field.onBlur}
											error={!!errors.price}
										/>
									)}
								/>
								{errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
							</Field>

							<Field>
								<div className="flex items-center justify-between">
									<Label>Description</Label>
									<span
										className={clsx(
											"text-xs tabular-nums",
											description.length > 450 ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500"
										)}
									>
										{description.length}/500
									</span>
								</div>
								<Textarea
									{...register("description")}
									placeholder="Brief listing description..."
									rows={3}
									resizable={false}
								/>
							</Field>
						</FieldGroup>
					)}

					{/* Step 1: Media & Link */}
					{step === 1 && (
						<FieldGroup>
							<Field>
								<Label>
									Listing URL <span className="text-red-500">*</span>
								</Label>
								<Description>Link to the product page or marketplace listing</Description>
								<InputGroup>
									<LinkIcon data-slot="icon" />
									<Input
										{...register("link")}
										type="url"
										placeholder="https://example.com/product"
										invalid={!!errors.link}
									/>
								</InputGroup>
								{errors.link && <ErrorMessage>{errors.link.message}</ErrorMessage>}
							</Field>

							<Field>
								<Label>Images</Label>
								<Description>First image will be the primary. Drag to reorder.</Description>
								<FileDropzone
									accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
									label={
										uploadingCount > 0
											? `Uploading ${uploadingCount} file${uploadingCount > 1 ? "s" : ""}…`
											: "Drop images or click to browse"
									}
									description="JPG, PNG, WEBP — up to 10 MB"
									variant="compact"
									disabled={uploadingCount > 0}
									showPreviews={false}
									onFilesChange={handleFilesChange}
								/>

								{/* Thumbnails */}
								{images.length > 0 && (
									<div className="mt-4 flex flex-wrap gap-2">
										{images.map((url, idx) => (
											<div key={url} className="group relative">
												<button
													type="button"
													onClick={() => setPrimaryImage(idx)}
													className={clsx(
														"block size-20 overflow-hidden rounded-lg border object-contain transition-shadow",
														idx === 0
															? "border-emerald-300 ring-2 ring-emerald-500/20 dark:border-emerald-600"
															: "border-zinc-200 cursor-pointer hover:ring-2 hover:ring-emerald-500/30 dark:border-zinc-700"
													)}
													title={idx === 0 ? "Primary image" : "Click to set as primary"}
												>
													<img src={url} alt={`Upload ${idx + 1}`} className="size-full object-contain" />
												</button>
												{idx === 0 && (
													<span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-1.5 py-px text-[10px] font-semibold text-white">
														Primary
													</span>
												)}
												<button
													type="button"
													onClick={() => removeImage(idx)}
													className="absolute -right-1.5 -top-1.5 hidden size-5 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm group-hover:flex dark:bg-zinc-100 dark:text-zinc-900"
												>
													<XMarkIcon className="size-3" />
												</button>
											</div>
										))}

										{/* Upload placeholder */}
										{uploadingCount > 0 && (
											<div className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700">
												<ArrowPathIcon className="size-5 animate-spin text-zinc-400" />
											</div>
										)}
									</div>
								)}
							</Field>
						</FieldGroup>
					)}

					{/* Step 2: Review */}
					{step === 2 && (
						<div className="space-y-4">
							{/* Listing Details */}
							<ReviewCard icon={CubeIcon} title="Listing Details" onEdit={() => goToStep(0)}>
								<dl className="mt-3 space-y-2">
									<ReviewRow label="Name" value={name || "—"} />
									<ReviewRow label="SKU" value={identifier || "—"} />
									<ReviewRow
										label="Price"
										value={price ? `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
									/>
									{description && (
										<ReviewRow
											label="Description"
											value={description.length > 80 ? `${description.slice(0, 80)}…` : description}
										/>
									)}
								</dl>
							</ReviewCard>

							{/* Media & Link */}
							<ReviewCard icon={LinkIcon} title="Media & Link" onEdit={() => goToStep(1)}>
								<dl className="mt-3 space-y-2">
									<ReviewRow
										label="URL"
										value={
											link ? (
												<a
													href={link}
													target="_blank"
													rel="noopener noreferrer"
													className="max-w-60 truncate text-blue-600 hover:underline dark:text-blue-400"
												>
													{link.length > 40 ? `${link.slice(0, 40)}…` : link}
												</a>
											) : (
												"—"
											)
										}
									/>
									<ReviewRow label="Images" value={`${images.length} uploaded`} />
								</dl>
								{/* Thumbnail preview */}
								{images.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-2">
										{images.map((url, idx) => (
											<img
												key={url}
												src={url}
												alt={`Upload ${idx + 1}`}
												className="size-14 rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
											/>
										))}
									</div>
								)}
							</ReviewCard>
						</div>
					)}
				</DialogBody>

				<DialogActions>
					<div className="flex flex-1 items-center">
						{step > 0 && (
							<Button type="button" onClick={() => goToStep(step - 1)} outline>
								<ChevronLeftIcon />
								Back
							</Button>
						)}
					</div>
					{step === 0 && (
						<Button plain onClick={handleClose}>
							Cancel
						</Button>
					)}
					{step < 2 ? (
						<Button type="button" onClick={goNext} color="emerald">
							{step === 1 ? "Review" : "Next"}
							<ChevronRightIcon />
						</Button>
					) : (
						<Button type="submit" color="emerald" disabled={createListing.isPending || uploadingCount > 0}>
							{createListing.isPending ? (
								<>
									<ArrowPathIcon className="size-4 animate-spin" />
									Creating…
								</>
							) : (
								<>
									<PlusIcon />
									Create Listing
								</>
							)}
						</Button>
					)}
				</DialogActions>
			</form>
		</Dialog>
	);
}
