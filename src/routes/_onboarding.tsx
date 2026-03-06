/**
 * Onboarding Routes Layout
 * For authenticated users without an organization.
 * Uses router context + server-side org fetch — no Zustand access.
 *
 * Backend org status model (3-state): onboarding | active | suspended
 */

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_onboarding")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}

		const organizations = context.organizations ?? [];

		if (organizations.length > 0) {
			const org = organizations[0];
			const status = org.status;

			if (status === "active") {
				throw redirect({ to: "/$orgSlug", params: { orgSlug: org.slug } });
			}
			if (status === "onboarding") {
				throw redirect({ to: "/pending-approval" });
			}
			if (status === "suspended") {
				throw redirect({ to: "/rejected" });
			}
		}

		// No orgs — allow onboarding
	},
	component: OnboardingLayoutWrapper,
});

function OnboardingLayoutWrapper() {
	return <Outlet />;
}
