/**
 * Wallet Query Hooks — read-only data access for wallet, transactions, withdrawals, deposits.
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { db } from "@/lib/brand-client";
import {
	depositsQueryOptions,
	infiniteWalletTransactionsQueryOptions,
	virtualAccountQueryOptions,
	walletHoldsQueryOptions,
	walletQueryOptions,
	walletTransactionsQueryOptions,
	withdrawalDetailQueryOptions,
	withdrawalStatsQueryOptions,
	withdrawalsQueryOptions,
} from "./queries";

export function useWallet(organizationId: string | undefined) {
	const query = useQuery({
		...walletQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useWalletTransactions(
	organizationId: string | undefined,
	params?: {
		type?: "credit" | "debit";
		status?: "pending" | "completed" | "voided";
		category?: "enrollment_hold" | "deposit" | "payout" | "refund" | "admin_credit";
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "amount";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useQuery({
		...walletTransactionsQueryOptions(organizationId || "", params),
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

export function useInfiniteWalletTransactions(
	organizationId: string | undefined,
	params?: {
		type?: "credit" | "debit";
		category?: "enrollment_hold" | "deposit" | "payout" | "refund" | "admin_credit";
	}
) {
	const query = useInfiniteQuery({
		...infiniteWalletTransactionsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	const data = query.data?.pages.flatMap((page) => page.data) ?? [];
	const total = query.data?.pages[0]?.total ?? 0;

	return {
		data,
		total,
		hasMore: query.hasNextPage ?? false,
		loading: query.isPending && !query.data,
		isFetchingNextPage: query.isFetchingNextPage,
		error: query.error,
		refetch: query.refetch,
		fetchNextPage: query.fetchNextPage,
	};
}

export function useWalletHolds(organizationId: string | undefined) {
	const query = useQuery({
		...walletHoldsQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useWithdrawals(
	organizationId: string | undefined,
	params?: { status?: db.WithdrawalStatus; skip?: number; take?: number }
) {
	const query = useQuery({
		...withdrawalsQueryOptions(organizationId || "", params),
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

export function useWithdrawalStats(organizationId: string | undefined) {
	const query = useQuery({
		...withdrawalStatsQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useVirtualAccount(organizationId: string | undefined) {
	const query = useQuery({
		...virtualAccountQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useDeposits(
	organizationId: string | undefined,
	params?: { skip?: number; take?: number; sortOrder?: "asc" | "desc" }
) {
	const query = useQuery({
		...depositsQueryOptions(organizationId || "", params),
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

export function useWithdrawalDetail(organizationId: string | undefined, withdrawalId: string | undefined) {
	const query = useQuery({
		...withdrawalDetailQueryOptions(organizationId || "", withdrawalId || ""),
		enabled: !!organizationId && !!withdrawalId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}
