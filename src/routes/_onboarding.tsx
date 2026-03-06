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

		// If user has at least one active org, they're intentionally creating
		// a new one from the brand switcher — allow through to onboarding.
		const hasActiveOrg = organizations.some((o) => o.status === "active");
		if (hasActiveOrg) return;

		// No active orgs — check if they have any pending/suspended orgs
		if (organizations.length > 0) {
			const org = organizations[0];
			const status = org.status;

			if (status === "onboarding") {
				throw redirect({ to: "/pending-approval" });
			}
			if (status === "suspended") {
				throw redirect({ to: "/rejected" });
			}
			// active case already handled above
			throw redirect({ to: "/$orgSlug", params: { orgSlug: org.slug } });
		}

		// No orgs at all — allow onboarding
	},
	component: OnboardingLayoutWrapper,
});

function OnboardingLayoutWrapper() {
	return <Outlet />;
}
