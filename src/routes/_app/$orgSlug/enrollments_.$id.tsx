import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { enrollmentQueryOptions } from "@/features/enrollments/queries";
import { EnrollmentShow } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/enrollments_/$id")({
	head: () => ({
		meta: [{ title: "Enrollment | Hypedrive" }],
	}),
	loader: async ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.ensureQueryData(enrollmentQueryOptions(orgId, params.id));
	},
	component: EnrollmentShow,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
