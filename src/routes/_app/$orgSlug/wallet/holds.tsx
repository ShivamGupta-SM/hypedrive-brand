import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { walletHoldsQueryOptions } from "@/features/wallet/queries";
import { WalletHolds } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/holds")({
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.ensureQueryData(walletHoldsQueryOptions(orgId));
	},
	head: () => ({
		meta: [{ title: "Holds | Wallet | Hypedrive" }],
	}),
	component: WalletHolds,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
