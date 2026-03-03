/**
 * User Invitation Hooks — invitations received by the current user.
 * Org-sent invitations (create/cancel) are in features/team/mutations.ts.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import { userInvitationsQueryOptions } from "./queries";

export function useUserInvitations() {
	const query = useQuery({
		...userInvitationsQueryOptions(),
	});

	return {
		data: query.data?.invitations ?? [],
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useGetInvitation() {
	return useMutation({
		mutationFn: async (invitationId: string) => {
			const client = getAuthenticatedClient();
			return client.auth.getInvitation({ invitationId });
		},
	});
}

export function useAcceptInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { organizationId: string; invitationId: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.acceptInvitation(params.organizationId, params.invitationId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInvitations() });
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
			queryClient.invalidateQueries({ queryKey: ["auth", "session-with-orgs"] });
		},
	});
}

export function useRejectInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { organizationId: string; invitationId: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.rejectInvitation(params.organizationId, params.invitationId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInvitations() });
		},
	});
}
