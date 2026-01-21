/**
 * InfoPanel Component
 * Colored info/warning/success/error boxes for alerts and messages
 * Styled consistently with Shopper app patterns
 */

import clsx from "clsx";
import { Button } from "@/components/button";
import {
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

// =============================================================================
// INFO PANEL
// =============================================================================

export type InfoPanelVariant = "info" | "warning" | "success" | "error" | "neutral";

export interface InfoPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: InfoPanelVariant;
  title?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  onDismiss?: () => void;
}

const variantStyles = {
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

const defaultIcons = {
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
  const styles = variantStyles[variant];
  const DefaultIcon = defaultIcons[variant];

  return (
    <div
      className={clsx(
        "rounded-lg border p-4",
        styles.container,
        styles.border,
        className
      )}
    >
      <div className="flex gap-3">
        {showIcon && (
          <div className="shrink-0">
            {icon || <DefaultIcon className={clsx("size-5", styles.icon)} />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className={clsx("font-medium", styles.title)}>{title}</h4>
          )}
          <div className={clsx("text-sm", title && "mt-1", styles.content)}>
            {children}
          </div>
          {action && (
            <div className="mt-3">
              <Button
                color={styles.button}
                onClick={action.onClick}
                href={action.href}
                className="text-sm"
              >
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
            <XCircleIcon className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// ALERT BANNER
// =============================================================================

export interface AlertBannerProps {
  className?: string;
  variant: "warning" | "danger" | "info" | "success";
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  icon?: React.ReactNode;
  onDismiss?: () => void;
}

const bannerStyles = {
  warning: {
    bg: "bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/40 dark:to-amber-950/20",
    ring: "ring-amber-200/60 dark:ring-amber-800/40",
    icon: "bg-amber-500",
    title: "text-amber-800 dark:text-amber-200",
    desc: "text-amber-700/80 dark:text-amber-300/80",
    button: "amber" as const,
  },
  danger: {
    bg: "bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/40 dark:to-red-950/20",
    ring: "ring-red-200/60 dark:ring-red-800/40",
    icon: "bg-red-500",
    title: "text-red-800 dark:text-red-200",
    desc: "text-red-700/80 dark:text-red-300/80",
    button: "red" as const,
  },
  info: {
    bg: "bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/40 dark:to-blue-950/20",
    ring: "ring-blue-200/60 dark:ring-blue-800/40",
    icon: "bg-blue-500",
    title: "text-blue-800 dark:text-blue-200",
    desc: "text-blue-700/80 dark:text-blue-300/80",
    button: "blue" as const,
  },
  success: {
    bg: "bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/40 dark:to-emerald-950/20",
    ring: "ring-emerald-200/60 dark:ring-emerald-800/40",
    icon: "bg-emerald-500",
    title: "text-emerald-800 dark:text-emerald-200",
    desc: "text-emerald-700/80 dark:text-emerald-300/80",
    button: "green" as const,
  },
};

const bannerIcons = {
  warning: ExclamationTriangleIcon,
  danger: XCircleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
};

export function AlertBanner({
  className,
  variant,
  title,
  description,
  action,
  icon,
  onDismiss,
}: AlertBannerProps) {
  const styles = bannerStyles[variant];
  const DefaultIcon = bannerIcons[variant];

  return (
    <div
      className={clsx(
        "flex flex-col gap-3 rounded-xl p-4 ring-1 ring-inset sm:flex-row sm:items-center",
        styles.bg,
        styles.ring,
        className
      )}
    >
      <div
        className={clsx(
          "flex size-10 shrink-0 items-center justify-center rounded-full text-white",
          styles.icon
        )}
      >
        {icon || <DefaultIcon className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={clsx("font-medium", styles.title)}>{title}</p>
        {description && (
          <p className={clsx("mt-0.5 text-sm", styles.desc)}>{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <Button
            color={styles.button}
            onClick={action.onClick}
            href={action.href}
            className="shrink-0"
          >
            {action.label}
          </Button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-700 dark:hover:bg-white/10 dark:hover:text-zinc-300"
          >
            <XCircleIcon className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// TIP BOX
// =============================================================================

export interface TipBoxProps {
  children: React.ReactNode;
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
          <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
// EMPTY MESSAGE
// =============================================================================

export interface EmptyMessageProps {
  children?: React.ReactNode;
  className?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyMessage({ children, className, message = "No data available", icon }: EmptyMessageProps) {
  return (
    <div className={clsx("flex flex-col items-center justify-center py-8 text-center", className)}>
      {icon && (
        <div className="mb-3 text-zinc-300 dark:text-zinc-600">{icon}</div>
      )}
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      {children}
    </div>
  );
}

// =============================================================================
// ACTION LINK (Shopper-style clickable row)
// =============================================================================

export interface ActionLinkProps {
  href?: string;
  onClick?: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "warning" | "danger";
  className?: string;
}

const actionLinkStyles = {
  default: {
    container: "bg-white dark:bg-zinc-900 ring-zinc-200 dark:ring-zinc-800 hover:ring-zinc-300 dark:hover:ring-zinc-700",
    icon: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    title: "text-zinc-900 dark:text-white",
    description: "text-zinc-500 dark:text-zinc-400",
    chevron: "text-zinc-400 dark:text-zinc-500",
  },
  warning: {
    container: "bg-amber-50 dark:bg-amber-950/30 ring-amber-200 dark:ring-amber-800/50 hover:ring-amber-300 dark:hover:ring-amber-700",
    icon: "bg-linear-to-b from-amber-400 to-amber-600 text-white shadow-sm ring-1 ring-amber-600/20 dark:from-amber-500 dark:to-amber-700",
    title: "text-amber-900 dark:text-amber-100",
    description: "text-amber-700 dark:text-amber-300",
    chevron: "text-amber-600 dark:text-amber-400",
  },
  danger: {
    container: "bg-red-50 dark:bg-red-950/30 ring-red-200 dark:ring-red-800/50 hover:ring-red-300 dark:hover:ring-red-700",
    icon: "bg-linear-to-b from-red-400 to-red-600 text-white shadow-sm ring-1 ring-red-600/20 dark:from-red-500 dark:to-red-700",
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
      className={clsx(
        "flex items-center gap-4 rounded-xl p-4 ring-1 transition-all",
        styles.container,
        className
      )}
    >
      {icon && (
        <div
          className={clsx(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            styles.icon
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1 text-left">
        <p className={clsx("font-medium", styles.title)}>{title}</p>
        {description && (
          <p className={clsx("text-sm", styles.description)}>{description}</p>
        )}
      </div>
      <ChevronRightIcon className={clsx("size-5 shrink-0", styles.chevron)} />
    </Component>
  );
}
