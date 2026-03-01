import {
	ArrowPathIcon,
	ArrowsRightLeftIcon,
	CalendarIcon,
	CheckCircleIcon,
	CheckIcon,
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronUpIcon,
	CubeIcon,
	CurrencyRupeeIcon,
	GlobeAltIcon,
	HashtagIcon,
	InformationCircleIcon,
	LockClosedIcon,
	MagnifyingGlassIcon,
	MegaphoneIcon,
	PencilSquareIcon,
	PlusIcon,
	RocketLaunchIcon,
	SparklesIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { DatePicker } from "@/components/date-picker";
import { Dialog, DialogBody, DialogTitle } from "@/components/dialog";
import { Description, ErrorMessage, Field, FieldGroup, Label } from "@/components/fieldset";
import { Input, InputGroup } from "@/components/input";
import { NumberInput } from "@/components/number-input";
import { Select } from "@/components/select";
import { Switch } from "@/components/switch";
import { Textarea } from "@/components/textarea";
import { getPlatformColor, getPlatformIcon } from "@/components/icons/platform-icons";
import { FilterChip } from "@/components/shared/filter-chip";
import {
	getAPIErrorMessage,
	getAssetUrl,
	useCreateAndSubmitCampaign,
	useCreateCampaign,
	useListings,
	useOrgSlug,
	usePlatforms,
	useTaskTemplates,
} from "@/hooks";
import type { db } from "@/lib/brand-client";
import { formatCurrency } from "@/lib/design-tokens";

// =============================================================================
// SCHEMA
// =============================================================================

const campaignSchema = z
	.object({
		listingId: z.string().min(1, "Select a listing"),
		title: z.string().min(1, "Title is required").max(120, "Title too long"),
		description: z.string().max(1000).optional(),
		campaignType: z.string().default("cashback"),
		isPublic: z.boolean().default(true),
		startDate: z.date({ required_error: "Start date is required" }),
		endDate: z.date({ required_error: "End date is required" }),
		maxEnrollments: z.number({ required_error: "Required" }).int().min(1, "At least 1"),
		termsAndConditions: z.string().max(5000).optional(),
	})
	.refine((d) => d.endDate > d.startDate, {
		message: "End date must be after start date",
		path: ["endDate"],
	});

type CampaignFormValues = z.infer<typeof campaignSchema>;

/** A task entry managed outside react-hook-form via useState */
interface TaskEntry {
	id: string; // local key for React rendering
	taskTemplateId: string;
	taskTemplateName: string;
	platformName?: string;
	instructions: string;
	requirements: db.TaskRequirements;
}

const STEPS = ["Listing", "Details", "Schedule", "Review"] as const;

// =============================================================================
// CONSTANTS
// =============================================================================

const CAMPAIGN_TYPES = [
	{ value: "cashback", label: "Cashback", icon: CurrencyRupeeIcon, desc: "Pay creators per task" },
	{ value: "barter", label: "Barter", icon: ArrowsRightLeftIcon, desc: "Product exchange" },
	{ value: "hybrid", label: "Hybrid", icon: SparklesIcon, desc: "Cash + product" },
] as const;

let taskIdCounter = 0;
function nextTaskId() {
	return `local-task-${++taskIdCounter}`;
}

// =============================================================================
// INLINE HELPERS
// =============================================================================

function WizardStepper({
	steps,
	currentStep,
	completedSteps,
	onStepClick,
}: {
	steps: readonly string[];
	currentStep: number;
	completedSteps: boolean[];
	onStepClick: (step: number) => void;
}) {
	return (
		<div className="mb-6 flex items-start">
			{steps.map((label, i) => {
				const canClick = i < currentStep || completedSteps[i];
				return (
					<Fragment key={label}>
						{i > 0 && (
							<div
								className={clsx(
									"mx-1 mt-3 h-px flex-1 transition-colors sm:mx-0 sm:mt-3.5",
									completedSteps[i - 1] ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
								)}
							/>
						)}
						<button
							type="button"
							onClick={() => canClick && onStepClick(i)}
							className={clsx("flex flex-col items-center gap-1", canClick ? "cursor-pointer" : "cursor-default")}
						>
							<div
								className={clsx(
									"flex size-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all sm:size-7 sm:text-xs",
									i === currentStep
										? "bg-zinc-900 text-white ring-4 ring-zinc-900/10 dark:bg-white dark:text-zinc-900 dark:ring-white/10"
										: completedSteps[i]
											? "bg-emerald-500 text-white"
											: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
								)}
							>
								{completedSteps[i] && i !== currentStep ? <CheckIcon className="size-3" /> : i + 1}
							</div>
							<span
								className={clsx(
									"max-w-14 truncate text-[10px] sm:max-w-20 sm:text-[11px]",
									i === currentStep
										? "font-medium text-zinc-900 dark:text-white"
										: completedSteps[i]
											? "font-medium text-emerald-600 dark:text-emerald-400"
											: "text-zinc-400 dark:text-zinc-500"
								)}
							>
								{label}
							</span>
						</button>
					</Fragment>
				);
			})}
		</div>
	);
}

function InfoCallout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50/50 p-3 dark:border-sky-800/50 dark:bg-sky-950/20">
			<InformationCircleIcon className="size-5 shrink-0 text-sky-500 dark:text-sky-400" />
			<p className="text-sm text-sky-700 dark:text-sky-300">{children}</p>
		</div>
	);
}

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
// TASK REQUIREMENTS DIALOG
// =============================================================================

