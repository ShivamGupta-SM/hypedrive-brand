import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ResetPassword } from "@/pages/auth";

const searchSchema = z.object({
	token: z.string().optional(),
});

export const Route = createFileRoute("/_auth/reset-password")({
	head: () => ({
		meta: [{ title: "Reset Password | Hypedrive" }],
	}),
	validateSearch: searchSchema,
	component: ResetPassword,
});
