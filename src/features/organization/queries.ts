/**
 * Organization Query Factories — dashboard, activity, setup, settings.
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

export const dashboardQueryOptions = (orgId: string, params?: { days?: number }) =>
	queryOptions({
		queryKey: [...queryKeys.dashboard(orgId), params?.days] as const,
		queryFn: () => getAuthenticatedClient().brand.getDashboardOverview(orgId, { days: params?.days }),
		staleTime: CACHE.dashboard,
	});

export const organizationActivityQueryOptions = (
	orgId: string,
	params?: {
		cursor?: string;
		limit?: number;
		entityType?: "campaign" | "enrollment" | "invoice" | "listing" | "organization" | "withdrawal";
	}
) =>
	queryOptions({
		queryKey: queryKeys.organizationActivity(orgId, params),
		queryFn: () => getAuthenticatedClient().brand.getOrganizationActivity(orgId, params || {}),
		staleTime: CACHE.activity,
	});

export const setupProgressQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.setupProgress(orgId),
		queryFn: () => getAuthenticatedClient().brand.getSetupProgress(orgId),
		staleTime: CACHE.dashboard,
	});

export const unifiedSearchQueryOptions = (orgId: string, params: { q: string; cursor?: string; limit?: number }) =>
	queryOptions({
		queryKey: queryKeys.search(orgId, params),
		queryFn: () => getAuthenticatedClient().brand.unifiedSearch(orgId, params),
		staleTime: CACHE.activity,
	});

export const activeMemberQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.activeMember(orgId),
		queryFn: () => getAuthenticatedClient().auth.getActiveMember(orgId),
		staleTime: CACHE.auth,
	});

export const organizationSettingsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.organization(orgId),
		queryFn: () => getAuthenticatedClient().brand.getOrganization(orgId),
		staleTime: CACHE.settings,
	});

export const bankAccountQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.bankAccount(orgId),
		queryFn: () => getAuthenticatedClient().brand.getOrganizationBankAccount(orgId, {}),
		staleTime: CACHE.settings,
	});

export const gstDetailsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.gstDetails(orgId),
		queryFn: () => getAuthenticatedClient().brand.getGSTDetails(orgId),
		staleTime: CACHE.static,
	});
