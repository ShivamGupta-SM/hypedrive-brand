import { createFileRoute } from "@tanstack/react-router";
import { CampaignsList } from "@/pages/campaigns";

export const Route = createFileRoute("/_app/$orgSlug/campaigns")({
	head: () => ({
		meta: [{ title: "Campaigns | Hypedrive" }],
	}),
	component: CampaignsList,
});
