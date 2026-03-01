import { createFileRoute } from "@tanstack/react-router";

import { Login } from "@/pages/auth";

export const Route = createFileRoute("/_auth/login")({
	head: () => ({
		meta: [{ title: "Login | Hypedrive" }],
	}),
	component: Login,
});
