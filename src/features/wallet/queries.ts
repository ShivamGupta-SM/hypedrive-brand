/**
 * Wallet Query Factories — single source of truth for wallet data access.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, queryKeys } from "@/hooks/api-client";
import {
	getVirtualAccountServer,
	getWalletHoldsServer,
	getWalletServer,
	getWalletTransactionsServer,
	getWithdrawalDetailServer,
	getWithdrawalStatsServer,
	listDepositsServer,
	listWithdrawalsServer,
} from "./server";

export const walletQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.wallet(orgId),
		queryFn: () => getWalletServer({ data: { orgId } }),
		staleTime: CACHE.list,
	});

export const walletHoldsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.walletHolds(orgId),
		queryFn: () => getWalletHoldsServer({ data: { orgId } }),
		staleTime: CACHE.list,
	});

export const withdrawalsQueryOptions = (
	orgId: string,
	params?: {
		status?: string;
		requestedFrom?: string;
		requestedTo?: string;
		amountMin?: number;
		amountMax?: number;
		sortBy?: "requestedAt" | "amount" | "status";
		sortOrder?: "asc" | "desc";
		skip?: number;
		take?: number;
	}
) =>
	queryOptions({
		queryKey: queryKeys.withdrawals(orgId, params),
		queryFn: () => listWithdrawalsServer({ data: { orgId, params: params || {} } }),
		staleTime: CACHE.list,
	});

export const withdrawalStatsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.withdrawalStats(orgId),
		queryFn: () => getWithdrawalStatsServer({ data: { orgId } }),
		staleTime: CACHE.list,
	});

export const depositsQueryOptions = (
	orgId: string,
	params?: {
		dateFrom?: string;
		dateTo?: string;
		amountMin?: number;
		amountMax?: number;
		sortBy?: "createdAt" | "amount";
		sortOrder?: "asc" | "desc";
		skip?: number;
		take?: number;
	}
) =>
	queryOptions({
		queryKey: queryKeys.deposits(orgId, params),
		queryFn: () => listDepositsServer({ data: { orgId, params: params || {} } }),
		staleTime: CACHE.list,
	});

export const walletTransactionsQueryOptions = (
	orgId: string,
	params?: {
		type?: "credit" | "debit";
		status?: "pending" | "completed" | "voided";
		category?: "enrollment_hold" | "deposit" | "payout" | "refund" | "admin_credit";
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "amount";
		sortOrder?: "asc" | "desc";
	}
) =>
	queryOptions({
		queryKey: queryKeys.walletTransactions(orgId, params),
		queryFn: () => getWalletTransactionsServer({ data: { orgId, params: params || {} } }),
		staleTime: CACHE.list,
	});

export const virtualAccountQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.virtualAccount(orgId),
		queryFn: () => getVirtualAccountServer({ data: { orgId } }),
		staleTime: CACHE.list,
	});

export const withdrawalDetailQueryOptions = (orgId: string, withdrawalId: string) =>
	queryOptions({
		queryKey: queryKeys.withdrawal(orgId, withdrawalId),
		queryFn: () => getWithdrawalDetailServer({ data: { orgId, withdrawalId } }),
		staleTime: CACHE.list,
	});

export const infiniteWalletTransactionsQueryOptions = (
	orgId: string,
	params?: {
		type?: "credit" | "debit";
		category?: "enrollment_hold" | "deposit" | "payout" | "refund" | "admin_credit";
	}
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteWalletTransactions(orgId, params),
		queryFn: ({ pageParam }) =>
			getWalletTransactionsServer({
				data: { orgId, params: { ...params, cursor: pageParam, limit: DEFAULT_PAGE_SIZE } },
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		staleTime: CACHE.list,
	});
