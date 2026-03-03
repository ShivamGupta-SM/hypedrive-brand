/**
 * useOrgContext — Single source of truth for org context inside $orgSlug routes.
 *
 * Reads synchronously from TanStack Router context (populated by beforeLoad).
 * Zero extra renders, no Zustand dependency.
 *
 * TanStack Router infers the correct non-optional types from $orgSlug's
 * beforeLoad return — no manual casting needed.
 *
 * Only usable inside the /_app/$orgSlug route tree (all normal app pages).
 * For components above $orgSlug (AppLayout, OrganizationSwitcher,
 * NotificationPopover), use useCurrentOrganization() or useOrganizationId()
 * from the Zustand store instead.
 */

import { getRouteApi } from "@tanstack/react-router";

const orgSlugRoute = getRouteApi("/_app/$orgSlug");

export function useOrgContext() {
	const { organization, orgSlug, activeMember } = orgSlugRoute.useRouteContext();

	return {
		organization,
		organizationId: organization.id,
		orgSlug,
		activeMember: activeMember ?? null,
	};
}
