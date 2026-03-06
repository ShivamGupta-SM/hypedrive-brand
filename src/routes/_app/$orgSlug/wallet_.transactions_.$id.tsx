import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { walletTransactionQueryOptions } from "@/features/wallet/queries";
import { TransactionShow } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet_/transactions_/$id")({
	loader: ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.ensureQueryData(walletTransactionQueryOptions(orgId, params.id));
	},
	head: () => ({
		meta: [{ title: "Transaction | Hypedrive" }],
	}),
	component: TransactionShow,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
