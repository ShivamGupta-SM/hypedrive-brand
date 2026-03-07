import { createFileRoute } from "@tanstack/react-router";
import { CampaignsGrid } from "@/pages/campaigns/campaigns-grid";
import { campaignStatusRouteConfig } from "./-route-config";

export const Route = createFileRoute("/_app/$orgSlug/campaigns/ended")({
	...campaignStatusRouteConfig("ended"),
	component: () => <CampaignsGrid status="ended" />,
});
