import { createFileRoute } from "@tanstack/react-router";

import { infiniteWalletTransactionsQueryOptions, walletQueryOptions } from "@/hooks/api-client";
import { WalletLayout } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet")({
	head: () => ({
		meta: [{ title: "Wallet | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		// Prefetch wallet overview + transactions in parallel
		context.queryClient.ensureQueryData(walletQueryOptions(orgId));
		context.queryClient.prefetchInfiniteQuery(infiniteWalletTransactionsQueryOptions(orgId, {}));
	},
	component: WalletLayout,
});