function TaskRequirementsDialog({
	task,
	onSave,
	onClose,
	hashtagInput,
	setHashtagInput,
	mentionInput,
	setMentionInput,
}: {
	task: TaskEntry;
	onSave: (updated: Pick<TaskEntry, "instructions" | "requirements">) => void;
	onClose: () => void;
	hashtagInput: string;
	setHashtagInput: (v: string) => void;
	mentionInput: string;
	setMentionInput: (v: string) => void;
}) {
	const [instructions, setInstructions] = useState(task.instructions);
	const [req, setReq] = useState<db.TaskRequirements>({ ...task.requirements });
	const [showReqs, setShowReqs] = useState(false);

	const updateReq = (patch: Partial<db.TaskRequirements>) => setReq((prev) => ({ ...prev, ...patch }));

	return (
		<Dialog open onClose={onClose} size="lg">
			<DialogTitle>Edit Task — {task.taskTemplateName}</DialogTitle>
			<DialogBody>
				<div className="space-y-4">
					{/* Instructions */}
					<Field>
						<div className="flex items-center justify-between">
							<Label>Instructions</Label>
							<span className={clsx("text-xs tabular-nums", instructions.length > 900 ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500")}>
								{instructions.length}/1000
							</span>
						</div>
						<Textarea
							value={instructions}
							onChange={(e) => setInstructions(e.target.value)}
							placeholder="Specific instructions for the creator…"
							rows={3}
							resizable={false}
						/>
					</Field>

					{/* Collapsible Requirements */}
					<div className="border-t border-zinc-100 pt-3 dark:border-zinc-700/50">
						<button
							type="button"
							onClick={() => setShowReqs(!showReqs)}
							className="flex w-full items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300"
						>
							<span className="flex items-center gap-1.5">
								<HashtagIcon className="size-3.5" />
								Task Requirements
								<Badge color="zinc">Optional</Badge>
							</span>
							{showReqs ? (
								<ChevronUpIcon className="size-3.5 text-zinc-400" />
							) : (
								<ChevronDownIcon className="size-3.5 text-zinc-400" />
							)}
						</button>

						{showReqs && (
							<div className="mt-3 space-y-4">
								{/* Social Media */}
								<div className="space-y-2">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Social Media</p>
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
														if (tag && !req.requiredHashtags?.includes(tag)) {
															updateReq({ requiredHashtags: [...(req.requiredHashtags || []), tag] });
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
													if (tag && !req.requiredHashtags?.includes(tag)) {
														updateReq({ requiredHashtags: [...(req.requiredHashtags || []), tag] });
														setHashtagInput("");
													}
												}}
											>
												<PlusIcon className="size-4" />
											</Button>
										</div>
										{(req.requiredHashtags?.length ?? 0) > 0 && (
											<div className="mt-1.5 flex flex-wrap gap-1.5">
												{req.requiredHashtags?.map((tag) => (
													<FilterChip
														key={tag}
														label={`#${tag}`}
														onRemove={() => updateReq({ requiredHashtags: req.requiredHashtags?.filter((t) => t !== tag) || [] })}
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
														if (mention && !req.requiredMentions?.includes(mention)) {
															updateReq({ requiredMentions: [...(req.requiredMentions || []), mention] });
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
													if (mention && !req.requiredMentions?.includes(mention)) {
														updateReq({ requiredMentions: [...(req.requiredMentions || []), mention] });
														setMentionInput("");
													}
												}}
											>
												<PlusIcon className="size-4" />
											</Button>
										</div>
										{(req.requiredMentions?.length ?? 0) > 0 && (
											<div className="mt-1.5 flex flex-wrap gap-1.5">
												{req.requiredMentions?.map((m) => (
													<FilterChip
														key={m}
														label={`@${m}`}
														onRemove={() => updateReq({ requiredMentions: req.requiredMentions?.filter((t) => t !== m) || [] })}
													/>
												))}
											</div>
										)}
									</Field>
								</div>

								{/* Content */}
								<div className="space-y-2">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Content</p>
									<div className="grid grid-cols-2 gap-3">
										<Field>
											<Label>Min Word Count</Label>
											<NumberInput
												value={req.minWordCount ?? undefined}
												onValueChange={(v) => updateReq({ minWordCount: v.floatValue })}
												allowNegative={false}
												decimalScale={0}
												placeholder="0"
											/>
										</Field>
										<Field>
											<Label>Min Rating</Label>
											<Select
												value={req.minRating?.toString() ?? ""}
												onChange={(e) => updateReq({ minRating: e.target.value ? Number(e.target.value) : undefined })}
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

								{/* Media */}
								<div className="space-y-2">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Media</p>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Require Photos</p>
												<p className="text-xs text-zinc-500 dark:text-zinc-400">Creator must include photos</p>
											</div>
											<Switch
												color="emerald"
												checked={req.requirePhotosInReview ?? false}
												onChange={(v) => updateReq({ requirePhotosInReview: v })}
											/>
										</div>
										{req.requirePhotosInReview && (
											<Field>
												<Label>Min Photos</Label>
												<NumberInput
													value={req.minPhotos ?? undefined}
													onValueChange={(v) => updateReq({ minPhotos: v.floatValue })}
													allowNegative={false}
													decimalScale={0}
													placeholder="1"
												/>
											</Field>
										)}
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Require Videos</p>
												<p className="text-xs text-zinc-500 dark:text-zinc-400">Creator must include videos</p>
											</div>
											<Switch
												color="emerald"
												checked={req.requireVideosInReview ?? false}
												onChange={(v) => updateReq({ requireVideosInReview: v })}
											/>
										</div>
										{req.requireVideosInReview && (
											<Field>
												<Label>Min Videos</Label>
												<NumberInput
													value={req.minVideos ?? undefined}
													onValueChange={(v) => updateReq({ minVideos: v.floatValue })}
													allowNegative={false}
													decimalScale={0}
													placeholder="1"
												/>
											</Field>
										)}
									</div>
								</div>

								{/* Duration */}
								<div className="space-y-2">
									<p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Duration (seconds)</p>
									<div className="grid grid-cols-2 gap-3">
										<Field>
											<Label>Min Duration</Label>
											<NumberInput
												value={req.minDuration ?? undefined}
												onValueChange={(v) => updateReq({ minDuration: v.floatValue })}
												allowNegative={false}
												decimalScale={0}
												placeholder="0"
											/>
										</Field>
										<Field>
											<Label>Max Duration</Label>
											<NumberInput
												value={req.maxDuration ?? undefined}
												onValueChange={(v) => updateReq({ maxDuration: v.floatValue })}
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
										value={req.sellerInstructions ?? ""}
										onChange={(e) => updateReq({ sellerInstructions: e.target.value })}
										placeholder="Internal notes about this task…"
										rows={2}
										resizable={false}
									/>
								</Field>
							</div>
						)}
					</div>
				</div>
			</DialogBody>
			<div className="mt-6 flex gap-2">
				<Button type="button" color="zinc" onClick={onClose} className="w-full">
					Cancel
				</Button>
				<Button
					type="button"
					color="emerald"
					onClick={() => onSave({ instructions, requirements: req })}
					className="w-full"
				>
					<CheckIcon className="size-4" />
					Save Task
				</Button>
			</div>
		</Dialog>
	);
}

// =============================================================================
// CREATE CAMPAIGN MODAL
// =============================================================================

export function CreateCampaignModal({
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
	const [listingSearch, setListingSearch] = useState("");
	const [completedSteps, setCompletedSteps] = useState<boolean[]>(() => Array(STEPS.length).fill(false));
	const stepTopRef = useRef<HTMLDivElement>(null);

	const { data: listings, loading: listingsLoading } = useListings(organizationId, {
		search: listingSearch || undefined,
		take: 20,
	});
	const { data: platforms, loading: platformsLoading } = usePlatforms();
	const [selectedPlatformId, setSelectedPlatformId] = useState("");
	const { data: taskTemplates, loading: templatesLoading } = useTaskTemplates(
		selectedPlatformId ? { platformId: selectedPlatformId } : undefined
	);

	const createCampaign = useCreateCampaign(organizationId);
	const createAndSubmit = useCreateAndSubmitCampaign(organizationId);
	const navigate = useNavigate();
	const orgSlug = useOrgSlug();

	const {
		register,
		control,
		handleSubmit,
		trigger,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CampaignFormValues>({
		resolver: zodResolver(campaignSchema),
		defaultValues: {
			listingId: "",
			title: "",
			description: "",
			campaignType: "cashback",
			isPublic: true,
			maxEnrollments: 100,
			termsAndConditions: "",
		},
		mode: "onSubmit",
	});

	const listingId = watch("listingId");
	const campaignType = watch("campaignType");
	const isPublic = watch("isPublic");
	const startDate = watch("startDate");
	const title = watch("title");
	const description = watch("description") ?? "";
	const endDate = watch("endDate");
	const maxEnrollments = watch("maxEnrollments");
	const termsAndConditions = watch("termsAndConditions") ?? "";

	// Tasks managed separately from react-hook-form
	const [tasks, setTasks] = useState<TaskEntry[]>([]);
	const [editingTaskIdx, setEditingTaskIdx] = useState<number | null>(null);
	const [hashtagInput, setHashtagInput] = useState("");
	const [mentionInput, setMentionInput] = useState("");

	const editingTask = editingTaskIdx !== null ? tasks[editingTaskIdx] : null;

	const selectedListing = useMemo(() => listings.find((l) => l.id === listingId) ?? null, [listings, listingId]);

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
			valid = await trigger("listingId");
		} else if (s === 1) {
			valid = await trigger(["title", "description", "campaignType", "isPublic"]);
		} else if (s === 2) {
			valid = await trigger(["startDate", "endDate", "maxEnrollments"]);
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

	// ---- Reset & close ----

	const handleClose = useCallback(() => {
		setStep(0);
		setListingSearch("");
		setCompletedSteps(Array(STEPS.length).fill(false));
		setTasks([]);
		setEditingTaskIdx(null);
		setSelectedPlatformId("");
		setHashtagInput("");
		setMentionInput("");
		reset();
		onClose();
	}, [onClose, reset]);

	// ---- Submit ----

	const onSubmitDraft = useCallback(
		async (data: CampaignFormValues) => {
			if (!organizationId) return;
			try {
				const campaign = await createCampaign.mutateAsync({
					listingId: data.listingId,
					title: data.title.trim(),
					description: data.description?.trim() || undefined,
					startDate: data.startDate.toISOString(),
					endDate: data.endDate.toISOString(),
					maxEnrollments: data.maxEnrollments,
					campaignType: data.campaignType as db.CampaignType,
					isPublic: data.isPublic,
					termsAndConditions: data.termsAndConditions?.trim() || undefined,
				});
				toast.success("Campaign draft created");
				onSuccess();
				handleClose();
				navigate({ to: "/$orgSlug/campaigns/$id", params: { orgSlug, id: campaign.id } });
			} catch (err) {
				toast.error(getAPIErrorMessage(err, "Failed to create campaign"));
			}
		},
		[organizationId, createCampaign, onSuccess, navigate, orgSlug, handleClose]
	);

	const onSubmitAndPublish = useCallback(
		async (data: CampaignFormValues) => {
			if (!organizationId) return;
			if (tasks.length === 0) {
				toast.error("Add at least one task to submit for approval");
				return;
			}

			// Build tasks array from state
			const apiTasks = tasks.map((t, idx) => {
				const req = t.requirements;
				const taskReq: db.TaskRequirements = {};
				if (req?.requiredHashtags?.length) taskReq.requiredHashtags = req.requiredHashtags;
				if (req?.requiredMentions?.length) taskReq.requiredMentions = req.requiredMentions;
				if (req?.minRating) taskReq.minRating = req.minRating;
				if (req?.minWordCount) taskReq.minWordCount = req.minWordCount;
				if (req?.requirePhotosInReview) taskReq.requirePhotosInReview = true;
				if (req?.requireVideosInReview) taskReq.requireVideosInReview = true;
				if (req?.minPhotos) taskReq.minPhotos = req.minPhotos;
				if (req?.minVideos) taskReq.minVideos = req.minVideos;
				if (req?.minDuration) taskReq.minDuration = req.minDuration;
				if (req?.maxDuration) taskReq.maxDuration = req.maxDuration;
				if (req?.sellerInstructions?.trim()) taskReq.sellerInstructions = req.sellerInstructions.trim();
				const hasReq = Object.keys(taskReq).length > 0;
				return {
					taskTemplateId: t.taskTemplateId,
					instructions: t.instructions?.trim() || undefined,
					sortOrder: idx,
					requirements: hasReq ? taskReq : undefined,
				};
			});

			try {
				const campaign = await createAndSubmit.mutateAsync({
					listingId: data.listingId,
					title: data.title.trim(),
					description: data.description?.trim() || undefined,
					startDate: data.startDate.toISOString(),
					endDate: data.endDate.toISOString(),
					maxEnrollments: data.maxEnrollments,
					campaignType: data.campaignType as db.CampaignType,
					isPublic: data.isPublic,
					termsAndConditions: data.termsAndConditions?.trim() || undefined,
					tasks: apiTasks,
				});
				toast.success("Campaign submitted for approval");
				onSuccess();
				handleClose();
				navigate({ to: "/$orgSlug/campaigns/$id", params: { orgSlug, id: campaign.id } });
			} catch (err) {
				toast.error(getAPIErrorMessage(err, "Failed to submit campaign"));
			}
		},
		[organizationId, tasks, createAndSubmit, onSuccess, navigate, orgSlug, handleClose]
	);

	const today = useMemo(() => {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}, []);

	const isPending = createCampaign.isPending || createAndSubmit.isPending;

	return (
		<Dialog open={isOpen} onClose={handleClose} size="xl">
			<form
				onSubmit={handleSubmit(onSubmitDraft)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && e.target instanceof HTMLInputElement) e.preventDefault();
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15">
							<MegaphoneIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
						</div>
						<div>
							<DialogTitle>Create Campaign</DialogTitle>
							<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
								Step {step + 1} of {STEPS.length}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={handleClose}
						className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
					>
						<XMarkIcon className="size-5" />
					</button>
				</div>

				{/* Body */}
				<DialogBody>
					<div ref={stepTopRef} />
					<WizardStepper steps={STEPS} currentStep={step} completedSteps={completedSteps} onStepClick={goToStep} />

					{/* Step 0: Select Listing */}
					{step === 0 && (
						<div className="space-y-4">
							<InputGroup>
								<MagnifyingGlassIcon data-slot="icon" />
								<Input
									type="search"
									value={listingSearch}
									onChange={(e) => setListingSearch(e.target.value)}
									placeholder="Search listings…"
								/>
							</InputGroup>

							{errors.listingId && <p className="text-sm text-red-500">{errors.listingId.message}</p>}

							<div className="-mx-1 -my-1 max-h-72 space-y-1.5 overflow-y-auto px-1 py-1">
								{listingsLoading ? (
									<div className="flex items-center justify-center py-12">
										<ArrowPathIcon className="size-5 animate-spin text-zinc-400" />
									</div>
								) : listings.length === 0 ? (
									<div className="rounded-xl bg-zinc-50 py-10 text-center dark:bg-zinc-800/50">
										<CubeIcon className="mx-auto size-8 text-zinc-300 dark:text-zinc-600" />
										<p className="mt-2 text-sm font-medium text-zinc-500">No listings found</p>
										<p className="mt-0.5 text-xs text-zinc-400">Create a listing first</p>
									</div>
								) : (
									listings.map((listing) => {
										const selected = listingId === listing.id;
										return (
											<button
												key={listing.id}
												type="button"
												onClick={() => setValue("listingId", listing.id, { shouldValidate: true })}
												className={clsx(
													"flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all",
													selected
														? "bg-emerald-50 ring-2 ring-emerald-500/60 dark:bg-emerald-950/30 dark:ring-emerald-500/40"
														: "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
												)}
											>
												{listing.listingImages?.[0]?.imageUrl ? (
													<img
														src={getAssetUrl(listing.listingImages[0].imageUrl)}
														alt={listing.name}
														className="size-11 rounded-lg bg-zinc-100 object-contain dark:bg-zinc-800"
													/>
												) : (
													<div className="flex size-11 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
														<CubeIcon className="size-5 text-zinc-400" />
													</div>
												)}
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{listing.name}</p>
													<p className="text-xs text-zinc-500">
														{formatCurrency(listing.priceDecimal)}
													</p>
												</div>
												{selected && <CheckCircleIcon className="size-5 shrink-0 text-emerald-500" />}
											</button>
										);
									})
								)}
							</div>
						</div>
					)}

					{/* Step 1: Campaign Details */}
					{step === 1 && (
						<FieldGroup>
							<Field>
								<Label>
									Title <span className="text-red-500">*</span>
								</Label>
								<Input {...register("title")} placeholder="e.g., Summer Sale Campaign" invalid={!!errors.title} />
								{errors.title && <ErrorMessage>{errors.title.message}</ErrorMessage>}
							</Field>

							<Field>
								<div className="flex items-center justify-between">
									<Label>Description</Label>
									<span
										className={clsx(
											"text-xs tabular-nums",
											description.length > 900 ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500"
										)}
									>
										{description.length}/1000
									</span>
								</div>
								<Textarea
									{...register("description")}
									placeholder="Describe your campaign…"
									rows={3}
									resizable={false}
								/>
							</Field>

							{/* Campaign Type */}
							<Field>
								<Label>Campaign Type</Label>
								<div className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-2">
									{CAMPAIGN_TYPES.map((ct) => {
										const active = campaignType === ct.value;
										const Icon = ct.icon;
										return (
											<button
												key={ct.value}
												type="button"
												onClick={() => setValue("campaignType", ct.value)}
												className={clsx(
													"flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-all sm:gap-1.5 sm:px-3 sm:py-3",
													active
														? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
														: "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
												)}
											>
												<Icon className="size-4 sm:size-5" />
												<span className="text-[11px] font-semibold sm:text-xs">{ct.label}</span>
											</button>
										);
									})}
								</div>
							</Field>

							{/* Visibility */}
							<Field>
								<Label>Visibility</Label>
								<div className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2">
									{[
										{ value: true, label: "Public", desc: "Anyone can join", icon: GlobeAltIcon },
										{
											value: false,
											label: "Private",
											desc: "Invite only",
											icon: LockClosedIcon,
										},
									].map((opt) => {
										const active = isPublic === opt.value;
										const Icon = opt.icon;
										return (
											<button
												key={String(opt.value)}
												type="button"
												onClick={() => setValue("isPublic", opt.value)}
												className={clsx(
													"flex items-center gap-2 rounded-xl px-2.5 py-2.5 text-left transition-all sm:gap-2.5 sm:px-3 sm:py-3",
													active
														? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
														: "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
												)}
											>
												<Icon className="size-4 shrink-0 sm:size-5" />
												<div>
													<p className="text-xs font-medium sm:text-sm">{opt.label}</p>
													<p className={clsx("hidden text-xs sm:block", active ? "opacity-60" : "text-zinc-400 dark:text-zinc-500")}>
														{opt.desc}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							</Field>
						</FieldGroup>
					)}

					{/* Step 2: Schedule & Settings */}
					{step === 2 && (
						<div className="space-y-5">
							{/* Schedule Section */}
							<div className="rounded-xl border border-zinc-200 p-3 sm:p-4 dark:border-zinc-700/50">
								<div className="mb-3 flex items-center gap-2 sm:mb-4">
									<CalendarIcon className="size-4 text-zinc-400" />
									<p className="text-sm font-medium text-zinc-900 dark:text-white">Campaign Schedule</p>
								</div>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									<Field>
										<Label>
											Start Date <span className="text-red-500">*</span>
										</Label>
										<Controller
											name="startDate"
											control={control}
											render={({ field }) => (
												<DatePicker
													value={field.value ?? null}
													onChange={(d) => field.onChange(d)}
													onBlur={field.onBlur}
													minDate={today}
													error={!!errors.startDate}
													placeholderText="Select start date"
												/>
											)}
										/>
										{errors.startDate && <ErrorMessage>{errors.startDate.message}</ErrorMessage>}
									</Field>
									<Field>
										<Label>
											End Date <span className="text-red-500">*</span>
										</Label>
										<Controller
											name="endDate"
											control={control}
											render={({ field }) => (
												<DatePicker
													value={field.value ?? null}
													onChange={(d) => field.onChange(d)}
													onBlur={field.onBlur}
													minDate={startDate || today}
													error={!!errors.endDate}
													placeholderText="Select end date"
												/>
											)}
										/>
										{errors.endDate && <ErrorMessage>{errors.endDate.message}</ErrorMessage>}
									</Field>
								</div>
								{startDate && endDate && (
									<p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
										Duration:{" "}
										<span className="font-medium text-zinc-700 dark:text-zinc-300">
											{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
										</span>
									</p>
								)}
							</div>

							{/* Capacity & Terms Section */}
							<div className="rounded-xl border border-zinc-200 p-3 sm:p-4 dark:border-zinc-700/50">
								<div className="mb-3 flex items-center gap-2 sm:mb-4">
									<CubeIcon className="size-4 text-zinc-400" />
									<p className="text-sm font-medium text-zinc-900 dark:text-white">Capacity & Terms</p>
								</div>
								<FieldGroup className="space-y-4!">
									<Field>
										<Label>Max Enrollments</Label>
										<Description>Maximum number of creators who can join</Description>
										<Controller
											name="maxEnrollments"
											control={control}
											render={({ field }) => (
												<NumberInput
													value={field.value}
													onValueChange={(vals) => field.onChange(vals.floatValue ?? 0)}
													onBlur={field.onBlur}
													allowNegative={false}
													decimalScale={0}
													placeholder="100"
													error={!!errors.maxEnrollments}
												/>
											)}
										/>
										{errors.maxEnrollments && <ErrorMessage>{errors.maxEnrollments.message}</ErrorMessage>}
									</Field>

									<Field>
										<div className="flex items-center justify-between">
											<Label>Terms & Conditions</Label>
											<span
												className={clsx(
													"text-xs tabular-nums",
													termsAndConditions.length > 4500 ? "text-amber-500" : "text-zinc-400 dark:text-zinc-500"
												)}
											>
												{termsAndConditions.length}/5000
											</span>
										</div>
										<Textarea
											{...register("termsAndConditions")}
											placeholder="Campaign terms and conditions…"
											rows={3}
											resizable={false}
										/>
									</Field>
								</FieldGroup>
							</div>

							{/* Task Selection Section */}
							<div className="rounded-xl border border-zinc-200 p-3 sm:p-4 dark:border-zinc-700/50">
								<div className="mb-1">
									<div className="flex items-center gap-2">
										<RocketLaunchIcon className="size-4 text-zinc-400" />
										<p className="text-sm font-medium text-zinc-900 dark:text-white">Tasks</p>
										{tasks.length > 0 && (
											<Badge color="emerald">{tasks.length}</Badge>
										)}
										<Badge color="zinc" className="ml-auto">Optional</Badge>
									</div>
									<p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
										Add tasks to submit for approval immediately, or skip to save as draft.
									</p>
								</div>

								{/* Added tasks */}
								{tasks.length > 0 && (
									<div className="mt-3 space-y-2">
										{tasks.map((task, idx) => (
											<div
												key={task.id}
												className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-2.5 dark:border-zinc-700/50 dark:bg-zinc-800/30"
											>
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-2 min-w-0">
														<span className="flex size-5 shrink-0 items-center justify-center rounded bg-zinc-200 text-[10px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
															{idx + 1}
														</span>
														{(() => {
															const PIcon = task.platformName ? getPlatformIcon(task.platformName) : null;
															return PIcon ? (
																<PIcon className={`size-4 shrink-0 ${getPlatformColor(task.platformName || "")}`} />
															) : null;
														})()}
														<span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
															{task.taskTemplateName}
														</span>
													</div>
													<div className="flex items-center gap-1 shrink-0">
														<button
															type="button"
															onClick={() => {
																setEditingTaskIdx(idx);
																setHashtagInput("");
																setMentionInput("");
															}}
															className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
														>
															<PencilSquareIcon className="size-3.5" />
														</button>
														<button
															type="button"
															onClick={() => setTasks((prev) => prev.filter((_, i) => i !== idx))}
															className="rounded p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
														>
															<XMarkIcon className="size-3.5" />
														</button>
													</div>
												</div>
												{task.instructions && (
													<p className="mt-1 ml-7 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
														{task.instructions}
													</p>
												)}
											</div>
										))}
									</div>
								)}

								{/* Add task — Platform then Task Type */}
								<div className="mt-3 space-y-2">
									<div className="flex items-end gap-2">
										<Field className="flex-1">
											<Label>Platform</Label>
											{platformsLoading ? (
												<div className="flex items-center py-2">
													<ArrowPathIcon className="size-4 animate-spin text-zinc-400" />
												</div>
											) : (
												<Select
													value={selectedPlatformId}
													onChange={(e) => {
														setSelectedPlatformId(e.target.value);
													}}
												>
													<option value="">All platforms</option>
													{platforms.map((p) => (
														<option key={p.id} value={p.id}>{p.name}</option>
													))}
												</Select>
											)}
										</Field>
										<Field className="flex-1">
											<Label>{tasks.length > 0 ? "Add another task" : "Task type"}</Label>
											{templatesLoading ? (
												<div className="flex items-center py-2">
													<ArrowPathIcon className="size-4 animate-spin text-zinc-400" />
												</div>
											) : taskTemplates.length === 0 ? (
												<Select disabled>
													<option>{selectedPlatformId ? "No tasks for this platform" : "Select a platform first"}</option>
												</Select>
											) : (
												<Select
													value=""
													onChange={(e) => {
														const tpl = taskTemplates.find((t) => t.id === e.target.value);
														if (!tpl) return;
														const platform = platforms.find((p) => p.id === tpl.platformId);
														const entry: TaskEntry = {
															id: nextTaskId(),
															taskTemplateId: tpl.id,
															taskTemplateName: tpl.name,
															platformName: platform?.name || tpl.platformName,
															instructions: "",
															requirements: tpl.defaultRequirements ?? {},
														};
														setTasks((prev) => [...prev, entry]);
													}}
												>
													<option value="" disabled>Select task type…</option>
													{taskTemplates.map((tpl) => {
														const alreadyAdded = tasks.some((t) => t.taskTemplateId === tpl.id);
														return (
															<option key={tpl.id} value={tpl.id} disabled={alreadyAdded}>
																{tpl.name}{alreadyAdded ? " (added)" : ""}
															</option>
														);
													})}
												</Select>
											)}
										</Field>
									</div>
								</div>
							</div>

							{/* Edit Task Dialog */}
							{editingTask && (
								<TaskRequirementsDialog
									task={editingTask}
									onSave={(updated) => {
										setTasks((prev) =>
											prev.map((t, i) => (i === editingTaskIdx ? { ...t, ...updated } : t))
										);
										setEditingTaskIdx(null);
									}}
									onClose={() => setEditingTaskIdx(null)}
									hashtagInput={hashtagInput}
									setHashtagInput={setHashtagInput}
									mentionInput={mentionInput}
									setMentionInput={setMentionInput}
								/>
							)}

							<InfoCallout>
								Set the campaign duration to at least 30 days for best results. Longer campaigns attract more creator
								applications.
							</InfoCallout>
						</div>
					)}

					{/* Step 3: Review */}
					{step === 3 && (
						<div className="space-y-4">
							{/* Selected Listing */}
							<ReviewCard icon={CubeIcon} title="Selected Listing" onEdit={() => goToStep(0)}>
								<div className="mt-3 flex items-center gap-3">
									{selectedListing?.listingImages?.[0]?.imageUrl ? (
										<img
											src={getAssetUrl(selectedListing.listingImages[0].imageUrl)}
											alt={selectedListing.name}
											className="size-10 rounded-lg bg-zinc-100 object-contain dark:bg-zinc-800"
										/>
									) : (
										<div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
											<CubeIcon className="size-5 text-zinc-400" />
										</div>
									)}
									<div>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">
											{selectedListing?.name || "Unknown listing"}
										</p>
										<p className="text-xs text-zinc-500">
											{selectedListing
												? formatCurrency(selectedListing.priceDecimal)
												: ""}
										</p>
									</div>
								</div>
							</ReviewCard>

							{/* Campaign Details */}
							<ReviewCard icon={MegaphoneIcon} title="Campaign Details" onEdit={() => goToStep(1)}>
								<dl className="mt-3 space-y-2">
									<ReviewRow label="Title" value={title || "—"} />
									{description && (
										<ReviewRow
											label="Description"
											value={description.length > 80 ? `${description.slice(0, 80)}…` : description}
										/>
									)}
									<ReviewRow
										label="Type"
										value={
											<Badge
												color={campaignType === "cashback" ? "emerald" : campaignType === "barter" ? "amber" : "violet"}
											>
												{CAMPAIGN_TYPES.find((ct) => ct.value === campaignType)?.label || campaignType}
											</Badge>
										}
									/>
									<ReviewRow
										label="Visibility"
										value={
											<span className="flex items-center gap-1.5 text-sm text-zinc-900 dark:text-white">
												{isPublic ? <GlobeAltIcon className="size-3.5" /> : <LockClosedIcon className="size-3.5" />}
												{isPublic ? "Public" : "Private"}
											</span>
										}
									/>
								</dl>
							</ReviewCard>

							{/* Schedule & Settings */}
							<ReviewCard icon={CalendarIcon} title="Schedule & Settings" onEdit={() => goToStep(2)}>
								<dl className="mt-3 space-y-2">
									<ReviewRow
										label="Dates"
										value={`${startDate ? startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"} → ${endDate ? endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}`}
									/>
									<ReviewRow
										label="Max Enrollments"
										value={maxEnrollments ? maxEnrollments.toLocaleString("en-IN") : "—"}
									/>
									{termsAndConditions && (
										<ReviewRow
											label="Terms"
											value={
												termsAndConditions.length > 60 ? `${termsAndConditions.slice(0, 60)}…` : termsAndConditions
											}
										/>
									)}
									{tasks.length > 0 && (
										<ReviewRow
											label={`Task${tasks.length > 1 ? "s" : ""}`}
											value={
												<div className="flex flex-wrap justify-end gap-1">
													{tasks.map((t) => (
														<Badge key={t.id} color="zinc">{t.taskTemplateName}</Badge>
													))}
												</div>
											}
										/>
									)}
								</dl>
							</ReviewCard>
						</div>
					)}
				</DialogBody>

				{/* Actions */}
				<div className="mt-6 flex gap-2">
					{step > 0 && (
						<Button type="button" onClick={() => goToStep(step - 1)} color="zinc" className="w-full">
							<ChevronLeftIcon />
							Back
						</Button>
					)}
					{step < 3 ? (
						<Button type="button" onClick={goNext} color="emerald" className="w-full">
							{step === 2 ? "Review" : "Continue"}
							<ChevronRightIcon />
						</Button>
					) : tasks.length > 0 ? (
						<Button type="button" color="emerald" onClick={handleSubmit(onSubmitAndPublish)} disabled={isPending} className="w-full">
							{createAndSubmit.isPending ? <ArrowPathIcon className="size-4 animate-spin" /> : <RocketLaunchIcon />}
							Submit for Approval
						</Button>
					) : (
						<Button type="submit" color="emerald" disabled={isPending} className="w-full">
							{createCampaign.isPending ? <ArrowPathIcon className="size-4 animate-spin" /> : <PlusIcon />}
							Save as Draft
						</Button>
					)}
				</div>
			</form>
		</Dialog>
	);
}
