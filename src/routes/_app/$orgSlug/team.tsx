import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { invitationsQueryOptions, membersQueryOptions } from "@/features/team/queries";
import { TeamLayout } from "@/pages/team";

const searchSchema = z.object({
	q: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/$orgSlug/team")({
	head: () => ({
		meta: [{ title: "Team | Hypedrive" }],
	}),
	validateSearch: searchSchema,
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await Promise.all([
			context.queryClient.ensureQueryData(membersQueryOptions(orgId)),
			context.queryClient.ensureQueryData(invitationsQueryOptions(orgId)),
		]);
	},
	component: TeamLayout,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
