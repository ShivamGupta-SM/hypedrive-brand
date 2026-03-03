/**
 * Approval Status Routes Layout
 * For pending/rejected organizations.
 * Uses router context + server-side org fetch — no Zustand access.
 */

import { createFileRoute, isRedirect, Outlet, redirect } from "@tanstack/react-router";

import { CACHE } from "@/hooks/api-client";
import { getServerAuthWithOrgs } from "@/server/auth-queries";

const AUTH_QUERY_KEY = ["auth", "session-with-orgs"] as const;

export const Route = createFileRoute("/_approval")({
	beforeLoad: async ({ context }) => {
		// Not authenticated — redirect to login
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}

		// Invalidate + refetch the root auth query so "Check Status" always gets
		// fresh approval status, while keeping a single cache entry for org data.
		let approvalOrganization: {
			id: string;
			name: string;
			slug: string;
			logo?: string | null;
			createdAt: string;
			approvalStatus?: string;
		} | null = null;
		try {
			await context.queryClient.invalidateQueries({ queryKey: [...AUTH_QUERY_KEY] });
			const result = await context.queryClient.fetchQuery({
				queryKey: [...AUTH_QUERY_KEY],
				queryFn: () => getServerAuthWithOrgs(),
				staleTime: CACHE.auth,
			});
			const organizations = result.organizations ?? [];

			// No organization — redirect to onboarding
			if (organizations.length === 0) {
				throw redirect({ to: "/onboarding" });
			}

			// Active org — redirect to dashboard
			const org = organizations[0];
			if (org.approvalStatus === "active") {
				throw redirect({ to: "/$orgSlug", params: { orgSlug: org.slug } });
			}

			approvalOrganization = org;
		} catch (error) {
			// Re-throw redirects, swallow fetch errors (show approval page as-is)
			if (isRedirect(error)) throw error;
		}

		// Pending/rejected — pass org to approval pages via context
		return { approvalOrganization };
	},
	component: ApprovalLayoutWrapper,
});

function ApprovalLayoutWrapper() {
	return <Outlet />;
}
