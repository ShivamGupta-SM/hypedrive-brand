import { createFileRoute } from "@tanstack/react-router";
import { EnrollmentsGrid } from "@/pages/enrollments/enrollments-grid";
import { enrollmentStatusRouteConfig } from "./-route-config";

export const Route = createFileRoute("/_app/$orgSlug/enrollments/awaiting-review")({
	...enrollmentStatusRouteConfig("awaiting_review"),
	component: () => <EnrollmentsGrid status="awaiting_review" />,
});
