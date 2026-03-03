/**
 * Account Management Hooks — password, email, verification, deletion.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

// -- Password -----------------------------------------------------------------

export function useChangePassword() {
	return useMutation({
		mutationFn: async (params: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => {
			const client = getAuthenticatedClient();
			return client.auth.changePassword(params);
		},
	});
}

export function useSetPassword() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { newPassword: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.setPassword(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() });
		},
	});
}

// -- Email --------------------------------------------------------------------

export function useChangeEmail() {
	return useMutation({
		mutationFn: async (params: { newEmail: string; callbackURL?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.changeEmail(params);
		},
	});
}

export function useVerifyEmail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { token: string; callbackURL?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.verifyEmail(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() });
		},
	});
}

export function useSendVerificationEmail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { email: string; callbackURL?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.sendVerificationEmail(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() });
		},
	});
}

// -- Account Deletion ---------------------------------------------------------

export function useDeleteUser() {
	return useMutation({
		mutationFn: async (params: { password?: string; callbackURL?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.deleteUser(params);
		},
	});
}
