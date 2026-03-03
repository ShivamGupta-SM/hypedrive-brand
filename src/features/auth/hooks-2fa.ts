/**
 * Two-Factor Authentication Hooks.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import {
	twoFactorDisableServer,
	twoFactorEnableServer,
	twoFactorGenerateBackupCodesServer,
	twoFactorGetTotpUriServer,
	twoFactorSendOtpServer,
	twoFactorVerifyBackupCodeServer,
	twoFactorVerifyOtpServer,
	twoFactorVerifyTotpServer,
	twoFactorViewBackupCodesServer,
} from "./server";

export function useTwoFactorEnable() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (params: { password: string; issuer?: string }) => {
			return twoFactorEnableServer({ data: { ...params } });
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
			return twoFactorDisableServer({ data: { ...params } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() });
		},
	});
}

export function useTwoFactorGetTotpUri() {
	return useMutation({
		mutationFn: async (params: { password: string }) => {
			return twoFactorGetTotpUriServer({ data: { ...params } });
		},
	});
}

export function useTwoFactorVerifyTotp() {
	return useMutation({
		mutationFn: async (params: { twoFactorToken: string; code: string; trustDevice?: boolean }) => {
			return twoFactorVerifyTotpServer({ data: { ...params } });
		},
	});
}

export function useTwoFactorGenerateBackupCodes() {
	return useMutation({
		mutationFn: async (params: { password: string }) => {
			return twoFactorGenerateBackupCodesServer({ data: { ...params } });
		},
	});
}

export function useTwoFactorSendOtp() {
	return useMutation({
		mutationFn: async (params: { twoFactorToken: string; trustDevice?: boolean }) => {
			return twoFactorSendOtpServer({ data: { ...params } });
		},
	});
}

export function useTwoFactorVerifyOtp() {
	return useMutation({
		mutationFn: async (params: { twoFactorToken: string; otp: string; trustDevice?: boolean }) => {
			return twoFactorVerifyOtpServer({ data: { ...params } });
		},
	});
}

export function useTwoFactorViewBackupCodes() {
	return useMutation({
		mutationFn: async (params: { password: string }) => {
			return twoFactorViewBackupCodesServer({ data: { ...params } });
		},
	});
}

export function useTwoFactorVerifyBackupCode() {
	return useMutation({
		mutationFn: async (params: { twoFactorToken: string; code: string; trustDevice?: boolean }) => {
			return twoFactorVerifyBackupCodeServer({ data: { ...params } });
		},
	});
}
