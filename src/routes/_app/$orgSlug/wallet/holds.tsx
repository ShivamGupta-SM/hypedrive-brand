import { createFileRoute } from "@tanstack/react-router";
import { WalletHolds } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/holds")({
	head: () => ({
		meta: [{ title: "Holds | Wallet | Hypedrive" }],
	}),
	component: WalletHolds,
});
