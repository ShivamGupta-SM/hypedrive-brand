import { createFileRoute } from "@tanstack/react-router";

import { listingQueryOptions } from "@/hooks/api-client";
import { ListingShow } from "@/pages/listings";

export const Route = createFileRoute("/_app/$orgSlug/listings_/$id")({
	head: () => ({
		meta: [{ title: "Listing | Hypedrive" }],
	}),
	loader: ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.ensureQueryData(listingQueryOptions(orgId, params.id));
	},
	component: ListingShow,
});
