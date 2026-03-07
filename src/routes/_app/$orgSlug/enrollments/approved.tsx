import { createFileRoute } from "@tanstack/react-router";
import { EnrollmentsGrid } from "@/pages/enrollments/enrollments-grid";
import { enrollmentStatusRouteConfig } from "./-route-config";

export const Route = createFileRoute("/_app/$orgSlug/enrollments/approved")({
	...enrollmentStatusRouteConfig("approved"),
	component: () => <EnrollmentsGrid status="approved" />,
});
