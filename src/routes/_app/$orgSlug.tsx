/**
 * Organization Layout Route - URL-based multi-tenancy
 *
 * All routes under /$orgSlug require:
 * 1. User to be authenticated (checked by parent _app)
 * 2. Organization to exist and user has access
 * 3. Organization to be approved
 *
 * Permissions data (role + custom permissions) is resolved in beforeLoad
 * and passed via router context. The `can()` closure is built in
 * useOrgContext() from this serializable data — SSR-safe, no Zustand.
 *
 * Renders AppLayout here so all sidebar components (OrganizationSwitcher,
 * NotificationPopover, SearchDialog) have direct access to org data
 * via props from router context.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { NotificationStreamProvider } from "@/components/notification-stream-provider";
import { NotFoundPage } from "@/components/shared/not-found-page";
import { RouteErrorComponent } from "@/components/shared/route-error";
import { CACHE, queryKeys } from "@/hooks/api-client";
import { ORG_ROLE_PERMISSIONS } from "@/lib/permissions/definitions";
import { getActiveMemberFromServer, getOrgRolesFromServer } from "@/server/auth-queries";

export const Route = createFileRoute("/_app/$orgSlug")({
	beforeLoad: async ({ params, context }) => {
		const organizations = context.organizations ?? [];

		// Find organization by slug from URL
		const org = organizations.find((o) => o.slug === params.orgSlug);

		// No matching organization — redirect to first org or onboarding
		if (!org) {
			if (organizations.length > 0) {
				throw redirect({ to: "/$orgSlug", params: { orgSlug: organizations[0].slug } });
			}
			throw redirect({ to: "/onboarding" });
		}

		// Check approval status
		const status = org.approvalStatus;

		if (status === "pending" || status === "draft") {
			throw redirect({ to: "/pending-approval" });
		}

		if (status === "rejected" || status === "banned") {
			throw redirect({ to: "/rejected" });
		}

		// Fetch active member + org roles in parallel for RBAC, cached per org.
		// Wrapped in try-catch so a transient fetch error during client hydration
		// doesn't bubble up to the root error boundary.
		let member: { role: string } | null = null;
		let customPermissions: Record<string, string[]> | null = null;

		try {
			const [memberResult, rolesResult] = await Promise.all([
				context.queryClient.ensureQueryData({
					queryKey: queryKeys.activeMember(org.id),
					queryFn: () => getActiveMemberFromServer({ data: { organizationId: org.id } }),
					staleTime: CACHE.auth,
				}),
				context.queryClient.ensureQueryData({
					queryKey: queryKeys.organizationRoles(org.id),
					queryFn: () => getOrgRolesFromServer({ data: { organizationId: org.id } }),
					staleTime: CACHE.settings,
				}),
			]);
			member = memberResult.member;

			// If member has a custom role (not in the hardcoded matrix), resolve its permissions
			if (member?.role && !(member.role in ORG_ROLE_PERMISSIONS)) {
				const memberRole = member.role;
				const match = rolesResult.roles.find(
					(r: { role: string; permission?: Record<string, string[]> }) => r.role === memberRole
				);
				customPermissions = match?.permission ?? null;
			}
		} catch {
			// Transient error — permissions default to deny-all (can() returns false)
		}

		return {
			organization: org,
			orgSlug: params.orgSlug,
			activeMember: member,
			customPermissions,
		};
	},
	component: OrgLayoutWrapper,
	errorComponent: RouteErrorComponent,
	notFoundComponent: OrgNotFound,
});

function OrgNotFound() {
	const { orgSlug } = Route.useParams();
	return <NotFoundPage fullScreen={false} backButtonLabel="Back to Dashboard" backButtonHref={`/${orgSlug}`} />;
}

function OrgLayoutWrapper() {
	const { auth, organization, organizations } = Route.useRouteContext();

	// organization is guaranteed by beforeLoad (redirects if not found)
	if (!organization) return null;

	return (
		<NotificationStreamProvider organizationId={organization.id}>
			<AppLayout user={auth.user ?? null} organization={organization} organizations={organizations ?? []} />
		</NotificationStreamProvider>
	);
}
