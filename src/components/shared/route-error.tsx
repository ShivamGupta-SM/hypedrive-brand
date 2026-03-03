/**
 * Shared route-level error and pending components.
 * Used by all data-loading routes as errorComponent / pendingComponent.
 */

import { getAPIErrorMessage, isAPIError } from "@/hooks/api-client";
import { ErrorState } from "./error-state";

export function RouteErrorComponent({ error, reset }: { error: unknown; reset?: () => void }) {
	// Auth errors — let the root handler deal with redirect
	if (isAPIError(error) && (error.status === 401 || error.status === 403)) {
		throw error;
	}

	return <ErrorState title="Failed to load" message={getAPIErrorMessage(error)} onRetry={reset} />;
}

export function RoutePendingComponent() {
	return (
		<div className="space-y-4 p-1">
			<div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
				))}
			</div>
			<div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
		</div>
	);
}
