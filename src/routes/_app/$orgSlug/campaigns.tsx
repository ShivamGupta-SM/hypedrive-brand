import { createFileRoute } from "@tanstack/react-router";

import { infiniteCampaignsQueryOptions } from "@/hooks/api-client";
import { CampaignsList } from "@/pages/campaigns";

export const Route = createFileRoute("/_app/$orgSlug/campaigns")({
	head: () => ({
		meta: [{ title: "Campaigns | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchInfiniteQuery(infiniteCampaignsQueryOptions(orgId, {}));
	},
	component: CampaignsList,
});
