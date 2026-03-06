import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { withdrawalStatsQueryOptions, withdrawalsQueryOptions } from "@/features/wallet/queries";
import { WalletWithdrawals } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/withdrawals")({
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchQuery(withdrawalsQueryOptions(orgId));
		context.queryClient.prefetchQuery(withdrawalStatsQueryOptions(orgId));
	},
	head: () => ({
		meta: [{ title: "Withdrawals | Wallet | Hypedrive" }],
	}),
	component: WalletWithdrawals,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
