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
	variant?: "default" | "bordered" | "elevated" | "subtle" | "interactive" | "hero";
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
	default: "bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
	bordered: "border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900",
	elevated: "bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
	subtle: "bg-zinc-50 dark:bg-zinc-800/50",
	interactive:
		"bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all cursor-pointer",
	hero: "bg-emerald-600 dark:bg-emerald-700",
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
				variant === "hero" ? "rounded-2xl" : "rounded-xl",
				variantStyles[variant],
				paddingStyles[padding],
				hover && "transition-all hover:shadow-md hover:ring-zinc-300 dark:hover:ring-zinc-700",
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
			<div className={clsx("flex items-start justify-between gap-4", className)}>{children}</div>
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
					{title &&
						(size === "lg" ? (
							<Heading className={titleClassName}>{title}</Heading>
						) : size === "md" ? (
							<Subheading className={titleClassName}>{title}</Subheading>
						) : (
							<h4
								className={clsx(
									"text-sm font-semibold text-zinc-900 dark:text-white",
									titleClassName
								)}
							>
								{title}
							</h4>
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
	children: React.ReactNode;
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
	return <div className={clsx("my-4 border-t border-zinc-200 dark:border-zinc-700", className)} />;
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

export function CardGrid({ children, columns = 3, gap = "md", className }: CardGridProps) {
	return (
		<div className={clsx("grid", columnStyles[columns], gapStyles[gap], className)}>{children}</div>
	);
}

// =============================================================================
// STAT CARD (Shopper-style)
// =============================================================================

export interface StatCardProps {
	icon?: React.ReactNode;
	label: string;
	value: string | number;
	sublabel?: string;
	trend?: {
		value: number;
		direction: "up" | "down" | "neutral";
	};
	/** Badge shown in top-right corner */
	badge?: { text: string; variant: "warning" | "danger" | "success" | "info" };
	/** CTA link or button shown at bottom */
	action?: { label: string; href?: string; onClick?: () => void };
	variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "lime";
	size?: "sm" | "md" | "lg";
	className?: string;
	href?: string;
	onClick?: () => void;
}

const statVariantStyles = {
	default: {
		card: "bg-white ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10",
		icon: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
		value: "text-zinc-900 dark:text-white",
		label: "text-zinc-500 dark:text-zinc-400",
		isPrimary: false,
	},
	/** Solid emerald gradient — for wallet balance, key revenue metrics */
	primary: {
		card: "bg-gradient-to-br from-emerald-600 to-emerald-800 ring-0 shadow-lg",
		icon: "bg-white/20 text-white",
		value: "text-white",
		label: "text-white/75",
		isPrimary: true,
	},
	success: {
		card: "bg-emerald-50 ring-emerald-200/60 dark:bg-emerald-950/20 dark:ring-emerald-800/40",
		icon: "bg-emerald-500 text-white",
		value: "text-emerald-900 dark:text-emerald-100",
		label: "text-emerald-700/80 dark:text-emerald-300/70",
		isPrimary: false,
	},
	warning: {
		card: "bg-amber-50 ring-amber-200/60 dark:bg-amber-950/20 dark:ring-amber-800/40",
		icon: "bg-amber-500 text-white",
		value: "text-amber-900 dark:text-amber-100",
		label: "text-amber-700/80 dark:text-amber-300/70",
		isPrimary: false,
	},
	danger: {
		card: "bg-red-50 ring-red-200/60 dark:bg-red-950/20 dark:ring-red-800/40",
		icon: "bg-red-500 text-white",
		value: "text-red-900 dark:text-red-100",
		label: "text-red-700/80 dark:text-red-300/70",
		isPrimary: false,
	},
	info: {
		card: "bg-sky-50 ring-sky-200/60 dark:bg-sky-950/20 dark:ring-sky-800/40",
		icon: "bg-sky-500 text-white",
		value: "text-sky-900 dark:text-sky-100",
		label: "text-sky-700/80 dark:text-sky-300/70",
		isPrimary: false,
	},
	lime: {
		card: "bg-lime-50 ring-lime-200/60 dark:bg-lime-950/20 dark:ring-lime-800/40",
		icon: "bg-lime-500 text-white",
		value: "text-lime-900 dark:text-lime-100",
		label: "text-lime-700/80 dark:text-lime-300/70",
		isPrimary: false,
	},
};

const trendStyles = {
	up: {
		text: "text-emerald-700 dark:text-emerald-400",
		bg: "bg-emerald-100 dark:bg-emerald-950/50",
	},
	down: {
		text: "text-red-700 dark:text-red-400",
		bg: "bg-red-100 dark:bg-red-950/50",
	},
	neutral: {
		text: "text-zinc-500 dark:text-zinc-400",
		bg: "bg-zinc-100 dark:bg-zinc-800/50",
	},
};

const sizeStyles = {
	sm: {
		card: "p-3",
		icon: "size-8",
		value: "text-lg font-semibold",
		label: "text-xs",
	},
	md: {
		card: "p-4 sm:p-5",
		icon: "size-10 sm:size-11",
		value: "text-2xl font-semibold tracking-tight sm:text-3xl",
		label: "text-sm",
	},
	lg: {
		card: "p-5 sm:p-6",
		icon: "size-12",
		value: "text-3xl font-bold tracking-tight sm:text-4xl",
		label: "text-sm",
	},
};

const badgeVariantStyles = {
	warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
	danger: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
	success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
	info: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
};

export function StatCard({
	icon,
	label,
	value,
	sublabel,
	trend,
	badge,
	action,
	variant = "default",
	size = "md",
	className,
	href,
	onClick,
}: StatCardProps) {
	const styles = statVariantStyles[variant];
	const sizes = sizeStyles[size];
	const Wrapper = href ? "a" : onClick ? "button" : "div";

	return (
		<Wrapper
			href={href}
			onClick={onClick}
			className={clsx(
				"relative group flex flex-col rounded-xl ring-1 ring-inset transition-all",
				sizes.card,
				styles.card,
				(href || onClick) && "cursor-pointer hover:shadow-md",
				className
			)}
		>
			{/* Badge top-right */}
			{badge && (
				<span
					className={clsx(
						"absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-medium",
						badgeVariantStyles[badge.variant]
					)}
				>
					{badge.text}
				</span>
			)}

			<div className="flex items-start justify-between">
				{icon && (
					<div
						className={clsx("flex items-center justify-center rounded-xl", sizes.icon, styles.icon)}
					>
						{icon}
					</div>
				)}
				{trend && !badge && (
					<div
						className={clsx(
							"flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
							styles.isPrimary
								? "bg-white/20 text-white"
								: clsx(trendStyles[trend.direction].text, trendStyles[trend.direction].bg)
						)}
					>
						{trend.direction !== "neutral" && (
							<svg
								className={clsx("size-3", trend.direction === "down" && "rotate-180")}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2.5}
								aria-hidden="true"
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
							</svg>
						)}
						{Math.abs(trend.value)}%
					</div>
				)}
			</div>
			<div className={clsx("mt-4", sizes.value, styles.value)}>{value}</div>
			<div className="mt-1 flex items-center gap-2">
				<span className={clsx(sizes.label, styles.label)}>{label}</span>
				{sublabel && (
					<span
						className={clsx(
							"text-xs",
							styles.isPrimary ? "text-white/60" : "text-zinc-400 dark:text-zinc-500"
						)}
					>
						{sublabel}
					</span>
				)}
			</div>

			{/* Action link */}
			{action && (
				<div className="mt-3">
					{action.href ? (
						<a
							href={action.href}
							className={clsx(
								"text-xs font-medium underline-offset-2 hover:underline",
								styles.isPrimary ? "text-white/90" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
							)}
							onClick={(e) => e.stopPropagation()}
						>
							{action.label}
						</a>
					) : (
						<button
							type="button"
							className={clsx(
								"text-xs font-medium underline-offset-2 hover:underline",
								styles.isPrimary ? "text-white/90" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
							)}
							onClick={(e) => { e.stopPropagation(); action.onClick?.(); }}
						>
							{action.label}
						</button>
					)}
				</div>
			)}
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

export function MiniStat({
	icon,
	iconColor = "zinc",
	label,
	value,
	sublabel,
	className,
}: MiniStatProps) {
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
			{sublabel && <Text className="mt-1 text-xs text-zinc-500">{sublabel}</Text>}
		</div>
	);
}
