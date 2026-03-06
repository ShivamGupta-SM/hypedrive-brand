import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteWalletTransactionsQueryOptions } from "@/features/wallet/queries";
import { WalletTransactions } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/")({
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchInfiniteQuery(infiniteWalletTransactionsQueryOptions(orgId));
	},
	head: () => ({
		meta: [{ title: "Transactions | Wallet | Hypedrive" }],
	}),
	component: WalletTransactions,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
