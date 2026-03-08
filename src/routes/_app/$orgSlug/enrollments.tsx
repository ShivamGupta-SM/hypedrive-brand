import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { campaignsLookupQueryOptions } from "@/features/campaigns/queries";
import { infiniteEnrollmentsQueryOptions } from "@/features/enrollments/queries";

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/$orgSlug/enrollments")({
  head: () => ({
    meta: [{ title: "Enrollments | Hypedrive" }],
  }),
  validateSearch: searchSchema,
  loader: async ({ context }) => {
    const orgId = context.organization?.id;
    if (!orgId) return;
    await Promise.all([
      context.queryClient.prefetchInfiniteQuery(infiniteEnrollmentsQueryOptions(orgId, {})),
      context.queryClient.ensureQueryData(campaignsLookupQueryOptions(orgId)),
    ]);
  },
  errorComponent: RouteErrorComponent,
  pendingComponent: RoutePendingComponent,
});
