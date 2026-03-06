/**
 * Invoice Query Factories.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, queryKeys } from "@/hooks/api-client";
import type { db } from "@/lib/brand-client";
import { getInvoiceServer, listInvoicesServer } from "./server";

// -- Invoice Detail -----------------------------------------------------------

export const invoiceQueryOptions = (orgId: string, invoiceId: string, expand?: string) =>
	queryOptions({
		queryKey: queryKeys.invoice(orgId, invoiceId),
		queryFn: () => getInvoiceServer({ data: { orgId, invoiceId, expand } }),
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

export const infiniteInvoicesQueryOptions = (
	orgId: string,
	params?: {
		status?: db.InvoiceStatus;
		q?: string;
		campaignId?: string;
		issuedDateFrom?: string;
		issuedDateTo?: string;
		amountMin?: number;
		amountMax?: number;
		sortBy?: "createdAt" | "issuedAt" | "dueDate" | "totalAmount";
		sortOrder?: "asc" | "desc";
	}
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteInvoices(orgId, params),
		queryFn: ({ pageParam }) =>
			listInvoicesServer({ data: { orgId, params: { ...params, cursor: pageParam, limit: DEFAULT_PAGE_SIZE } } }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		staleTime: CACHE.list,
	});
