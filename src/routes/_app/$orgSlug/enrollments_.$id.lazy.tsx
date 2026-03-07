import { createLazyFileRoute } from "@tanstack/react-router";
import { EnrollmentShow } from "@/pages/enrollments";

export const Route = createLazyFileRoute("/_app/$orgSlug/enrollments_/$id")({
	component: EnrollmentShow,
});
