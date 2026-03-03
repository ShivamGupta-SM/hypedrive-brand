/**
 * Design Tokens for Hypedrive Brand Admin Panel
 * Centralized design system utilities for consistent UI
 *
 * Color Philosophy (matching shopper app):
 * - Emerald: Primary brand color, used for revenue, earnings, positive states
 * - Amber: Warning, pending actions, bonus highlights
 * - Sky: Info, under review, processing states
 * - Red: Error, rejected, failed states
 * - Zinc: Neutral colors for text, borders, backgrounds
 */

import clsx from "clsx";

// =============================================================================
// TYPOGRAPHY SCALE
// =============================================================================

export const typography = {
	/** Display - Hero numbers (large stats, balance) */
	display: "text-3xl font-bold tracking-tight",

	/** Heading - Page titles */
	heading: "text-xl font-semibold text-zinc-900 dark:text-white",

	/** Subheading - Section headers */
	subheading: "text-sm font-semibold text-zinc-900 dark:text-white",

	/** Body - Primary content */
	body: "text-sm text-zinc-600 dark:text-zinc-400",

	/** Body Small - Secondary content */
	bodySmall: "text-sm text-zinc-500 dark:text-zinc-400",

	/** Caption - Labels, metadata */
	caption: "text-xs text-zinc-500 dark:text-zinc-400",

	/** Caption Strong - Important labels */
	captionStrong: "text-xs font-medium text-zinc-500 dark:text-zinc-400",

	/** Micro - Badges, tiny text */
	micro: "text-[11px] font-medium",

	/** Uppercase Label - Settings style headers */
	uppercaseLabel: "text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400",

	/** Page title - larger variant */
	pageTitle: "text-2xl/8 font-semibold text-zinc-900 dark:text-white",

	/** Section title */
	sectionTitle: "text-base/7 font-semibold text-zinc-900 dark:text-white",

	/** Card title */
	cardTitle: "text-sm font-semibold text-zinc-900 dark:text-white",

	/** Large stat value */
	statLarge: "text-2xl font-semibold text-zinc-900 dark:text-white sm:text-3xl",

	/** Medium stat value */
	statMedium: "text-lg font-semibold text-zinc-900 dark:text-white",

	/** Link */
	link: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
} as const;

// =============================================================================
// SPACING SCALE
// =============================================================================

export const spacing = {
	/** Page section vertical spacing */
	pageSections: "space-y-6",

	/** Card padding */
	cardPadding: "p-4",

	/** Card internal gap */
	cardGap: "gap-3",

	/** Grid gap mobile */
	gridGapMobile: "gap-3",

	/** Grid gap desktop */
	gridGapDesktop: "sm:gap-4",

	/** List item padding */
	listItemPadding: "px-4 py-3",

	/** Page gutter */
	pageGutter: "px-4 sm:px-6 lg:px-8",

	/** Page padding Y */
	pagePaddingY: "py-6 lg:py-8",

	/** Page section margin */
	pageSection: "mt-8",

	/** Card sm padding */
	cardSm: "p-3",

	/** Card md padding */
	cardMd: "p-4",

	/** Card lg padding */
	cardLg: "p-6",

	/** Section gap */
	sectionGap: "gap-6",

	/** Inline gap */
	inlineGap: "gap-2",

	/** Tight gap */
	tightGap: "gap-1.5",

	/** Form gap */
	formGap: "space-y-6",

	/** Field gap */
	fieldGap: "space-y-4",
} as const;

// =============================================================================
// CARD STYLES (Shopper Pattern)
// =============================================================================

export const cardStyles = {
	/** Standard card with subtle border */
	default: "rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",

	/** Elevated card with shadow */
	elevated: "rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",

	/** Interactive card with hover state */
	interactive:
		"rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all",

	/** Hero card (Balance card style) */
	hero: "rounded-2xl bg-emerald-600 p-5 dark:bg-emerald-700",

	/** Alert card base */
	alert: "rounded-xl border p-4",
} as const;

// =============================================================================
// ICON SIZES
// =============================================================================

export const iconSizes = {
	/** Inline with caption text */
	xs: "size-3",

	/** Chevrons, tiny indicators */
	sm: "size-3.5",

	/** Standard icons in buttons, menu items */
	md: "size-4",

	/** Icons in list items, cards */
	lg: "size-5",

	/** Tab bar icons, primary nav */
	xl: "size-6",

	/** Empty state icons */
	"2xl": "size-8",

	/** Hero empty states */
	"3xl": "size-10",
} as const;

// =============================================================================
// GRID PATTERNS
// =============================================================================

export const gridPatterns = {
	/** 2 column mobile, 3 column desktop, 4 column xl */
	campaignGrid: "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4",

	/** 1 column mobile, 2 column desktop */
	enrollmentGrid: "grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2",

	/** 3 column stat cards */
	statGrid: "grid grid-cols-3 gap-2",

	/** 4 column stat cards */
	statGridWide: "grid grid-cols-4 gap-2",

	/** Standard 4-column responsive grid */
	standardGrid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
} as const;

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
		refunded: "zinc",
		hold: "sky",
		review: "sky",
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
// INTERACTIVE STATES
// =============================================================================

export const interactive = {
	// Clickable row (table, list)
	clickableRow: "cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50",

	// Focus ring
	focusRing:
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",

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

	// Sky
	sky: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",

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
	if (Number.isNaN(num)) return "₹0";

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
export function formatDate(dateStr?: string, options?: Intl.DateTimeFormatOptions): string {
	if (!dateStr) return "—";
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
export function formatDateTime(dateStr?: string): string {
	if (!dateStr) return "—";
	return new Date(dateStr).toLocaleString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/**
 * Format compact date (e.g., "Mar 2") — no year, for cards and lists
 */
export function formatDateCompact(dateStr?: string): string {
	if (!dateStr) return "—";
	return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

/**
 * Format price from decimal string (e.g., "1500.00" → "₹1,500")
 * Returns null if value is missing or zero
 */
export function formatPrice(priceDecimal?: string): string | null {
	if (!priceDecimal) return null;
	const num = parseFloat(priceDecimal);
	if (Number.isNaN(num) || num === 0) return null;
	return formatCurrency(num);
}

/**
 * Get initials from a name (up to 2 characters)
 */
export function getInitials(name: string): string {
	return name
		.split(" ")
		.map((word) => word[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
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
