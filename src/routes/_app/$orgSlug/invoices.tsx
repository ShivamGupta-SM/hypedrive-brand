import { createFileRoute } from "@tanstack/react-router";

import { infiniteInvoicesQueryOptions } from "@/hooks/api-client";
import { InvoicesList } from "@/pages/invoices";

export const Route = createFileRoute("/_app/$orgSlug/invoices")({
	head: () => ({
		meta: [{ title: "Invoices | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchInfiniteQuery(infiniteInvoicesQueryOptions(orgId, {}));
	},
	component: InvoicesList,
});
