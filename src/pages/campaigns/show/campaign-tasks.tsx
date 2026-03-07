import {
	ArrowPathIcon,
	ClipboardDocumentListIcon,
	PencilIcon,
	PencilSquareIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/16/solid";
import type { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Description, Field, Label } from "@/components/fieldset";
import { extractPlatformFromText, getPlatformGradient, getPlatformIcon } from "@/components/icons/platform-icons";
import { Input } from "@/components/input";
import { NumberInput } from "@/components/number-input";
import { Select } from "@/components/select";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChip } from "@/components/shared/filter-chip";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Switch } from "@/components/switch";
import { Textarea } from "@/components/textarea";
import type { brand, catalog, db } from "@/lib/brand-client";
import { showToast } from "@/lib/toast";

interface CampaignTasksProps {
	campaign: brand.CampaignWithStats;
	tasks: brand.CampaignTaskResponse[];
	tasksLoading: boolean;
	platforms: catalog.Platform[];
	canUpdateCampaign: boolean;
	// Add task state & handlers
	showAddTaskPicker: boolean;
	setShowAddTaskPicker: (v: boolean) => void;
	addTaskPlatformId: string;
	setAddTaskPlatformId: (v: string) => void;
	addTaskTemplateId: string;
	setAddTaskTemplateId: (v: string) => void;
	filteredTemplates: catalog.TaskTemplateResponse[];
	addTask: {
		mutate: (params: { taskTemplateId: string; isRequired: boolean }, options?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => void;
		isPending: boolean;
	};
	// Edit task state & handlers
	editingTaskId: string | null;
	setEditingTaskId: (v: string | null) => void;
	editingTaskInstructions: string;
	setEditingTaskInstructions: (v: string) => void;
	editingTaskRequirements: db.TaskRequirements;
	setEditingTaskRequirements: Dispatch<SetStateAction<db.TaskRequirements>>;
	editingTaskCategory: string | undefined;
	setEditingTaskCategory: (v: string | undefined) => void;
	hashtagInput: string;
	setHashtagInput: (v: string) => void;
	mentionInput: string;
	setMentionInput: (v: string) => void;
	updateTask: {
		mutate: (params: { taskId: string; instructions?: string; requirements?: db.TaskRequirements }, options?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => void;
		isPending: boolean;
	};
	removeTask: {
		mutate: (taskId: string, options?: { onSuccess?: () => void; onError?: (err: unknown) => void }) => void;
		isPending: boolean;
	};
}

export function CampaignTasks({
	campaign,
	tasks,
	tasksLoading,
	platforms,
	canUpdateCampaign,
	showAddTaskPicker,
	setShowAddTaskPicker,
	addTaskPlatformId,
	setAddTaskPlatformId,
	addTaskTemplateId,
	setAddTaskTemplateId,
	filteredTemplates,
	addTask,
	editingTaskId,
	setEditingTaskId,
	editingTaskInstructions,
	setEditingTaskInstructions,
	editingTaskRequirements,
	setEditingTaskRequirements,
	editingTaskCategory,
	setEditingTaskCategory,
	hashtagInput,
	setHashtagInput,
	mentionInput,
	setMentionInput,
	updateTask,
	removeTask,
}: CampaignTasksProps) {
	return (
		<>
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
															{task.requirements.minDuration && task.requirements.maxDuration ? "\u2013" : ""}
															{task.requirements.maxDuration ? `${task.requirements.maxDuration}s` : ""}
														</Badge>
													) : null}
												</div>
											)}
										</div>
									</div>

									{/* Edit/Remove actions -- floating top-right */}
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
								placeholder="Specific instructions for the creator..."
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
								placeholder="Internal notes about this task..."
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
									Select task type...
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
		</>
	);
}
