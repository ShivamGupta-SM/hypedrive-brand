/**
 * Alert & Info Components
 * AlertBanner, InfoPanel, TipBox, EmptyMessage, ActionLink
 */

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	InformationCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Button } from "@/components/button";

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
			<div
				className={clsx(
					"flex shrink-0 items-center justify-center rounded-full text-white",
					sm ? "size-8" : "size-9 sm:size-10",
					styles.iconBg
				)}
			>
				{icon || <DefaultIcon className={sm ? "size-4" : "size-4.5 sm:size-5"} />}
			</div>
			<div className="min-w-0 flex-1">
				{title && <p className={clsx("font-medium", sm ? "text-sm" : "text-sm sm:text-base", styles.title)}>{title}</p>}
				{description && (
					<p className={clsx("mt-0.5", sm ? "text-xs" : "text-xs sm:text-sm", styles.text)}>{description}</p>
				)}
				{children && (
					<div className={clsx(sm ? "text-xs" : "text-xs sm:text-sm", title && "mt-1", styles.text)}>{children}</div>
				)}
			</div>
			{hasActions && (
				<div className="flex shrink-0 items-center gap-2">
					{actions}
					{action && (
						<Button
							color={styles.button}
							onClick={action.onClick}
							href={action.href}
							className={clsx("shrink-0", sm && "text-xs!")}
						>
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
				{showIcon && (
					<div className="shrink-0 mt-0.5 sm:mt-0">
						{icon || <DefaultIcon className={clsx("size-4 sm:size-5", styles.icon)} />}
					</div>
				)}
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
