/**
 * Shared route config factory for enrollment status sub-routes.
 * File prefixed with `-` so TanStack Router ignores it (not a route).
 */

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { campaignsLookupQueryOptions } from "@/features/campaigns/queries";
import { infiniteEnrollmentsQueryOptions } from "@/features/enrollments/queries";

type EnrollmentStatus = "awaiting_review" | "approved" | "permanently_rejected";

const TITLES: Record<EnrollmentStatus, string> = {
	awaiting_review: "Awaiting Review | Enrollments",
	approved: "Approved | Enrollments",
	permanently_rejected: "Rejected | Enrollments",
};

export function enrollmentStatusRouteConfig(status: EnrollmentStatus) {
	return {
		head: () => ({
			meta: [{ title: `${TITLES[status]} | Hypedrive` }],
		}),
		loader: ({ context }: { context: { organization?: { id: string } | null; queryClient: any } }) => {
			const orgId = context.organization?.id;
			if (!orgId) return;
			context.queryClient.prefetchInfiniteQuery(infiniteEnrollmentsQueryOptions(orgId, { status }));
			context.queryClient.prefetchQuery(campaignsLookupQueryOptions(orgId));
		},
		errorComponent: RouteErrorComponent,
		pendingComponent: RoutePendingComponent,
	} as const;
}
