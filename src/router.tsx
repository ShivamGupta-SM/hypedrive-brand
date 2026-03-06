import { dehydrate, hydrate, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { isAPIError } from "@/hooks/api-client";
import { clearServerAuthCookie } from "@/server/auth-queries";
import { routeTree } from "./routeTree.gen";

// Shared queryClient reference - accessible outside React tree
let _queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient | null {
	return _queryClient;
}

/**
 * Handle 401 errors globally — clear cookie and query cache.
 * Called from QueryClient retry and can be called from anywhere.
 */
export async function handleAuthError() {
	// Clear the httpOnly auth cookie via a server round-trip
	try {
		await clearServerAuthCookie();
	} catch {}
	// clear() wipes the entire QueryClient cache including auth+orgs
	_queryClient?.clear();
}

export function getRouter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000, // 30 seconds
				gcTime: 5 * 60 * 1000, // 5 minutes
				retry: (failureCount, error: unknown) => {
					if (isAPIError(error) && error.status) {
						// 401 — clear auth and stop immediately
						if (error.status === 401) {
							handleAuthError();
							return false;
						}
						// 4xx (incl. 429) — client error, never retry
						if (error.status >= 400 && error.status < 500) return false;
						// 5xx — server error, retry up to 2 times
						if (error.status >= 500) return failureCount < 2;
					}
					// Network / unknown errors — retry once
					return failureCount < 1;
				},
				refetchOnWindowFocus: false,
			},
		},
	});

	// Store reference for access outside React tree (e.g., logout)
	_queryClient = queryClient;

	const router = createTanStackRouter({
		routeTree,
		context: {
			queryClient,
			auth: { isAuthenticated: false, user: null },
		},
		defaultPreload: "intent",
		defaultPreloadStaleTime: 30_000,
		scrollRestoration: true,
		// Dehydrate QueryClient state into SSR HTML so the client can rehydrate
		// without re-fetching — eliminates the flash caused by empty client cache.
		// biome-ignore lint/suspicious/noExplicitAny: TanStack Router and React Query dehydration types diverge slightly
		dehydrate: () => ({ queryClientState: dehydrate(queryClient) as any }),
		hydrate: (data) => hydrate(queryClient, data.queryClientState),
	});

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}