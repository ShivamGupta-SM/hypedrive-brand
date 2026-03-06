/**
 * Campaign Mutations — create, update, state changes, tasks, duplicate.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import type { brand, db } from "@/lib/brand-client";
import {
	addCampaignTaskServer,
	batchCampaignsServer,
	createAndSubmitCampaignServer,
	createCampaignServer,
	duplicateCampaignServer,
	exportCampaignsServer,
	removeCampaignTaskServer,
	updateCampaignServer,
	updateCampaignStateServer,
	updateCampaignTaskServer,
} from "./server";

export function useCreateCampaign(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateCampaignRequest) => {
			return createCampaignServer({
				data: {
					orgId: organizationId as string,
					params: { ...params, idempotencyKey: params.idempotencyKey ?? crypto.randomUUID() },
				},
			});
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
			return updateCampaignServer({
				data: { orgId: organizationId as string, campaignId, ...params },
			});
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
			return updateCampaignStateServer({ data: { organizationId, campaignId, action, reason } });
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
			return duplicateCampaignServer({
				data: { organizationId, campaignId, newTitle, idempotencyKey: crypto.randomUUID() },
			});
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
			return createAndSubmitCampaignServer({
				data: {
					orgId: organizationId as string,
					params: { ...params, idempotencyKey: params.idempotencyKey ?? crypto.randomUUID() },
				},
			});
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
			return addCampaignTaskServer({
				data: { orgId: organizationId as string, campaignId: campaignId as string, ...params },
			});
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
			return updateCampaignTaskServer({
				data: { orgId: organizationId as string, campaignId: campaignId as string, taskId, ...params },
			});
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
			return removeCampaignTaskServer({
				data: { orgId: organizationId as string, campaignId: campaignId as string, taskId },
			});
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

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

export function useBatchCampaigns() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			organizationId,
			action,
			campaignIds,
			reason,
		}: {
			organizationId: string;
			action: "pause" | "resume" | "end" | "archive";
			campaignIds: string[];
			reason?: string;
		}) => {
			return batchCampaignsServer({
				data: { orgId: organizationId, action, campaignIds, reason },
			});
		},
		onSuccess: (_, v) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(v.organizationId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteCampaigns(v.organizationId) });
		},
	});
}

export function useExportCampaigns(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (params: { status?: string; q?: string }) => {
			return exportCampaignsServer({
				data: { orgId: organizationId as string, ...params },
			});
		},
	});
}
