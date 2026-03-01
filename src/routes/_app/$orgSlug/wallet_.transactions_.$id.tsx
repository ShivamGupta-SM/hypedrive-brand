import { createFileRoute } from "@tanstack/react-router";

import { TransactionShow } from "@/pages/wallet";

export const Route = createFileRoute("/_app/$orgSlug/wallet_/transactions_/$id")({
	head: () => ({
		meta: [{ title: "Transaction | Hypedrive" }],
	}),
	component: TransactionShow,
});
