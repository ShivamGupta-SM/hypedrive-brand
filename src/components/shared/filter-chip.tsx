/**
 * Filter Components
 * Shopper-style filter chips, filter bar, and tab buttons
 */

import { FunnelIcon, XMarkIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

// =============================================================================
// FILTER CHIP
// =============================================================================

export interface FilterChipProps {
	label: string;
	onRemove: () => void;
	className?: string;
}

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
	return (
		<span
			className={clsx(
				"inline-flex items-center gap-1 rounded-full bg-zinc-100 py-1 pl-2.5 pr-1 text-xs font-medium text-zinc-700",
				"dark:bg-zinc-800 dark:text-zinc-300",
				className
			)}
		>
			{label}
			<button
				type="button"
				onClick={onRemove}
				className="flex size-4 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
			>
				<XMarkIcon className="size-3" />
			</button>
		</span>
	);
}

// =============================================================================
// FILTER ICON BUTTON
// =============================================================================

export interface FilterIconButtonProps {
	onClick: () => void;
	hasActiveFilters?: boolean;
	className?: string;
}

export function FilterIconButton({ onClick, hasActiveFilters = false, className }: FilterIconButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				"relative flex size-10 items-center justify-center rounded-lg",
				"bg-white ring-1 ring-zinc-200 transition-all hover:ring-zinc-300",
				"dark:bg-zinc-900 dark:ring-zinc-700 dark:hover:ring-zinc-600",
				className
			)}
		>
			<FunnelIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
			{hasActiveFilters && (
				<span className="absolute -right-0.5 -top-0.5 flex size-2.5">
					<span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
					<span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
				</span>
			)}
		</button>
	);
}

// =============================================================================
// TAB BUTTON (Pill style tabs)
// =============================================================================

export interface TabButtonProps {
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	isActive: boolean;
	onClick: () => void;
	count?: number;
	className?: string;
}

export function TabButton({ label, icon: Icon, isActive, onClick, count, className }: TabButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				"flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
				isActive
					? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
					: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
				className
			)}
		>
			{Icon && <Icon className="size-4" />}
			{label}
			{count !== undefined && (
				<span
					className={clsx(
						"ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
						isActive
							? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
							: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
					)}
				>
					{count}
				</span>
			)}
		</button>
	);
}

// =============================================================================
// TAB GROUP
// =============================================================================

export interface TabGroupProps {
	children: React.ReactNode;
	className?: string;
}

export function TabGroup({ children, className }: TabGroupProps) {
	return <div className={clsx("flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800", className)}>{children}</div>;
}

// =============================================================================
// FILTER BAR
// =============================================================================

export interface FilterBarProps {
	children: React.ReactNode;
	className?: string;
}

export function FilterBar({ children, className }: FilterBarProps) {
	return <div className={clsx("flex flex-wrap items-center gap-2", className)}>{children}</div>;
}

// =============================================================================
// ACTIVE FILTERS ROW
// =============================================================================

export interface ActiveFiltersProps {
	filters: Array<{
		id: string;
		label: string;
	}>;
	onRemove: (id: string) => void;
	onClearAll?: () => void;
	className?: string;
}

export function ActiveFilters({ filters, onRemove, onClearAll, className }: ActiveFiltersProps) {
	if (filters.length === 0) return null;

	return (
		<div className={clsx("flex flex-wrap items-center gap-2", className)}>
			{filters.map((filter) => (
				<FilterChip key={filter.id} label={filter.label} onRemove={() => onRemove(filter.id)} />
			))}
			{onClearAll && filters.length > 1 && (
				<button
					type="button"
					onClick={onClearAll}
					className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
				>
					Clear all
				</button>
			)}
		</div>
	);
}

// =============================================================================
// SEARCH INPUT
// =============================================================================

export interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search...", className }: SearchInputProps) {
	return (
		<div className={clsx("relative", className)}>
			<svg
				className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
				/>
			</svg>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={clsx(
					"w-full rounded-lg border-0 bg-white py-2 pl-9 pr-3 text-sm",
					"ring-1 ring-zinc-200 placeholder:text-zinc-400",
					"focus:outline-none focus:ring-2 focus:ring-zinc-900",
					"dark:bg-zinc-900 dark:ring-zinc-700 dark:placeholder:text-zinc-500 dark:focus:ring-white"
				)}
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
				>
					<XMarkIcon className="size-4" />
				</button>
			)}
		</div>
	);
}
