import { createFileRoute } from "@tanstack/react-router";

import { Onboarding } from "@/pages/onboarding";

export const Route = createFileRoute("/_onboarding/onboarding")({
	head: () => ({
		meta: [{ title: "Get Started | Hypedrive" }],
	}),
	component: Onboarding,
});
