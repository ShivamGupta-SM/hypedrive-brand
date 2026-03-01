/**
 * Hypedrive Shopper Theme Configuration
 *
 * This file defines the color palette and provides utility functions
 * for consistent color usage across the application.
 *
 * Color Philosophy:
 * - Emerald: Primary brand color, used for earnings, cashback, positive states
 * - Amber: Warning, pending actions, bonus highlights
 * - Sky: Info, under review, processing states
 * - Red: Error, rejected, failed states
 * - Zinc: Neutral colors for text, borders, backgrounds
 */

// =============================================================================
// STATUS COLORS
// Use these for enrollment/campaign status indicators
// =============================================================================

export type EnrollmentStatus =
	| "awaiting_submission"
	| "awaiting_review"
	| "changes_requested"
	| "approved"
	| "rejected"
	| "permanently_rejected"
	| "cancelled"
	| "withdrawn"
	| "expired";

export type StatusColorConfig = {
	/** Text color class */
	text: string;
	/** Background color class */
	bg: string;
	/** Icon fill color class (for Heroicons) */
	icon: string;
	/** Border color class */
	border: string;
};

/**
 * Status color mappings for consistent styling across the app.
 * Each status has predefined colors for light and dark mode.
 */
export const statusColors: Record<EnrollmentStatus, StatusColorConfig> = {
	// Warning states (amber) - action required
	awaiting_submission: {
		text: "text-amber-600 dark:text-amber-400",
		bg: "bg-amber-50 dark:bg-amber-950/30",
		icon: "text-amber-600 dark:text-amber-400",
		border: "border-amber-200 dark:border-amber-900/50",
	},
	changes_requested: {
		text: "text-amber-600 dark:text-amber-400",
		bg: "bg-amber-50 dark:bg-amber-950/30",
		icon: "text-amber-600 dark:text-amber-400",
		border: "border-amber-200 dark:border-amber-900/50",
	},

	// Info states (sky) - processing
	awaiting_review: {
		text: "text-sky-600 dark:text-sky-400",
		bg: "bg-sky-50 dark:bg-sky-950/30",
		icon: "text-sky-600 dark:text-sky-400",
		border: "border-sky-200 dark:border-sky-900/50",
	},

	// Success states (emerald) - completed successfully
	approved: {
		text: "text-emerald-600 dark:text-emerald-400",
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		icon: "text-emerald-600 dark:text-emerald-400",
		border: "border-emerald-200 dark:border-emerald-900/50",
	},

	// Error states (red) - rejected/failed
	rejected: {
		text: "text-red-600 dark:text-red-400",
		bg: "bg-red-50 dark:bg-red-950/30",
		icon: "text-red-600 dark:text-red-400",
		border: "border-red-200 dark:border-red-900/50",
	},
	permanently_rejected: {
		text: "text-red-600 dark:text-red-400",
		bg: "bg-red-50 dark:bg-red-950/30",
		icon: "text-red-600 dark:text-red-400",
		border: "border-red-200 dark:border-red-900/50",
	},

	// Neutral states (zinc) - inactive/cancelled
	cancelled: {
		text: "text-zinc-500 dark:text-zinc-400",
		bg: "bg-zinc-100 dark:bg-zinc-800/50",
		icon: "text-zinc-500 dark:text-zinc-400",
		border: "border-zinc-200 dark:border-zinc-700",
	},
	withdrawn: {
		text: "text-zinc-500 dark:text-zinc-400",
		bg: "bg-zinc-100 dark:bg-zinc-800/50",
		icon: "text-zinc-500 dark:text-zinc-400",
		border: "border-zinc-200 dark:border-zinc-700",
	},
	expired: {
		text: "text-zinc-400 dark:text-zinc-500",
		bg: "bg-zinc-100 dark:bg-zinc-800/50",
		icon: "text-zinc-400 dark:text-zinc-500",
		border: "border-zinc-200 dark:border-zinc-700",
	},
};

