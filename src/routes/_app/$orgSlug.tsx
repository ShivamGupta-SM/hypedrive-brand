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
import { NotFoundPage } from "@/components/shared/not-found-page";
import { CACHE, queryKeys } from "@/hooks/api-client";
import {
	clearCustomRolePermissions,
	ORG_ROLE_PERMISSIONS,
	registerCustomRolePermissions,
} from "@/lib/permissions/access-control-client";
import { getActiveMemberFromServer, getOrgRolesFromServer } from "@/lib/server-auth";
import { useAuthStore } from "@/store/auth-store";
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

		// Fetch active member + org roles in parallel for RBAC, cached per org.
		// Both are fired concurrently — roles are only used if the member has a custom role,
		// but fetching speculatively avoids a sequential waterfall.
		// Wrapped in try-catch so a transient fetch error during client hydration
		// doesn't bubble up to the root error boundary and flash "Something went wrong".
		let member: { role: string } | null = null;
		let customPermissions: Record<string, string[]> | null = null;

		try {
			const [memberResult, rolesResult] = await Promise.all([
				context.queryClient.ensureQueryData({
					queryKey: queryKeys.activeMember(org.id),
					queryFn: () => getActiveMemberFromServer({ data: { organizationId: org.id } }),
					staleTime: CACHE.auth,
				}),
				context.queryClient.ensureQueryData({
					queryKey: queryKeys.organizationRoles(org.id),
					queryFn: () => getOrgRolesFromServer({ data: { organizationId: org.id } }),
					staleTime: CACHE.settings,
				}),
			]);
			member = memberResult.member;

			// If member has a custom role (not in the hardcoded matrix), resolve its permissions
			if (member?.role && !(member.role in ORG_ROLE_PERMISSIONS)) {
				const memberRole = member.role;
				const match = rolesResult.roles.find((r) => r.role === memberRole);
				customPermissions = match?.permission ?? null;

				// Register immediately for SSR-time rendering
				registerCustomRolePermissions(customPermissions);
			}
		} catch {
			// Transient error — clear any stale custom role permissions from previous org
			clearCustomRolePermissions();
		}

		return {
			organization: org,
			orgSlug: params.orgSlug,
			activeMember: member,
			customPermissions,
		};
	},
	component: OrgLayoutWrapper,
	notFoundComponent: OrgNotFound,
});

function OrgNotFound() {
	const { orgSlug } = Route.useParams();
	return <NotFoundPage fullScreen={false} backButtonLabel="Back to Dashboard" backButtonHref={`/${orgSlug}`} />;
}

function OrgLayoutWrapper() {
	const { organization, organizations, activeMember, customPermissions } = Route.useRouteContext();
	const userId = useAuthStore((s) => s.user?.id);

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
		if (activeMember?.role && organization && userId) {
			usePermissionsStore.getState().setPermissions({
				userId,
				organizationRole: activeMember.role,
				customPermissions,
			});
		} else {
			usePermissionsStore.getState().clearPermissions();
		}
	}, [activeMember, organization, userId, customPermissions]);

	return <Outlet />;
}
