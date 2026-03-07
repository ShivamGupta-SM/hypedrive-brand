import { createFileRoute } from "@tanstack/react-router";
import { CampaignsGrid } from "@/pages/campaigns/campaigns-grid";
import { campaignStatusRouteConfig } from "./-route-config";

export const Route = createFileRoute("/_app/$orgSlug/campaigns/active")({
	...campaignStatusRouteConfig("active"),
	component: () => <CampaignsGrid status="active" />,
});
