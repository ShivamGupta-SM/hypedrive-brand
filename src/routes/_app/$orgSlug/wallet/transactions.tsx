import { createFileRoute } from "@tanstack/react-router";
import { WalletTransactions } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/transactions")({
	head: () => ({
		meta: [{ title: "Transactions | Wallet | Hypedrive" }],
	}),
	component: WalletTransactions,
});
