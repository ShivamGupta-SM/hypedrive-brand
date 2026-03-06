/**
 * FilterDropdown — Polished dropdown for sort/filter controls.
 *
 * Features:
 * - Single-select (default) and multi-select modes
 * - Optional search input for long option lists
 * - Option groups with section headings
 * - Count badges per option
 * - Clear button when value differs from default
 * - Smooth Headless UI Popover transitions
 * - Matches Catalyst input styling
 */

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { type ComponentType, Fragment, type SVGProps, useMemo, useRef, useState } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface FilterOption<T extends string = string> {
	value: T;
	label: string;
	icon?: ComponentType<SVGProps<SVGSVGElement>>;
	iconColor?: string;
	/** Optional count badge */
	count?: number;
	/** Group key — options with the same group are grouped under a heading */
	group?: string;
}

export interface FilterOptionGroup {
	key: string;
	label: string;
}

// =============================================================================
// SINGLE-SELECT (default)
// =============================================================================

interface SingleSelectProps<T extends string = string> {
	label: string;
	options: FilterOption<T>[];
	value: T;
	onChange: (value: T) => void;
	/** Enable multi-select mode */
	multiple?: false;
	/** Groups for section headings (order matters) */
	groups?: FilterOptionGroup[];
	/** Show search input when options exceed this count (default: 8) */
	searchThreshold?: number;
	/** Placeholder for search input */
	searchPlaceholder?: string;
	/** Default value — shows clear button when value differs */
	defaultValue?: T;
	/** Anchor position */
	anchor?: "bottom start" | "bottom end";
	className?: string;
}

// =============================================================================
// MULTI-SELECT
// =============================================================================

interface MultiSelectProps<T extends string = string> {
	label: string;
	options: FilterOption<T>[];
	value: T[];
	onChange: (value: T[]) => void;
	multiple: true;
	groups?: FilterOptionGroup[];
	searchThreshold?: number;
	searchPlaceholder?: string;
	defaultValue?: T[];
	anchor?: "bottom start" | "bottom end";
	className?: string;
}

export type FilterDropdownProps<T extends string = string> = SingleSelectProps<T> | MultiSelectProps<T>;

// =============================================================================
// COMPONENT
// =============================================================================

