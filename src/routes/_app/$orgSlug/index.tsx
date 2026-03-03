import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import {
	dashboardQueryOptions,
	organizationActivityQueryOptions,
	setupProgressQueryOptions,
} from "@/features/organization/queries";
import { Dashboard } from "@/pages/dashboard";

export const Route = createFileRoute("/_app/$orgSlug/")({
	head: () => ({
		meta: [{ title: "Dashboard | Hypedrive" }],
	}),
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await Promise.all([
			context.queryClient.ensureQueryData(dashboardQueryOptions(orgId)),
			context.queryClient.ensureQueryData(organizationActivityQueryOptions(orgId, { limit: 6 })),
			context.queryClient.ensureQueryData(setupProgressQueryOptions(orgId)),
		]);
	},
	component: Dashboard,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
