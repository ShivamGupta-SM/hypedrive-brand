import { createLazyFileRoute } from "@tanstack/react-router";
import { WalletLayout } from "@/pages/wallet";

export const Route = createLazyFileRoute("/_app/$orgSlug/wallet")({
	component: WalletLayout,
});
