import { createFileRoute, redirect } from "@tanstack/react-router";

// Settings are now a dialog — redirect deep-links back to dashboard
export const Route = createFileRoute("/_app/$orgSlug/settings")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/$orgSlug", params, replace: true });
	},
	component: () => null,
});
