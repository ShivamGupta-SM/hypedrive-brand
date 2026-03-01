import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AcceptInvite } from "@/pages/auth";

const searchSchema = z.object({
	invitationId: z.string().optional(),
});

export const Route = createFileRoute("/_auth/accept-invite")({
	head: () => ({
		meta: [{ title: "Accept Invitation | Hypedrive" }],
	}),
	validateSearch: searchSchema,
	component: AcceptInvite,
});
