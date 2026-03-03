import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { campaignsLookupQueryOptions } from "@/features/campaigns/queries";
import { infiniteEnrollmentsQueryOptions } from "@/features/enrollments/queries";
import { EnrollmentsList } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/enrollments")({
	head: () => ({
		meta: [{ title: "Enrollments | Hypedrive" }],
	}),
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await Promise.all([
			context.queryClient.prefetchInfiniteQuery(infiniteEnrollmentsQueryOptions(orgId, {})),
			context.queryClient.ensureQueryData(campaignsLookupQueryOptions(orgId)),
		]);
	},
	component: EnrollmentsList,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
