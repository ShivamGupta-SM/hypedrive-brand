import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { brand, db } from "@/lib/brand-client";
import { DEFAULT_PAGE_SIZE, getAuthenticatedClient, queryKeys } from "./api-client";

export function useWallet(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.wallet(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganizationWallet(organizationId as string);
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
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
		queryKey: queryKeys.walletTransactions(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganizationWalletTransactions(organizationId as string, params || {});
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isLoading,
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
		queryKey: queryKeys.infiniteWalletTransactions(organizationId || "", params),
		queryFn: async ({ pageParam = 0 }) => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganizationWalletTransactions(organizationId as string, {
				...params,
				skip: pageParam,
				take: DEFAULT_PAGE_SIZE,
			});
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		enabled: !!organizationId,
	});

	const data = query.data?.pages.flatMap((page) => page.data) ?? [];
	const total = query.data?.pages[0]?.total ?? 0;

	return {
		data,
		total,
		hasMore: query.hasNextPage ?? false,
		loading: query.isLoading,
		isFetchingNextPage: query.isFetchingNextPage,
		error: query.error,
		refetch: query.refetch,
		fetchNextPage: query.fetchNextPage,
	};
}

export function useWalletHolds(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.walletHolds(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getWalletHolds(organizationId as string, {});
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useWithdrawals(
	organizationId: string | undefined,
	params?: { status?: db.WithdrawalStatus; skip?: number; take?: number }
) {
	const query = useQuery({
		queryKey: queryKeys.withdrawals(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.listWithdrawalRequests(organizationId as string, params || {});
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCreateWithdrawal(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateOrgWithdrawalRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.createWithdrawalRequest(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.wallet(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals(organizationId || "") });
		},
	});
}

export function useWithdrawalStats(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.withdrawalStats(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganizationWithdrawalStats(organizationId as string);
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useVirtualAccount(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.virtualAccount(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getVirtualAccount(organizationId as string);
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useDeposits(
	organizationId: string | undefined,
	params?: { skip?: number; take?: number; sortOrder?: "asc" | "desc" }
) {
	const query = useQuery({
		queryKey: queryKeys.deposits(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.listDeposits(organizationId as string, params || {});
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
