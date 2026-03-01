/**
 * StatsRow Component
 * Horizontal stats display for page headers and dashboards
 * Supports responsive horizontal scroll on mobile with hidden scrollbars
 */

import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

// =============================================================================
// STAT ITEM
// =============================================================================

export interface StatItemConfig {
	label: string;
	value: string | number;
	sublabel?: string;
	trend?: {
		value: number;
		direction: "up" | "down";
	};
	icon?: React.ReactNode;
	iconColor?: "lime" | "amber" | "blue" | "red" | "zinc" | "emerald" | "sky";
	variant?: "default" | "success" | "warning" | "danger" | "info";
	href?: string;
	onClick?: () => void;
}

// =============================================================================
// STATS ROW
// =============================================================================

export interface StatsRowProps {
	stats: StatItemConfig[];
	className?: string;
	variant?: "default" | "compact" | "cards";
	columns?: 2 | 3 | 4 | 5 | 6;
}

const columnStyles = {
	2: "sm:grid-cols-2",
	3: "sm:grid-cols-2 lg:grid-cols-3",
	4: "sm:grid-cols-2 lg:grid-cols-4",
	5: "sm:grid-cols-3 lg:grid-cols-5",
	6: "sm:grid-cols-3 lg:grid-cols-6",
};

const iconColors = {
	lime: "text-lime-500",
	amber: "text-amber-500",
	blue: "text-blue-500",
	red: "text-red-500",
	zinc: "text-zinc-400",
	emerald: "text-emerald-500",
	sky: "text-sky-500",
};

const variantColors = {
	default: {
		bg: "bg-white dark:bg-zinc-900",
		iconBg: "bg-zinc-100 dark:bg-zinc-800",
		iconColor: "text-zinc-600 dark:text-zinc-400",
		valueColor: "text-zinc-900 dark:text-white",
	},
	success: {
		bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
		iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
		iconColor: "text-emerald-600 dark:text-emerald-400",
		valueColor: "text-emerald-700 dark:text-emerald-300",
	},
	warning: {
		bg: "bg-amber-50/50 dark:bg-amber-950/20",
		iconBg: "bg-amber-100 dark:bg-amber-900/50",
		iconColor: "text-amber-600 dark:text-amber-400",
		valueColor: "text-amber-700 dark:text-amber-300",
	},
	danger: {
		bg: "bg-red-50/50 dark:bg-red-950/20",
		iconBg: "bg-red-100 dark:bg-red-900/50",
		iconColor: "text-red-600 dark:text-red-400",
		valueColor: "text-red-700 dark:text-red-300",
	},
	info: {
		bg: "bg-sky-50/50 dark:bg-sky-950/20",
		iconBg: "bg-sky-100 dark:bg-sky-900/50",
		iconColor: "text-sky-600 dark:text-sky-400",
		valueColor: "text-sky-700 dark:text-sky-300",
	},
};

