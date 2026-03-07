/**
 * Page Layout Components
 * PageLayout, PageSection, SectionGroup, FormSection, DetailSection, DetailList, DetailItem
 */

import clsx from "clsx";
import type { ReactNode } from "react";
import { Divider } from "@/components/divider";
import { Heading, Subheading } from "@/components/heading";
import { Text } from "@/components/text";

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
