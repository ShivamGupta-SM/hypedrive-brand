/**
 * Skeleton - Loading placeholder components
 * Wrapper around react-loading-skeleton with Catalyst theme integration
 */

import { useIsDark } from "@/hooks/use-theme";
import ReactSkeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import clsx from "clsx";

// Re-export for convenience
export { SkeletonTheme };

export interface SkeletonProps {
	/** Number of skeleton lines to render */
	count?: number;
	/** Width of the skeleton (CSS value or number for pixels) */
	width?: string | number;
	/** Height of the skeleton (CSS value or number for pixels) */
	height?: string | number;
	/** Make the skeleton circular */
	circle?: boolean;
	/** Border radius (CSS value) */
	borderRadius?: string | number;
	/** Custom class name */
	className?: string;
	/** Container class name */
	containerClassName?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Enable animation (default: true) */
	enableAnimation?: boolean;
	/** Animation direction */
	direction?: "ltr" | "rtl";
	/** Animation duration in seconds */
	duration?: number;
	/** Render as inline element */
	inline?: boolean;
}

export function Skeleton({
	count = 1,
	width,
	height,
	circle = false,
	borderRadius,
	className,
	containerClassName,
	style,
	enableAnimation = true,
	direction = "ltr",
	duration = 1.5,
	inline = false,
}: SkeletonProps) {
	return (
		<ReactSkeleton
			count={count}
			width={width}
			height={height}
			circle={circle}
			borderRadius={borderRadius}
			className={className}
			containerClassName={clsx("skeleton-container", containerClassName)}
			style={style}
			enableAnimation={enableAnimation}
			direction={direction}
			duration={duration}
			inline={inline}
		/>
	);
}

// =============================================================================
// PRESET SKELETONS
// =============================================================================

/** Text line skeleton */
export function TextSkeleton({
	lines = 1,
	width,
	className,
}: {
	lines?: number;
	width?: string | number;
	className?: string;
}) {
	return <Skeleton count={lines} width={width} height={16} className={clsx("mb-1", className)} />;
}

/** Avatar skeleton */
export function AvatarSkeleton({
	size = "md",
	className,
}: {
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	className?: string;
}) {
	const sizeMap = {
		xs: 24,
		sm: 32,
		md: 40,
		lg: 48,
		xl: 64,
	};

	return <Skeleton circle width={sizeMap[size]} height={sizeMap[size]} className={className} />;
}

/** Button skeleton */
export function ButtonSkeleton({
	size = "md",
	width = 100,
	className,
}: {
	size?: "sm" | "md" | "lg";
	width?: string | number;
	className?: string;
}) {
	const heightMap = {
		sm: 32,
		md: 38,
		lg: 44,
	};

	return <Skeleton width={width} height={heightMap[size]} borderRadius={8} className={className} />;
}

/** Card skeleton */
export function CardSkeleton({ height = 200, className }: { height?: string | number; className?: string }) {
	return <Skeleton width="100%" height={height} borderRadius={12} className={className} />;
}

/** Table row skeleton */
export function TableRowSkeleton({ columns = 4, className }: { columns?: number; className?: string }) {
	return (
		<div className={clsx("flex items-center gap-4 py-3", className)}>
			{Array.from({ length: columns }).map((_, i) => (
				<Skeleton
					key={i}
					width={i === 0 ? 40 : undefined}
					height={i === 0 ? 40 : 16}
					circle={i === 0}
					containerClassName="flex-1"
				/>
			))}
		</div>
	);
}

/** Stat card skeleton */
export function StatCardSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={clsx("rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800", className)}
		>
			<Skeleton width={40} height={40} borderRadius={8} />
			<Skeleton width={80} height={28} className="mt-4" />
			<Skeleton width={60} height={16} className="mt-1" />
		</div>
	);
}

/** List item skeleton */
export function ListItemSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={clsx(
				"flex items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800",
				className
			)}
		>
			<Skeleton circle width={40} height={40} />
			<div className="flex-1 space-y-2">
				<Skeleton width="60%" height={16} />
				<Skeleton width="40%" height={14} />
			</div>
			<Skeleton width={60} height={20} borderRadius={4} />
		</div>
	);
}

/** Form field skeleton */
export function FormFieldSkeleton({ className }: { className?: string }) {
	return (
		<div className={clsx("space-y-2", className)}>
			<Skeleton width={80} height={14} />
			<Skeleton width="100%" height={38} borderRadius={8} />
		</div>
	);
}

// =============================================================================
// SKELETON THEME PROVIDER
// =============================================================================

interface SkeletonProviderProps {
	children: React.ReactNode;
	/** Use dark mode colors */
	darkMode?: boolean;
}

/**
 * Wrap your app/component with this to set skeleton colors globally
 * Colors are auto-detected based on dark class on html element
 */
export function SkeletonProvider({ children, darkMode }: SkeletonProviderProps) {
	const themeDark = useIsDark();
	const isDark = darkMode ?? themeDark;

	return (
		<SkeletonTheme
			baseColor={isDark ? "rgb(39 39 42)" : "rgb(244 244 245)"} // zinc-800 / zinc-100
			highlightColor={isDark ? "rgb(63 63 70)" : "rgb(228 228 231)"} // zinc-700 / zinc-200
		>
			{children}
		</SkeletonTheme>
	);
}
