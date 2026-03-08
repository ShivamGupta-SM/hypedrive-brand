import { createLazyFileRoute } from "@tanstack/react-router";
import { TransactionShow } from "@/pages/wallet";

export const Route = createLazyFileRoute("/_app/$orgSlug/wallet_/transactions_/$id")({
	component: TransactionShow,
});
