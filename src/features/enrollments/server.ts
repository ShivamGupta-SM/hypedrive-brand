/**
 * Enrollment Server Functions — authenticated API calls proxied through the server.
 */

import { createServerFn } from "@tanstack/react-start";
import type { db } from "@/lib/brand-client";
import { authMiddleware } from "@/server/middleware";

// -- Queries ------------------------------------------------------------------

export const getEnrollmentServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; enrollmentId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getEnrollment(data.orgId, data.enrollmentId);
	});

export const listEnrollmentsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			params: {
				status?: db.EnrollmentStatus;
				campaignId?: string;
				skip?: number;
				take?: number;
				sortBy?: "createdAt" | "status" | "expiresAt" | "orderValue" | "submittedAt";
				sortOrder?: "asc" | "desc";
			};
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.listOrganizationEnrollments(data.orgId, data.params);
	});

// -- Mutations ----------------------------------------------------------------

export const reviewEnrollmentServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			enrollmentId: string;
			action: "approve" | "reject" | "request_changes";
			reason?: string;
			remarks?: string;
			taskFeedback?: { submissionId: string; feedback: string }[];
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.updateEnrollmentReview(data.orgId, data.enrollmentId, {
			action: data.action,
			reason: data.reason,
			remarks: data.remarks,
			taskFeedback: data.taskFeedback,
		});
	});

export const batchEnrollmentsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			action: "approve" | "reject" | "request_changes";
			ids: string[];
			reason?: string;
			remarks?: string;
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.batchEnrollments(data.orgId, {
			action: data.action,
			ids: data.ids,
			reason: data.reason,
			remarks: data.remarks,
		});
	});

export const exportEnrollmentsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; campaignId: string; status?: db.EnrollmentStatus }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.exportEnrollments(data.orgId, data.campaignId, { status: data.status });
	});

export const exportOrgEnrollmentsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			status?: db.EnrollmentStatus;
			campaignId?: string;
			createdFrom?: string;
			createdTo?: string;
		}) => input
	)
	.handler(async ({ context, data }) => {
		const { orgId, ...params } = data;
		return context.client.brand.exportOrganizationEnrollments(orgId, params);
	});
