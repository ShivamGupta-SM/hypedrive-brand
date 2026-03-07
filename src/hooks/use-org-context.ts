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

function resolvePermissions(
	role: string | undefined,
	customPermissions: Record<string, string[]> | null,
): Record<string, readonly string[]> | null {
	if (!role) return null;
	const staticPerms = ORG_ROLE_PERMISSIONS[role as OrgRole];
	if (staticPerms) return staticPerms;
	return customPermissions;
}

function buildCan(permissions: Record<string, readonly string[]> | null) {
	return <R extends OrgResource>(resource: R, action: OrgAction<R>): boolean => {
		if (!permissions) return false;
		return permissions[resource]?.includes(action as string) ?? false;
	};
}

export function useOrgContext() {
	const { auth, organization, orgSlug, activeMember, customPermissions } = orgSlugRoute.useRouteContext();

	const role = activeMember?.role;
	const permissions = useMemo(() => resolvePermissions(role, customPermissions ?? null), [role, customPermissions]);
	const can = useMemo(() => buildCan(permissions), [permissions]);

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
