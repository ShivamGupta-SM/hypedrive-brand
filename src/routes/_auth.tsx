/**
 * Public Authentication Routes Layout
 * Redirects to dashboard if already authenticated with approved org.
 * Uses router context for auth — no Zustand access.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { getOrganizationsFromServer } from "@/lib/server-auth";
import { AuthLayout } from "@/pages/auth/layout";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async ({ context }) => {
		if (context.auth.isAuthenticated) {
			// Fetch orgs server-side to determine where to redirect, cached for 5 min
			const { organizations } = await context.queryClient.ensureQueryData({
				queryKey: ["server", "organizations"],
				queryFn: () => getOrganizationsFromServer(),
				staleTime: 5 * 60 * 1000,
			});
			const approvedOrg = organizations.find((o) => o.approvalStatus === "approved");

			if (approvedOrg) {
				throw redirect({ to: "/$orgSlug", params: { orgSlug: approvedOrg.slug } });
			}

			// Authenticated but no approved org — check if they have any org
			if (organizations.length > 0) {
				const org = organizations[0];
				const status = org.approvalStatus;

				if (status === "pending" || status === "draft") {
					throw redirect({ to: "/pending-approval" });
				}
				if (status === "rejected" || status === "banned") {
					throw redirect({ to: "/rejected" });
				}
			}

			// Authenticated with no orgs — send to onboarding to create first org
			throw redirect({ to: "/onboarding" });
		}
	},
	component: AuthLayoutWrapper,
});

function AuthLayoutWrapper() {
	return <AuthLayout />;
}
