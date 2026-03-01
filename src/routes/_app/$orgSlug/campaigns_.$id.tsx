import { createFileRoute } from "@tanstack/react-router";
import { CampaignShow } from "@/pages/campaigns";

export const Route = createFileRoute("/_app/$orgSlug/campaigns_/$id")({
	head: () => ({
		meta: [{ title: "Campaign | Hypedrive" }],
	}),
	component: CampaignShow,
});
