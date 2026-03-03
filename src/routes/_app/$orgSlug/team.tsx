import { createFileRoute } from "@tanstack/react-router";

import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { invitationsQueryOptions, membersQueryOptions } from "@/features/team/queries";
import { TeamLayout } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team")({
	head: () => ({
		meta: [{ title: "Team | Hypedrive" }],
	}),
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
