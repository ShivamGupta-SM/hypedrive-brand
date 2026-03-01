import { createFileRoute } from "@tanstack/react-router";
import { TeamMembers } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team/")({
	component: TeamMembers,
});