/**
 * Get status colors by status key
 */
export function getStatusColors(status: string): StatusColorConfig {
	return statusColors[status as EnrollmentStatus] || statusColors.awaiting_review;
}

// =============================================================================
// SEMANTIC COLORS
// Use these for general semantic meaning
// =============================================================================

export const semanticColors = {
	/** Success states: approved, completed, positive balance */
	success: {
		text: "text-emerald-600 dark:text-emerald-400",
		textStrong: "text-emerald-700 dark:text-emerald-300",
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		bgSolid: "bg-emerald-600 dark:bg-emerald-700",
		border: "border-emerald-200 dark:border-emerald-800",
		icon: "text-emerald-600 dark:text-emerald-400",
	},

	/** Warning states: pending, needs attention */
	warning: {
		text: "text-amber-600 dark:text-amber-400",
		textStrong: "text-amber-700 dark:text-amber-300",
		bg: "bg-amber-50 dark:bg-amber-950/30",
		bgSolid: "bg-amber-500 dark:bg-amber-600",
		border: "border-amber-200 dark:border-amber-800",
		icon: "text-amber-600 dark:text-amber-400",
	},

	/** Error states: rejected, failed */
	error: {
		text: "text-red-600 dark:text-red-400",
		textStrong: "text-red-700 dark:text-red-300",
		bg: "bg-red-50 dark:bg-red-950/30",
		bgSolid: "bg-red-600 dark:bg-red-700",
		border: "border-red-200 dark:border-red-800",
		icon: "text-red-600 dark:text-red-400",
	},

	/** Info states: under review, processing */
	info: {
		text: "text-sky-600 dark:text-sky-400",
		textStrong: "text-sky-700 dark:text-sky-300",
		bg: "bg-sky-50 dark:bg-sky-950/30",
		bgSolid: "bg-sky-500 dark:bg-sky-600",
		border: "border-sky-200 dark:border-sky-800",
		icon: "text-sky-600 dark:text-sky-400",
	},
} as const;

// =============================================================================
// MONEY/EARNINGS COLORS
// Use these for financial displays
// =============================================================================

export const moneyColors = {
	/** Positive amounts (earnings, cashback) */
	positive: {
		text: "text-emerald-600 dark:text-emerald-400",
		textLarge: "text-emerald-700 dark:text-emerald-300",
	},

	/** Negative amounts (deductions, refunds) */
	negative: {
		text: "text-red-600 dark:text-red-400",
		textLarge: "text-red-700 dark:text-red-300",
	},

	/** Pending amounts */
	pending: {
		text: "text-amber-600 dark:text-amber-400",
		textLarge: "text-amber-500 dark:text-amber-300",
	},

	/** Neutral amounts */
	neutral: {
		text: "text-zinc-900 dark:text-white",
		textLarge: "text-zinc-950 dark:text-white",
	},
} as const;

// =============================================================================
// TREND INDICATOR COLORS
// Use these for showing increase/decrease trends
// =============================================================================

export const trendColors = {
	/** Positive trend (increase) */
	up: {
		text: "text-emerald-700 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-950/50",
	},

	/** Negative trend (decrease) */
	down: {
		text: "text-red-700 dark:text-red-400",
		bg: "bg-red-100 dark:bg-red-950/50",
	},

	/** No change */
	neutral: {
		text: "text-zinc-500 dark:text-zinc-400",
		bg: "bg-zinc-100 dark:bg-zinc-800/50",
	},
} as const;

/**
 * Get trend colors based on numeric value
 */
export function getTrendColors(value: number) {
	if (value > 0) return trendColors.up;
	if (value < 0) return trendColors.down;
	return trendColors.neutral;
}

// =============================================================================
// SURFACE COLORS
// Use these for cards, backgrounds, and containers
// =============================================================================

