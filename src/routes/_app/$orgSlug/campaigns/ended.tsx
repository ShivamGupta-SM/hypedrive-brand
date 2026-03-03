import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteCampaignsQueryOptions } from "@/features/campaigns/queries";
import { CampaignsGrid } from "@/pages/campaigns/campaigns-grid";

export const Route = createFileRoute("/_app/$orgSlug/campaigns/ended")({
	head: () => ({
		meta: [{ title: "Ended Campaigns | Hypedrive" }],
	}),
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.prefetchInfiniteQuery(infiniteCampaignsQueryOptions(orgId, { status: "ended" }));
	},
	component: () => <CampaignsGrid status="ended" />,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
