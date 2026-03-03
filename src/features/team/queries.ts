/**
 * Team Query Factories — members, invitations, roles.
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

export const membersQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.members(orgId),
		queryFn: () => getAuthenticatedClient().auth.listMembersAuth(orgId),
		staleTime: CACHE.auth,
	});

export const invitationsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.invitations(orgId),
		queryFn: () => getAuthenticatedClient().auth.listInvitations(orgId),
		staleTime: CACHE.invitations,
	});

export const organizationRolesQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.organizationRoles(orgId),
		queryFn: () => getAuthenticatedClient().auth.listOrganizationRoles(orgId),
		staleTime: CACHE.settings,
	});
