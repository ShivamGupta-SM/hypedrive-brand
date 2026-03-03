import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { campaignsLookupQueryOptions } from "@/features/campaigns/queries";
import { infiniteEnrollmentsQueryOptions } from "@/features/enrollments/queries";
import { EnrollmentsGrid } from "@/pages/enrollments/enrollments-grid";

export const Route = createFileRoute("/_app/$orgSlug/enrollments/rejected")({
	head: () => ({
		meta: [{ title: "Rejected | Enrollments | Hypedrive" }],
	}),
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await Promise.all([
			context.queryClient.prefetchInfiniteQuery(
				infiniteEnrollmentsQueryOptions(orgId, { status: "permanently_rejected" }),
			),
			context.queryClient.ensureQueryData(campaignsLookupQueryOptions(orgId)),
		]);
	},
	component: () => <EnrollmentsGrid status="permanently_rejected" />,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
