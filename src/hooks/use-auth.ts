import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	forgotPasswordAction,
	loginAction,
	logoutAction,
	registerAction,
	resetPasswordAction,
	socialLoginAction,
} from "@/lib/auth-actions";
import { useAuthStore } from "@/store/auth-store";
import { useOrganizationStore } from "@/store/organization-store";
import { usePermissionsStore } from "@/store/permissions-store";
import { clearAuthCache, getAuthenticatedClient, getAuthTokenFromCookie, queryKeys } from "./api-client";

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
// AUTH MUTATION HOOKS — TanStack Query mutations calling server actions
// =============================================================================

export function useLogin() {
	return useMutation({
		mutationFn: async (params: { email: string; password: string; rememberMe?: boolean }) => {
			const result = await loginAction({
				data: { email: params.email, password: params.password, rememberMe: params.rememberMe },
			});

			// 2FA required — return as success (not an error) so caller can handle
			if ("twoFactorRedirect" in result && result.twoFactorRedirect) {
				return result;
			}

			if (result.success && "user" in result && result.user) {
				useAuthStore.getState().setUser(result.user);
				useAuthStore.getState().setAuthenticated(true);
				return result;
			}

			// Error case — throw so TanStack Query treats it as mutation error
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

			// Clear all client state synchronously to prevent stale UI
			usePermissionsStore.getState().clearPermissions();
			useOrganizationStore.getState().clearOrganization();
			useAuthStore.getState().clearAuth();
			clearAuthCache();
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
				useAuthStore.getState().setUser(result.user);
				useAuthStore.getState().setAuthenticated(true);
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
// USER INFO
// =============================================================================

export function useUserInfo() {
	const query = useQuery({
		queryKey: queryKeys.userInfo(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.getSession();
		},
	});

	return {
		data: query.data?.user ?? null,
		session: query.data?.session ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

/**
 * Fetch current user profile via /auth/me.
 * Returns auth data including role, org IDs, 2FA status, etc.
 */
export function useMe() {
	const query = useQuery({
		queryKey: [...queryKeys.userInfo(), "me"] as const,
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.me();
		},
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

/**
 * Fetch account info — linked providers, profile details.
 */
export function useAccountInfo() {
	const query = useQuery({
		queryKey: [...queryKeys.userInfo(), "accountInfo"] as const,
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.getAccountInfo();
		},
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

// =============================================================================
// FULL ORGANIZATION (via auth service)
// =============================================================================

export function useFullOrganization(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.fullOrganization(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.getFullOrganization(organizationId as string, {});
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

// =============================================================================
// UPDATE USER/ORGANIZATION (via auth service)
// =============================================================================

export function useUpdateOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ organizationId, ...params }: { organizationId: string; name?: string; logo?: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.updateOrganization(organizationId, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
		},
	});
}

// =============================================================================
// PASSWORD & EMAIL
// =============================================================================

export function useChangePassword() {
	return useMutation({
		mutationFn: async (params: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => {
			const client = getAuthenticatedClient();
			return client.auth.changePassword(params);
		},
	});
}

export function useChangeEmail() {
	return useMutation({
		mutationFn: async (params: { newEmail: string; callbackURL?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.changeEmail(params);
		},
	});
}

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
		loading: query.isLoading,
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
// TWO-FACTOR AUTHENTICATION
// =============================================================================

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

// =============================================================================
// PASSKEYS
// =============================================================================

export function usePasskeyList() {
	const query = useQuery({
		queryKey: queryKeys.passkeys(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyList();
		},
	});

	return {
		data: query.data?.passkeys ?? [],
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function usePasskeyRegisterOptions() {
	return useMutation({
		mutationFn: async (params: { name?: string; authenticatorAttachment?: "platform" | "cross-platform" }) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyRegisterOptions(params);
		},
	});
}

export function usePasskeyRegister() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { response: unknown; name?: string; challengeCookie: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyRegister(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() });
		},
	});
}

export function usePasskeyDelete() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyDelete({ id });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() });
		},
	});
}

export function usePasskeyUpdateName() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { id: string; name: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyUpdateName(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() });
		},
	});
}

export function usePasskeyReauthOptions() {
	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyReauthOptions();
		},
	});
}

export function usePasskeyAuthenticateOptions() {
	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyAuthenticateOptions();
		},
	});
}

export function usePasskeyAuthenticate() {
	return useMutation({
		mutationFn: async (params: { response: unknown; challengeCookie: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.passkeyAuthenticate(params);
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
		loading: query.isLoading,
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

// =============================================================================
// EMAIL VERIFICATION
// =============================================================================

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

// =============================================================================
// SET PASSWORD (for social-auth users without a password)
// =============================================================================

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

// =============================================================================
// SOCIAL ACCOUNT LINKING
// =============================================================================

export function useLinkedAccounts() {
	const query = useQuery({
		queryKey: queryKeys.linkedAccounts(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listAccounts();
		},
	});

	return {
		data: query.data?.accounts ?? [],
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useLinkSocial() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			provider: string;
			callbackURL?: string;
			errorCallbackURL?: string;
			scopes?: string[];
		}) => {
			const client = getAuthenticatedClient();
			return client.auth.linkSocial(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts() });
		},
	});
}

export function useUnlinkAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { providerId: string; accountId?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.unlinkAccount(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts() });
		},
	});
}

// =============================================================================
// USER INVITATIONS (received invitations)
// =============================================================================

export function useUserInvitations() {
	const query = useQuery({
		queryKey: queryKeys.userInvitations(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listUserInvitations();
		},
	});

	return {
		data: query.data?.invitations ?? [],
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useGetInvitation() {
	return useMutation({
		mutationFn: async (invitationId: string) => {
			const client = getAuthenticatedClient();
			return client.auth.getInvitation({ invitationId });
		},
	});
}

export function useAcceptInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { organizationId: string; invitationId: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.acceptInvitation(params.organizationId, params.invitationId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInvitations() });
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
		},
	});
}

export function useRejectInvitation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { organizationId: string; invitationId: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.rejectInvitation(params.organizationId, params.invitationId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.userInvitations() });
		},
	});
}

// =============================================================================
// LEAVE ORGANIZATION
// =============================================================================

export function useLeaveOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (organizationId: string) => {
			const client = getAuthenticatedClient();
			return client.auth.leaveOrganization(organizationId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
		},
	});
}

// =============================================================================
// CHECK SLUG
// =============================================================================

export function useCheckSlug() {
	return useMutation({
		mutationFn: async (slug: string) => {
			const client = getAuthenticatedClient();
			return client.auth.checkSlug({ slug });
		},
	});
}

// =============================================================================
// ORGANIZATION ROLE (get + update)
// =============================================================================

export function useOrganizationRole(organizationId: string | undefined, roleId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.organizationRole(organizationId || "", roleId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.getOrganizationRole(organizationId as string, roleId as string);
		},
		enabled: !!organizationId && !!roleId,
	});

	return {
		data: query.data?.role ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useUpdateOrganizationRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { roleId: string; permission?: { [key: string]: string[] } }) => {
			const client = getAuthenticatedClient();
			return client.auth.updateOrganizationRole(organizationId as string, params.roleId, {
				permission: params.permission,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.organizationRoles(organizationId || ""),
			});
		},
	});
}

// =============================================================================
// ACCOUNT DELETION
// =============================================================================

export function useDeleteUser() {
	return useMutation({
		mutationFn: async (params: { password?: string; callbackURL?: string }) => {
			const client = getAuthenticatedClient();
			return client.auth.deleteUser(params);
		},
	});
}
