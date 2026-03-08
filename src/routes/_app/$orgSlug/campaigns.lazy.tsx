import { createLazyFileRoute } from "@tanstack/react-router";
import { CampaignsLayout } from "@/pages/campaigns";

export const Route = createLazyFileRoute("/_app/$orgSlug/campaigns")({
	component: CampaignsLayout,
});
