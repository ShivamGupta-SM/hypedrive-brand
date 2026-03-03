/**
 * User Invitation Hooks — invitations received by the current user.
 * Org-sent invitations (create/cancel) are in features/team/mutations.ts.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import { userInvitationsQueryOptions } from "./queries";
import { acceptInvitationServer, getInvitationServer, rejectInvitationServer } from "./server";

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
			return getInvitationServer({ data: { invitationId } });
		},
	});
}

export function useAcceptInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { organizationId: string; invitationId: string }) => {
			return acceptInvitationServer({ data: { ...params } });
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
			return rejectInvitationServer({ data: { ...params } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInvitations() });
		},
	});
}
