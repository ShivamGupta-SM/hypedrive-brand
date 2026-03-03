import { createFileRoute } from "@tanstack/react-router";

import { campaignsLookupQueryOptions, infiniteEnrollmentsQueryOptions } from "@/hooks/api-client";
import { EnrollmentsList } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/enrollments")({
	head: () => ({
		meta: [{ title: "Enrollments | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		// Prefetch enrollments + campaign name lookup in parallel
		context.queryClient.prefetchInfiniteQuery(infiniteEnrollmentsQueryOptions(orgId, {}));
		context.queryClient.ensureQueryData(campaignsLookupQueryOptions(orgId));
	},
	component: EnrollmentsList,
});
