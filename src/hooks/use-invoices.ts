import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import type { db } from "@/lib/brand-client";
import { CACHE, getAuthenticatedClient, infiniteInvoicesQueryOptions, queryKeys } from "./api-client";

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
		queryFn: () => getAuthenticatedClient().brand.listInvoices(organizationId as string, params || {}),
		enabled: !!organizationId,
		staleTime: CACHE.list,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useInfiniteInvoices(organizationId: string | undefined, params?: { status?: db.InvoiceStatus }) {
	const query = useInfiniteQuery({
		...infiniteInvoicesQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	const data = query.data?.pages.flatMap((page) => page.data) ?? [];
	const total = query.data?.pages[0]?.total ?? 0;

	return {
		data,
		total,
		hasMore: query.hasNextPage ?? false,
		loading: query.isPending,
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
		loading: query.isPending,
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