export function FilterDropdown<T extends string = string>(props: FilterDropdownProps<T>) {
	const {
		label,
		options,
		multiple,
		groups,
		searchThreshold = 8,
		searchPlaceholder = "Search…",
		anchor = "bottom start",
		className,
	} = props;

	const [query, setQuery] = useState("");
	const searchRef = useRef<HTMLInputElement>(null);
	const showSearch = options.length >= searchThreshold;

	// Filtered options
	const filtered = useMemo(() => {
		if (!query) return options;
		const q = query.toLowerCase();
		return options.filter(
			(o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
		);
	}, [options, query]);

	// Group options if groups are provided
	const grouped = useMemo(() => {
		if (!groups || groups.length === 0) return null;
		const map = new Map<string, FilterOption<T>[]>();
		const ungrouped: FilterOption<T>[] = [];
		for (const opt of filtered) {
			if (opt.group) {
				const list = map.get(opt.group) || [];
				list.push(opt);
				map.set(opt.group, list);
			} else {
				ungrouped.push(opt);
			}
		}
		return { map, ungrouped, groups };
	}, [filtered, groups]);

	// Selection helpers
	const isSelected = (value: T): boolean => {
		if (multiple) return (props as MultiSelectProps<T>).value.includes(value);
		return (props as SingleSelectProps<T>).value === value;
	};

	const toggle = (value: T, close: () => void) => {
		if (multiple) {
			const mp = props as MultiSelectProps<T>;
			const next = mp.value.includes(value)
				? mp.value.filter((v) => v !== value)
				: [...mp.value, value];
			mp.onChange(next);
		} else {
			(props as SingleSelectProps<T>).onChange(value);
			close();
		}
	};

	// Button label
	const buttonLabel = (() => {
		if (multiple) {
			const mp = props as MultiSelectProps<T>;
			if (mp.value.length === 0) return null;
			if (mp.value.length === 1) {
				return options.find((o) => o.value === mp.value[0])?.label ?? mp.value[0];
			}
			return `${mp.value.length} selected`;
		}
		const sp = props as SingleSelectProps<T>;
		return options.find((o) => o.value === sp.value)?.label ?? sp.value;
	})();

	// Show clear?
	const canClear = (() => {
		if (multiple) {
			const mp = props as MultiSelectProps<T>;
			const def = mp.defaultValue ?? [];
			return JSON.stringify(mp.value.slice().sort()) !== JSON.stringify(def.slice().sort());
		}
		const sp = props as SingleSelectProps<T>;
		return sp.defaultValue !== undefined && sp.value !== sp.defaultValue;
	})();

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (multiple) {
			const mp = props as MultiSelectProps<T>;
			mp.onChange(mp.defaultValue ?? ([] as T[]));
		} else {
			const sp = props as SingleSelectProps<T>;
			if (sp.defaultValue !== undefined) sp.onChange(sp.defaultValue);
		}
	};

	return (
		<Popover className={clsx("relative", className)}>
			{({ close }) => (
				<>
					{/* ── Trigger Button ── */}
					<span
						className={clsx(
							"relative block",
							"before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm",
							"dark:before:hidden",
						)}
					>
						<PopoverButton
							className={clsx(
								"relative inline-flex w-full items-center gap-1 appearance-none rounded-lg",
								"px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)]",
								"text-sm/6",
								"border border-zinc-950/10 hover:border-zinc-950/20",
								"bg-transparent dark:bg-white/5",
								"dark:border-white/10 dark:hover:border-white/20",
								"focus:outline-hidden",
								"transition-colors",
							)}
						>
							<span className="text-zinc-500 dark:text-zinc-400">{label}</span>
							{buttonLabel && (
								<span className="max-w-40 truncate font-medium text-zinc-950 dark:text-white">
									{buttonLabel}
								</span>
							)}

							{/* Multi-select count pill */}
							{multiple && (props as MultiSelectProps<T>).value.length > 1 && (
								<span className="flex size-4.5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
									{(props as MultiSelectProps<T>).value.length}
								</span>
							)}

							{/* Clear button */}
							{canClear ? (
								<button
									type="button"
									tabIndex={-1}
									onClick={handleClear}
									className="ml-0.5 -mr-0.5 flex size-4 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-600 dark:hover:text-white"
								>
									<XMarkIcon className="size-3" />
								</button>
							) : (
								<ChevronDownIcon className="size-3.5 shrink-0 text-zinc-400 transition-transform ui-open:rotate-180 dark:text-zinc-500" />
							)}
						</PopoverButton>
					</span>

					{/* ── Panel ── */}
					<Transition
						as={Fragment}
						enter="transition ease-out duration-150"
						enterFrom="opacity-0 translate-y-1"
						enterTo="opacity-100 translate-y-0"
						leave="transition ease-in duration-100"
						leaveFrom="opacity-100 translate-y-0"
						leaveTo="opacity-0 translate-y-1"
						afterEnter={() => searchRef.current?.focus()}
						afterLeave={() => setQuery("")}
					>
						<PopoverPanel
							anchor={anchor}
							className={clsx(
								"z-50 mt-2 w-max min-w-48 max-w-[18rem] rounded-xl p-1",
								"bg-white/80 backdrop-blur-xl dark:bg-zinc-800/80",
								"shadow-lg ring-1 ring-zinc-950/10 dark:ring-white/10 dark:ring-inset",
								"outline-none",
								"[--anchor-gap:--spacing(2)] [--anchor-padding:--spacing(1)]",
							)}
						>
							{/* Search */}
							{showSearch && (
								<div className="px-1.5 pt-1 pb-1.5">
									<div className="relative">
										<MagnifyingGlassIcon className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" />
										<input
											ref={searchRef}
											type="text"
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											placeholder={searchPlaceholder}
											className={clsx(
												"w-full rounded-lg border-0 bg-zinc-100 py-1.5 pl-7 pr-2 text-sm",
												"text-zinc-900 placeholder:text-zinc-400",
												"focus:outline-none focus:ring-1 focus:ring-zinc-300",
												"dark:bg-zinc-700/60 dark:text-white dark:placeholder:text-zinc-500 dark:focus:ring-zinc-600",
											)}
										/>
									</div>
								</div>
							)}

							{/* Options */}
							<div className="max-h-64 overflow-y-auto overscroll-contain scrollbar-hide">
								{filtered.length === 0 ? (
									<div className="px-3 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
										No results
									</div>
								) : grouped ? (
									<>
										{/* Ungrouped first */}
										{grouped.ungrouped.map((opt) => (
											<OptionItem
												key={opt.value}
												option={opt}
												selected={isSelected(opt.value)}
												onSelect={() => toggle(opt.value, close)}

											/>
										))}
										{/* Grouped */}
										{grouped.groups.map((g) => {
											const items = grouped.map.get(g.key);
											if (!items || items.length === 0) return null;
											return (
												<Fragment key={g.key}>
													{/* Section heading */}
													<div className="px-3 pt-2.5 pb-1 text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
														{g.label}
													</div>
													{items.map((opt) => (
														<OptionItem
															key={opt.value}
															option={opt}
															selected={isSelected(opt.value)}
															onSelect={() => toggle(opt.value, close)}
			
														/>
													))}
												</Fragment>
											);
										})}
									</>
								) : (
									filtered.map((opt) => (
										<OptionItem
											key={opt.value}
											option={opt}
											selected={isSelected(opt.value)}
											onSelect={() => toggle(opt.value, close)}
										/>
									))
								)}
							</div>

							{/* Multi-select footer */}
							{multiple && (props as MultiSelectProps<T>).value.length > 0 && (
								<>
									<div className="mx-2 my-1 h-px bg-zinc-950/5 dark:bg-white/10" />
									<div className="flex items-center justify-between px-3 py-1.5">
										<span className="text-xs text-zinc-500 dark:text-zinc-400">
											{(props as MultiSelectProps<T>).value.length} selected
										</span>
										<button
											type="button"
											onClick={() => (props as MultiSelectProps<T>).onChange([])}
											className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
										>
											Clear all
										</button>
									</div>
								</>
							)}
						</PopoverPanel>
					</Transition>
				</>
			)}
		</Popover>
	);
}

// =============================================================================
// OPTION ITEM
// =============================================================================

function OptionItem<T extends string>({
	option,
	selected,
	onSelect,
}: {
	option: FilterOption<T>;
	selected: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={clsx(
				"flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
				"sm:py-1.5",
				selected
					? "bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900"
					: "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-white/5",
			)}
		>
			{/* Icon */}
			{option.icon && (
				<option.icon
					className={clsx(
						"size-4 shrink-0",
						selected ? "text-white/70 dark:text-zinc-900/60" : (option.iconColor || "text-zinc-500 dark:text-zinc-400"),
					)}
				/>
			)}

			{/* Label */}
			<span className="flex-1 truncate">{option.label}</span>

			{/* Count badge */}
			{option.count !== undefined && option.count > 0 && (
				<span
					className={clsx(
						"ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
						selected
							? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
							: "bg-zinc-100 text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400",
					)}
				>
					{option.count}
				</span>
			)}
		</button>
	);
}
