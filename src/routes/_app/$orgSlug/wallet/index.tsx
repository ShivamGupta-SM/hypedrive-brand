import { createFileRoute } from "@tanstack/react-router";
import { WalletOverview } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet/")({
	component: WalletOverview,
});
