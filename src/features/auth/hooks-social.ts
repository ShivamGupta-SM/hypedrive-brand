/**
 * Social Account Linking Hooks.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import { linkedAccountsQueryOptions } from "./queries";

export function useLinkedAccounts() {
	const query = useQuery({
		...linkedAccountsQueryOptions(),
	});

	return {
		data: query.data?.accounts ?? [],
		loading: query.isPending && !query.data,
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
