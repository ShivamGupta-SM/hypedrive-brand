/**
 * Authenticated App Layout
 *
 * This is the parent layout for all authenticated routes.
 * Child routes are under /$orgSlug/* for URL-based multi-tenancy.
 *
 * Flow:
 * 1. Check auth + organizations from router context (set by root beforeLoad in one parallel call)
 * 2. Render AppLayout with Outlet for child routes
 *
 * Organization validation happens in the /$orgSlug child route.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/_app")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
		// organizations already in context from root beforeLoad — no async work needed
	},
	component: AppLayoutWrapper,
});

function AppLayoutWrapper() {
	const { auth, organizations } = Route.useRouteContext();
	return <AppLayout serverAuth={auth} serverOrganizations={organizations ?? []} />;
}
