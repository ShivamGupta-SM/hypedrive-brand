import { createFileRoute } from "@tanstack/react-router";

import { campaignQueryOptions, campaignStatsQueryOptions } from "@/hooks/api-client";
import { CampaignShow } from "@/pages/campaigns";

export const Route = createFileRoute("/_app/$orgSlug/campaigns_/$id")({
	head: () => ({
		meta: [{ title: "Campaign | Hypedrive" }],
	}),
	loader: ({ context, params }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		// Prefetch campaign + stats in parallel
		context.queryClient.ensureQueryData(campaignQueryOptions(orgId, params.id));
		context.queryClient.ensureQueryData(campaignStatsQueryOptions(orgId, params.id));
	},
	component: CampaignShow,
});
