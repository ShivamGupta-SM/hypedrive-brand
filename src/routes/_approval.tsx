/**
 * Approval Status Routes Layout
 * For pending/rejected organizations.
 * Uses router context + server-side org fetch — no Zustand access.
 */

import { createFileRoute, isRedirect, Outlet, redirect } from "@tanstack/react-router";

import { queryKeys } from "@/hooks/api-client";
import { getOrganizationsFromServer } from "@/server/auth-queries";

export const Route = createFileRoute("/_approval")({
	beforeLoad: async ({ context }) => {
		// Not authenticated — redirect to login
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}

		// Fetch orgs fresh — staleTime: 0 so Check Status always gets latest state
		let approvalOrganization: {
			id: string;
			name: string;
			slug: string;
			logo?: string | null;
			createdAt: string;
			approvalStatus?: string;
		} | null = null;
		try {
			const { organizations } = await context.queryClient.fetchQuery({
				queryKey: [...queryKeys.organizationProfile(), "approval"],
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
