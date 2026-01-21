import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

/**
 * AppInitializer - Handles app startup initialization
 *
 * Shows a loading skeleton while:
 * 1. Zustand rehydrates auth state from localStorage
 * 2. If authenticated, fetches organization profile
 *
 * Once initialized, renders children (the app routes)
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
