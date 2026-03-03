/**
 * useOrgContext — Single source of truth for org context inside $orgSlug routes.
 *
 * Reads synchronously from TanStack Router context (populated by beforeLoad).
 * Zero extra renders, no Zustand dependency.
 *
 * The `can()` function is built here from the serializable role + customPermissions
 * data returned by $orgSlug's beforeLoad. This avoids Zustand, module-level mutables,
 * and useEffect sync — permissions are available immediately on first render.
 *
 * Only usable inside the /_app/$orgSlug route tree (all normal app pages).
 * Components above $orgSlug (AppLayout, OrganizationSwitcher,
 * NotificationPopover) receive org data via props from OrgLayoutWrapper.
 */

import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import { ORG_ROLE_PERMISSIONS, type OrgAction, type OrgResource, type OrgRole } from "@/lib/permissions/definitions";

const orgSlugRoute = getRouteApi("/_app/$orgSlug");

function buildCan(role: string | undefined, customPermissions: Record<string, string[]> | null) {
	return <R extends OrgResource>(resource: R, action: OrgAction<R>): boolean => {
		if (!role) return false;

		// Static roles (owner, admin, etc.) — use hardcoded matrix
		const staticPerms = ORG_ROLE_PERMISSIONS[role as OrgRole];
		if (staticPerms) {
			const resourcePerms = staticPerms[resource] as readonly string[] | undefined;
			return resourcePerms?.includes(action as string) ?? false;
		}

		// Custom role — use fetched permissions
		if (customPermissions) {
			const resourcePerms = customPermissions[resource];
			return resourcePerms?.includes(action as string) ?? false;
		}

		return false;
	};
}

export function useOrgContext() {
	const { auth, organization, orgSlug, activeMember, customPermissions } = orgSlugRoute.useRouteContext();

	const role = activeMember?.role;
	const can = useMemo(() => buildCan(role, customPermissions ?? null), [role, customPermissions]);

	return {
		organization,
		organizationId: organization.id,
		orgSlug,
		activeMember: activeMember ?? null,
		user: auth.user,
		userId: auth.user?.id ?? null,
		can,
	};
}
