/**
 * Organization Server Functions — authenticated API calls proxied through the server.
 * Covers: dashboard, activity, setup, search, settings, bank account, GST, enrichment, roles.
 */

import { createServerFn } from "@tanstack/react-start";
import type { brand } from "@/lib/brand-client";
import { authMiddleware } from "@/server/middleware";

// =============================================================================
// QUERIES
// =============================================================================

// -- Dashboard ----------------------------------------------------------------

export const getDashboardServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; days?: number }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getDashboardOverview(data.orgId, { days: data.days });
	});

// -- Activity -----------------------------------------------------------------

export const getOrganizationActivityServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			params?: {
				cursor?: string;
				limit?: number;
				entityType?: "campaign" | "enrollment" | "invoice" | "listing" | "organization" | "withdrawal";
			};
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.getOrganizationActivity(data.orgId, data.params || {});
	});

// -- Setup Progress -----------------------------------------------------------

export const getSetupProgressServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getSetupProgress(data.orgId);
	});

// -- Unified Search -----------------------------------------------------------

export const unifiedSearchServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; params: { q: string; cursor?: string; limit?: number } }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.unifiedSearch(data.orgId, data.params);
	});

// -- Active Member ------------------------------------------------------------

export const getActiveMemberServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.getActiveMember(data.orgId);
	});

// -- Organization Settings (GET) ----------------------------------------------

export const getOrganizationServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getOrganization(data.orgId);
	});

// -- Bank Account (GET) -------------------------------------------------------

export const getBankAccountServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getOrganizationBankAccount(data.orgId, {});
	});

// -- GST Details (GET) --------------------------------------------------------

export const getGSTDetailsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getGSTDetails(data.orgId);
	});

// =============================================================================
// MUTATIONS
// =============================================================================

// -- Create Organization ------------------------------------------------------

export const createOrganizationServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			name: string;
			slug?: string;
			logo?: string;
			gstNumber: string;
			gstLegalName: string;
			gstTradeName?: string;
			description?: string;
			website?: string;
			businessType?: string;
			industryCategory?: string;
			contactPerson?: string;
			phoneNumber?: string;
			address?: string;
			city?: string;
			state?: string;
			country?: string;
			postalCode?: string;
			idempotencyKey?: string;
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.auth.createOrganization(data);
	});

// -- Update Organization ------------------------------------------------------

export const updateOrganizationServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; name?: string; logo?: string }) => input)
	.handler(async ({ context, data }) => {
		const { organizationId, ...params } = data;
		return context.client.brand.updateOrganization(organizationId, params);
	});

// -- Leave Organization -------------------------------------------------------

export const leaveOrganizationServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.leaveOrganization(data.organizationId);
	});

// -- Check Slug ---------------------------------------------------------------

export const checkSlugServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { slug: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.checkSlug({ slug: data.slug });
	});

// -- Update Organization Settings ---------------------------------------------

export const updateOrganizationSettingsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			organizationId: string;
			name?: string;
			description?: string;
			website?: string;
			logo?: string;
			businessType?: "pvt_ltd" | "llp" | "partnership" | "proprietorship" | "public_ltd" | "trust" | "society";
			industryCategory?: string;
			contactPerson?: string;
			email?: string;
			address?: string;
			city?: string;
			state?: string;
			country?: string;
			postalCode?: string;
		}) => input
	)
	.handler(async ({ context, data }) => {
		const { organizationId, ...params } = data;
		return context.client.brand.updateOrganization(organizationId, params);
	});

// -- Change Org Phone ---------------------------------------------------------

export const changeOrgPhoneServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: { organizationId: string; phoneNumber: string; passkeyResponse: unknown; challengeId: string }) => input
	)
	.handler(async ({ context, data }) => {
		const { organizationId, ...params } = data;
		return context.client.brand.changeOrgPhone(organizationId, params);
	});

// -- Bank Account Mutations ---------------------------------------------------

export const verifyBankAccountServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string } & brand.VerifyBankAccountDetailsRequest) => input)
	.handler(async ({ context, data }) => {
		const { organizationId, ...params } = data;
		return context.client.brand.verifyBankAccountDetails(organizationId, params);
	});

export const addBankAccountServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string } & brand.AddBankAccountRequest) => input)
	.handler(async ({ context, data }) => {
		const { organizationId, ...params } = data;
		return context.client.brand.addBankAccount(organizationId, params);
	});

export const deleteBankAccountServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.deleteBankAccount(data.organizationId);
	});

// -- GST Mutations ------------------------------------------------------------

export const verifyGSTPreviewServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { gstNumber: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.verifyGSTPreview(data);
	});

export const verifyGSTServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; gstNumber: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.verifyGST(data.organizationId, { gstNumber: data.gstNumber });
	});

// -- Enrichment ---------------------------------------------------------------

export const enrichPreviewServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { domain: string; name?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.enrichment.enrichPreview(data);
	});

// -- Organization Roles -------------------------------------------------------

export const createOrganizationRoleServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: { organizationId: string; role: string; description?: string; permission?: Record<string, string[]> }) =>
			input
	)
	.handler(async ({ context, data }) => {
		const { organizationId, ...params } = data;
		return context.client.auth.createOrganizationRole(organizationId, params);
	});

export const updateOrganizationRoleServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			organizationId: string;
			roleId: string;
			role?: string;
			description?: string;
			permission?: Record<string, string[]>;
		}) => input
	)
	.handler(async ({ context, data }) => {
		const { organizationId, roleId, ...params } = data;
		return context.client.auth.updateOrganizationRole(organizationId, roleId, params);
	});

export const deleteOrganizationRoleServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; roleId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.deleteOrganizationRole(data.organizationId, data.roleId);
	});
