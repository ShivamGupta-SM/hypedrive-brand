import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "./api-client";

export function useMembers(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.members(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listMembersAuth(organizationId as string);
		},
		enabled: !!organizationId,
		staleTime: 5 * 60 * 1000, // 5 min — member list changes infrequently
	});

	return {
		data: query.data?.members ?? [],
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useInvitations(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.invitations(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listInvitations(organizationId as string);
		},
		enabled: !!organizationId,
		staleTime: 2 * 60 * 1000, // 2 min — invitations can change when members accept
	});

	return {
		data: query.data?.invitations ?? [],
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

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

/**
 * Directly add a user as a member (bypasses invitation flow).
 * Useful when the user is already known (e.g., from search).
 */
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
