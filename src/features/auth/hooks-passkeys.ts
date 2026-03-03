/**
 * Passkey Hooks — WebAuthn registration, authentication, management.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import { passkeyListQueryOptions } from "./queries";

export function usePasskeyList() {
	const query = useQuery({
		...passkeyListQueryOptions(),
	});

	return {
		data: query.data?.passkeys ?? [],
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function usePasskeyRegisterOptions() {
	return useMutation({
		mutationFn: async (params: { name?: string; authenticatorAttachment?: "platform" | "cross-platform" }) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyRegisterOptions(params);
		},
	});
}

export function usePasskeyRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { response: unknown; name?: string; challengeCookie: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyRegister(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() });
		},
	});
}

export function usePasskeyDelete() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyDelete({ id });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() });
		},
	});
}

export function usePasskeyUpdateName() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { id: string; name: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyUpdateName(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() });
		},
	});
}

export function usePasskeyReauthOptions() {
	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyReauthOptions();
		},
	});
}

export function usePasskeyAuthenticateOptions() {
	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyAuthenticateOptions();
		},
	});
}

export function usePasskeyAuthenticate() {
	return useMutation({
		mutationFn: async (params: { response: unknown; challengeCookie: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyAuthenticate(params);
		},
	});
}
