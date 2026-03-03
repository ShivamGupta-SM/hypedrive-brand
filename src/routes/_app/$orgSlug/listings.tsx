import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteListingsQueryOptions } from "@/features/listings/queries";
import { ListingsList } from "@/pages/listings";

export const Route = createFileRoute("/_app/$orgSlug/listings")({
	head: () => ({
		meta: [{ title: "Listings | Hypedrive" }],
	}),
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.prefetchInfiniteQuery(infiniteListingsQueryOptions(orgId, {}));
	},
	component: ListingsList,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
