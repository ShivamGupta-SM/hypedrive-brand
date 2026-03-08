import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Button } from "@/components/button";

interface ErrorStateProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
	className?: string;
	/** Compact mode for inline sections */
	compact?: boolean;
}

export function ErrorState({
	title = "Something went wrong",
	message = "An unexpected error occurred. Please try again.",
	onRetry,
	className,
	compact,
}: ErrorStateProps) {
	return (
		<div
			className={clsx(
				"flex flex-col items-center justify-center text-center animate-scale-in",
				compact ? "py-8" : "py-16",
				className
			)}
		>
			{/* Animated icon with pulsing ring */}
			<div className="relative">
				<div className="absolute inset-0 animate-[ping_3s_ease-in-out_infinite] rounded-2xl bg-red-100 dark:bg-red-900/20" />
				<div className="relative flex size-16 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100 dark:bg-red-950/30 dark:ring-red-900/30">
					<ExclamationTriangleIcon className="size-7 text-red-500 dark:text-red-400" />
				</div>
			</div>

			{/* Text */}
			<h3 className={clsx("font-semibold text-zinc-900 dark:text-white", compact ? "mt-3 text-base" : "mt-5 text-lg")}>
				{title}
			</h3>
			<p
				className={clsx(
					"max-w-sm text-zinc-500 dark:text-zinc-400",
					compact ? "mt-1 text-xs" : "mt-2 text-sm leading-relaxed"
				)}
			>
				{message}
			</p>

			{/* Retry */}
			{onRetry && (
				<Button className="mt-6" onClick={onRetry} outline>
					<ArrowPathIcon className="size-4" />
					Try Again
				</Button>
			)}
		</div>
	);
}
