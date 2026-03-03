import { createFileRoute } from "@tanstack/react-router";

import { invitationsQueryOptions, membersQueryOptions } from "@/hooks/api-client";
import { TeamLayout } from "@/pages/team";

export const Route = createFileRoute("/_app/$orgSlug/team")({
	head: () => ({
		meta: [{ title: "Team | Hypedrive" }],
	}),
	loader: ({ context }) => {
		const orgId = context.organization?.id;
		if (!orgId) return;
		context.queryClient.ensureQueryData(membersQueryOptions(orgId));
		context.queryClient.ensureQueryData(invitationsQueryOptions(orgId));
	},
	component: TeamLayout,
});
