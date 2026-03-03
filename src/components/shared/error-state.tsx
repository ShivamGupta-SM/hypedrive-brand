import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Button } from "@/components/button";

interface ErrorStateProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
	className?: string;
}

export function ErrorState({
	title = "Something went wrong",
	message = "An unexpected error occurred. Please try again.",
	onRetry,
	className,
}: ErrorStateProps) {
	return (
		<div className={clsx("flex flex-col items-center justify-center py-16 text-center", className)}>
			<div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
				<ExclamationTriangleIcon className="size-8 text-red-400" />
			</div>
			<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">{title}</p>
			<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
			{onRetry && (
				<Button className="mt-6" onClick={onRetry} color="dark/zinc">
					<ArrowPathIcon className="size-4" />
					Try Again
				</Button>
			)}
		</div>
	);
}
