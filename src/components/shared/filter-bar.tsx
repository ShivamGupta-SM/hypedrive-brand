/**
 * FilterBar Component
 * Standardized search and filter UI for list pages
 */

import { FunnelIcon, ListBulletIcon, MagnifyingGlassIcon, Squares2X2Icon, XMarkIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Button } from "@/components/button";
import { Input, InputGroup } from "@/components/input";
import { Select } from "@/components/select";
import { Text } from "@/components/text";

// =============================================================================
// FILTER CONFIG TYPES
// =============================================================================

export interface SelectFilterConfig {
	type: "select";
	field: string;
	label: string;
	placeholder?: string;
	options: { value: string; label: string }[];
	width?: string;
}

export interface TextFilterConfig {
	type: "text";
	field: string;
	label: string;
	placeholder?: string;
	width?: string;
}

export type FilterConfig = SelectFilterConfig | TextFilterConfig;

export type FilterState = Record<string, string>;

// =============================================================================
// FILTER BAR
// =============================================================================

export interface FilterBarProps {
	className?: string;
	// Search
	searchPlaceholder?: string;
	searchValue?: string;
	onSearchChange?: (value: string) => void;
	showSearch?: boolean;
	// Filters
	filters?: FilterConfig[];
	filterValues?: FilterState;
	onFilterChange?: (field: string, value: string) => void;
	// Active filters
	hasActiveFilters?: boolean;
	onClearFilters?: () => void;
	// Results
	resultCount?: number;
	totalCount?: number;
	// View toggle
	showViewToggle?: boolean;
	viewMode?: "list" | "grid";
	onViewModeChange?: (mode: "list" | "grid") => void;
	// Actions
	actions?: React.ReactNode;
}

