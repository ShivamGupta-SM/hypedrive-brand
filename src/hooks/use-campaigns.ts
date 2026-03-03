import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { brand, db } from "@/lib/brand-client";
import {
	CACHE,
	campaignQueryOptions,
	campaignStatsQueryOptions,
	getAuthenticatedClient,
	infiniteCampaignsQueryOptions,
	queryKeys,
} from "./api-client";

export function useCampaigns(
	organizationId: string | undefined,
	params?: {
		status?: string;
		listingId?: string;
		search?: string;
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "startDate" | "endDate" | "title";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useQuery({
		queryKey: queryKeys.campaigns(organizationId || "", params),
		queryFn: () => getAuthenticatedClient().brand.listCampaigns(organizationId as string, params || {}),
		enabled: !!organizationId,
		staleTime: CACHE.list,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useInfiniteCampaigns(
	organizationId: string | undefined,
	params?: { status?: string; listingId?: string; search?: string }
) {
	const query = useInfiniteQuery({
		...infiniteCampaignsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	const data = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];
	const total = query.data?.pages[0]?.total ?? data.length;

	return {
		data,
		total,
		hasMore: query.hasNextPage ?? false,
		loading: query.isPending,
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
		loading: query.isPending,
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
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCreateCampaign(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateCampaignRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.createCampaign(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(organizationId || "") });
			queryClient.invalidateQueries({
				queryKey: queryKeys.infiniteCampaigns(organizationId || ""),
			});
		},
	});
}

export function useUpdateCampaign(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			campaignId,
			...params
		}: {
			campaignId: string;
			title?: string;
			description?: string;
			maxEnrollments?: number;
			isPublic?: boolean;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.updateCampaign(organizationId as string, campaignId, params);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.campaign(organizationId || "", variables.campaignId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(organizationId || "") });
			queryClient.invalidateQueries({
				queryKey: queryKeys.infiniteCampaigns(organizationId || ""),
			});
		},
	});
}

// =============================================================================
// CAMPAIGN STATE MUTATIONS — Factory pattern to avoid 6 nearly identical hooks
// =============================================================================

type CampaignAction = "pause" | "resume" | "end" | "cancel" | "archive" | "submit";

/** Actions that also invalidate the individual campaign detail cache */
const INVALIDATES_DETAIL: CampaignAction[] = ["pause", "resume", "end", "submit"];

function useCampaignStateAction(action: CampaignAction) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			organizationId,
			campaignId,
			reason,
		}: {
			organizationId: string;
			campaignId: string;
			reason?: string;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.updateCampaignState(organizationId, campaignId, { action, reason });
		},
		onSuccess: (_, v) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(v.organizationId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteCampaigns(v.organizationId) });
			if (INVALIDATES_DETAIL.includes(action)) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.campaign(v.organizationId, v.campaignId),
				});
			}
		},
	});
}

export function usePauseCampaign() {
	return useCampaignStateAction("pause");
}
export function useResumeCampaign() {
	return useCampaignStateAction("resume");
}
export function useEndCampaign() {
	return useCampaignStateAction("end");
}
export function useCancelCampaign() {
	return useCampaignStateAction("cancel");
}
export function useArchiveCampaign() {
	return useCampaignStateAction("archive");
}
export function useSubmitCampaign() {
	return useCampaignStateAction("submit");
}

export function useDuplicateCampaign() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			organizationId,
			campaignId,
			newTitle,
		}: {
			organizationId: string;
			campaignId: string;
			newTitle?: string;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.duplicateCampaign(organizationId, campaignId, { newTitle });
		},
		onSuccess: (_, v) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(v.organizationId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteCampaigns(v.organizationId) });
		},
	});
}

/**
 * Create AND submit a campaign in one call.
 * Tasks are required (at least one) since submission validates task count.
 * Returns the campaign in pending_approval status.
 */
export function useCreateAndSubmitCampaign(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateAndSubmitRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.createAndSubmitCampaign(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(organizationId || "") });
			queryClient.invalidateQueries({
				queryKey: queryKeys.infiniteCampaigns(organizationId || ""),
			});
		},
	});
}

// =============================================================================
// CAMPAIGN TASKS
// =============================================================================

export function useCampaignTasks(organizationId: string | undefined, campaignId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.campaignTasks(organizationId || "", campaignId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.listCampaignTasks(organizationId as string, campaignId as string, {});
		},
		enabled: !!organizationId && !!campaignId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useAddCampaignTask(organizationId: string | undefined, campaignId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			taskTemplateId: string;
			isRequired?: boolean;
			sortOrder?: number;
			instructions?: string;
			requirements?: db.TaskRequirements;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.addCampaignTask(organizationId as string, campaignId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.campaignTasks(organizationId || "", campaignId || ""),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.campaign(organizationId || "", campaignId || ""),
			});
		},
	});
}

export function useUpdateCampaignTask(organizationId: string | undefined, campaignId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			taskId,
			...params
		}: {
			taskId: string;
			isRequired?: boolean;
			sortOrder?: number;
			instructions?: string;
			requirements?: db.TaskRequirements;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.updateCampaignTask(organizationId as string, campaignId as string, taskId, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.campaignTasks(organizationId || "", campaignId || ""),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.campaign(organizationId || "", campaignId || ""),
			});
		},
	});
}

export function useRemoveCampaignTask(organizationId: string | undefined, campaignId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (taskId: string) => {
			const client = getAuthenticatedClient();
			return client.brand.removeCampaignTask(organizationId as string, campaignId as string, taskId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.campaignTasks(organizationId || "", campaignId || ""),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.campaign(organizationId || "", campaignId || ""),
			});
		},
	});
}

export function usePlatforms() {
	const query = useQuery({
		queryKey: queryKeys.platforms(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.catalog.listPlatforms({ take: 100, status: "active" });
		},
		staleTime: CACHE.settings,
	});

	return {
		data: query.data?.data ?? [],
		loading: query.isPending,
		error: query.error,
	};
}

export function useTaskTemplates(params?: { category?: string; status?: string; platformId?: string }) {
	const query = useQuery({
		queryKey: queryKeys.taskTemplates(params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.catalog.listTaskTemplates({
				take: 100,
				status: "active" as db.TaskTemplateStatus,
				...(params?.category ? { category: params.category as db.TaskCategory } : {}),
				...(params?.platformId ? { platformId: params.platformId } : {}),
			});
		},
		staleTime: CACHE.lookup,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		loading: query.isPending,
		error: query.error,
	};
}
