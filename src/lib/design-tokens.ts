/**
 * Design Tokens for Hypedrive Brand Admin Panel
 * Centralized design system utilities for consistent UI
 */

import clsx from "clsx";

// =============================================================================
// STATUS COLORS
// =============================================================================

export type StatusType =
  | "active"
  | "approved"
  | "completed"
  | "pending"
  | "pending_approval"
  | "processing"
  | "draft"
  | "paused"
  | "ended"
  | "rejected"
  | "failed"
  | "cancelled"
  | "refunded"
  | "overdue"
  | "info"
  | "warning"
  | "error"
  | "success"
  | "neutral";

export type BadgeColor =
  | "lime"
  | "green"
  | "emerald"
  | "amber"
  | "yellow"
  | "orange"
  | "red"
  | "rose"
  | "pink"
  | "purple"
  | "violet"
  | "indigo"
  | "blue"
  | "sky"
  | "cyan"
  | "teal"
  | "zinc";

/**
 * Get consistent badge color for any status
 */
export function getStatusColor(status: string): BadgeColor {
  const normalized = status.toLowerCase().replace(/[_-]/g, "");

  const colorMap: Record<string, BadgeColor> = {
    // Success states
    active: "lime",
    approved: "green",
    completed: "emerald",
    success: "green",
    paid: "green",
    verified: "green",

    // Warning states
    pending: "amber",
    pendingapproval: "yellow",
    pendingpayment: "yellow",
    processing: "amber",
    inprogress: "amber",
    warning: "amber",

    // Error states
    rejected: "red",
    failed: "red",
    cancelled: "red",
    error: "red",
    overdue: "red",
    expired: "red",

    // Info states
    draft: "zinc",
    paused: "sky",
    ended: "blue",
    archived: "zinc",
    info: "blue",

    // Special states
    refunded: "purple",
    hold: "violet",
    review: "indigo",
  };

  return colorMap[normalized] || "zinc";
}

/**
 * Format status text for display (e.g., "pending_approval" -> "Pending Approval")
 */
export function formatStatus(status: string): string {
  return status
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// =============================================================================
// CONTAINER STYLES
// =============================================================================

export const containerStyles = {
  // Standard card with subtle ring
  card: "rounded-xl bg-white ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10",

  // Card with shadow for elevated appearance
  cardElevated: "rounded-xl bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10",

  // Bordered container (for form sections, etc.)
  bordered: "rounded-lg border border-zinc-200 dark:border-zinc-700",

  // Subtle background container
  subtle: "rounded-lg bg-zinc-50 dark:bg-zinc-800/50",

  // Dashed border (for empty states, drop zones)
  dashed: "rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/30",

  // Info boxes by variant
  infoBox: {
    neutral: "rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50",
    info: "rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30",
    success: "rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30",
    warning: "rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30",
    error: "rounded-lg bg-red-50 p-4 dark:bg-red-950/30",
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  // Page level
  pageGutter: "px-4 sm:px-6 lg:px-8",
  pagePaddingY: "py-6 lg:py-8",
  pageSection: "mt-8",

  // Card padding
  cardSm: "p-3",
  cardMd: "p-4",
  cardLg: "p-6",

  // Gaps
  sectionGap: "gap-6",
  cardGap: "gap-4",
  inlineGap: "gap-2",
  tightGap: "gap-1.5",

  // Form spacing
  formGap: "space-y-6",
  fieldGap: "space-y-4",
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Page title
  pageTitle: "text-2xl/8 font-semibold text-zinc-900 dark:text-white",

  // Section title
  sectionTitle: "text-base/7 font-semibold text-zinc-900 dark:text-white",

  // Card title
  cardTitle: "text-sm font-semibold text-zinc-900 dark:text-white",

  // Body text
  body: "text-base/6 text-zinc-500 dark:text-zinc-400 sm:text-sm/6",

  // Caption/label
  caption: "text-xs text-zinc-500 dark:text-zinc-400",

  // Large stat value
  statLarge: "text-2xl font-semibold text-zinc-900 dark:text-white sm:text-3xl",

  // Medium stat value
  statMedium: "text-lg font-semibold text-zinc-900 dark:text-white",

  // Link
  link: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
} as const;

// =============================================================================
// INTERACTIVE STATES
// =============================================================================

export const interactive = {
  // Clickable row (table, list)
  clickableRow: "cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",

  // Focus ring
  focusRing: "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",

  // Button-like hover
  buttonHover: "transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
} as const;

// =============================================================================
// ICON BACKGROUNDS
// =============================================================================

export const iconBg = {
  // Neutral
  neutral: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",

  // Success
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",

  // Warning
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",

  // Error
  error: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",

  // Info
  info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",

  // Purple
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",

  // Lime (active)
  lime: "bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400",
} as const;

// =============================================================================
// PROGRESS BAR COLORS
// =============================================================================

export function getProgressColor(percent: number): string {
  if (percent >= 90) return "bg-red-500";
  if (percent >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

export function getProgressTrack(): string {
  return "bg-zinc-200 dark:bg-zinc-700";
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Combine container style with custom classes
 */
export function card(variant: keyof typeof containerStyles = "card", className?: string): string {
  const style = containerStyles[variant];
  return clsx(typeof style === "string" ? style : "", className);
}

/**
 * Get info box style by variant
 */
export function infoBox(variant: keyof typeof containerStyles.infoBox = "neutral", className?: string): string {
  return clsx(containerStyles.infoBox[variant], className);
}

// =============================================================================
// FORMAT UTILITIES
// =============================================================================

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number | string, currency = "INR"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format number with locale
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * Format compact number (1K, 1M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2d ago", "3h ago")
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return formatDate(dateStr);
}

/**
 * Get current date formatted for display
 */
export function getCurrentDateFormatted(): string {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
