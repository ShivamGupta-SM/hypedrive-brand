import { createFileRoute } from "@tanstack/react-router";
import { EnrollmentsList } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/enrollments")({
	head: () => ({
		meta: [{ title: "Enrollments | Hypedrive" }],
	}),
	component: EnrollmentsList,
});
