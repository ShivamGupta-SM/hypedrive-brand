import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteInvoicesQueryOptions } from "@/features/invoices/queries";
import { InvoicesList } from "@/pages/invoices";

const searchSchema = z.object({
	q: z.string().optional().catch(undefined),
	sort: z.enum(["newest", "oldest", "amount"]).optional().catch(undefined),
	period: z.enum(["all", "this_month", "last_month", "last_3_months"]).optional().catch(undefined),
	status: z.enum(["all", "unpaid", "paid", "overdue", "draft", "sent", "viewed", "partially_paid", "cancelled"]).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/$orgSlug/invoices")({
	head: () => ({
		meta: [{ title: "Invoices | Hypedrive" }],
	}),
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.prefetchInfiniteQuery(infiniteInvoicesQueryOptions(orgId, {}));
	},
	component: InvoicesList,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
