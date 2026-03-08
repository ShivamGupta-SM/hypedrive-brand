import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$orgSlug/support")({
	head: () => ({
		meta: [{ title: "Support | Hypedrive" }],
	}),
});
