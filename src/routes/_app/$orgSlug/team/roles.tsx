import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorComponent, RoutePendingComponent } from "@/components/shared/route-error";
import { organizationRolesQueryOptions } from "@/features/team/queries";
import { TeamRoles } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team/roles")({
	loader: async ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		await context.queryClient.ensureQueryData(organizationRolesQueryOptions(orgId));
	},
	head: () => ({
		meta: [{ title: "Roles | Team | Hypedrive" }],
	}),
	component: TeamRoles,
	errorComponent: RouteErrorComponent,
	pendingComponent: RoutePendingComponent,
});
