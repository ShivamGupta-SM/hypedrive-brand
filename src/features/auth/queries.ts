/**
 * Auth Query Option Factories
 * Reusable queryOptions for auth-related queries — can be used in hooks, loaders, or prefetching.
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, queryKeys } from "@/hooks/api-client";
import {
	getAccountInfoServer,
	getSessionServer,
	listAccountsServer,
	listDeviceSessionsServer,
	listSessionsServer,
	listUserInvitationsServer,
	meServer,
	passkeyListServer,
} from "./server";

// =============================================================================
// USER SESSION
// =============================================================================

export function userInfoQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.userInfo(),
		queryFn: async () => {
			return getSessionServer();
		},
		staleTime: CACHE.auth,
	});
}

export function meQueryOptions() {
	return queryOptions({
		queryKey: [...queryKeys.userInfo(), "me"] as const,
		queryFn: async () => {
			return meServer();
		},
		staleTime: CACHE.auth,
	});
}

export function accountInfoQueryOptions() {
	return queryOptions({
		queryKey: [...queryKeys.userInfo(), "accountInfo"] as const,
		queryFn: async () => {
			return getAccountInfoServer();
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
			return passkeyListServer();
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
			return listSessionsServer();
		},
		staleTime: CACHE.auth,
	});
}

export function deviceSessionsListQueryOptions() {
	return queryOptions({
		queryKey: [...queryKeys.deviceSessions(), "device"] as const,
		queryFn: async () => {
			return listDeviceSessionsServer();
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
			return listAccountsServer();
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
			return listUserInvitationsServer();
		},
		staleTime: CACHE.invitations,
	});
}
