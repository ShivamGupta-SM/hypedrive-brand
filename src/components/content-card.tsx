/**
 * Content Card Components
 * ContentCard, Card (deprecated alias), CardHeader, CardBody, CardFooter,
 * CardDivider, CardGrid, ContentGrid, GridItem, TwoColumnLayout
 */

import clsx from "clsx";
import type { ReactNode } from "react";
import { Heading, Subheading } from "@/components/heading";
import { Text } from "@/components/text";

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

export const contentGridGapClasses = {
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
