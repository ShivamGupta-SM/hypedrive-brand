import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { EnrollmentShow } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/campaigns_/$campaignId/enrollments_/$id")({
	head: () => ({
		meta: [{ title: "Enrollment | Hypedrive" }],
	}),
	component: EnrollmentShow,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
