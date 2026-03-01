import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { VerifyEmail } from "@/pages/auth/verify-email";

const searchSchema = z.object({
	token: z.string().optional(),
});

export const Route = createFileRoute("/_auth/verify-email")({
	head: () => ({
		meta: [{ title: "Verify Email | Hypedrive" }],
	}),
	validateSearch: searchSchema,
	component: VerifyEmail,
});
