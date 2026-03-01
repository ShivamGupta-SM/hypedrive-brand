import { createFileRoute } from "@tanstack/react-router";

import { Register } from "@/pages/auth";

export const Route = createFileRoute("/_auth/register")({
	head: () => ({
		meta: [{ title: "Register | Hypedrive" }],
	}),
	component: Register,
});
