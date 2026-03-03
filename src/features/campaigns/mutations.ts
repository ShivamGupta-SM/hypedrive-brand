/**
 * Campaign Mutations — create, update, state changes, tasks, duplicate.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import type { brand, db } from "@/lib/brand-client";

export function useCreateCampaign(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateCampaignRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.createCampaign(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteCampaigns(organizationId || "") });
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
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteCampaigns(organizationId || "") });
		},
	});
}

// =============================================================================
// CAMPAIGN STATE MUTATIONS — Factory pattern to avoid 6 nearly identical hooks
// =============================================================================

type CampaignAction = "pause" | "resume" | "end" | "cancel" | "archive" | "submit";

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
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteCampaigns(organizationId || "") });
		},
	});
}

// =============================================================================
// CAMPAIGN TASKS
// =============================================================================

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
