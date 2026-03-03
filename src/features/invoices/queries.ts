/**
 * Invoice Query Factories.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, queryKeys } from "@/hooks/api-client";
import type { db } from "@/lib/brand-client";
import { getInvoiceServer, listInvoicesServer } from "./server";

// -- Invoice Detail -----------------------------------------------------------

export const invoiceQueryOptions = (orgId: string, invoiceId: string) =>
	queryOptions({
		queryKey: queryKeys.invoice(orgId, invoiceId),
		queryFn: () => getInvoiceServer({ data: { orgId, invoiceId } }),
		staleTime: CACHE.detail,
	});

// -- Invoice Lists (paginated) ------------------------------------------------

export const invoicesQueryOptions = (
	orgId: string,
	params?: {
		status?: db.InvoiceStatus;
		skip?: number;
		take?: number;
		q?: string;
		sortBy?: "createdAt" | "issuedAt" | "dueDate" | "totalAmount";
		sortOrder?: "asc" | "desc";
	}
) =>
	queryOptions({
		queryKey: queryKeys.invoices(orgId, params),
		queryFn: () => listInvoicesServer({ data: { orgId, params: params || {} } }),
		staleTime: CACHE.list,
	});

// -- Invoice Lists (infinite) ------------------------------------------------

export const infiniteInvoicesQueryOptions = (orgId: string, params?: { status?: db.InvoiceStatus }) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteInvoices(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			listInvoicesServer({ data: { orgId, params: { ...params, skip: pageParam, take: DEFAULT_PAGE_SIZE } } }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});
