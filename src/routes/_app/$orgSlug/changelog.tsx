import { createFileRoute } from "@tanstack/react-router";

import { Changelog } from "@/pages/changelog";

export const Route = createFileRoute("/_app/$orgSlug/changelog")({
	head: () => ({
		meta: [{ title: "Changelog | Hypedrive" }],
	}),
	component: Changelog,
});
