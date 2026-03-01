import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "@/pages/dashboard";

export const Route = createFileRoute("/_app/$orgSlug/")({
	head: () => ({
		meta: [{ title: "Dashboard | Hypedrive" }],
	}),
	// Dashboard component handles its own data fetching via useQuery hooks
	// No prefetch needed since getDashboardOverview is not available in the API
	component: Dashboard,
});
