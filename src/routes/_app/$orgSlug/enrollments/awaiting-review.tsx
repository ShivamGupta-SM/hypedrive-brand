import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { campaignsLookupQueryOptions } from "@/features/campaigns/queries";
import { infiniteEnrollmentsQueryOptions } from "@/features/enrollments/queries";
import { EnrollmentsGrid } from "@/pages/enrollments/enrollments-grid";

export const Route = createFileRoute("/_app/$orgSlug/enrollments/awaiting-review")({
	head: () => ({
		meta: [{ title: "Awaiting Review | Enrollments | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchInfiniteQuery(
			infiniteEnrollmentsQueryOptions(orgId, { status: "awaiting_review" }),
		);
		context.queryClient.prefetchQuery(campaignsLookupQueryOptions(orgId));
	},
	component: () => <EnrollmentsGrid status="awaiting_review" />,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
