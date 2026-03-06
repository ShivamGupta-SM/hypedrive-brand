import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteCampaignsQueryOptions } from "@/features/campaigns/queries";
import { CampaignsGrid } from "@/pages/campaigns/campaigns-grid";

export const Route = createFileRoute("/_app/$orgSlug/campaigns/paused")({
	head: () => ({
		meta: [{ title: "Paused Campaigns | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchInfiniteQuery(infiniteCampaignsQueryOptions(orgId, { status: "paused" }));
	},
	component: () => <CampaignsGrid status="paused" />,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
