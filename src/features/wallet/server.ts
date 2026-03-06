/**
 * Wallet Server Functions — authenticated API calls proxied through the server.
 */

import { createServerFn } from "@tanstack/react-start";
import type { brand } from "@/lib/brand-client";
import { authMiddleware } from "@/server/middleware";

// -- Queries ------------------------------------------------------------------

export const getWalletServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getOrganizationWallet(data.orgId);
	});

export const getWalletHoldsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getWalletHolds(data.orgId, {});
	});

export const listWithdrawalsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			params: {
				status?: "otp_pending" | "pending" | "approved" | "rejected" | "queued" | "processing" | "completed" | "failed" | "cancelled" | "reversed";
				requestedFrom?: string;
				requestedTo?: string;
				amountMin?: number;
				amountMax?: number;
				sortBy?: "requestedAt" | "amount" | "status";
				sortOrder?: "asc" | "desc";
				skip?: number;
				take?: number;
				cursor?: string;
				limit?: number;
			};
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.listWithdrawalRequests(data.orgId, data.params);
	});

export const getWithdrawalStatsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getOrganizationWithdrawalStats(data.orgId);
	});

export const listDepositsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			params: {
				dateFrom?: string;
				dateTo?: string;
				amountMin?: number;
				amountMax?: number;
				sortBy?: "createdAt" | "amount";
				sortOrder?: "asc" | "desc";
				skip?: number;
				take?: number;
				page?: number;
			};
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.listDeposits(data.orgId, data.params);
	});

export const getWalletTransactionsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			params: {
				type?: "credit" | "debit";
				status?: "pending" | "completed" | "voided";
				category?: "enrollment_hold" | "deposit" | "payout" | "refund" | "admin_credit";
				skip?: number;
				take?: number;
				cursor?: string;
				limit?: number;
				sortBy?: "createdAt" | "amount";
				sortOrder?: "asc" | "desc";
			};
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.getOrganizationWalletTransactions(data.orgId, data.params);
	});

export const getVirtualAccountServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getVirtualAccount(data.orgId);
	});

export const getWithdrawalDetailServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; withdrawalId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getWithdrawalRequest(data.orgId, data.withdrawalId);
	});

// -- Mutations ----------------------------------------------------------------

export const createWithdrawalServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; params: brand.CreateOrgWithdrawalRequest }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.createWithdrawalRequest(data.orgId, data.params);
	});

export const cancelWithdrawalServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; withdrawalId: string; reason?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.cancelWithdrawalRequest(data.orgId, data.withdrawalId, {
			reason: data.reason,
		});
	});
