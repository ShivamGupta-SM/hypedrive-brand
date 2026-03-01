import { createFileRoute } from "@tanstack/react-router";
import { TeamLayout } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team")({
	head: () => ({
		meta: [{ title: "Team | Hypedrive" }],
	}),
	component: TeamLayout,
});
