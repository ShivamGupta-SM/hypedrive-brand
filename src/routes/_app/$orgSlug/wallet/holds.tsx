import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { walletHoldsQueryOptions } from "@/features/wallet/queries";
import { WalletHolds } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/holds")({
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchQuery(walletHoldsQueryOptions(orgId));
	},
	head: () => ({
		meta: [{ title: "Holds | Wallet | Hypedrive" }],
	}),
	component: WalletHolds,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
