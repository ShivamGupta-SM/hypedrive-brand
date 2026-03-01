/**
 * Authenticated App Layout
 *
 * This is the parent layout for all authenticated routes.
 * Child routes are under /$orgSlug/* for URL-based multi-tenancy.
 *
 * Flow:
 * 1. Check auth from router context (set by root beforeLoad)
 * 2. Fetch organizations server-side
 * 3. Render AppLayout with Outlet for child routes
 *
 * Organization validation happens in the /$orgSlug child route.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppLayout } from "@/components/app-layout";
import { getOrganizationsFromServer } from "@/lib/server-auth";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context }) => {
		// Auth already validated in root beforeLoad — just check the result
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}

		// Fetch organizations server-side, cached for 5 min via TanStack Query
		const { organizations } = await context.queryClient.ensureQueryData({
			queryKey: ["server", "organizations"],
			queryFn: () => getOrganizationsFromServer(),
			staleTime: 5 * 60 * 1000,
		});
		return { organizations };
	},
	component: AppLayoutWrapper,
});

function AppLayoutWrapper() {
	const { auth, organizations } = Route.useRouteContext();
	return <AppLayout serverAuth={auth} serverOrganizations={organizations ?? []} />;
}
