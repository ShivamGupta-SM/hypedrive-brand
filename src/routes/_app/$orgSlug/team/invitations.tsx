import { createFileRoute } from "@tanstack/react-router";
import { TeamInvitations } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team/invitations")({
	head: () => ({
		meta: [{ title: "Invitations | Team | Hypedrive" }],
	}),
	component: TeamInvitations,
});
