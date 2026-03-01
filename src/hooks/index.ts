// API client utilities

// Permissions re-export
export { type PermissionContext, usePermissionsStore } from "@/store/permissions-store";
export {
	apiClient,
	DEFAULT_PAGE_SIZE,
	getAPIErrorCode,
	getAPIErrorMessage,
	getAssetUrl,
	getAuthenticatedClient,
	isAPIError,
	queryKeys,
} from "./api-client";
export * from "./use-auth";
export * from "./use-campaigns";
export * from "./use-confetti";
// Domain hooks
export * from "./use-dashboard";
export * from "./use-enrollments";
export * from "./use-invoices";
export * from "./use-listings";
export * from "./use-org-slug";
export * from "./use-organization";
export * from "./use-storage";
export * from "./use-team";
export * from "./use-wallet";

// =============================================================================
// INVALIDATION HELPERS
// =============================================================================

import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./api-client";

export function useInvalidateQueries() {
	const queryClient = useQueryClient();

	return {
		invalidateDashboard: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(orgId) }),
		invalidateCampaigns: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(orgId) }),
		invalidateListings: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.listings(orgId) }),
		invalidateEnrollments: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(orgId) }),
		invalidateWallet: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.wallet(orgId) }),
		invalidateInvoices: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.invoices(orgId) }),
		invalidateBankAccounts: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: queryKeys.bankAccount(orgId) }),
		invalidateSessions: () => queryClient.invalidateQueries({ queryKey: queryKeys.deviceSessions() }),
		invalidateUserInfo: () => queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() }),
		invalidateOrganizationProfile: () => queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() }),
		invalidateNotifications: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(orgId) }),
		invalidatePasskeys: () => queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() }),
		invalidateRoles: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.organizationRoles(orgId) }),
		invalidateLinkedAccounts: () => queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts() }),
		invalidateUserInvitations: () => queryClient.invalidateQueries({ queryKey: queryKeys.userInvitations() }),
		invalidateAll: () => queryClient.invalidateQueries(),
	};
}
