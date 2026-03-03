/**
 * Campaign Query Factories — single source of truth for query keys + options.
 * Used by route loaders (ensureQueryData) and hooks (useQuery).
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

// -- Campaign Detail ----------------------------------------------------------

export const campaignQueryOptions = (orgId: string, campaignId: string) =>
	queryOptions({
		queryKey: queryKeys.campaign(orgId, campaignId),
		queryFn: () => getAuthenticatedClient().brand.getCampaign(orgId, campaignId),
		staleTime: CACHE.detail,
	});

export const campaignStatsQueryOptions = (orgId: string, campaignId: string) =>
	queryOptions({
		queryKey: queryKeys.campaignStats(orgId, campaignId),
		queryFn: () => getAuthenticatedClient().brand.getCampaignStats(orgId, campaignId, {}),
		staleTime: CACHE.detail,
	});

// -- Campaign Lists -----------------------------------------------------------

export const infiniteCampaignsQueryOptions = (
	orgId: string,
	params?: { status?: string; listingId?: string; search?: string }
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteCampaigns(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			getAuthenticatedClient().brand.listCampaigns(orgId, { ...params, skip: pageParam, take: DEFAULT_PAGE_SIZE }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});

// -- Campaign Lists (paginated) -----------------------------------------------

export const campaignsQueryOptions = (
	orgId: string,
	params?: {
		status?: string;
		listingId?: string;
		search?: string;
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "startDate" | "endDate" | "title";
		sortOrder?: "asc" | "desc";
	}
) =>
	queryOptions({
		queryKey: queryKeys.campaigns(orgId, params),
		queryFn: () => getAuthenticatedClient().brand.listCampaigns(orgId, params || {}),
		staleTime: CACHE.list,
	});

// -- Campaign Tasks -----------------------------------------------------------

export const campaignTasksQueryOptions = (orgId: string, campaignId: string) =>
	queryOptions({
		queryKey: queryKeys.campaignTasks(orgId, campaignId),
		queryFn: () => getAuthenticatedClient().brand.listCampaignTasks(orgId, campaignId, {}),
		staleTime: CACHE.list,
	});

// -- Platforms ----------------------------------------------------------------

export const platformsQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.platforms(),
		queryFn: () => getAuthenticatedClient().catalog.listPlatforms({ take: 100, status: "active" }),
		staleTime: CACHE.lookup,
	});

// -- Task Templates -----------------------------------------------------------

export const taskTemplatesQueryOptions = (params?: { category?: string; platformId?: string }) =>
	queryOptions({
		queryKey: queryKeys.taskTemplates(params),
		queryFn: () =>
			getAuthenticatedClient().catalog.listTaskTemplates({
				take: 100,
				status: "active" as import("@/lib/brand-client").db.TaskTemplateStatus,
				...(params?.category ? { category: params.category as import("@/lib/brand-client").db.TaskCategory } : {}),
				...(params?.platformId ? { platformId: params.platformId } : {}),
			}),
		staleTime: CACHE.lookup,
	});

// -- Campaign Lookup (dropdowns) ----------------------------------------------

export const campaignsLookupQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.campaigns(orgId, { take: 100 }),
		queryFn: () => getAuthenticatedClient().brand.listCampaigns(orgId, { take: 100 }),
		staleTime: CACHE.lookup,
	});
