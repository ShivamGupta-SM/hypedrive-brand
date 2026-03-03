/**
 * Invoice Hooks — queries + mutations.
 */

import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import type { db } from "@/lib/brand-client";
import { infiniteInvoicesQueryOptions, invoiceQueryOptions, invoicesQueryOptions } from "./queries";
import { generateInvoicePDFServer } from "./server";

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
		...invoicesQueryOptions(organizationId || "", params),
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
		loading: query.isPending && !query.data,
		isFetchingNextPage: query.isFetchingNextPage,
		error: query.error,
		refetch: query.refetch,
		fetchNextPage: query.fetchNextPage,
	};
}

export function useInvoice(organizationId: string | undefined, invoiceId: string | undefined) {
	const query = useQuery({
		...invoiceQueryOptions(organizationId || "", invoiceId || ""),
		enabled: !!organizationId && !!invoiceId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useGenerateInvoicePDF(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (invoiceId: string) => {
			return generateInvoicePDFServer({ data: { orgId: organizationId as string, invoiceId } });
		},
	});
}
