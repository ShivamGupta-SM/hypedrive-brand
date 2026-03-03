/**
 * Invoice Server Functions — authenticated API calls proxied through the server.
 */

import { createServerFn } from "@tanstack/react-start";
import type { db } from "@/lib/brand-client";
import { authMiddleware } from "@/server/middleware";

// -- Queries ------------------------------------------------------------------

export const getInvoiceServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; invoiceId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getInvoice(data.orgId, data.invoiceId);
	});

export const listInvoicesServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			params: {
				status?: db.InvoiceStatus;
				skip?: number;
				take?: number;
				q?: string;
				sortBy?: "createdAt" | "issuedAt" | "dueDate" | "totalAmount";
				sortOrder?: "asc" | "desc";
			};
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.listInvoices(data.orgId, data.params);
	});

// -- Mutations ----------------------------------------------------------------

export const generateInvoicePDFServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; invoiceId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.generateInvoicePDF(data.orgId, data.invoiceId);
	});
