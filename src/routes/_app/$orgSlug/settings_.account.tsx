import { createFileRoute, redirect } from "@tanstack/react-router";

// Account settings are now a dialog — redirect deep-links back to dashboard
export const Route = createFileRoute("/_app/$orgSlug/settings_/account")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/$orgSlug", params, replace: true });
	},
	component: () => null,
});
