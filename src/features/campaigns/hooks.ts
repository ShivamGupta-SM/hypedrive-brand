/**
 * Campaign Query Hooks — read-only data access.
 */

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
	campaignQueryOptions,
	campaignStatsQueryOptions,
	campaignsQueryOptions,
	campaignTasksQueryOptions,
	infiniteCampaignsQueryOptions,
	platformsQueryOptions,
	taskTemplatesQueryOptions,
} from "./queries";

export function useCampaigns(
	organizationId: string | undefined,
	params?: {
		status?: string;
		listingId?: string;
		q?: string;
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "startDate" | "endDate" | "title";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useQuery({
		...campaignsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useInfiniteCampaigns(
	organizationId: string | undefined,
	params?: {
		status?: string;
		listingId?: string;
		q?: string;
		sortBy?: "createdAt" | "startDate" | "endDate" | "title";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useInfiniteQuery({
		...infiniteCampaignsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
		placeholderData: keepPreviousData,
	});

	const data = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];
	const total = query.data?.pages[0]?.total ?? data.length;

	return {
		data,
		total,
		hasMore: query.hasNextPage ?? false,
		loading: query.isPending && !query.data,
		isFetching: query.isFetching,
		isFetchingNextPage: query.isFetchingNextPage,
		error: query.error,
		refetch: query.refetch,
		fetchNextPage: query.fetchNextPage,
	};
}

export function useCampaign(organizationId: string | undefined, campaignId: string | undefined) {
	const query = useQuery({
		...campaignQueryOptions(organizationId || "", campaignId || ""),
		enabled: !!organizationId && !!campaignId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCampaignStats(organizationId: string | undefined, campaignId: string | undefined) {
	const query = useQuery({
		...campaignStatsQueryOptions(organizationId || "", campaignId || ""),
		enabled: !!organizationId && !!campaignId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCampaignTasks(organizationId: string | undefined, campaignId: string | undefined) {
	const query = useQuery({
		...campaignTasksQueryOptions(organizationId || "", campaignId || ""),
		enabled: !!organizationId && !!campaignId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function usePlatforms() {
	const query = useQuery({
		...platformsQueryOptions(),
	});

	return {
		data: query.data?.data ?? [],
		loading: query.isPending && !query.data,
		error: query.error,
	};
}

export function useTaskTemplates(params?: { category?: string; status?: string; platformId?: string }) {
	const query = useQuery({
		...taskTemplatesQueryOptions(params),
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		loading: query.isPending && !query.data,
		error: query.error,
	};
}
