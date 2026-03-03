/**
 * Team Mutations — invite, cancel, update role, remove, add.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

export function useInviteMember(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { email: string; role: "owner" | "admin" | "member" }) => {
			const client = getAuthenticatedClient();
			return client.auth.inviteMemberAuth(organizationId as string, params);
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
			const client = getAuthenticatedClient();
			return client.auth.cancelInvitation(organizationId as string, invitationId);
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
			const client = getAuthenticatedClient();
			return client.auth.updateMemberRole(organizationId as string, params.memberId, {
				role: params.role,
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
			const client = getAuthenticatedClient();
			return client.auth.removeMember(organizationId as string, memberIdOrEmail, {});
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
			const client = getAuthenticatedClient();
			return client.auth.addMember(organizationId as string, params);
		},
		onSuccess: () => {
			if (organizationId) {
				queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) });
			}
		},
	});
}
