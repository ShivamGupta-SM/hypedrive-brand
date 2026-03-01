import { createFileRoute } from "@tanstack/react-router";
import { EnrollmentShow } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/enrollments_/$id")({
	head: () => ({
		meta: [{ title: "Enrollment | Hypedrive" }],
	}),
	component: EnrollmentShow,
});
