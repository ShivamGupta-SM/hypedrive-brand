import { createFileRoute } from "@tanstack/react-router";
import { EnrollmentShow } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/campaigns_/$campaignId/enrollments_/$id")({
	head: () => ({
		meta: [{ title: "Enrollment | Hypedrive" }],
	}),
	component: EnrollmentShow,
});