export function FilterBar({
	className,
	searchPlaceholder = "Search...",
	searchValue = "",
	onSearchChange,
	showSearch = true,
	filters = [],
	filterValues = {},
	onFilterChange,
	hasActiveFilters = false,
	onClearFilters,
	resultCount,
	totalCount,
	showViewToggle = false,
	viewMode = "list",
	onViewModeChange,
	actions,
}: FilterBarProps) {
	return (
		<div className={clsx("space-y-3", className)}>
			{/* Main filter row */}
			<div className="flex flex-wrap items-center gap-3">
				{/* Search */}
				{showSearch && onSearchChange && (
					<div className="w-full sm:w-auto sm:min-w-[240px] sm:flex-1 sm:max-w-xs">
						<InputGroup>
							<MagnifyingGlassIcon data-slot="icon" />
							<Input
								name="search"
								placeholder={searchPlaceholder}
								value={searchValue}
								onChange={(e) => onSearchChange(e.target.value)}
							/>
							{searchValue && (
								<button
									type="button"
									onClick={() => onSearchChange("")}
									className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
								>
									<XMarkIcon className="size-4" />
								</button>
							)}
						</InputGroup>
					</div>
				)}

				{/* Filters */}
				{filters.map((filter) => (
					<div key={filter.field} className={clsx("shrink-0", filter.width || "w-36")}>
						{filter.type === "select" ? (
							<Select
								value={filterValues[filter.field] || ""}
								onChange={(e) => onFilterChange?.(filter.field, e.target.value)}
								aria-label={filter.label}
							>
								<option value="">{filter.placeholder || `All ${filter.label}`}</option>
								{filter.options.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</Select>
						) : (
							<Input
								placeholder={filter.placeholder || filter.label}
								value={filterValues[filter.field] || ""}
								onChange={(e) => onFilterChange?.(filter.field, e.target.value)}
								aria-label={filter.label}
							/>
						)}
					</div>
				))}

				{/* Clear filters */}
				{hasActiveFilters && onClearFilters && (
					<Button plain onClick={onClearFilters} className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
						<XMarkIcon data-slot="icon" />
						Clear
					</Button>
				)}

				{/* Spacer */}
				<div className="flex-1" />

				{/* View toggle */}
				{showViewToggle && onViewModeChange && (
					<div className="flex items-center rounded-lg shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
						<button
							type="button"
							onClick={() => onViewModeChange("list")}
							className={clsx(
								"flex items-center justify-center rounded-l-lg p-2 transition-colors",
								viewMode === "list"
									? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
									: "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
							)}
							aria-label="List view"
						>
							<ListBulletIcon className="size-4" />
						</button>
						<button
							type="button"
							onClick={() => onViewModeChange("grid")}
							className={clsx(
								"flex items-center justify-center rounded-r-lg p-2 transition-colors",
								viewMode === "grid"
									? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
									: "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
							)}
							aria-label="Grid view"
						>
							<Squares2X2Icon className="size-4" />
						</button>
					</div>
				)}

				{/* Actions */}
				{actions}
			</div>

			{/* Results count */}
			{(resultCount !== undefined || hasActiveFilters) && (
				<div className="flex items-center gap-2">
					{resultCount !== undefined && (
						<Text className="text-sm text-zinc-500">
							{hasActiveFilters && totalCount !== undefined ? (
								<>
									Showing <span className="font-medium text-zinc-700 dark:text-zinc-300">{resultCount}</span> of{" "}
									<span className="font-medium text-zinc-700 dark:text-zinc-300">{totalCount}</span> results
								</>
							) : (
								<>
									<span className="font-medium text-zinc-700 dark:text-zinc-300">{resultCount}</span> results
								</>
							)}
						</Text>
					)}
					{hasActiveFilters && (
						<div className="flex items-center gap-1 text-xs text-zinc-400">
							<FunnelIcon className="size-3.5" />
							<span>Filtered</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// FILTER PILLS
// =============================================================================

export interface FilterPillsProps {
	className?: string;
	options: { value: string; label: string; count?: number }[];
	value: string;
	onChange: (value: string) => void;
	allLabel?: string;
}

export function FilterPills({ className, options, value, onChange, allLabel = "All" }: FilterPillsProps) {
	return (
		<div className={clsx("flex flex-wrap gap-2", className)}>
			<button
				type="button"
				onClick={() => onChange("")}
				className={clsx(
					"rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
					!value
						? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
						: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
				)}
			>
				{allLabel}
			</button>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					className={clsx(
						"rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
						value === option.value
							? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
							: "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
					)}
				>
					{option.label}
					{option.count !== undefined && <span className="ml-1.5 text-xs opacity-70">({option.count})</span>}
				</button>
			))}
		</div>
	);
}

// =============================================================================
// ACTIVE FILTERS
// =============================================================================

export interface ActiveFilter {
	field: string;
	label: string;
	value: string;
	displayValue: string;
}

export interface ActiveFiltersProps {
	className?: string;
	filters: ActiveFilter[];
	onRemove: (field: string) => void;
	onClearAll?: () => void;
}

export function ActiveFilters({ className, filters, onRemove, onClearAll }: ActiveFiltersProps) {
	if (filters.length === 0) return null;

	return (
		<div className={clsx("flex flex-wrap items-center gap-2", className)}>
			<Text className="text-sm text-zinc-500">Filters:</Text>
			{filters.map((filter) => (
				<span
					key={filter.field}
					className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 py-1 pl-3 pr-1.5 text-sm dark:bg-zinc-800"
				>
					<span className="text-zinc-500 dark:text-zinc-400">{filter.label}:</span>
					<span className="font-medium text-zinc-700 dark:text-zinc-300">{filter.displayValue}</span>
					<button
						type="button"
						onClick={() => onRemove(filter.field)}
						className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
					>
						<XMarkIcon className="size-3.5" />
					</button>
				</span>
			))}
			{onClearAll && filters.length > 1 && (
				<button
					type="button"
					onClick={onClearAll}
					className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
				>
					Clear all
				</button>
			)}
		</div>
	);
}
