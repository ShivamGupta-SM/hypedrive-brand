/**
 * Page Header Components
 * PageHeader and DetailPageHeader live here.
 * All other layout primitives have been split into focused modules
 * and are re-exported below for backward compatibility.
 */

import clsx from "clsx";
import type { ReactNode } from "react";

import { Heading } from "@/components/heading";
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

export function PageHeader({ title, description, badge, actions, className, children }: PageHeaderProps) {
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
				<div
					className={clsx(
						"pointer-events-none absolute inset-px top-px h-24 rounded-t-[11px] bg-linear-to-b sm:h-32",
						gradientClass
					)}
				/>
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
// RE-EXPORTS for backward compatibility
// =============================================================================

export * from "./alert-banner";
export * from "./content-card";
export * from "./page-layout";
export * from "./page-skeleton";
