import { createFileRoute } from "@tanstack/react-router";

import { enrollmentQueryOptions } from "@/hooks/api-client";
import { EnrollmentShow } from "@/pages/enrollments";

export const Route = createFileRoute("/_app/$orgSlug/enrollments_/$id")({
	head: () => ({
		meta: [{ title: "Enrollment | Hypedrive" }],
	}),
	loader: ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.ensureQueryData(enrollmentQueryOptions(orgId, params.id));
	},
	component: EnrollmentShow,
});
