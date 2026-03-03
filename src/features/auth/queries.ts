/**
 * Auth Query Option Factories
 * Reusable queryOptions for auth-related queries — can be used in hooks, loaders, or prefetching.
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

// =============================================================================
// USER SESSION
// =============================================================================

export function userInfoQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.userInfo(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.getSession();
		},
		staleTime: CACHE.auth,
	});
}

export function meQueryOptions() {
	return queryOptions({
		queryKey: [...queryKeys.userInfo(), "me"] as const,
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.me();
		},
		staleTime: CACHE.auth,
	});
}

export function accountInfoQueryOptions() {
	return queryOptions({
		queryKey: [...queryKeys.userInfo(), "accountInfo"] as const,
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.getAccountInfo();
		},
		staleTime: CACHE.auth,
	});
}

// =============================================================================
// PASSKEYS
// =============================================================================

export function passkeyListQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.passkeys(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyList();
		},
		staleTime: CACHE.auth,
	});
}

// =============================================================================
// SESSIONS
// =============================================================================

export function deviceSessionsQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.deviceSessions(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listSessions();
		},
		staleTime: CACHE.auth,
	});
}

export function deviceSessionsListQueryOptions() {
	return queryOptions({
		queryKey: [...queryKeys.deviceSessions(), "device"] as const,
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listDeviceSessions();
		},
		staleTime: CACHE.auth,
	});
}

// =============================================================================
// SOCIAL / LINKED ACCOUNTS
// =============================================================================

export function linkedAccountsQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.linkedAccounts(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listAccounts();
		},
		staleTime: CACHE.auth,
	});
}

// =============================================================================
// USER INVITATIONS
// =============================================================================

export function userInvitationsQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.userInvitations(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listUserInvitations();
		},
		staleTime: CACHE.invitations,
	});
}
