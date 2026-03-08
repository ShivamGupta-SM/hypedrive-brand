import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import {
	infiniteWalletTransactionsQueryOptions,
	walletHoldsQueryOptions,
	walletQueryOptions,
} from "@/features/wallet/queries";

export const Route = createFileRoute("/_app/$orgSlug/wallet")({
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await Promise.all([
			context.queryClient.ensureQueryData(walletQueryOptions(orgId)),
			context.queryClient.ensureQueryData(walletHoldsQueryOptions(orgId)),
			context.queryClient.prefetchInfiniteQuery(infiniteWalletTransactionsQueryOptions(orgId, {})),
		]);
	},
	head: () => ({
		meta: [{ title: "Wallet | Hypedrive" }],
	}),
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
