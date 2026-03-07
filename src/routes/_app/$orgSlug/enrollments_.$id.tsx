import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { enrollmentQueryOptions } from "@/features/enrollments/queries";

export const Route = createFileRoute("/_app/$orgSlug/enrollments_/$id")({
	head: () => ({
		meta: [{ title: "Enrollment | Hypedrive" }],
	}),
	loader: async ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.ensureQueryData(enrollmentQueryOptions(orgId, params.id));
	},
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
