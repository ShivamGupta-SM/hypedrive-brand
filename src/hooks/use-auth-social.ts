import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "./api-client";

// =============================================================================
// SOCIAL ACCOUNT LINKING
// =============================================================================

export function useLinkedAccounts() {
	const query = useQuery({
		queryKey: queryKeys.linkedAccounts(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listAccounts();
		},
	});

	return {
		data: query.data?.accounts ?? [],
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useLinkSocial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			provider: string;
			callbackURL?: string;
			errorCallbackURL?: string;
			scopes?: string[];
		}) => {
			const client = getAuthenticatedClient();
			return client.auth.linkSocial(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts() });
		},
	});
}

export function useUnlinkAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { providerId: string; accountId?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.unlinkAccount(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts() });
		},
	});
}