export const surfaceColors = {
	/** Primary surface (main content area) */
	primary: "bg-white dark:bg-zinc-900",

	/** Secondary surface (sidebar, cards) */
	secondary: "bg-zinc-50 dark:bg-zinc-800/50",

	/** Tertiary surface (nested elements) */
	tertiary: "bg-zinc-100 dark:bg-zinc-800",

	/** Elevated surface (modals, dropdowns) */
	elevated: "bg-white dark:bg-zinc-800",

	/** Card surface with ring */
	card: "bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800",

	/** Interactive card (hover state) */
	cardInteractive:
		"bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700",
} as const;

// =============================================================================
// TEXT COLORS
// Use these for typography
// =============================================================================

export const textColors = {
	/** Primary text (headings, important content) */
	primary: "text-zinc-950 dark:text-white",

	/** Secondary text (descriptions, labels) */
	secondary: "text-zinc-500 dark:text-zinc-400",

	/** Tertiary text (timestamps, metadata) */
	tertiary: "text-zinc-400 dark:text-zinc-500",

	/** Disabled text */
	disabled: "text-zinc-300 dark:text-zinc-600",

	/** Inverted text (on dark backgrounds) */
	inverted: "text-white dark:text-zinc-950",

	/** Link text */
	link: "text-zinc-950 dark:text-white underline decoration-zinc-950/50 dark:decoration-white/50",
} as const;

// =============================================================================
// BORDER COLORS
// Use these for dividers and element borders
// =============================================================================

export const borderColors = {
	/** Light border (subtle dividers) */
	light: "border-zinc-950/5 dark:border-white/5",

	/** Default border (cards, inputs) */
	default: "border-zinc-950/10 dark:border-white/10",

	/** Medium border (hover states) */
	medium: "border-zinc-950/15 dark:border-white/15",

	/** Strong border (focus states) */
	strong: "border-zinc-950/20 dark:border-white/20",

	/** Divider line */
	divider: "divide-zinc-200 dark:divide-zinc-700",
} as const;

// =============================================================================
// BADGE COLORS
// Use these for status badges and labels
// =============================================================================

export const badgeColors = {
	/** Success badge (approved, completed) */
	success: "emerald" as const,

	/** Warning badge (pending, attention) */
	warning: "amber" as const,

	/** Error badge (rejected, failed) */
	error: "red" as const,

	/** Info badge (under review) */
	info: "sky" as const,

	/** Neutral badge (default) */
	neutral: "zinc" as const,
} as const;

/**
 * Map enrollment status to badge color
 */
export function getStatusBadgeColor(
	status: string
): (typeof badgeColors)[keyof typeof badgeColors] {
	const mapping: Record<string, (typeof badgeColors)[keyof typeof badgeColors]> = {
		awaiting_submission: badgeColors.warning,
		awaiting_review: badgeColors.info,
		changes_requested: badgeColors.warning,
		approved: badgeColors.success,
		rejected: badgeColors.error,
		cancelled: badgeColors.neutral,
	};
	return mapping[status] || badgeColors.neutral;
}

// =============================================================================
// BUTTON COLORS
// Recommended button colors for different actions
// =============================================================================

export const buttonColors = {
	/** Primary action (main CTA) */
	primary: "emerald" as const,

	/** Secondary action */
	secondary: "dark/zinc" as const,

	/** Destructive action */
	destructive: "red" as const,

	/** Success action */
	success: "emerald" as const,

	/** Warning action */
	warning: "amber" as const,
} as const;

// =============================================================================
// BALANCE CARD COLORS
// Colors for the main earnings/balance card
// =============================================================================

export const balanceCardColors = {
	/** Main balance card background */
	bg: "bg-emerald-600 dark:bg-emerald-700",

	/** Available balance text */
	amount: "text-white",

	/** Label text */
	label: "text-emerald-100",

	/** Secondary stat text */
	stat: "text-emerald-200",

	/** Pending amount highlight */
	pending: "text-amber-300",

	/** Divider */
	divider: "border-emerald-500/40",
} as const;
