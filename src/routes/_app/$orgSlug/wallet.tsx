import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { walletHoldsQueryOptions, walletQueryOptions } from "@/features/wallet/queries";
import { WalletLayout } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet")({
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await Promise.all([
			context.queryClient.ensureQueryData(walletQueryOptions(orgId)),
			context.queryClient.ensureQueryData(walletHoldsQueryOptions(orgId)),
		]);
	},
	head: () => ({
		meta: [{ title: "Wallet | Hypedrive" }],
	}),
	component: WalletLayout,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
