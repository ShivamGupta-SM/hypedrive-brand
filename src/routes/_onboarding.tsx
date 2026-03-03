/**
 * Onboarding Routes Layout
 * For authenticated users without an organization.
 * Uses router context + server-side org fetch — no Zustand access.
 */

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_onboarding")({
	beforeLoad: ({ context }) => {
		// Not authenticated — redirect to login
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}

		// Organizations already in context from root beforeLoad
		const organizations = context.organizations ?? [];

		if (organizations.length > 0) {
			const org = organizations[0];
			const status = org.approvalStatus;

			if (status === "approved") {
				throw redirect({ to: "/$orgSlug", params: { orgSlug: org.slug } });
			}
			if (status === "pending" || status === "draft") {
				throw redirect({ to: "/pending-approval" });
			}
			if (status === "rejected" || status === "banned") {
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
