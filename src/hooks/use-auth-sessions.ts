import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, getAuthTokenFromCookie, queryKeys } from "./api-client";

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

export function useDeviceSessions() {
	const currentToken = getAuthTokenFromCookie();

	const query = useQuery({
		queryKey: queryKeys.deviceSessions(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listSessions();
		},
	});

	return {
		data: query.data?.sessions ?? [],
		currentToken,
		loading: query.isPending,
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

/**
 * Revoke ALL sessions (including current). Use for "Log out everywhere".
 */
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

/**
 * Switch active session (multi-session support).
 */
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

// =============================================================================
// DEVICE SESSIONS (multi-session)
// =============================================================================

export function useDeviceSessionsList() {
	const query = useQuery({
		queryKey: [...queryKeys.deviceSessions(), "device"] as const,
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listDeviceSessions();
		},
	});

	return {
		data: query.data?.sessions ?? [],
		loading: query.isPending,
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
