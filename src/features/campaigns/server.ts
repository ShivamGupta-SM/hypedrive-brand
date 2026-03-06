/**
 * Campaign Server Functions — authenticated API calls proxied through the server.
 * Covers: campaign CRUD, state changes, tasks, platforms, task templates.
 */

import { createServerFn } from "@tanstack/react-start";
import type { brand, db } from "@/lib/brand-client";
import { authMiddleware } from "@/server/middleware";

// =============================================================================
// QUERIES
// =============================================================================

// -- Campaign Detail ----------------------------------------------------------

export const getCampaignServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; campaignId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getCampaign(data.orgId, data.campaignId, {
			expand: "tasks,enrollmentStats,listing",
		});
	});

export const getCampaignStatsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; campaignId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getCampaignStats(data.orgId, data.campaignId, {});
	});

// -- Campaign Lists -----------------------------------------------------------

export const listCampaignsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			params?: {
				status?: string;
				listingId?: string;
				q?: string;
				skip?: number;
				take?: number;
				cursor?: string;
				limit?: number;
				sortBy?: "createdAt" | "startDate" | "endDate" | "title";
				sortOrder?: "asc" | "desc";
			};
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.listCampaigns(data.orgId, data.params || {});
	});

// -- Campaign Tasks -----------------------------------------------------------

export const listCampaignTasksServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; campaignId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.listCampaignTasks(data.orgId, data.campaignId, {});
	});

// -- Platforms ----------------------------------------------------------------

export const listPlatformsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.catalog.listPlatforms({ take: 100, status: "active" });
	});

// -- Task Templates -----------------------------------------------------------

export const listTaskTemplatesServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { category?: string; platformId?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.catalog.listTaskTemplates({
			take: 100,
			status: "active" as db.TaskTemplateStatus,
			...(data.category ? { category: data.category as db.TaskCategory } : {}),
			...(data.platformId ? { platformId: data.platformId } : {}),
		});
	});

// =============================================================================
// MUTATIONS
// =============================================================================

// -- Create Campaign ----------------------------------------------------------

export const createCampaignServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; params: brand.CreateCampaignRequest }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.createCampaign(data.orgId, data.params);
	});

// -- Update Campaign ----------------------------------------------------------

export const updateCampaignServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			campaignId: string;
			title?: string;
			description?: string;
			maxEnrollments?: number;
			isPublic?: boolean;
		}) => input
	)
	.handler(async ({ context, data }) => {
		const { orgId, campaignId, ...params } = data;
		return context.client.brand.updateCampaign(orgId, campaignId, params);
	});

// -- Campaign State Changes (unified) -----------------------------------------

export const updateCampaignStateServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			organizationId: string;
			campaignId: string;
			action: "pause" | "resume" | "end" | "cancel" | "archive" | "submit";
			reason?: string;
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.updateCampaignState(data.organizationId, data.campaignId, {
			action: data.action,
			reason: data.reason,
		});
	});

// -- Duplicate Campaign -------------------------------------------------------

export const duplicateCampaignServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; campaignId: string; newTitle?: string; idempotencyKey?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.duplicateCampaign(data.organizationId, data.campaignId, {
			newTitle: data.newTitle,
			idempotencyKey: data.idempotencyKey,
		});
	});

// -- Create and Submit Campaign -----------------------------------------------

export const createAndSubmitCampaignServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; params: brand.CreateAndSubmitRequest }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.createAndSubmitCampaign(data.orgId, data.params);
	});

// -- Campaign Task Mutations --------------------------------------------------

export const addCampaignTaskServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			campaignId: string;
			taskTemplateId: string;
			isRequired?: boolean;
			sortOrder?: number;
			instructions?: string;
			requirements?: db.TaskRequirements;
		}) => input
	)
	.handler(async ({ context, data }) => {
		const { orgId, campaignId, ...params } = data;
		return context.client.brand.addCampaignTask(orgId, campaignId, params);
	});

export const updateCampaignTaskServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			campaignId: string;
			taskId: string;
			isRequired?: boolean;
			sortOrder?: number;
			instructions?: string;
			requirements?: db.TaskRequirements;
		}) => input
	)
	.handler(async ({ context, data }) => {
		const { orgId, campaignId, taskId, ...params } = data;
		return context.client.brand.updateCampaignTask(orgId, campaignId, taskId, params);
	});

export const removeCampaignTaskServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; campaignId: string; taskId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.removeCampaignTask(data.orgId, data.campaignId, data.taskId);
	});

// -- Batch Campaign Operations ------------------------------------------------

export const batchCampaignsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			action: "pause" | "resume" | "end" | "archive";
			campaignIds: string[];
			reason?: string;
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.batchCampaigns(data.orgId, {
			action: data.action,
			campaignIds: data.campaignIds,
			reason: data.reason,
		});
	});

// -- Export Campaigns ---------------------------------------------------------

export const exportCampaignsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			status?: string;
			q?: string;
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.exportCampaigns(data.orgId, {
			status: data.status,
			q: data.q,
		});
	});
