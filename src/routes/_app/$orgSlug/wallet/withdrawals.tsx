import { createFileRoute } from "@tanstack/react-router";
import { WalletWithdrawals } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/withdrawals")({
	head: () => ({
		meta: [{ title: "Withdrawals | Wallet | Hypedrive" }],
	}),
	component: WalletWithdrawals,
});
