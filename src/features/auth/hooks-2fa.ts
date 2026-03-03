/**
 * Two-Factor Authentication Hooks.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

export function useTwoFactorEnable() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { password: string; issuer?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorEnable(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() });
		},
	});
}

export function useTwoFactorDisable() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { password: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorDisable(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() });
		},
	});
}

export function useTwoFactorGetTotpUri() {
	return useMutation({
		mutationFn: async (params: { password: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorGetTotpUri(params);
		},
	});
}

export function useTwoFactorVerifyTotp() {
	return useMutation({
		mutationFn: async (params: { twoFactorToken: string; code: string; trustDevice?: boolean }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorVerifyTotp(params);
		},
	});
}

export function useTwoFactorGenerateBackupCodes() {
	return useMutation({
		mutationFn: async (params: { password: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorGenerateBackupCodes(params);
		},
	});
}

export function useTwoFactorSendOtp() {
	return useMutation({
		mutationFn: async (params: { twoFactorToken: string; trustDevice?: boolean }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorSendOtp(params);
		},
	});
}

export function useTwoFactorVerifyOtp() {
	return useMutation({
		mutationFn: async (params: { twoFactorToken: string; otp: string; trustDevice?: boolean }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorVerifyOtp(params);
		},
	});
}

export function useTwoFactorViewBackupCodes() {
	return useMutation({
		mutationFn: async (params: { password: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorViewBackupCodes(params);
		},
	});
}

export function useTwoFactorVerifyBackupCode() {
	return useMutation({
		mutationFn: async (params: { twoFactorToken: string; code: string; trustDevice?: boolean }) => {
			const client = getAuthenticatedClient();
			return client.auth.twoFactorVerifyBackupCode(params);
		},
	});
}
