import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteListingsQueryOptions } from "@/features/listings/queries";
import { ListingsList } from "@/pages/listings";

const searchSchema = z.object({
	q: z.string().optional().catch(undefined),
	sort: z.enum(["date", "name", "price", "views"]).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/$orgSlug/listings")({
	head: () => ({
		meta: [{ title: "Listings | Hypedrive" }],
	}),
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.prefetchInfiniteQuery(infiniteListingsQueryOptions(orgId, {}));
	},
	component: ListingsList,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
