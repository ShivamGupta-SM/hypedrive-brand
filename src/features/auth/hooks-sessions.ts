/**
 * Session Management Hooks — list, revoke, switch sessions.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, getAuthTokenFromCookie, queryKeys } from "@/hooks/api-client";
import { deviceSessionsListQueryOptions, deviceSessionsQueryOptions } from "./queries";

export function useDeviceSessions() {
	const currentToken = getAuthTokenFromCookie();

	const query = useQuery({
		...deviceSessionsQueryOptions(),
	});

	return {
		data: query.data?.sessions ?? [],
		currentToken,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useRevokeSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (sessionToken: string) => {
			const client = getAuthenticatedClient();
			return client.auth.revokeSession({ token: sessionToken });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.deviceSessions() });
		},
	});
}

export function useRevokeOtherSessions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.revokeOtherSessions();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.deviceSessions() });
		},
	});
}

export function useRevokeAllSessions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.revokeSessions();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.deviceSessions() });
		},
	});
}

export function useSetActiveSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (sessionToken: string) => {
			const client = getAuthenticatedClient();
			return client.auth.setActiveSession({ sessionToken });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() });
			queryClient.invalidateQueries({ queryKey: queryKeys.deviceSessions() });
		},
	});
}

export function useDeviceSessionsList() {
	const query = useQuery({
		...deviceSessionsListQueryOptions(),
	});

	return {
		data: query.data?.sessions ?? [],
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useRevokeDeviceSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (sessionToken: string) => {
			const client = getAuthenticatedClient();
			return client.auth.revokeDeviceSession({ sessionToken });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.deviceSessions() });
		},
	});
}
