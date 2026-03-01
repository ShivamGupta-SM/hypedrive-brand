/**
 * Auth Store — Minimal UI-only state for auth.
 *
 * The cookie (`hd_auth`) is the single source of truth for authentication.
 * This store only holds reactive UI state (user info, loading states).
 * Auth actions (login, logout, etc.) are server functions in auth-actions.ts.
 */

import { useState } from "react";
import { create } from "zustand";
import { getAuthTokenFromCookie } from "@/hooks/api-client";
import {
	forgotPasswordAction,
	loginAction,
	logoutAction,
	registerAction,
	resetPasswordAction,
	socialLoginAction,
} from "@/lib/auth-actions";
import { useOrganizationStore } from "@/store/organization-store";
import { usePermissionsStore } from "@/store/permissions-store";

// Types
interface User {
	id: string;
	name: string;
	email: string;
	image?: string | null;
}

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	organizationStatus?: string;
}

interface LoginParams {
	email: string;
	password: string;
}

interface RegisterParams {
	email: string;
	password: string;
	name: string;
}

interface ForgotPasswordParams {
	email: string;
}

interface ResetPasswordParams {
	token: string;
	newPassword: string;
}

type SocialProvider = "google" | "apple";

// Store interface — UI-only, no token storage
export interface AuthState {
	user: User | null;
	// Keep isAuthenticated for backward compat — derived from cookie on client
	isAuthenticated: boolean;
	setUser: (user: User | null) => void;
	setAuthenticated: (isAuthenticated: boolean) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
	user: null,
	isAuthenticated: false,

	setUser: (user) => set({ user }),
	setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

	clearAuth: () => {
		set({ user: null, isAuthenticated: false });
	},
}));

// =============================================================================
// AUTH ACTION HOOKS — Same API as before, but calling server actions
// =============================================================================

export function useLogin() {
	const [isPending, setIsPending] = useState(false);

	const mutate = async (
		params: LoginParams,
		options?: {
			onSuccess?: () => void;
			onError?: (error: { message: string; code?: string }) => void;
		}
	) => {
		setIsPending(true);
		try {
			const result = await loginAction({ data: params });
			if (result.success && "user" in result && result.user) {
				useAuthStore.getState().setUser(result.user);
				useAuthStore.getState().setAuthenticated(true);
				options?.onSuccess?.();
			} else if ("error" in result && result.error) {
				options?.onError?.({ message: result.error.message, code: result.error.code });
			}
			return result;
		} finally {
			setIsPending(false);
		}
	};

	return { mutate, isPending };
}

export function useLogout() {
	const [isPending, setIsPending] = useState(false);

	const mutate = async () => {
		setIsPending(true);
		try {
			const result = await logoutAction();

			// Clear all client state synchronously to prevent stale UI
			usePermissionsStore.getState().clearPermissions();
			useOrganizationStore.getState().clearOrganization();
			useAuthStore.getState().clearAuth();

			// Clear in-memory auth client cache so next request doesn't reuse stale token
			const { clearAuthCache } = await import("@/hooks/api-client");
			clearAuthCache();

			// Clear React Query cache to prevent stale data on re-login
			const { getQueryClient } = await import("@/router");
			getQueryClient()?.clear();

			return result;
		} finally {
			setIsPending(false);
		}
	};

	return { mutate, isPending };
}

export function useRegister() {
	const [isPending, setIsPending] = useState(false);

	const mutate = async (
		params: RegisterParams,
		options?: {
			onSuccess?: () => void;
			onError?: (error: { message: string; code?: string }) => void;
		}
	) => {
		setIsPending(true);
		try {
			const result = await registerAction({ data: params });
			if (result.success && "user" in result && result.user) {
				useAuthStore.getState().setUser(result.user);
				useAuthStore.getState().setAuthenticated(true);
				options?.onSuccess?.();
			} else if ("error" in result && result.error) {
				options?.onError?.({ message: result.error.message, code: result.error.code });
			}
			return result;
		} finally {
			setIsPending(false);
		}
	};

	return { mutate, isPending };
}

export function useForgotPassword() {
	const [isPending, setIsPending] = useState(false);

	const mutate = async (
		params: ForgotPasswordParams,
		options?: {
			onSuccess?: () => void;
			onError?: (error: { message: string; code?: string }) => void;
		}
	) => {
		setIsPending(true);
		try {
			const origin = typeof window !== "undefined" ? window.location.origin : "";
			const result = await forgotPasswordAction({ data: { email: params.email, origin } });
			if (result.success) {
				options?.onSuccess?.();
			} else if ("error" in result && result.error) {
				options?.onError?.({ message: result.error.message, code: result.error.code });
			}
			return result;
		} finally {
			setIsPending(false);
		}
	};

	return { mutate, isPending };
}

export function useUpdatePassword() {
	const [isPending, setIsPending] = useState(false);

	const mutate = async (
		params: ResetPasswordParams,
		options?: {
			onSuccess?: () => void;
			onError?: (error: { message: string; code?: string }) => void;
		}
	) => {
		setIsPending(true);
		try {
			const result = await resetPasswordAction({ data: params });
			if (result.success) {
				options?.onSuccess?.();
			} else if ("error" in result && result.error) {
				options?.onError?.({ message: result.error.message, code: result.error.code });
			}
			return result;
		} finally {
			setIsPending(false);
		}
	};

	return { mutate, isPending };
}

export function useSocialLogin() {
	const [isPending, setIsPending] = useState(false);

	const mutate = async (
		provider: SocialProvider,
		options?: {
			onSuccess?: (redirectUrl?: string) => void;
			onError?: (error: { message: string; code?: string }) => void;
		}
	) => {
		setIsPending(true);
		try {
			const origin = typeof window !== "undefined" ? window.location.origin : "";
			const result = await socialLoginAction({ data: { provider, origin } });
			if (result.success && "redirectUrl" in result) {
				options?.onSuccess?.(result.redirectUrl);
			} else if ("error" in result && result.error) {
				options?.onError?.({ message: result.error.message, code: result.error.code });
			}
			return result;
		} finally {
			setIsPending(false);
		}
	};

	return { mutate, isPending };
}

export function useIsAuthenticated() {
	return { data: { authenticated: !!getAuthTokenFromCookie() }, isLoading: false };
}
