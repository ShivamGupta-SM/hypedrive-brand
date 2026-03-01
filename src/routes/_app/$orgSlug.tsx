/**
 * Organization Layout Route - URL-based multi-tenancy
 *
 * All routes under /$orgSlug require:
 * 1. User to be authenticated (checked by parent _app)
 * 2. Organization to exist and user has access
 * 3. Organization to be approved
 *
 * Organization resolution is fully server-side — no Zustand access in beforeLoad.
 * The component syncs resolved data to client stores for reactive UI.
 */

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { ORG_ROLE_PERMISSIONS, registerCustomRolePermissions } from "@/lib/permissions/access-control-client";
import { getActiveMemberFromServer, getOrgRolesFromServer } from "@/lib/server-auth";
import { useOrganizationStore } from "@/store/organization-store";
import { usePermissionsStore } from "@/store/permissions-store";

export const Route = createFileRoute("/_app/$orgSlug")({
	beforeLoad: async ({ params, context }) => {
		const organizations = context.organizations ?? [];

		// Find organization by slug from URL
		const org = organizations.find((o) => o.slug === params.orgSlug);

		// No matching organization — redirect to first org or onboarding
		if (!org) {
			if (organizations.length > 0) {
				throw redirect({ to: "/$orgSlug", params: { orgSlug: organizations[0].slug } });
			}
			throw redirect({ to: "/onboarding" });
		}

		// Check approval status
		const status = org.approvalStatus;

		if (status === "pending" || status === "draft") {
			throw redirect({ to: "/pending-approval" });
		}

		if (status === "rejected" || status === "banned") {
			throw redirect({ to: "/rejected" });
		}

		// Fetch active member role server-side for RBAC, cached per org for 5 min
		const { member } = await context.queryClient.ensureQueryData({
			queryKey: ["server", "activeMember", org.id],
			queryFn: () => getActiveMemberFromServer({ data: { organizationId: org.id } }),
			staleTime: 5 * 60 * 1000,
		});

		// If member has a custom role (not in the hardcoded matrix), fetch its permissions
		let customPermissions: Record<string, string[]> | null = null;
		if (member?.role && !(member.role in ORG_ROLE_PERMISSIONS)) {
			const { roles } = await context.queryClient.ensureQueryData({
				queryKey: ["server", "orgRoles", org.id],
				queryFn: () => getOrgRolesFromServer({ data: { organizationId: org.id } }),
				staleTime: 10 * 60 * 1000,
			});
			const match = roles.find((r) => r.role === member.role);
			customPermissions = match?.permission ?? null;

			// Register immediately for SSR-time rendering
			registerCustomRolePermissions(customPermissions);
		}

		return {
			organization: org,
			orgSlug: params.orgSlug,
			activeMember: member,
			customPermissions,
		};
	},
	component: OrgLayoutWrapper,
});

function OrgLayoutWrapper() {
	const { organization, organizations, activeMember, customPermissions, auth } = Route.useRouteContext();

	// Sync server-resolved data to client stores for reactive UI (dropdowns, permissions, etc.)
	useEffect(() => {
		if (organization) {
			useOrganizationStore.getState().setCurrentOrganization(organization);
		}
		if (organizations) {
			useOrganizationStore.getState().setOrganizations(organizations);
		}
	}, [organization, organizations]);

	// Sync permissions to store — clear if member fetch failed
	useEffect(() => {
		if (activeMember?.role && organization && auth?.user) {
			usePermissionsStore.getState().setPermissions({
				userId: auth.user.id,
				organizationRole: activeMember.role,
				customPermissions,
			});
		} else {
			usePermissionsStore.getState().clearPermissions();
		}
	}, [activeMember, organization, auth?.user, customPermissions]);

	return <Outlet />;
}
