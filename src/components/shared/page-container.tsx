/**
 * PageContainer Component
 * Consistent page layout wrapper with max-width and spacing
 */

import clsx from "clsx";

export interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "6xl" | "7xl" | "full";
	padding?: boolean;
	as?: "div" | "main" | "section" | "article";
}

const maxWidthStyles = {
	sm: "max-w-screen-sm",
	md: "max-w-screen-md",
	lg: "max-w-screen-lg",
	xl: "max-w-screen-xl",
	"2xl": "max-w-screen-2xl",
	"4xl": "max-w-4xl",
	"6xl": "max-w-6xl",
	"7xl": "max-w-7xl",
	full: "max-w-full",
};

export function PageContainer({
	children,
	className,
	maxWidth = "7xl",
	padding = true,
	as: Component = "div",
}: PageContainerProps) {
	return (
		<Component
			className={clsx(
				"mx-auto w-full",
				maxWidthStyles[maxWidth],
				padding && "px-4 sm:px-6 lg:px-8",
				className
			)}
		>
			{children}
		</Component>
	);
}

// =============================================================================
// PAGE SECTION
// =============================================================================

export interface PageSectionProps {
	children: React.ReactNode;
	className?: string;
	spacing?: "sm" | "md" | "lg";
}

const sectionSpacing = {
	sm: "mt-4",
	md: "mt-6",
	lg: "mt-8",
};

export function PageSection({ children, className, spacing = "lg" }: PageSectionProps) {
	return <section className={clsx(sectionSpacing[spacing], className)}>{children}</section>;
}

// =============================================================================
// CONTENT GRID
// =============================================================================

export interface ContentGridProps {
	children: React.ReactNode;
	className?: string;
	columns?: 1 | 2 | 3 | 4 | 12;
	gap?: "sm" | "md" | "lg";
}

const gridColumns = {
	1: "grid-cols-1",
	2: "grid-cols-1 sm:grid-cols-2",
	3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
	12: "grid-cols-12",
};

const gridGap = {
	sm: "gap-3",
	md: "gap-4",
	lg: "gap-6",
};

export function ContentGrid({ children, className, columns = 12, gap = "lg" }: ContentGridProps) {
	return (
		<div className={clsx("grid", gridColumns[columns], gridGap[gap], className)}>{children}</div>
	);
}

// =============================================================================
// GRID ITEM
// =============================================================================

export interface GridItemProps {
	children: React.ReactNode;
	className?: string;
	span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
	spanSm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
	spanLg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full";
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

export function GridItem({ children, className, span = "full", spanSm, spanLg }: GridItemProps) {
	return (
		<div
			className={clsx(
				spanStyles[span],
				spanSm && spanSmStyles[spanSm],
				spanLg && spanLgStyles[spanLg],
				className
			)}
		>
			{children}
		</div>
	);
}

// =============================================================================
// TWO COLUMN LAYOUT
// =============================================================================

export interface TwoColumnLayoutProps {
	children: React.ReactNode;
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
				gridGap[gap],
				className
			)}
		>
			{children}
		</div>
	);
}
