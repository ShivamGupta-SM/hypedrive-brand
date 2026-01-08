/**
 * Card Component
 * Standardized card container with Header, Body, and Footer subcomponents
 */

import clsx from "clsx";
import { Heading, Subheading } from "@/components/heading";
import { Text } from "@/components/text";

// =============================================================================
// CARD CONTAINER
// =============================================================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "bordered" | "elevated" | "subtle";
  hover?: boolean;
  onClick?: () => void;
  as?: "div" | "article" | "section";
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const variantStyles = {
  default: "bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10",
  bordered: "border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
  elevated: "bg-white shadow-md ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10",
  subtle: "bg-zinc-50 dark:bg-zinc-800/50",
};

export function Card({
  children,
  className,
  padding = "md",
  variant = "default",
  hover = false,
  onClick,
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      className={clsx(
        "rounded-xl",
        variantStyles[variant],
        paddingStyles[padding],
        hover && "transition-all hover:shadow-md hover:ring-zinc-950/10 dark:hover:ring-white/20",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

// =============================================================================
// CARD HEADER
// =============================================================================

export interface CardHeaderProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  size?: "sm" | "md" | "lg";
}

export function CardHeader({
  children,
  title,
  description,
  icon,
  action,
  className,
  titleClassName,
  size = "md",
}: CardHeaderProps) {
  if (children) {
    return (
      <div className={clsx("flex items-start justify-between gap-4", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={clsx("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {title && (
            size === "lg" ? (
              <Heading className={titleClassName}>{title}</Heading>
            ) : size === "md" ? (
              <Subheading className={titleClassName}>{title}</Subheading>
            ) : (
              <h4 className={clsx("text-sm font-semibold text-zinc-900 dark:text-white", titleClassName)}>
                {title}
              </h4>
            )
          )}
          {description && (
            <Text className="mt-1 text-sm text-zinc-500">{description}</Text>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// =============================================================================
// CARD BODY
// =============================================================================

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function CardBody({ children, className, noPadding }: CardBodyProps) {
  return (
    <div className={clsx(!noPadding && "mt-4", className)}>
      {children}
    </div>
  );
}

// =============================================================================
// CARD FOOTER
// =============================================================================

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export function CardFooter({ children, className, border = true }: CardFooterProps) {
  return (
    <div
      className={clsx(
        "mt-4 flex items-center justify-end gap-3 pt-4",
        border && "border-t border-zinc-200 dark:border-zinc-700",
        className
      )}
    >
      {children}
    </div>
  );
}

// =============================================================================
// CARD DIVIDER
// =============================================================================

export function CardDivider({ className }: { className?: string }) {
  return (
    <div className={clsx("my-4 border-t border-zinc-200 dark:border-zinc-700", className)} />
  );
}

// =============================================================================
// CARD GRID
// =============================================================================

export interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const columnStyles = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const gapStyles = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

export function CardGrid({
  children,
  columns = 3,
  gap = "md",
  className,
}: CardGridProps) {
  return (
    <div className={clsx("grid", columnStyles[columns], gapStyles[gap], className)}>
      {children}
    </div>
  );
}

// =============================================================================
// STAT CARD
// =============================================================================

export interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
  href?: string;
  onClick?: () => void;
}

const statVariantStyles = {
  default: {
    card: "bg-white ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10",
    icon: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    value: "text-zinc-900 dark:text-white",
  },
  success: {
    card: "bg-emerald-50 ring-emerald-200/60 dark:bg-emerald-950/20 dark:ring-emerald-800/40",
    icon: "bg-emerald-500 text-white",
    value: "text-emerald-900 dark:text-emerald-100",
  },
  warning: {
    card: "bg-amber-50 ring-amber-200/60 dark:bg-amber-950/20 dark:ring-amber-800/40",
    icon: "bg-amber-500 text-white",
    value: "text-amber-900 dark:text-amber-100",
  },
  danger: {
    card: "bg-red-50 ring-red-200/60 dark:bg-red-950/20 dark:ring-red-800/40",
    icon: "bg-red-500 text-white",
    value: "text-red-900 dark:text-red-100",
  },
  info: {
    card: "bg-blue-50 ring-blue-200/60 dark:bg-blue-950/20 dark:ring-blue-800/40",
    icon: "bg-blue-500 text-white",
    value: "text-blue-900 dark:text-blue-100",
  },
};

export function StatCard({
  icon,
  label,
  value,
  sublabel,
  trend,
  variant = "default",
  className,
  href,
  onClick,
}: StatCardProps) {
  const styles = statVariantStyles[variant];
  const Wrapper = href ? "a" : onClick ? "button" : "div";

  return (
    <Wrapper
      href={href}
      onClick={onClick}
      className={clsx(
        "group flex flex-col rounded-xl p-4 ring-1 ring-inset transition-all sm:p-5",
        styles.card,
        (href || onClick) && "cursor-pointer hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div
            className={clsx(
              "flex size-10 items-center justify-center rounded-lg sm:size-11",
              styles.icon
            )}
          >
            {icon}
          </div>
        )}
        {trend && (
          <div
            className={clsx(
              "flex items-center gap-0.5 text-xs font-medium",
              trend.direction === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            <svg
              className={clsx("size-3.5", trend.direction === "down" && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className={clsx("mt-4 text-2xl font-semibold tracking-tight sm:text-3xl", styles.value)}>
        {value}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
        {sublabel && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{sublabel}</span>
        )}
      </div>
    </Wrapper>
  );
}

// =============================================================================
// MINI STAT
// =============================================================================

export interface MiniStatProps {
  icon?: React.ReactNode;
  iconColor?: "lime" | "amber" | "blue" | "zinc" | "emerald" | "red";
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
}

const miniIconColors = {
  lime: "text-lime-500",
  amber: "text-amber-500",
  blue: "text-blue-500",
  zinc: "text-zinc-400",
  emerald: "text-emerald-500",
  red: "text-red-500",
};

export function MiniStat({ icon, iconColor = "zinc", label, value, sublabel, className }: MiniStatProps) {
  return (
    <div
      className={clsx(
        "rounded-xl bg-white p-4 ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <span className={clsx("size-4", miniIconColors[iconColor])}>{icon}</span>}
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{value}</div>
      {sublabel && (
        <Text className="mt-1 text-xs text-zinc-500">{sublabel}</Text>
      )}
    </div>
  );
}
