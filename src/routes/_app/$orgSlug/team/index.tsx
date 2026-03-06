import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { membersQueryOptions } from "@/features/team/queries";
import { TeamMembers } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team/")({
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.prefetchQuery(membersQueryOptions(orgId));
	},
	component: TeamMembers,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
