/**
 * Approval Status Routes Layout
 * For pending/rejected organizations.
 * Uses router context + server-side org fetch — no Zustand access.
 */

import { createFileRoute, isRedirect, Outlet, redirect } from "@tanstack/react-router";

import { getOrganizationsFromServer } from "@/lib/server-auth";

export const Route = createFileRoute("/_approval")({
	beforeLoad: async ({ context }) => {
		// Not authenticated — redirect to login
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}

		// Fetch orgs fresh — no cache, so Check Status always gets latest state
		try {
			const { organizations } = await context.queryClient.fetchQuery({
				queryKey: ["server", "organizations"],
				queryFn: () => getOrganizationsFromServer(),
				staleTime: 0,
			});

			// No organization — redirect to onboarding
			if (organizations.length === 0) {
				throw redirect({ to: "/onboarding" });
			}

			// Active org — redirect to dashboard
			const org = organizations[0];
			if (org.approvalStatus === "active") {
				throw redirect({ to: "/$orgSlug", params: { orgSlug: org.slug } });
			}
		} catch (error) {
			// Re-throw redirects, swallow fetch errors (show approval page as-is)
			if (isRedirect(error)) throw error;
		}

		// Pending/rejected — allow access to approval pages
	},
	component: ApprovalLayoutWrapper,
});

function ApprovalLayoutWrapper() {
	return <Outlet />;
}
