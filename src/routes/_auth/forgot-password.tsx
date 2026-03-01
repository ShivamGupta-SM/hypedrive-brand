import { createFileRoute } from "@tanstack/react-router";

import { ForgotPassword } from "@/pages/auth";

export const Route = createFileRoute("/_auth/forgot-password")({
	head: () => ({
		meta: [{ title: "Forgot Password | Hypedrive" }],
	}),
	component: ForgotPassword,
});
