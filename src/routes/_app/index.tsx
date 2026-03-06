/**
 * Root App Route - Redirects to org-specific URL
 *
 * When user visits /, redirect them to /$orgSlug/
 * based on their current or first available organization.
 * Organizations are resolved server-side by the parent _app route.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
	beforeLoad: ({ context }) => {
		const organizations = context.organizations ?? [];

		// No organizations — redirect to onboarding
		if (organizations.length === 0) {
			throw redirect({ to: "/onboarding" });
		}

		// Prefer first active org, fall back to first org
		const activeOrg = organizations.find((o) => o.status === "active");
		const targetOrg = activeOrg ?? organizations[0];

		// Redirect to org-specific dashboard
		throw redirect({
			to: "/$orgSlug",
			params: { orgSlug: targetOrg.slug },
		});
	},
	component: () => null, // Never renders - always redirects
});
