import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { campaignsLookupQueryOptions } from "@/features/campaigns/queries";
import { infiniteEnrollmentsQueryOptions } from "@/features/enrollments/queries";
import { EnrollmentsGrid } from "@/pages/enrollments/enrollments-grid";

export const Route = createFileRoute("/_app/$orgSlug/enrollments/approved")({
	head: () => ({
		meta: [{ title: "Approved | Enrollments | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchInfiniteQuery(infiniteEnrollmentsQueryOptions(orgId, { status: "approved" }));
		context.queryClient.prefetchQuery(campaignsLookupQueryOptions(orgId));
	},
	component: () => <EnrollmentsGrid status="approved" />,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
