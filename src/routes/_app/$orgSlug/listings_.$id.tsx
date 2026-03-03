import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { listingQueryOptions } from "@/features/listings/queries";
import { ListingShow } from "@/pages/listings";

export const Route = createFileRoute("/_app/$orgSlug/listings_/$id")({
	head: () => ({
		meta: [{ title: "Listing | Hypedrive" }],
	}),
	loader: async ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.ensureQueryData(listingQueryOptions(orgId, params.id));
	},
	component: ListingShow,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
