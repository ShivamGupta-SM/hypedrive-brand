/**
 * Financial Stats Grid - Merged/compound stat cards
 * Ported from hypedrive-admin. Tailwind UI-style stat grid with gap-px borders.
 */

interface StatItem {
	name: string;
	value: string | number;
	change?: string;
	changeType?: "positive" | "negative" | "neutral";
}

interface FinancialStatsGridProps {
	stats: StatItem[];
	loading?: boolean;
	columns?: 2 | 3 | 4 | 5;
}

export function FinancialStatsGrid({ stats, loading = false, columns = 4 }: FinancialStatsGridProps) {
	const gridColsClass = {
		2: "grid-cols-2",
		3: "grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-2 lg:grid-cols-4",
		5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
	}[columns];

	if (loading) {
		return (
			<dl className={`grid ${gridColsClass} gap-px bg-zinc-200 dark:bg-zinc-700`}>
				{Array.from({ length: stats.length || columns }).map((_, i) => (
					<div
						key={`skeleton-${i}`}
						className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-3 py-6 sm:px-6 xl:px-8 dark:bg-zinc-900"
					>
						<div className="h-3 w-16 sm:h-4 sm:w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
						<div className="h-3 w-10 sm:h-4 sm:w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
						<div className="mt-2 h-6 w-20 sm:h-8 sm:w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
					</div>
				))}
			</dl>
		);
	}

	return (
		<dl className={`grid ${gridColsClass} gap-px bg-zinc-200 dark:bg-zinc-700`}>
			{stats.map((stat) => (
				<div
					key={stat.name}
					className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-white px-3 py-5 sm:px-6 sm:py-8 xl:px-8 dark:bg-zinc-900"
				>
					<dt className="text-xs sm:text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">{stat.name}</dt>
					{stat.change && (
						<dd
							className={`text-xs font-medium ${
								stat.changeType === "negative"
									? "text-rose-600 dark:text-rose-400"
									: stat.changeType === "positive"
										? "text-emerald-600 dark:text-emerald-400"
										: "text-zinc-700 dark:text-zinc-300"
							}`}
						>
							{stat.change}
						</dd>
					)}
					<dd className="w-full flex-none text-xl sm:text-3xl/10 font-medium tracking-tight text-zinc-900 dark:text-white">
						{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
					</dd>
				</div>
			))}
		</dl>
	);
}

/**
 * Bordered variant with rounded corners - for use inside card containers
 */
export function FinancialStatsGridBordered({ stats, loading = false, columns = 4 }: FinancialStatsGridProps) {
	const gridColsClass = {
		2: "grid-cols-2",
		3: "grid-cols-2 lg:grid-cols-3",
		4: "grid-cols-2 lg:grid-cols-4",
		5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
	}[columns];

	if (loading) {
		return (
			<dl
				className={`grid ${gridColsClass} gap-px overflow-hidden rounded-xl bg-zinc-200 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-700 dark:ring-zinc-800`}
			>
				{Array.from({ length: stats.length || columns }).map((_, i) => (
					<div
						key={`skeleton-${i}`}
						className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 bg-white px-3 py-5 sm:px-6 sm:py-6 dark:bg-zinc-900"
					>
						<div className="h-3 w-16 sm:h-4 sm:w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
						<div className="h-3 w-10 sm:h-4 sm:w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
						<div className="mt-2 h-5 w-16 sm:h-7 sm:w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
					</div>
				))}
			</dl>
		);
	}

	return (
		<dl
			className={`grid ${gridColsClass} gap-px overflow-hidden rounded-xl bg-zinc-200 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-700 dark:ring-zinc-800`}
		>
			{stats.map((stat) => (
				<div
					key={stat.name}
					className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-white px-3 py-4 sm:px-6 sm:py-6 dark:bg-zinc-900"
				>
					<dt className="text-xs sm:text-sm/6 font-medium text-zinc-500 dark:text-zinc-400">{stat.name}</dt>
					{stat.change && (
						<dd
							className={`text-xs font-medium ${
								stat.changeType === "negative"
									? "text-rose-600 dark:text-rose-400"
									: stat.changeType === "positive"
										? "text-emerald-600 dark:text-emerald-400"
										: "text-zinc-700 dark:text-zinc-300"
							}`}
						>
							{stat.change}
						</dd>
					)}
					<dd className="w-full flex-none text-lg sm:text-2xl/8 lg:text-3xl/10 font-medium tracking-tight text-zinc-900 dark:text-white">
						{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
					</dd>
				</div>
			))}
		</dl>
	);
}
