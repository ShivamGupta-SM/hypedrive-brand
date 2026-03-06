/**
 * Team Mutations — invite, cancel, update role, remove, add.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import {
	addMemberServer,
	batchMembersServer,
	cancelInvitationServer,
	inviteMemberServer,
	removeMemberServer,
	updateMemberRoleServer,
} from "./server";

export function useInviteMember(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { email: string; role: "owner" | "admin" | "member" }) => {
			return inviteMemberServer({ data: { orgId: organizationId as string, ...params, idempotencyKey: crypto.randomUUID() } });
		},
		onSuccess: () => {
			if (organizationId) {
				queryClient.invalidateQueries({ queryKey: queryKeys.invitations(organizationId) });
			}
		},
	});
}

export function useCancelInvitation(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (invitationId: string) => {
			return cancelInvitationServer({ data: { orgId: organizationId as string, invitationId } });
		},
		onSuccess: () => {
			if (organizationId) {
				queryClient.invalidateQueries({ queryKey: queryKeys.invitations(organizationId) });
			}
		},
	});
}

export function useUpdateMemberRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { memberId: string; role: "owner" | "admin" | "member" }) => {
			return updateMemberRoleServer({
				data: { orgId: organizationId as string, memberId: params.memberId, role: params.role },
			});
		},
		onSuccess: () => {
			if (organizationId) {
				queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
			}
		},
	});
}

export function useRemoveMember(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (memberIdOrEmail: string) => {
			return removeMemberServer({ data: { orgId: organizationId as string, memberIdOrEmail } });
		},
		onSuccess: () => {
			if (organizationId) {
				queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
			}
		},
	});
}

export function useAddMember(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { userId: string; role: "owner" | "admin" | "member" }) => {
			return addMemberServer({ data: { orgId: organizationId as string, ...params, idempotencyKey: crypto.randomUUID() } });
		},
		onSuccess: () => {
			if (organizationId) {
				queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
			}
		},
	});
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

export function useBatchMembers() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			organizationId,
			action,
			memberIds,
		}: {
			organizationId: string;
			action: "remove";
			memberIds: string[];
		}) => {
			return batchMembersServer({
				data: { orgId: organizationId, action, memberIds },
			});
		},
		onSuccess: (_, v) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.members(v.organizationId) });
		},
	});
}
