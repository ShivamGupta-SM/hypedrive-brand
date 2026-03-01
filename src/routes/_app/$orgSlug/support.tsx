import { createFileRoute } from "@tanstack/react-router";

import { Support } from "@/pages/support";

export const Route = createFileRoute("/_app/$orgSlug/support")({
	head: () => ({
		meta: [{ title: "Support | Hypedrive" }],
	}),
	component: Support,
});
