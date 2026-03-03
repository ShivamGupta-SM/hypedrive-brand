import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { invitationsQueryOptions } from "@/features/team/queries";
import { TeamInvitations } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team/invitations")({
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.ensureQueryData(invitationsQueryOptions(orgId));
	},
	head: () => ({
		meta: [{ title: "Invitations | Team | Hypedrive" }],
	}),
	component: TeamInvitations,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
