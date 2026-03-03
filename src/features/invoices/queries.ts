/**
 * Invoice Query Factories.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import type { db } from "@/lib/brand-client";

// -- Invoice Detail -----------------------------------------------------------

export const invoiceQueryOptions = (orgId: string, invoiceId: string) =>
	queryOptions({
		queryKey: queryKeys.invoice(orgId, invoiceId),
		queryFn: () => getAuthenticatedClient().brand.getInvoice(orgId, invoiceId),
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
		queryFn: () => getAuthenticatedClient().brand.listInvoices(orgId, params || {}),
		staleTime: CACHE.list,
	});

// -- Invoice Lists (infinite) ------------------------------------------------

export const infiniteInvoicesQueryOptions = (orgId: string, params?: { status?: db.InvoiceStatus }) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteInvoices(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			getAuthenticatedClient().brand.listInvoices(orgId, { ...params, skip: pageParam, take: DEFAULT_PAGE_SIZE }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});
