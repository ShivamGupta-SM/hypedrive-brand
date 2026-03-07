import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { campaignQueryOptions, campaignStatsQueryOptions } from "@/features/campaigns/queries";

export const Route = createFileRoute("/_app/$orgSlug/campaigns_/$id")({
	head: () => ({
		meta: [{ title: "Campaign | Hypedrive" }],
	}),
	loader: async ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await Promise.all([
			context.queryClient.ensureQueryData(campaignQueryOptions(orgId, params.id)),
			context.queryClient.ensureQueryData(campaignStatsQueryOptions(orgId, params.id)),
		]);
	},
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
