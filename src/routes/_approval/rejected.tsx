import { createFileRoute } from "@tanstack/react-router";

import { Rejected } from "@/pages/approval";

export const Route = createFileRoute("/_approval/rejected")({
	head: () => ({
		meta: [{ title: "Application Status | Hypedrive" }],
	}),
	component: Rejected,
});
