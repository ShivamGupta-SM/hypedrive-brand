/**
 * Page Header Components
 * Unified page-level layout system: headers, sections, cards, grids,
 * info panels, and skeletons.
 *
 * This file is the single source for page-level layout primitives.
 * Stat grids live in shared/financial-stats-grid.tsx.
 */

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { type ReactNode, useId } from "react";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { Heading, Subheading } from "@/components/heading";
import { Text } from "@/components/text";

// =============================================================================
// PAGE HEADER
// =============================================================================

export interface PageHeaderProps {
	title: string;
	description?: string;
	badge?: ReactNode;
	actions?: ReactNode;
	/** @deprecated Back buttons removed — breadcrumbs handle navigation */
	backHref?: string;
	/** @deprecated Back buttons removed — breadcrumbs handle navigation */
	backLabel?: string;
	className?: string;
	children?: ReactNode;
}

export function PageHeader({
	title,
	description,
	badge,
	actions,
	className,
	children,
}: PageHeaderProps) {
	return (
		<div className={className}>
			{/* Main Header */}
			<div className="flex items-start justify-between gap-2 sm:gap-4">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
						<Heading>{title}</Heading>
						{badge}
					</div>
					{description && <Text className="mt-1 text-zinc-500 dark:text-zinc-400">{description}</Text>}
					{children}
				</div>

				{actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">{actions}</div>}
			</div>
		</div>
	);
}

// =============================================================================
// DETAIL PAGE HEADER
// =============================================================================

export interface DetailPageHeaderProps {
	/** @deprecated Back buttons removed — breadcrumbs handle navigation */
	backHref?: string;
	/** @deprecated Back buttons removed — breadcrumbs handle navigation */
	backLabel?: string;
	icon: ReactNode;
	iconClassName?: string;
	title: string;
	subtitle?: ReactNode;
	badges?: ReactNode;
	actions?: ReactNode;
	className?: string;
	/** Gradient class for a subtle top gradient overlay (e.g. "from-emerald-500/20 via-emerald-500/5 to-transparent") */
	gradientClass?: string;
}

export function DetailPageHeader({
	icon,
	iconClassName,
	title,
	subtitle,
	badges,
	actions,
	className,
	gradientClass,
}: DetailPageHeaderProps) {
	return (
		<div className={clsx("relative", className)}>
			{gradientClass && (
				<div className={clsx("pointer-events-none absolute inset-px top-px h-24 rounded-t-[11px] bg-linear-to-b sm:h-32", gradientClass)} />
			)}
			{/* Main header row */}
			<div className="relative flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<div className={clsx("flex size-20 shrink-0 items-center justify-center rounded-2xl", iconClassName)}>
						{icon}
					</div>
					<div>
						<Heading>{title}</Heading>
						{subtitle && <Text className="mt-1">{subtitle}</Text>}
						{badges && <div className="mt-2 flex flex-wrap items-center gap-2">{badges}</div>}
					</div>
				</div>
				{actions && <div className="hidden items-center gap-2 sm:flex">{actions}</div>}
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
	return <div className={clsx(spacingStyles[spacing], className)}>{children}</div>;
}

// =============================================================================
// PAGE SECTION (upgraded with section.tsx capabilities)
// =============================================================================

export interface PageSectionProps {
	title?: string;
	description?: string;
	icon?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	variant?: "default" | "card";
	iconVariant?: "default" | "success" | "warning" | "danger" | "info";
	size?: "sm" | "md" | "lg";
	divided?: boolean;
	columns?: 1 | 2;
}

const iconVariantStyles = {
	default: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
	success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
	warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
	danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
	info: "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400",
};

export function PageSection({
	title,
	description,
	icon,
	actions,
	children,
	className,
	variant = "default",
	iconVariant = "default",
	size = "md",
	divided = false,
	columns = 1,
}: PageSectionProps) {
	const TitleComponent = size === "lg" ? Heading : size === "sm" ? "h3" : Subheading;

	const content = (
		<>
			{(title || actions) && (
				<div className="mb-4 flex items-start justify-between gap-4">
					<div className="flex items-start gap-3">
						{icon && (
							<div
								className={clsx(
									"flex size-10 shrink-0 items-center justify-center rounded-lg",
									iconVariantStyles[iconVariant]
								)}
							>
								{icon}
							</div>
						)}
						<div>
							{title &&
								(TitleComponent === "h3" ? (
									<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
								) : (
									<TitleComponent>{title}</TitleComponent>
								))}
							{description && <Text className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</Text>}
						</div>
					</div>
					{actions && <div className="shrink-0">{actions}</div>}
				</div>
			)}
			<div className={clsx(columns === 2 && "grid grid-cols-1 gap-6 sm:grid-cols-2")}>{children}</div>
			{divided && <Divider className="mt-8" />}
		</>
	);

	if (variant === "card") {
		return (
			<section
				className={clsx(
					"rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:p-6",
					className
				)}
			>
				{content}
			</section>
		);
	}

	return <section className={clsx("relative", className)}>{content}</section>;
}

// =============================================================================
// SECTION GROUP
// =============================================================================

export interface SectionGroupProps {
	children: ReactNode;
	className?: string;
	spacing?: "sm" | "md" | "lg";
}

const groupSpacing = {
	sm: "space-y-6",
	md: "space-y-8",
	lg: "space-y-10",
};

export function SectionGroup({ children, className, spacing = "md" }: SectionGroupProps) {
	return <div className={clsx(groupSpacing[spacing], className)}>{children}</div>;
}

// =============================================================================
// FORM SECTION (absorbed from section.tsx)
// =============================================================================

export interface FormSectionProps {
	children: ReactNode;
	className?: string;
	icon?: ReactNode;
	title: string;
	description?: string;
}

export function FormSection({ children, className, icon, title, description }: FormSectionProps) {
	return (
		<div
			className={clsx(
				"rounded-xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
				className
			)}
		>
			<div className="flex items-start gap-3 border-b border-zinc-200 pb-4 dark:border-zinc-700">
				{icon && (
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
						{icon}
					</div>
				)}
				<div>
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
					{description && <Text className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</Text>}
				</div>
			</div>
			<div className="mt-6 space-y-6">{children}</div>
		</div>
	);
}

// =============================================================================
// DETAIL SECTION (absorbed from section.tsx)
// =============================================================================

export interface DetailSectionProps {
	children: ReactNode;
	className?: string;
	title?: string;
	description?: string;
	action?: ReactNode;
	variant?: "default" | "card";
}

export function DetailSection({
	children,
	className,
	title,
	description,
	action,
	variant = "default",
}: DetailSectionProps) {
	const content = (
		<>
			{(title || description || action) && (
				<div className="mb-4 flex items-start justify-between gap-4">
					<div>
						{title && <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>}
						{description && <Text className="mt-0.5 text-xs text-zinc-500">{description}</Text>}
					</div>
					{action && <div className="shrink-0">{action}</div>}
				</div>
			)}
			{children}
		</>
	);

	if (variant === "card") {
		return (
			<div
				className={clsx(
					"rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:p-5",
					className
				)}
			>
				{content}
			</div>
		);
	}

	return <div className={className}>{content}</div>;
}

// =============================================================================
// DETAIL LIST + DETAIL ITEM (absorbed from section.tsx)
// =============================================================================

export interface DetailListProps {
	children: ReactNode;
	className?: string;
	columns?: 1 | 2 | 3;
}

const detailColumns = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export function DetailList({ children, className, columns = 2 }: DetailListProps) {
	return <dl className={clsx("grid gap-4", detailColumns[columns], className)}>{children}</dl>;
}

export interface DetailItemProps {
	label: string;
	value?: ReactNode;
	children?: ReactNode;
	className?: string;
	span?: 1 | 2 | 3 | "full";
	copyable?: boolean;
	onCopy?: () => void;
}

const detailSpan: Record<string, string> = {
	1: "col-span-1",
	2: "sm:col-span-2",
	3: "lg:col-span-3",
	full: "col-span-full",
};

export function DetailItem({ label, value, children, className, span = 1, copyable, onCopy }: DetailItemProps) {
	const content = children ?? value;

	return (
		<div className={clsx(detailSpan[span], className)}>
			<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
			<dd className="mt-1 flex items-center gap-2">
				<span className="text-sm text-zinc-900 dark:text-white">{content ?? "—"}</span>
				{copyable && content && (
					<button
						type="button"
						onClick={onCopy}
						className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
						title="Copy"
					>
						<svg
							className="size-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
					</button>
				)}
			</dd>
		</div>
	);
}

// =============================================================================
// CONTENT CARD (upgraded with card.tsx capabilities)
// =============================================================================

export interface ContentCardProps {
	children: ReactNode;
	className?: string;
	padding?: "none" | "sm" | "md" | "lg";
	variant?: "default" | "bordered" | "elevated" | "subtle" | "interactive" | "hero";
	hover?: boolean;
	onClick?: () => void;
	as?: "div" | "article" | "section";
	/** Structured mode props (optional — use children for full custom content) */
	title?: string;
	description?: string;
	icon?: ReactNode;
	actions?: ReactNode;
}

/** @deprecated Use ContentCard instead */
export const Card = ContentCard;

const cardPaddingStyles = {
	none: "",
	sm: "p-3",
	md: "p-4",
	lg: "p-6",
};

const cardVariantStyles = {
	default: "bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
	bordered: "bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
	elevated: "bg-white shadow-md ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
	subtle: "bg-zinc-50 ring-1 ring-zinc-200/80 dark:bg-zinc-800/50 dark:ring-zinc-800",
	interactive:
		"bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all cursor-pointer",
	hero: "bg-emerald-600 dark:bg-emerald-700",
};

export function ContentCard({
	children,
	className,
	padding = "md",
	variant = "default",
	hover = false,
	onClick,
	as: Component = "div",
	title,
	description,
	icon,
	actions,
}: ContentCardProps) {
	const cardClasses = clsx(
		"min-w-0 overflow-hidden text-left w-full",
		variant === "hero" ? "rounded-2xl" : "rounded-xl",
		cardVariantStyles[variant],
		cardPaddingStyles[padding],
		hover && "transition-all hover:shadow-md hover:ring-zinc-300 dark:hover:ring-zinc-700",
		onClick && "cursor-pointer",
		className
	);

	const cardContent = (
		<>
			{(title || actions || icon) && (
				<div className="mb-4 flex items-start justify-between gap-4">
					<div className="flex items-start gap-3 min-w-0">
						{icon && (
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
								{icon}
							</div>
						)}
						<div className="min-w-0">
							{title && <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>}
							{description && <Text className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</Text>}
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

	return <Component className={cardClasses}>{cardContent}</Component>;
}

// =============================================================================
// CARD HEADER
// =============================================================================

export interface CardHeaderProps {
	children?: ReactNode;
	title?: string;
	description?: string;
	icon?: ReactNode;
	action?: ReactNode;
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
		return <div className={clsx("flex items-start justify-between gap-4", className)}>{children}</div>;
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
					{title &&
						(size === "lg" ? (
							<Heading className={titleClassName}>{title}</Heading>
						) : size === "md" ? (
							<Subheading className={titleClassName}>{title}</Subheading>
						) : (
							<h4 className={clsx("text-sm font-semibold text-zinc-900 dark:text-white", titleClassName)}>{title}</h4>
						))}
					{description && <Text className="mt-1 text-sm text-zinc-500">{description}</Text>}
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
	children: ReactNode;
	className?: string;
	noPadding?: boolean;
}

export function CardBody({ children, className, noPadding }: CardBodyProps) {
	return <div className={clsx(!noPadding && "mt-4", className)}>{children}</div>;
}

// =============================================================================
// CARD FOOTER
// =============================================================================

export interface CardFooterProps {
	children: ReactNode;
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
	return <div className={clsx("my-4 border-t border-zinc-200 dark:border-zinc-700", className)} />;
}

// =============================================================================
// CARD GRID
// =============================================================================

export interface CardGridProps {
	children: ReactNode;
	columns?: 1 | 2 | 3 | 4;
	gap?: "sm" | "md" | "lg";
	className?: string;
}

const cardGridColumnStyles = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const cardGridGapStyles = {
	sm: "gap-3",
	md: "gap-4",
	lg: "gap-6",
};

export function CardGrid({ children, columns = 3, gap = "md", className }: CardGridProps) {
	return (
		<div className={clsx("grid", cardGridColumnStyles[columns], cardGridGapStyles[gap], className)}>{children}</div>
	);
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

const contentGridColumnClasses = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	12: "grid-cols-12",
};

const contentGridGapClasses = {
	sm: "gap-3",
	md: "gap-4",
	lg: "gap-6",
};

export function ContentGrid({ children, columns = 4, gap = "md", className }: ContentGridProps) {
	return (
		<div className={clsx("grid", contentGridColumnClasses[columns], contentGridGapClasses[gap], className)}>
			{children}
		</div>
	);
}

// =============================================================================
// GRID ITEM (upgraded with responsive spans)
// =============================================================================

type SpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";

export interface GridItemProps {
	children: ReactNode;
	span?: SpanValue;
	spanSm?: SpanValue;
	spanLg?: SpanValue;
	className?: string;
}

const spanStyles: Record<string, string> = {
	1: "col-span-1",
	2: "col-span-2",
	3: "col-span-3",
	4: "col-span-4",
	5: "col-span-5",
	6: "col-span-6",
	7: "col-span-7",
	8: "col-span-8",
	9: "col-span-9",
	10: "col-span-10",
	11: "col-span-11",
	12: "col-span-12",
	full: "col-span-full",
};

const spanSmStyles: Record<string, string> = {
	1: "sm:col-span-1",
	2: "sm:col-span-2",
	3: "sm:col-span-3",
	4: "sm:col-span-4",
	5: "sm:col-span-5",
	6: "sm:col-span-6",
	7: "sm:col-span-7",
	8: "sm:col-span-8",
	9: "sm:col-span-9",
	10: "sm:col-span-10",
	11: "sm:col-span-11",
	12: "sm:col-span-12",
	full: "sm:col-span-full",
};

const spanLgStyles: Record<string, string> = {
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
	full: "lg:col-span-full",
};

export function GridItem({ children, span = "full", spanSm, spanLg, className }: GridItemProps) {
	return (
		<div className={clsx(spanStyles[span], spanSm && spanSmStyles[spanSm], spanLg && spanLgStyles[spanLg], className)}>
			{children}
		</div>
	);
}

// =============================================================================
// TWO COLUMN LAYOUT (absorbed from page-container.tsx)
// =============================================================================

export interface TwoColumnLayoutProps {
	children: ReactNode;
	className?: string;
	split?: "1/2" | "1/3" | "2/3" | "7/5" | "5/7";
	gap?: "sm" | "md" | "lg";
	stackOnMobile?: boolean;
}

const splitStyles = {
	"1/2": "lg:grid-cols-2",
	"1/3": "lg:grid-cols-[1fr_2fr]",
	"2/3": "lg:grid-cols-[2fr_1fr]",
	"7/5": "lg:grid-cols-[7fr_5fr]",
	"5/7": "lg:grid-cols-[5fr_7fr]",
};

export function TwoColumnLayout({
	children,
	className,
	split = "7/5",
	gap = "lg",
	stackOnMobile = true,
}: TwoColumnLayoutProps) {
	return (
		<div
			className={clsx(
				"grid",
				stackOnMobile ? "grid-cols-1" : "grid-cols-2",
				splitStyles[split],
				contentGridGapClasses[gap],
				className
			)}
		>
			{children}
		</div>
	);
}

// =============================================================================
// ALERT BANNER (upgraded with info-panel.tsx capabilities)
// =============================================================================

export interface AlertBannerProps {
	variant: "info" | "warning" | "error" | "success" | "danger";
	size?: "sm" | "md";
	title?: string;
	description?: string;
	children?: ReactNode;
	actions?: ReactNode;
	action?: {
		label: string;
		onClick?: () => void;
		href?: string;
	};
	icon?: ReactNode;
	onDismiss?: () => void;
	className?: string;
}

const alertVariants = {
	info: {
		bg: "bg-blue-50 dark:bg-blue-950/30",
		ring: "ring-blue-200/60 dark:ring-blue-800/40",
		iconBg: "bg-blue-500 dark:bg-blue-600",
		title: "text-blue-800 dark:text-blue-200",
		text: "text-blue-700 dark:text-blue-300",
		button: "blue" as const,
	},
	warning: {
		bg: "bg-amber-50 dark:bg-amber-950/30",
		ring: "ring-amber-200/60 dark:ring-amber-800/40",
		iconBg: "bg-amber-500 dark:bg-amber-600",
		title: "text-amber-800 dark:text-amber-200",
		text: "text-amber-700 dark:text-amber-300",
		button: "amber" as const,
	},
	error: {
		bg: "bg-red-50 dark:bg-red-950/30",
		ring: "ring-red-200/60 dark:ring-red-800/40",
		iconBg: "bg-red-500 dark:bg-red-600",
		title: "text-red-800 dark:text-red-200",
		text: "text-red-700 dark:text-red-300",
		button: "red" as const,
	},
	danger: {
		bg: "bg-red-50 dark:bg-red-950/30",
		ring: "ring-red-200/60 dark:ring-red-800/40",
		iconBg: "bg-red-500 dark:bg-red-600",
		title: "text-red-800 dark:text-red-200",
		text: "text-red-700 dark:text-red-300",
		button: "red" as const,
	},
	success: {
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		ring: "ring-emerald-200/60 dark:ring-emerald-800/40",
		iconBg: "bg-emerald-500 dark:bg-emerald-600",
		title: "text-emerald-800 dark:text-emerald-200",
		text: "text-emerald-700 dark:text-emerald-300",
		button: "green" as const,
	},
};

const alertDefaultIcons = {
	info: InformationCircleIcon,
	warning: ExclamationTriangleIcon,
	error: XCircleIcon,
	danger: XCircleIcon,
	success: CheckCircleIcon,
};

export function AlertBanner({
	variant,
	size = "md",
	title,
	description,
	children,
	actions,
	action,
	icon,
	onDismiss,
	className,
}: AlertBannerProps) {
	const styles = alertVariants[variant];
	const DefaultIcon = alertDefaultIcons[variant];
	const sm = size === "sm";

	const hasActions = actions || action;

	return (
		<div
			className={clsx(
				"flex items-center rounded-xl shadow-sm ring-1",
				sm ? "gap-2.5 p-2.5 sm:p-3" : "gap-3 p-3.5 sm:p-4",
				styles.bg,
				styles.ring,
				className
			)}
		>
			<div className={clsx(
				"flex shrink-0 items-center justify-center rounded-full text-white",
				sm ? "size-8" : "size-9 sm:size-10",
				styles.iconBg
			)}>
				{icon || <DefaultIcon className={sm ? "size-4" : "size-4.5 sm:size-5"} />}
			</div>
			<div className="min-w-0 flex-1">
				{title && <p className={clsx("font-medium", sm ? "text-sm" : "text-sm sm:text-base", styles.title)}>{title}</p>}
				{description && <p className={clsx("mt-0.5", sm ? "text-xs" : "text-xs sm:text-sm", styles.text)}>{description}</p>}
				{children && <div className={clsx(sm ? "text-xs" : "text-xs sm:text-sm", title && "mt-1", styles.text)}>{children}</div>}
			</div>
			{hasActions && (
				<div className="flex shrink-0 items-center gap-2">
					{actions}
					{action && (
						<Button color={styles.button} onClick={action.onClick} href={action.href} className={clsx("shrink-0", sm && "text-xs!")}>
							{action.label}
						</Button>
					)}
				</div>
			)}
			{onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-700 sm:p-2 dark:hover:bg-white/10 dark:hover:text-zinc-300"
					aria-label="Dismiss"
				>
					<XCircleIcon className={sm ? "size-4" : "size-4 sm:size-5"} />
				</button>
			)}
		</div>
	);
}

// =============================================================================
// INFO PANEL (absorbed from info-panel.tsx)
// =============================================================================

export type InfoPanelVariant = "info" | "warning" | "success" | "error" | "neutral";

export interface InfoPanelProps {
	children: ReactNode;
	className?: string;
	variant?: InfoPanelVariant;
	title?: string;
	icon?: ReactNode;
	showIcon?: boolean;
	action?: {
		label: string;
		onClick?: () => void;
		href?: string;
	};
	onDismiss?: () => void;
}

const infoPanelStyles = {
	info: {
		container: "bg-blue-50 dark:bg-blue-950/30",
		border: "border-blue-200 dark:border-blue-800/50",
		icon: "text-blue-600 dark:text-blue-400",
		title: "text-blue-800 dark:text-blue-200",
		content: "text-blue-700 dark:text-blue-300",
		button: "blue" as const,
	},
	warning: {
		container: "bg-amber-50 dark:bg-amber-950/30",
		border: "border-amber-200 dark:border-amber-800/50",
		icon: "text-amber-600 dark:text-amber-400",
		title: "text-amber-800 dark:text-amber-200",
		content: "text-amber-700 dark:text-amber-300",
		button: "amber" as const,
	},
	success: {
		container: "bg-emerald-50 dark:bg-emerald-950/30",
		border: "border-emerald-200 dark:border-emerald-800/50",
		icon: "text-emerald-600 dark:text-emerald-400",
		title: "text-emerald-800 dark:text-emerald-200",
		content: "text-emerald-700 dark:text-emerald-300",
		button: "green" as const,
	},
	error: {
		container: "bg-red-50 dark:bg-red-950/30",
		border: "border-red-200 dark:border-red-800/50",
		icon: "text-red-600 dark:text-red-400",
		title: "text-red-800 dark:text-red-200",
		content: "text-red-700 dark:text-red-300",
		button: "red" as const,
	},
	neutral: {
		container: "bg-zinc-50 dark:bg-zinc-800/50",
		border: "border-zinc-200 dark:border-zinc-700",
		icon: "text-zinc-600 dark:text-zinc-400",
		title: "text-zinc-800 dark:text-zinc-200",
		content: "text-zinc-700 dark:text-zinc-300",
		button: "zinc" as const,
	},
};

const infoPanelDefaultIcons = {
	info: InformationCircleIcon,
	warning: ExclamationTriangleIcon,
	success: CheckCircleIcon,
	error: XCircleIcon,
	neutral: InformationCircleIcon,
};

export function InfoPanel({
	children,
	className,
	variant = "info",
	title,
	icon,
	showIcon = true,
	action,
	onDismiss,
}: InfoPanelProps) {
	const styles = infoPanelStyles[variant];
	const DefaultIcon = infoPanelDefaultIcons[variant];

	return (
		<div className={clsx("rounded-lg border p-3.5 sm:p-4", styles.container, styles.border, className)}>
			<div className="flex gap-2.5 sm:gap-3">
				{showIcon && <div className="shrink-0 mt-0.5 sm:mt-0">{icon || <DefaultIcon className={clsx("size-4 sm:size-5", styles.icon)} />}</div>}
				<div className="min-w-0 flex-1">
					{title && <h4 className={clsx("text-sm font-medium sm:text-base", styles.title)}>{title}</h4>}
					<div className={clsx("text-xs sm:text-sm", title && "mt-1", styles.content)}>{children}</div>
					{action && (
						<div className="mt-2.5 sm:mt-3">
							<Button color={styles.button} onClick={action.onClick} href={action.href} className="text-xs sm:text-sm">
								{action.label}
							</Button>
						</div>
					)}
				</div>
				{onDismiss && (
					<button
						type="button"
						onClick={onDismiss}
						className={clsx(
							"shrink-0 rounded p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10",
							styles.icon
						)}
					>
						<XCircleIcon className="size-4 sm:size-5" />
					</button>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// TIP BOX (absorbed from info-panel.tsx)
// =============================================================================

export interface TipBoxProps {
	children: ReactNode;
	className?: string;
	title?: string;
}

export function TipBox({ children, className, title = "Tip" }: TipBoxProps) {
	return (
		<div
			className={clsx(
				"rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800/50 dark:bg-blue-950/20",
				className
			)}
		>
			<div className="flex gap-3">
				<div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
					<svg
						className="size-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2.5}
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
						/>
					</svg>
				</div>
				<div>
					<h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">{title}</h4>
					<div className="mt-1 text-sm text-blue-700 dark:text-blue-300">{children}</div>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// EMPTY MESSAGE (absorbed from info-panel.tsx)
// =============================================================================

export interface EmptyMessageProps {
	children?: ReactNode;
	className?: string;
	message?: string;
	icon?: ReactNode;
}

export function EmptyMessage({ children, className, message = "No data available", icon }: EmptyMessageProps) {
	return (
		<div className={clsx("flex flex-col items-center justify-center py-8 text-center", className)}>
			{icon && <div className="mb-3 text-zinc-400 dark:text-zinc-500">{icon}</div>}
			<p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
			{children}
		</div>
	);
}

// =============================================================================
// ACTION LINK (absorbed from info-panel.tsx)
// =============================================================================

export interface ActionLinkProps {
	href?: string;
	onClick?: () => void;
	title: string;
	description?: string;
	icon?: ReactNode;
	variant?: "default" | "warning" | "danger";
	className?: string;
}

const actionLinkStyles = {
	default: {
		container:
			"bg-white dark:bg-zinc-900 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700",
		icon: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
		title: "text-zinc-900 dark:text-white",
		description: "text-zinc-500 dark:text-zinc-400",
		chevron: "text-zinc-500 dark:text-zinc-400",
	},
	warning: {
		container:
			"bg-amber-50 dark:bg-amber-950/30 ring-amber-200 dark:ring-amber-800/50 hover:ring-amber-300 dark:hover:ring-amber-700",
		icon: "bg-amber-500 text-white shadow-sm dark:bg-amber-600",
		title: "text-amber-900 dark:text-amber-100",
		description: "text-amber-700 dark:text-amber-300",
		chevron: "text-amber-600 dark:text-amber-400",
	},
	danger: {
		container:
			"bg-red-50 dark:bg-red-950/30 ring-red-200 dark:ring-red-800/50 hover:ring-red-300 dark:hover:ring-red-700",
		icon: "bg-red-500 text-white shadow-sm dark:bg-red-600",
		title: "text-red-900 dark:text-red-100",
		description: "text-red-700 dark:text-red-300",
		chevron: "text-red-600 dark:text-red-400",
	},
};

export function ActionLink({
	href,
	onClick,
	title,
	description,
	icon,
	variant = "default",
	className,
}: ActionLinkProps) {
	const styles = actionLinkStyles[variant];
	const Component = href ? "a" : "button";

	return (
		<Component
			href={href}
			onClick={onClick}
			className={clsx("flex items-center gap-4 rounded-xl p-4 ring-1 transition-all", styles.container, className)}
		>
			{icon && (
				<div className={clsx("flex size-10 shrink-0 items-center justify-center rounded-full", styles.icon)}>
					{icon}
				</div>
			)}
			<div className="min-w-0 flex-1 text-left">
				<p className={clsx("font-medium", styles.title)}>{title}</p>
				{description && <p className={clsx("text-sm", styles.description)}>{description}</p>}
			</div>
			<ChevronRightIcon className={clsx("size-5 shrink-0", styles.chevron)} />
		</Component>
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
