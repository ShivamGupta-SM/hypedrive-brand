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
		invalidateEnrollments: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(orgId) }),
		invalidateWallet: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.wallet(orgId) }),
		invalidateInvoices: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.invoices(orgId) }),
		invalidateBankAccounts: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: queryKeys.bankAccount(orgId) }),
		invalidateSessions: () => queryClient.invalidateQueries({ queryKey: queryKeys.deviceSessions() }),
		invalidateUserInfo: () => queryClient.invalidateQueries({ queryKey: queryKeys.userInfo() }),
		invalidateOrganizationProfile: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() }),
				queryClient.invalidateQueries({ queryKey: ["auth", "session-with-orgs"] }),
			]),
		invalidateNotifications: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(orgId) }),
		invalidatePasskeys: () => queryClient.invalidateQueries({ queryKey: queryKeys.passkeys() }),
		invalidateRoles: (orgId: string) =>
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationRoles(orgId) }),
		invalidateLinkedAccounts: () => queryClient.invalidateQueries({ queryKey: queryKeys.linkedAccounts() }),
		invalidateUserInvitations: () => queryClient.invalidateQueries({ queryKey: queryKeys.userInvitations() }),
		invalidateAll: () => queryClient.invalidateQueries(),
	};
}
