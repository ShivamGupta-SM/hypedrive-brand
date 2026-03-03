import { createFileRoute } from "@tanstack/react-router";

import { infiniteListingsQueryOptions } from "@/hooks/api-client";
import { ListingsList } from "@/pages/listings";

export const Route = createFileRoute("/_app/$orgSlug/listings")({
	head: () => ({
		meta: [{ title: "Listings | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchInfiniteQuery(infiniteListingsQueryOptions(orgId, {}));
	},
	component: ListingsList,
});
