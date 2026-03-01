import { createFileRoute } from "@tanstack/react-router";
import { WalletDeposits } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/deposits")({
	head: () => ({
		meta: [{ title: "Deposits | Wallet | Hypedrive" }],
	}),
	component: WalletDeposits,
});
