/**
 * Public Authentication Routes Layout
 * Redirects to dashboard if already authenticated with active org.
 * Uses router context for auth — no Zustand access.
 *
 * Backend org status model (3-state): onboarding | active | suspended
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { AuthLayout } from "@/pages/auth/layout";

export const Route = createFileRoute("/_auth")({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			const organizations = context.organizations ?? [];
			const activeOrg = organizations.find((o) => o.status === "active");

			if (activeOrg) {
				throw redirect({ to: "/$orgSlug", params: { orgSlug: activeOrg.slug } });
			}

			// Has org but not active — route based on status
			if (organizations.length > 0) {
				const status = organizations[0].status;

				if (status === "onboarding") {
					throw redirect({ to: "/pending-approval" });
				}
				if (status === "suspended") {
					throw redirect({ to: "/rejected" });
				}
			}

			// No orgs — send to onboarding to create first org
			throw redirect({ to: "/onboarding" });
		}
	},
	component: AuthLayoutWrapper,
});

function AuthLayoutWrapper() {
	return <AuthLayout />;
}
