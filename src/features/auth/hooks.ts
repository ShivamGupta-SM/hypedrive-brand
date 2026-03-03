/**
 * Auth Hooks — login, logout, register, password, session queries.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	forgotPasswordAction,
	loginAction,
	logoutAction,
	registerAction,
	resetPasswordAction,
	socialLoginAction,
} from "@/server/auth-mutations";
import { accountInfoQueryOptions, meQueryOptions, userInfoQueryOptions } from "./queries";

// =============================================================================
// AUTH ERROR
// =============================================================================

class AuthError extends Error {
	code?: string;
	constructor(message: string, code?: string) {
		super(message);
		this.name = "AuthError";
		this.code = code;
	}
}

// =============================================================================
// AUTH MUTATIONS
// =============================================================================

export function useLogin() {
	return useMutation({
		mutationFn: async (params: { email: string; password: string; rememberMe?: boolean }) => {
			const result = await loginAction({
				data: { email: params.email, password: params.password, rememberMe: params.rememberMe },
			});

			if ("twoFactorRedirect" in result && result.twoFactorRedirect) {
				return result;
			}

			if (result.success && "user" in result && result.user) {
				return result;
			}

			const error = "error" in result ? result.error : null;
			throw new AuthError(error?.message || "Invalid email or password", error?.code);
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const result = await logoutAction();
			queryClient.clear();
			return result;
		},
	});
}

export function useRegister() {
	return useMutation({
		mutationFn: async (params: { email: string; password: string; name: string }) => {
			const result = await registerAction({ data: params });

			if (result.success && "user" in result && result.user) {
				return result;
			}

			const error = "error" in result ? result.error : null;
			throw new AuthError(error?.message || "Registration failed", error?.code);
		},
	});
}

export function useForgotPassword() {
	return useMutation({
		mutationFn: async (params: { email: string }) => {
			const origin = typeof window !== "undefined" ? window.location.origin : "";
			const result = await forgotPasswordAction({ data: { email: params.email, origin } });

			if (result.success) {
				return result;
			}

			const error = "error" in result ? result.error : null;
			throw new AuthError(error?.message || "Failed to send reset email", error?.code);
		},
	});
}

export function useUpdatePassword() {
	return useMutation({
		mutationFn: async (params: { token: string; newPassword: string }) => {
			const result = await resetPasswordAction({ data: params });

			if (result.success) {
				return result;
			}

			const error = "error" in result ? result.error : null;
			throw new AuthError(error?.message || "Failed to reset password", error?.code);
		},
	});
}

export function useSocialLogin() {
	return useMutation({
		mutationFn: async (provider: "google" | "apple") => {
			const origin = typeof window !== "undefined" ? window.location.origin : "";
			const result = await socialLoginAction({ data: { provider, origin } });

			if (result.success && "redirectUrl" in result) {
				return result;
			}

			const error = "error" in result ? result.error : null;
			throw new AuthError(error?.message || "Social login failed", error?.code);
		},
	});
}

// =============================================================================
// USER SESSION QUERIES
// =============================================================================

export function useUserInfo() {
	const query = useQuery({
		...userInfoQueryOptions(),
	});

	return {
		data: query.data?.user ?? null,
		session: query.data?.session ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useMe() {
	const query = useQuery({
		...meQueryOptions(),
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useAccountInfo() {
	const query = useQuery({
		...accountInfoQueryOptions(),
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}
