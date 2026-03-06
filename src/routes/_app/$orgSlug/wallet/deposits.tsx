import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { depositsQueryOptions } from "@/features/wallet/queries";
import { WalletDeposits } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/deposits")({
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchQuery(depositsQueryOptions(orgId));
	},
	head: () => ({
		meta: [{ title: "Deposits | Wallet | Hypedrive" }],
	}),
	component: WalletDeposits,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
