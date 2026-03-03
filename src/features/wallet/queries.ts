/**
 * Wallet Query Factories — single source of truth for wallet data access.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

export const walletQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.wallet(orgId),
		queryFn: () => getAuthenticatedClient().brand.getOrganizationWallet(orgId),
		staleTime: CACHE.list,
	});

export const walletHoldsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.walletHolds(orgId),
		queryFn: () => getAuthenticatedClient().brand.getWalletHolds(orgId, {}),
		staleTime: CACHE.list,
	});

export const withdrawalsQueryOptions = (orgId: string, params?: Record<string, unknown>) =>
	queryOptions({
		queryKey: queryKeys.withdrawals(orgId, params),
		queryFn: () => getAuthenticatedClient().brand.listWithdrawalRequests(orgId, params || {}),
		staleTime: CACHE.list,
	});

export const withdrawalStatsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.withdrawalStats(orgId),
		queryFn: () => getAuthenticatedClient().brand.getOrganizationWithdrawalStats(orgId),
		staleTime: CACHE.list,
	});

export const depositsQueryOptions = (orgId: string, params?: Record<string, unknown>) =>
	queryOptions({
		queryKey: queryKeys.deposits(orgId, params),
		queryFn: () => getAuthenticatedClient().brand.listDeposits(orgId, params || {}),
		staleTime: CACHE.list,
	});

export const walletTransactionsQueryOptions = (orgId: string, params?: Record<string, unknown>) =>
	queryOptions({
		queryKey: queryKeys.walletTransactions(orgId, params),
		queryFn: () => getAuthenticatedClient().brand.getOrganizationWalletTransactions(orgId, params || {}),
		staleTime: CACHE.list,
	});

export const virtualAccountQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.virtualAccount(orgId),
		queryFn: () => getAuthenticatedClient().brand.getVirtualAccount(orgId),
		staleTime: CACHE.list,
	});

export const withdrawalDetailQueryOptions = (orgId: string, withdrawalId: string) =>
	queryOptions({
		queryKey: queryKeys.withdrawal(orgId, withdrawalId),
		queryFn: () => getAuthenticatedClient().brand.getWithdrawalRequest(orgId, withdrawalId),
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
		queryFn: ({ pageParam = 0 }) =>
			getAuthenticatedClient().brand.getOrganizationWalletTransactions(orgId, {
				...params,
				skip: pageParam,
				take: DEFAULT_PAGE_SIZE,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});
