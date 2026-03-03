/**
 * Organization Query Factories — dashboard, activity, setup, settings.
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, queryKeys } from "@/hooks/api-client";
import {
	getActiveMemberServer,
	getBankAccountServer,
	getDashboardServer,
	getGSTDetailsServer,
	getOrganizationActivityServer,
	getOrganizationServer,
	getSetupProgressServer,
	unifiedSearchServer,
} from "./server";

export const dashboardQueryOptions = (orgId: string, params?: { days?: number }) =>
	queryOptions({
		queryKey: [...queryKeys.dashboard(orgId), params?.days] as const,
		queryFn: () => getDashboardServer({ data: { orgId, days: params?.days } }),
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
		queryFn: () => getOrganizationActivityServer({ data: { orgId, params } }),
		staleTime: CACHE.activity,
	});

export const setupProgressQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.setupProgress(orgId),
		queryFn: () => getSetupProgressServer({ data: { orgId } }),
		staleTime: CACHE.dashboard,
	});

export const unifiedSearchQueryOptions = (orgId: string, params: { q: string; cursor?: string; limit?: number }) =>
	queryOptions({
		queryKey: queryKeys.search(orgId, params),
		queryFn: () => unifiedSearchServer({ data: { orgId, params } }),
		staleTime: CACHE.activity,
	});

export const activeMemberQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.activeMember(orgId),
		queryFn: () => getActiveMemberServer({ data: { orgId } }),
		staleTime: CACHE.auth,
	});

export const organizationSettingsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.organization(orgId),
		queryFn: () => getOrganizationServer({ data: { orgId } }),
		staleTime: CACHE.settings,
	});

export const bankAccountQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.bankAccount(orgId),
		queryFn: () => getBankAccountServer({ data: { orgId } }),
		staleTime: CACHE.settings,
	});

export const gstDetailsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.gstDetails(orgId),
		queryFn: () => getGSTDetailsServer({ data: { orgId } }),
		staleTime: CACHE.static,
	});