export function StatsRow({ stats, className, variant = "default", columns = 4 }: StatsRowProps) {
	if (variant === "cards") {
		return (
			<div className={clsx("-mx-4 px-4 sm:mx-0 sm:px-0", className)}>
				<div
					className={clsx(
						"flex gap-3 overflow-x-auto pb-2 sm:grid sm:gap-4 sm:overflow-visible sm:pb-0",
						columnStyles[columns]
					)}
				>
					{stats.map((stat) => (
						<div key={stat.label} className="w-36 shrink-0 sm:w-auto">
							<StatCard stat={stat} />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (variant === "compact") {
		return (
			<div className={clsx("flex flex-wrap items-center gap-6", className)}>
				{stats.map((stat) => (
					<CompactStat key={stat.label} stat={stat} />
				))}
			</div>
		);
	}

	// Default - horizontal scroll on mobile, grid on desktop
	return (
		<div className={clsx("-mx-4 px-4 sm:mx-0 sm:px-0", className)}>
			<div
				className={clsx(
					"flex gap-3 overflow-x-auto pb-2 sm:grid sm:gap-4 sm:overflow-visible sm:pb-0",
					columnStyles[columns]
				)}
			>
				{stats.map((stat) => (
					<div key={stat.label} className="w-36 shrink-0 sm:w-auto">
						<DefaultStat stat={stat} />
					</div>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// STAT VARIANTS
// =============================================================================

function DefaultStat({ stat }: { stat: StatItemConfig }) {
	const colors = variantColors[stat.variant || "default"];

	const content = (
		<>
			<div className="flex items-center gap-2">
				{stat.icon && (
					<div className={clsx("flex size-8 shrink-0 items-center justify-center rounded-lg", colors.iconBg)}>
						<span className={clsx("size-4", colors.iconColor)}>{stat.icon}</span>
					</div>
				)}
			</div>
			<div className="mt-auto pt-2">
				<span className={clsx("text-lg font-bold sm:text-xl", colors.valueColor)}>{stat.value}</span>
				<div className="flex items-center gap-2">
					<span className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</span>
					{stat.trend && (
						<span
							className={clsx(
								"flex items-center gap-0.5 text-[10px] font-medium",
								stat.trend.direction === "up"
									? "text-emerald-600 dark:text-emerald-400"
									: "text-red-600 dark:text-red-400"
							)}
						>
							{stat.trend.direction === "up" ? (
								<ArrowTrendingUpIcon className="size-3" />
							) : (
								<ArrowTrendingDownIcon className="size-3" />
							)}
							{Math.abs(stat.trend.value)}%
						</span>
					)}
				</div>
			</div>
			{stat.sublabel && <span className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">{stat.sublabel}</span>}
		</>
	);

	const baseClassName = clsx(
		"flex h-full flex-col rounded-xl p-3 ring-1 ring-zinc-200 dark:ring-zinc-800",
		colors.bg,
		(stat.href || stat.onClick) &&
			"cursor-pointer transition-all hover:shadow-md hover:ring-zinc-300 dark:hover:ring-zinc-700"
	);

	if (stat.href) {
		return (
			<a href={stat.href} className={baseClassName}>
				{content}
			</a>
		);
	}

	if (stat.onClick) {
		return (
			<button type="button" onClick={stat.onClick} className={baseClassName}>
				{content}
			</button>
		);
	}

	return <div className={baseClassName}>{content}</div>;
}

function CompactStat({ stat }: { stat: StatItemConfig }) {
	return (
		<div className="flex items-center gap-2">
			{stat.icon && <span className={clsx("size-4", iconColors[stat.iconColor || "zinc"])}>{stat.icon}</span>}
			<span className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}:</span>
			<span className="font-semibold text-zinc-900 dark:text-white">{stat.value}</span>
			{stat.trend && (
				<span
					className={clsx(
						"flex items-center gap-0.5 text-xs font-medium",
						stat.trend.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
					)}
				>
					{stat.trend.direction === "up" ? (
						<ArrowTrendingUpIcon className="size-3" />
					) : (
						<ArrowTrendingDownIcon className="size-3" />
					)}
					{Math.abs(stat.trend.value)}%
				</span>
			)}
		</div>
	);
}

function StatCard({ stat }: { stat: StatItemConfig }) {
	const colors = variantColors[stat.variant || "default"];

	const content = (
		<>
			{stat.icon && (
				<div className={clsx("flex size-10 shrink-0 items-center justify-center rounded-lg", colors.iconBg)}>
					<span className={clsx("size-5", colors.iconColor)}>{stat.icon}</span>
				</div>
			)}
			<div className="min-w-0">
				<div className="truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{stat.label}</div>
				<div className="flex items-baseline gap-1.5">
					<span className={clsx("text-lg font-bold", colors.valueColor)}>{stat.value}</span>
					{stat.trend && (
						<span
							className={clsx(
								"flex items-center gap-0.5 text-xs font-medium",
								stat.trend.direction === "up"
									? "text-emerald-600 dark:text-emerald-400"
									: "text-red-600 dark:text-red-400"
							)}
						>
							{stat.trend.direction === "up" ? "↑" : "↓"}
							{Math.abs(stat.trend.value)}%
						</span>
					)}
				</div>
			</div>
		</>
	);

	const baseClassName = clsx(
		"flex h-full items-center gap-3 rounded-xl p-3 ring-1 ring-zinc-200 dark:ring-zinc-800",
		colors.bg,
		(stat.href || stat.onClick) && "cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
	);

	if (stat.href) {
		return (
			<a href={stat.href} className={baseClassName}>
				{content}
			</a>
		);
	}

	if (stat.onClick) {
		return (
			<button type="button" onClick={stat.onClick} className={baseClassName}>
				{content}
			</button>
		);
	}

	return <div className={baseClassName}>{content}</div>;
}

// =============================================================================
// QUICK STATS
// =============================================================================

export interface QuickStatsProps {
	children: React.ReactNode;
	className?: string;
}

export function QuickStats({ children, className }: QuickStatsProps) {
	return (
		<div className={clsx("flex flex-wrap items-center gap-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50", className)}>
			{children}
		</div>
	);
}

// =============================================================================
// QUICK STAT ITEM
// =============================================================================

export interface QuickStatItemProps {
	icon?: React.ReactNode;
	iconBg?: string;
	label: string;
	value: string | number;
	divider?: boolean;
}

export function QuickStatItem({
	icon,
	iconBg = "bg-zinc-100 dark:bg-zinc-700",
	label,
	value,
	divider = false,
}: QuickStatItemProps) {
	return (
		<>
			{divider && <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />}
			<div className="flex items-center gap-2">
				{icon && <div className={clsx("flex size-8 items-center justify-center rounded-lg", iconBg)}>{icon}</div>}
				<div>
					<div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
					<div className="font-medium text-zinc-900 dark:text-white">{value}</div>
				</div>
			</div>
		</>
	);
}
