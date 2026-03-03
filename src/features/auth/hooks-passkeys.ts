/**
 * Passkey Hooks — WebAuthn registration, authentication, management.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import { passkeyListQueryOptions } from "./queries";
import {
	passkeyAuthenticateOptionsServer,
	passkeyAuthenticateServer,
	passkeyDeleteServer,
	passkeyReauthOptionsServer,
	passkeyRegisterOptionsServer,
	passkeyRegisterServer,
	passkeyUpdateNameServer,
} from "./server";

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
			return passkeyRegisterOptionsServer({ data: { ...params } });
		},
	});
}

export function usePasskeyRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { response: unknown; name?: string; challengeCookie: string }) => {
			return passkeyRegisterServer({ data: { ...params } });
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
			return passkeyDeleteServer({ data: { id } });
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
			return passkeyUpdateNameServer({ data: { ...params } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() });
		},
	});
}

export function usePasskeyReauthOptions() {
	return useMutation({
		mutationFn: async () => {
			return passkeyReauthOptionsServer();
		},
	});
}

export function usePasskeyAuthenticateOptions() {
	return useMutation({
		mutationFn: async () => {
			return passkeyAuthenticateOptionsServer();
		},
	});
}

export function usePasskeyAuthenticate() {
	return useMutation({
		mutationFn: async (params: { response: unknown; challengeCookie: string }) => {
			return passkeyAuthenticateServer({ data: { ...params } });
		},
	});
}
