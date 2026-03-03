/**
 * Team Query Factories — members, invitations, roles.
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, queryKeys } from "@/hooks/api-client";
import { listInvitationsServer, listMembersServer, listOrgRolesServer } from "./server";

export const membersQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.members(orgId),
		queryFn: () => listMembersServer({ data: { orgId } }),
		staleTime: CACHE.auth,
	});

export const invitationsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.invitations(orgId),
		queryFn: () => listInvitationsServer({ data: { orgId } }),
		staleTime: CACHE.invitations,
	});

export const organizationRolesQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.organizationRoles(orgId),
		queryFn: () => listOrgRolesServer({ data: { orgId } }),
		staleTime: CACHE.settings,
	});
