/**
 * Authenticated App Layout — Auth guard only.
 *
 * Redirects unauthenticated users to /login.
 * AppLayout rendering moved to $orgSlug.tsx so all sidebar components
 * (OrganizationSwitcher, NotificationPopover, SearchDialog) have direct
 * access to router context with org data — no Zustand bridge needed.
 */

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "/login" });
		}
	},
	component: () => <Outlet />,
});
