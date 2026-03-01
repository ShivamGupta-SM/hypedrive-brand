import { createFileRoute } from "@tanstack/react-router";
import { TeamRoles } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team/roles")({
	head: () => ({
		meta: [{ title: "Roles | Team | Hypedrive" }],
	}),
	component: TeamRoles,
});
