/**
 * Wallet Query Hooks — read-only data access for wallet, transactions, withdrawals, deposits.
 */

import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import Client from "@/lib/brand-client";

import { API_URL } from "@/lib/config";
import { queryKeys } from "@/hooks/api-client";
import { getStreamTokenServer } from "@/server/auth-queries";
import {
	depositsQueryOptions,
	infiniteWalletTransactionsQueryOptions,
	virtualAccountQueryOptions,
	walletHoldsQueryOptions,
	walletQueryOptions,
	walletTransactionQueryOptions,
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
		placeholderData: keepPreviousData,
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

export function useWalletHolds(
	organizationId: string | undefined,
	params?: {
		campaignId?: string;
		createdFrom?: string;
		createdTo?: string;
		expiresFrom?: string;
		expiresTo?: string;
		sortBy?: "createdAt" | "expiresAt" | "amount";
		sortOrder?: "asc" | "desc";
		skip?: number;
		take?: number;
	}
) {
	const query = useQuery({
		...walletHoldsQueryOptions(organizationId || "", params),
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
	params?: {
		status?: "otp_pending" | "pending" | "approved" | "rejected" | "queued" | "processing" | "completed" | "failed" | "cancelled" | "reversed";
		sortBy?: "requestedAt" | "amount" | "status";
		sortOrder?: "asc" | "desc";
		skip?: number;
		take?: number;
	}
) {
	const query = useQuery({
		...withdrawalsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
		placeholderData: keepPreviousData,
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
) {
	const query = useQuery({
		...depositsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
		placeholderData: keepPreviousData,
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

export function useWalletTransaction(organizationId: string | undefined, transactionId: string | undefined) {
	const query = useQuery({
		...walletTransactionQueryOptions(organizationId || "", transactionId || ""),
		enabled: !!organizationId && !!transactionId,
	});

	return {
		data: query.data ?? null,
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

// =============================================================================
// WALLET BALANCE STREAM
// =============================================================================

export interface WalletBalanceStreamState {
	balance: number;
	balanceDecimal: string;
	pendingDebit: number;
	pendingDebitDecimal: string;
	availableBalance: number;
	availableBalanceDecimal: string;
	updatedAt: string | null;
	balanceStale: boolean;
	connected: boolean;
}

const INITIAL_BALANCE_STATE: WalletBalanceStreamState = {
	balance: 0,
	balanceDecimal: "0.00",
	pendingDebit: 0,
	pendingDebitDecimal: "0.00",
	availableBalance: 0,
	availableBalanceDecimal: "0.00",
	updatedAt: null,
	balanceStale: false,
	connected: false,
};

export function useWalletBalanceStream(organizationId: string | undefined) {
	const [state, setState] = useState<WalletBalanceStreamState>(INITIAL_BALANCE_STATE);
	const streamRef = useRef<{ close: () => void } | null>(null);
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!organizationId) return;

		let cancelled = false;
		let retryAttempt = 0;
		let retryTimer: ReturnType<typeof setTimeout>;

		async function connect() {
			try {
				const { token } = await getStreamTokenServer();
				if (cancelled) return;

				const client = new Client(API_URL, { auth: { authorization: `Bearer ${token}` } });
				const stream = await client.brand.streamWalletBalance(organizationId!);
				if (cancelled) {
					stream.close();
					return;
				}
				streamRef.current = stream;
				setState((prev) => ({ ...prev, connected: true }));
				retryAttempt = 0;

				for await (const update of stream) {
					if (cancelled) break;

					setState({
						balance: update.balance,
						balanceDecimal: update.balanceDecimal,
						pendingDebit: update.pendingDebit,
						pendingDebitDecimal: update.pendingDebitDecimal,
						availableBalance: update.availableBalance,
						availableBalanceDecimal: update.availableBalanceDecimal,
						updatedAt: update.updatedAt,
						balanceStale: update.balanceStale ?? false,
						connected: true,
					});

					// Invalidate the wallet query so other components stay in sync
					queryClient.invalidateQueries({ queryKey: queryKeys.wallet(organizationId!) });
				}

				// Stream ended cleanly — reconnect
				if (!cancelled) {
					scheduleReconnect();
				}
			} catch {
				if (!cancelled) {
					scheduleReconnect();
				}
			}
		}

		function scheduleReconnect() {
			setState((prev) => ({ ...prev, connected: false }));
			streamRef.current = null;
			// Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
			const delay = Math.min(1000 * 2 ** retryAttempt, 30_000);
			retryAttempt++;
			retryTimer = setTimeout(connect, delay);
		}

		connect();

		return () => {
			cancelled = true;
			clearTimeout(retryTimer);
			streamRef.current?.close();
			streamRef.current = null;
			setState(INITIAL_BALANCE_STATE);
		};
	}, [organizationId, queryClient]);

	return state;
}
