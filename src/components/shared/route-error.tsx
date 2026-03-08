/**
 * Shared route-level error and pending components.
 * Used by all data-loading routes as errorComponent / pendingComponent.
 */

import { isCancelledError } from "@tanstack/react-query";
import { getFriendlyErrorMessage, isAPIError } from "@/hooks/api-client";
import { ErrorState } from "./error-state";

export function RouteErrorComponent({ error, reset }: { error: unknown; reset?: () => void }) {
  // Cancelled queries during navigation — not a real error, re-throw to root
  if (isCancelledError(error)) throw error;

  // Auth errors — let the root handler deal with redirect
  if (isAPIError(error) && (error.status === 401 || error.status === 403)) {
    throw error;
  }

  return <ErrorState title="Failed to load" message={getFriendlyErrorMessage(error)} onRetry={reset} />;
}

export function RoutePendingComponent() {
  return (
    <div className="space-y-4 p-1 animate-fade-in">
      {/* Title skeleton */}
      <div className="h-8 w-48 rounded-lg bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div
          className="h-10 rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800"
          style={{ animationDelay: "320ms" }}
        />
        <div
          className="h-64 rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800"
          style={{ animationDelay: "400ms" }}
        />
      </div>
    </div>
  );
}
