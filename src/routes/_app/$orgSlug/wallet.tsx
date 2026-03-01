import { createFileRoute } from "@tanstack/react-router";
import { WalletLayout } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet")({
	head: () => ({
		meta: [{ title: "Wallet | Hypedrive" }],
	}),
	component: WalletLayout,
});
