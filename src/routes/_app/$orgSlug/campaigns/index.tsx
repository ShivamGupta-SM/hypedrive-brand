import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteCampaignsQueryOptions } from "@/features/campaigns/queries";
import { CampaignsAll } from "@/pages/campaigns";

export const Route = createFileRoute("/_app/$orgSlug/campaigns/")({
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.prefetchInfiniteQuery(infiniteCampaignsQueryOptions(orgId, {}));
	},
	component: CampaignsAll,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
