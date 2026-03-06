import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteCampaignsQueryOptions } from "@/features/campaigns/queries";
import { CampaignsLayout } from "@/pages/campaigns";

const searchSchema = z.object({
	q: z.string().optional().catch(undefined),
	sort: z.enum(["newest", "oldest", "title", "startDate"]).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/$orgSlug/campaigns")({
	head: () => ({
		meta: [{ title: "Campaigns | Hypedrive" }],
	}),
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.prefetchInfiniteQuery(infiniteCampaignsQueryOptions(orgId, {}));
	},
	component: CampaignsLayout,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
