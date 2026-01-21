/**
 * Page Header Components
 * Consistent page headers, layouts, and skeletons
 */

import clsx from "clsx";
import { useId, type ReactNode } from "react";
import { Button } from "@/components/button";
import { Heading, Subheading } from "@/components/heading";
import { Text } from "@/components/text";
import { ArrowLeftIcon, ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { Link } from "@/components/link";
import { useNavigate } from "react-router";

// =============================================================================
// BREADCRUMBS
// =============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  homeHref?: string;
}

export function Breadcrumbs({
  items,
  className,
  showHome = true,
  homeHref = "/",
}: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: "Home", href: homeHref, icon: <HomeIcon className="size-4" /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={clsx("flex items-center gap-1.5 text-sm", className)}>
      {allItems.map((item, index) => (
        <span key={`${item.label}-${item.href || index}`} className="flex items-center gap-1.5">
          {index > 0 && (
            <ChevronRightIcon className="size-3.5 text-zinc-400" />
          )}
          {item.href && index < allItems.length - 1 ? (
            <Link
              href={item.href}
              className="flex items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-white">
              {item.icon}
              <span>{item.label}</span>
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// =============================================================================
// PAGE HEADER
// =============================================================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
  backButton?: {
    resource: string;
    label?: string;
    onClick?: () => void;
  };
  className?: string;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  showBreadcrumbs = false,
  backButton,
  className,
  size = "md",
  children,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const TitleComponent = size === "lg" ? Heading : size === "sm" ? Subheading : Heading;

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Back Button */}
      {backButton && (
        <Button
          plain
          onClick={backButton.onClick || (() => navigate(`/${backButton.resource}`))}
          className="-ml-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeftIcon className="size-4" />
          {backButton.label || `Back to ${backButton.resource}`}
        </Button>
      )}

      {/* Main Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <TitleComponent className="text-2xl/8!">{title}</TitleComponent>
            {badge}
          </div>
          {description && (
            <Text className="mt-1 max-w-2xl text-zinc-500 dark:text-zinc-400">
              {description}
            </Text>
          )}
          {/* Additional content slot */}
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// PAGE LAYOUT
// =============================================================================

export interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

const spacingStyles = {
  sm: "space-y-4",
  md: "space-y-6",
  lg: "space-y-8",
};

export function PageLayout({ children, className, spacing = "md" }: PageLayoutProps) {
  return (
    <div className={clsx(spacingStyles[spacing], className)}>
      {children}
    </div>
  );
}

// =============================================================================
// PAGE SECTION
// =============================================================================

export interface PageSectionProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: "default" | "card";
}

export function PageSection({
  title,
  description,
  icon,
  actions,
  children,
  className,
  variant = "default",
}: PageSectionProps) {
  const content = (
    <>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <Text className="mt-0.5 text-sm text-zinc-500">{description}</Text>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </>
  );

  if (variant === "card") {
    return (
      <section
        className={clsx(
          "rounded-xl bg-white p-4 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 sm:p-6",
          className
        )}
      >
        {content}
      </section>
    );
  }

  return <section className={clsx("space-y-4", className)}>{content}</section>;
}

// =============================================================================
// CONTENT GRID
// =============================================================================

export interface ContentGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 12;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  12: "grid-cols-1 lg:grid-cols-12",
};

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

export function ContentGrid({
  children,
  columns = 4,
  gap = "md",
  className,
}: ContentGridProps) {
  return (
    <div className={clsx("grid", columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// =============================================================================
// CONTENT CARD
// =============================================================================

export interface ContentCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  noPadding?: boolean;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function ContentCard({
  children,
  title,
  description,
  icon,
  actions,
  noPadding,
  className,
  hover,
  onClick,
}: ContentCardProps) {
  const cardClasses = clsx(
    "rounded-xl bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 text-left w-full",
    !noPadding && "p-4 sm:p-5",
    hover && "transition-all hover:shadow-md hover:ring-zinc-950/10 dark:hover:ring-white/20",
    onClick && "cursor-pointer",
    className
  );

  const cardContent = (
    <>
      {(title || actions || icon) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {title}
                </h3>
              )}
              {description && (
                <Text className="mt-0.5 text-sm text-zinc-500">{description}</Text>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cardClasses}>
        {cardContent}
      </button>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
}

// =============================================================================
// GRID ITEM
// =============================================================================

export interface GridItemProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
  className?: string;
}

const spanClasses: Record<string | number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
  full: "col-span-full",
};

export function GridItem({ children, span = 6, className }: GridItemProps) {
  return <div className={clsx(spanClasses[span], className)}>{children}</div>;
}

// =============================================================================
// ALERT BANNER
// =============================================================================

export interface AlertBannerProps {
  variant: "info" | "warning" | "error" | "success";
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const alertVariants = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800/50",
    icon: "bg-blue-500",
    title: "text-blue-800 dark:text-blue-200",
    text: "text-blue-700 dark:text-blue-300",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800/50",
    icon: "bg-amber-500",
    title: "text-amber-800 dark:text-amber-200",
    text: "text-amber-700 dark:text-amber-300",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800/50",
    icon: "bg-red-500",
    title: "text-red-800 dark:text-red-200",
    text: "text-red-700 dark:text-red-300",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800/50",
    icon: "bg-emerald-500",
    title: "text-emerald-800 dark:text-emerald-200",
    text: "text-emerald-700 dark:text-emerald-300",
  },
};

export function AlertBanner({
  variant,
  title,
  children,
  actions,
  icon,
  onDismiss,
  className,
}: AlertBannerProps) {
  const styles = alertVariants[variant];

  return (
    <div
      className={clsx(
        "flex items-start gap-4 rounded-xl border p-4",
        styles.bg,
        styles.border,
        className
      )}
    >
      {icon && (
        <div className={clsx("flex size-8 shrink-0 items-center justify-center rounded-full text-white", styles.icon)}>
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {title && (
          <h4 className={clsx("font-medium", styles.title)}>{title}</h4>
        )}
        <div className={clsx("text-sm", title && "mt-1", styles.text)}>{children}</div>
      </div>
      {(actions || onDismiss) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-300"
              aria-label="Dismiss"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
            <div
              key={key}
              className="h-28 rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800"
            />
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
    <div className="overflow-hidden rounded-xl ring-1 ring-zinc-950/5 dark:ring-white/10">
      <div className="bg-white dark:bg-zinc-900">
        {/* Header */}
        <div className="flex gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className="h-4 flex-1 rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-700"
            />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-zinc-200 px-4 py-4 last:border-0 dark:border-zinc-800"
          >
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="h-5 flex-1 rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800"
              />
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
        "rounded-xl bg-white p-4 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 sm:p-5",
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

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="size-11 rounded-lg bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
        <div className="h-4 w-12 rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
      </div>
      <div className="mt-4 h-8 w-24 rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
      <div className="mt-2 h-4 w-20 rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
    </div>
  );
}
