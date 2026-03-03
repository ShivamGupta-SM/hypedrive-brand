import { createFileRoute } from "@tanstack/react-router";

import { dashboardQueryOptions, organizationActivityQueryOptions, setupProgressQueryOptions } from "@/hooks/api-client";
import { Dashboard } from "@/pages/dashboard";

export const Route = createFileRoute("/_app/$orgSlug/")({
	head: () => ({
		meta: [{ title: "Dashboard | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		// Fire all three in parallel — don't await, just prime the cache
		context.queryClient.ensureQueryData(dashboardQueryOptions(orgId));
		context.queryClient.ensureQueryData(organizationActivityQueryOptions(orgId, { limit: 6 }));
		context.queryClient.ensureQueryData(setupProgressQueryOptions(orgId));
	},
	component: Dashboard,
});
