import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { campaignsLookupQueryOptions } from "@/features/campaigns/queries";
import { infiniteEnrollmentsQueryOptions } from "@/features/enrollments/queries";
import { EnrollmentsAll } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/enrollments/")({
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchInfiniteQuery(infiniteEnrollmentsQueryOptions(orgId, {}));
		context.queryClient.prefetchQuery(campaignsLookupQueryOptions(orgId));
	},
	component: EnrollmentsAll,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
