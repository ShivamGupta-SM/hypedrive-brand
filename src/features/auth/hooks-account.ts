/**
 * Account Management Hooks — password, email, verification, deletion.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import {
	changeEmailServer,
	changePasswordServer,
	deleteUserServer,
	sendVerificationEmailServer,
	setPasswordServer,
	verifyEmailServer,
} from "./server";

// -- Password -----------------------------------------------------------------

export function useChangePassword() {
	return useMutation({
		mutationFn: async (params: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => {
			return changePasswordServer({ data: { ...params } });
		},
	});
}

export function useSetPassword() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { newPassword: string }) => {
			return setPasswordServer({ data: { ...params } });
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
			return changeEmailServer({ data: { ...params } });
		},
	});
}

export function useVerifyEmail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { token: string; callbackURL?: string }) => {
			return verifyEmailServer({ data: { ...params } });
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
			return sendVerificationEmailServer({ data: { ...params } });
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
			return deleteUserServer({ data: { ...params } });
		},
	});
}
