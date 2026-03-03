/**
 * Session Management Hooks — list, revoke, switch sessions.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import { deviceSessionsListQueryOptions, deviceSessionsQueryOptions } from "./queries";
import {
	getCurrentSessionIdServer,
	revokeDeviceSessionServer,
	revokeOtherSessionsServer,
	revokeSessionServer,
	revokeSessionsServer,
	setActiveSessionServer,
} from "./server";

export function useDeviceSessions() {
	const fingerprintQuery = useQuery({
		queryKey: ["auth", "currentSessionId"],
		queryFn: () => getCurrentSessionIdServer(),
	});

	const query = useQuery({
		...deviceSessionsQueryOptions(),
	});

	return {
		data: query.data?.sessions ?? [],
		currentToken: fingerprintQuery.data?.sessionToken ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useRevokeSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (sessionToken: string) => {
			return revokeSessionServer({ data: { token: sessionToken } });
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
			return revokeOtherSessionsServer();
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
			return revokeSessionsServer();
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
			return setActiveSessionServer({ data: { sessionToken } });
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
			return revokeDeviceSessionServer({ data: { sessionToken } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.deviceSessions() });
		},
	});
}
