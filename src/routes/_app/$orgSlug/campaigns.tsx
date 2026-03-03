import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteCampaignsQueryOptions } from "@/features/campaigns/queries";
import { CampaignsList } from "@/pages/campaigns";

export const Route = createFileRoute("/_app/$orgSlug/campaigns")({
	head: () => ({
		meta: [{ title: "Campaigns | Hypedrive" }],
	}),
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.prefetchInfiniteQuery(infiniteCampaignsQueryOptions(orgId, {}));
	},
	component: CampaignsList,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
