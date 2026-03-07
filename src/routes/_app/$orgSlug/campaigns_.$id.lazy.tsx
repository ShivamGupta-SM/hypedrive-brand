import { createLazyFileRoute } from "@tanstack/react-router";
import { CampaignShow } from "@/pages/campaigns";

export const Route = createLazyFileRoute("/_app/$orgSlug/campaigns_/$id")({
	component: CampaignShow,
});
