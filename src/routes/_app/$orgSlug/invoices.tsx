import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteInvoicesQueryOptions } from "@/features/invoices/queries";
import { InvoicesList } from "@/pages/invoices";

export const Route = createFileRoute("/_app/$orgSlug/invoices")({
	head: () => ({
		meta: [{ title: "Invoices | Hypedrive" }],
	}),
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.prefetchInfiniteQuery(infiniteInvoicesQueryOptions(orgId, {}));
	},
	component: InvoicesList,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
