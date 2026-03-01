import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import type { db } from "@/lib/brand-client";
import { DEFAULT_PAGE_SIZE, getAuthenticatedClient, queryKeys } from "./api-client";

export function useInvoices(
	organizationId: string | undefined,
	params?: {
		status?: db.InvoiceStatus;
		skip?: number;
		take?: number;
		q?: string;
		sortBy?: "createdAt" | "issuedAt" | "dueDate" | "totalAmount";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useQuery({
		queryKey: queryKeys.invoices(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.listInvoices(organizationId as string, params || {});
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

export function useInfiniteInvoices(organizationId: string | undefined, params?: { status?: db.InvoiceStatus }) {
	const query = useInfiniteQuery({
		queryKey: queryKeys.infiniteInvoices(organizationId || "", params),
		queryFn: async ({ pageParam = 0 }) => {
			const client = getAuthenticatedClient();
			return client.brand.listInvoices(organizationId as string, {
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

export function useInvoice(organizationId: string | undefined, invoiceId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.invoice(organizationId || "", invoiceId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getInvoice(organizationId as string, invoiceId as string);
		},
		enabled: !!organizationId && !!invoiceId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useGenerateInvoicePDF(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (invoiceId: string) => {
			const client = getAuthenticatedClient();
			return client.brand.generateInvoicePDF(organizationId as string, invoiceId);
		},
	});
}
