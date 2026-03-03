/**
 * useOrgContext — Single source of truth for org context inside $orgSlug routes.
 *
 * Reads synchronously from TanStack Router context (populated by beforeLoad).
 * Zero extra renders, no Zustand dependency.
 *
 * Only usable inside the /_app/$orgSlug route tree (all normal app pages).
 * For components above $orgSlug (AppLayout, OrganizationSwitcher,
 * NotificationPopover), use useCurrentOrganization() or useOrganizationId()
 * from the Zustand store instead.
 */

import { getRouteApi } from "@tanstack/react-router";
import type { Organization } from "@/store/organization-store";

const orgSlugRoute = getRouteApi("/_app/$orgSlug");

export function useOrgContext() {
	const { organization, orgSlug, activeMember } = orgSlugRoute.useRouteContext();

	return {
		organization: organization as Organization,
		organizationId: (organization?.id ?? "") as string,
		orgSlug: orgSlug as string,
		activeMember: activeMember ?? null,
	};
}
