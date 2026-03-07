/**
 * Skeleton Components
 * PageSkeleton, TableSkeleton, CardSkeleton
 */

import clsx from "clsx";
import { useId } from "react";

// =============================================================================
// PAGE SKELETON
// =============================================================================

export interface PageSkeletonProps {
	showStats?: boolean;
	statsCount?: number;
	showFilters?: boolean;
	showTable?: boolean;
	tableRows?: number;
}

function generateKeys(prefix: string, count: number): string[] {
	return Array.from({ length: count }, (_, i) => `${prefix}-${i}`);
}

export function PageSkeleton({
	showStats = true,
	statsCount = 4,
	showFilters = true,
	showTable = true,
	tableRows = 5,
}: PageSkeletonProps) {
	const id = useId();
	const statKeys = generateKeys(`${id}-stat`, statsCount);

	return (
		<div className="animate-fade-in space-y-6">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<div className="h-8 w-48 rounded-lg bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
					<div className="h-4 w-64 rounded-lg bg-zinc-100 skeleton-shimmer dark:bg-zinc-800/50" />
				</div>
				<div className="flex gap-2">
					<div className="h-10 w-24 rounded-lg bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
					<div className="h-10 w-32 rounded-lg bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
				</div>
			</div>

			{/* Stats skeleton */}
			{showStats && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{statKeys.map((key) => (
						<div key={key} className="h-28 rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
					))}
				</div>
			)}

			{/* Filters skeleton */}
			{showFilters && (
				<div className="flex items-center gap-3">
					<div className="h-10 w-64 rounded-lg bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
					<div className="h-10 w-32 rounded-lg bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
				</div>
			)}

			{/* Table skeleton */}
			{showTable && <TableSkeleton rows={tableRows} />}
		</div>
	);
}

// =============================================================================
// TABLE SKELETON
// =============================================================================

export interface TableSkeletonProps {
	rows?: number;
	columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
	return (
		<div className="overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800">
			<div className="bg-white dark:bg-zinc-900">
				{/* Header */}
				<div className="flex gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
					{Array.from({ length: columns }).map((_, i) => (
						<div key={`th-${i}`} className="h-4 flex-1 rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
					))}
				</div>
				{/* Rows */}
				{Array.from({ length: rows }).map((_, i) => (
					<div
						key={`tr-${i}`}
						className="flex gap-4 border-b border-zinc-200 px-4 py-4 last:border-0 dark:border-zinc-800"
					>
						{Array.from({ length: columns }).map((_, j) => (
							<div key={`td-${i}-${j}`} className="h-5 flex-1 rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
						))}
					</div>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// CARD SKELETON
// =============================================================================

export function CardSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={clsx(
				"rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:p-5",
				className
			)}
		>
			<div className="flex items-start gap-3">
				<div className="size-10 rounded-lg bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
				<div className="flex-1 space-y-2">
					<div className="h-5 w-32 rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
					<div className="h-4 w-48 rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
				</div>
			</div>
			<div className="mt-4 space-y-2">
				<div className="h-4 w-full rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
				<div className="h-4 w-3/4 rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
			</div>
		</div>
	);
}

// =============================================================================
// STAT CARD SKELETON
// =============================================================================
