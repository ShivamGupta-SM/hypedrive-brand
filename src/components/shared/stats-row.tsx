/**
 * StatsRow Component
 * Horizontal stats display for page headers and dashboards
 */

import clsx from "clsx";
import { TrendUp, TrendDown } from "@phosphor-icons/react";

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
  iconColor?: "lime" | "amber" | "blue" | "red" | "zinc" | "emerald" | "purple";
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
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

const iconColors = {
  lime: "text-lime-500",
  amber: "text-amber-500",
  blue: "text-blue-500",
  red: "text-red-500",
  zinc: "text-zinc-400",
  emerald: "text-emerald-500",
  purple: "text-purple-500",
};

export function StatsRow({
  stats,
  className,
  variant = "default",
  columns = 4,
}: StatsRowProps) {
  if (variant === "cards") {
    return (
      <div className={clsx("grid gap-4", columnStyles[columns], className)}>
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={clsx("flex flex-wrap items-center gap-6", className)}>
        {stats.map((stat, index) => (
          <CompactStat key={index} stat={stat} />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx("grid gap-4", columnStyles[columns], className)}>
      {stats.map((stat, index) => (
        <DefaultStat key={index} stat={stat} />
      ))}
    </div>
  );
}

// =============================================================================
// STAT VARIANTS
// =============================================================================

function DefaultStat({ stat }: { stat: StatItemConfig }) {
  const Wrapper = stat.href ? "a" : stat.onClick ? "button" : "div";

  return (
    <Wrapper
      href={stat.href}
      onClick={stat.onClick}
      className={clsx(
        "rounded-xl bg-white p-4 ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10",
        (stat.href || stat.onClick) && "cursor-pointer transition-all hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-2">
        {stat.icon && (
          <span className={clsx("size-4", iconColors[stat.iconColor || "zinc"])}>
            {stat.icon}
          </span>
        )}
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {stat.label}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-zinc-900 dark:text-white">
          {stat.value}
        </span>
        {stat.trend && (
          <span
            className={clsx(
              "flex items-center gap-0.5 text-xs font-medium",
              stat.trend.direction === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {stat.trend.direction === "up" ? (
              <TrendUp className="size-3.5" weight="bold" />
            ) : (
              <TrendDown className="size-3.5" weight="bold" />
            )}
            {Math.abs(stat.trend.value)}%
          </span>
        )}
      </div>
      {stat.sublabel && (
        <span className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {stat.sublabel}
        </span>
      )}
    </Wrapper>
  );
}

function CompactStat({ stat }: { stat: StatItemConfig }) {
  return (
    <div className="flex items-center gap-2">
      {stat.icon && (
        <span className={clsx("size-4", iconColors[stat.iconColor || "zinc"])}>
          {stat.icon}
        </span>
      )}
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}:</span>
      <span className="font-semibold text-zinc-900 dark:text-white">{stat.value}</span>
      {stat.trend && (
        <span
          className={clsx(
            "flex items-center gap-0.5 text-xs font-medium",
            stat.trend.direction === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {stat.trend.direction === "up" ? (
            <TrendUp className="size-3" weight="bold" />
          ) : (
            <TrendDown className="size-3" weight="bold" />
          )}
          {Math.abs(stat.trend.value)}%
        </span>
      )}
    </div>
  );
}

function StatCard({ stat }: { stat: StatItemConfig }) {
  const Wrapper = stat.href ? "a" : stat.onClick ? "button" : "div";

  return (
    <Wrapper
      href={stat.href}
      onClick={stat.onClick}
      className={clsx(
        "flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50",
        (stat.href || stat.onClick) && "cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      )}
    >
      {stat.icon && (
        <div
          className={clsx(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            stat.iconColor === "lime" && "bg-lime-100 dark:bg-lime-900/30",
            stat.iconColor === "amber" && "bg-amber-100 dark:bg-amber-900/30",
            stat.iconColor === "blue" && "bg-blue-100 dark:bg-blue-900/30",
            stat.iconColor === "red" && "bg-red-100 dark:bg-red-900/30",
            stat.iconColor === "emerald" && "bg-emerald-100 dark:bg-emerald-900/30",
            stat.iconColor === "purple" && "bg-purple-100 dark:bg-purple-900/30",
            (!stat.iconColor || stat.iconColor === "zinc") && "bg-zinc-100 dark:bg-zinc-700"
          )}
        >
          <span className={clsx("size-5", iconColors[stat.iconColor || "zinc"])}>
            {stat.icon}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">
            {stat.value}
          </span>
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
    </Wrapper>
  );
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
    <div
      className={clsx(
        "flex flex-wrap items-center gap-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50",
        className
      )}
    >
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
      {divider && (
        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
      )}
      <div className="flex items-center gap-2">
        {icon && (
          <div className={clsx("flex size-8 items-center justify-center rounded-lg", iconBg)}>
            {icon}
          </div>
        )}
        <div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
          <div className="font-medium text-zinc-900 dark:text-white">{value}</div>
        </div>
      </div>
    </>
  );
}
