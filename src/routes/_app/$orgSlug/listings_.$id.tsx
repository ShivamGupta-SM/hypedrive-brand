import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { listingQueryOptions } from "@/features/listings/queries";

export const Route = createFileRoute("/_app/$orgSlug/listings_/$id")({
	head: () => ({
		meta: [{ title: "Listing | Hypedrive" }],
	}),
	loader: async ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.ensureQueryData(listingQueryOptions(orgId, params.id));
	},
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
