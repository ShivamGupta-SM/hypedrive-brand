// Barrel re-exports — backward-compatible facade.
// All hooks now live in src/features/. This file re-exports everything
// so existing imports from the hooks barrel continue to work.

// -- Auth ---------------------------------------------------------------------
export * from "@/features/auth/hooks";
export * from "@/features/auth/hooks-2fa";
export * from "@/features/auth/hooks-account";
export * from "@/features/auth/hooks-invitations";
export * from "@/features/auth/hooks-passkeys";
export * from "@/features/auth/hooks-sessions";
export * from "@/features/auth/hooks-social";
// -- Domain features ----------------------------------------------------------
export * from "@/features/campaigns/hooks";
export * from "@/features/campaigns/mutations";
export * from "@/features/enrollments/hooks";
export * from "@/features/enrollments/mutations";
export * from "@/features/invoices/hooks";
export * from "@/features/listings/hooks";
export * from "@/features/listings/mutations";
export * from "@/features/notifications/hooks";
export * from "@/features/organization/hooks";
export * from "@/features/organization/hooks-roles";
export * from "@/features/organization/hooks-settings";
export * from "@/features/organization/mutations";
export * from "@/features/storage/hooks";
export * from "@/features/team/hooks";
export * from "@/features/team/mutations";
export * from "@/features/wallet/hooks";
export * from "@/features/wallet/mutations";
// API client utilities
export {
	CACHE,
	DEFAULT_PAGE_SIZE,
	getAPIErrorCode,
	getAPIErrorMessage,
	getAssetUrl,
	isAPIError,
	queryKeys,
} from "./api-client";
// -- UI utilities (no feature domain) -----------------------------------------
export * from "./use-confetti";
// -- Utilities (stay in hooks/) -----------------------------------------------
export * from "./use-org-context";
export * from "./use-org-slug";

// =============================================================================
// INVALIDATION HELPERS
// =============================================================================

import { useQueryClient } from "@tanstack/react-query";
import { queryKeys as _queryKeys } from "./api-client";

export function useInvalidateQueries() {
	const queryClient = useQueryClient();

	return {
		invalidateDashboard: (orgId: string) => queryClient.invalidateQueries({ queryKey: _queryKeys.dashboard(orgId) }),
		invalidateCampaigns: (orgId: string) => queryClient.invalidateQueries({ queryKey: _queryKeys.campaigns(orgId) }),
		invalidateListings: (orgId: string) => queryClient.invalidateQueries({ queryKey: _queryKeys.listings(orgId) }),
		invalidateEnrollments: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: _queryKeys.enrollments(orgId) }),
		invalidateWallet: (orgId: string) => queryClient.invalidateQueries({ queryKey: _queryKeys.wallet(orgId) }),
		invalidateInvoices: (orgId: string) => queryClient.invalidateQueries({ queryKey: _queryKeys.invoices(orgId) }),
		invalidateBankAccounts: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: _queryKeys.bankAccount(orgId) }),
		invalidateSessions: () => queryClient.invalidateQueries({ queryKey: _queryKeys.deviceSessions() }),
		invalidateUserInfo: () => queryClient.invalidateQueries({ queryKey: _queryKeys.userInfo() }),
		invalidateOrganizationProfile: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: _queryKeys.organizationProfile() }),
				queryClient.invalidateQueries({ queryKey: ["auth", "session-with-orgs"] }),
			]),
		invalidateNotifications: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: _queryKeys.notifications(orgId) }),
		invalidatePasskeys: () => queryClient.invalidateQueries({ queryKey: _queryKeys.passkeys() }),
		invalidateRoles: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: _queryKeys.organizationRoles(orgId) }),
		invalidateLinkedAccounts: () => queryClient.invalidateQueries({ queryKey: _queryKeys.linkedAccounts() }),
		invalidateUserInvitations: () => queryClient.invalidateQueries({ queryKey: _queryKeys.userInvitations() }),
		invalidateAll: () => queryClient.invalidateQueries(),
	};
}
