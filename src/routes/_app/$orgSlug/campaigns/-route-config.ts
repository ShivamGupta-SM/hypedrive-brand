/**
 * Shared route config factories for campaign & enrollment status sub-routes.
 * Eliminates copy-paste across status filter routes.
 *
 * File prefixed with `-` so TanStack Router ignores it (not a route).
 */

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { infiniteCampaignsQueryOptions } from "@/features/campaigns/queries";

type CampaignStatus = "active" | "draft" | "paused" | "ended";

const TITLES: Record<CampaignStatus, string> = {
	active: "Active Campaigns",
	draft: "Draft Campaigns",
	paused: "Paused Campaigns",
	ended: "Ended Campaigns",
};

export function campaignStatusRouteConfig(status: CampaignStatus) {
	return {
		head: () => ({
			meta: [{ title: `${TITLES[status]} | Hypedrive` }],
		}),
		loader: ({ context }: { context: { organization?: { id: string } | null; queryClient: any } }) => {
			const orgId = context.organization?.id;
			if (!orgId) return;
			context.queryClient.prefetchInfiniteQuery(infiniteCampaignsQueryOptions(orgId, { status }));
		},
		errorComponent: RouteErrorComponent,
		pendingComponent: RoutePendingComponent,
	} as const;
}
