/**
 * Invoice Mutations — batch operations, PDF generation.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import { batchInvoicesServer, exportInvoiceEnrollmentsServer, generateInvoicePDFServer } from "./server";

export function useGenerateInvoicePDF(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (invoiceId: string) => {
			return generateInvoicePDFServer({ data: { orgId: organizationId as string, invoiceId } });
		},
		onSuccess: (_, invoiceId) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.invoice(organizationId || "", invoiceId),
			});
		},
	});
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

export function useExportInvoiceEnrollments(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (invoiceId: string) => {
			return exportInvoiceEnrollmentsServer({ data: { orgId: organizationId as string, invoiceId } });
		},
	});
}

export function useBatchInvoices() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			organizationId,
			action,
			invoiceIds,
		}: {
			organizationId: string;
			action: "mark_paid";
			invoiceIds: string[];
		}) => {
			return batchInvoicesServer({
				data: { orgId: organizationId, action, invoiceIds },
			});
		},
		onSuccess: (_, v) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.invoices(v.organizationId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteInvoices(v.organizationId) });
		},
	});
}
