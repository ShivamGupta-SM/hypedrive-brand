/**
 * Auth Query Server Functions — read-only server functions for auth data.
 *
 * createServerFn exports become RPC stubs in client bundles.
 * Server-only helpers are dynamically imported inside handlers
 * to avoid triggering import-protection.
 */

import { createServerFn } from "@tanstack/react-start";

// =============================================================================
// SESSION + ORGANIZATIONS (combined fetch for root beforeLoad)
// =============================================================================

/**
 * Combined auth + organizations fetch in a single server round-trip.
 * Calls getSession() and listOrganizations() in parallel on the server.
 */
export const getServerAuthWithOrgs = createServerFn({ method: "GET" }).handler(async () => {
	const { readAuthCookie, getServerClient, clearAuthCookies } = await import("@/server/auth-helpers.server");

	const token = readAuthCookie();
	if (!token) {
		return { isAuthenticated: false as const, user: null, token: null, organizations: [] };
	}

	try {
		const client = getServerClient(token);
		const [session, orgResult] = await Promise.all([
			client.auth.getSession(),
			client.auth.listOrganizations().catch(() => ({ organizations: [] as never[] })),
		]);

		if (!session.user) {
			clearAuthCookies();
			return { isAuthenticated: false as const, user: null, token: null, organizations: [] };
		}

		const organizations = (orgResult.organizations ?? []).map((org) => ({
			id: org.id,
			name: org.name,
			slug: org.slug,
			logo: org.logo,
			createdAt: org.createdAt,
			approvalStatus: org.status,
		}));

		return {
			isAuthenticated: true as const,
			user: session.user,
			token,
			organizations,
		};
	} catch {
		clearAuthCookies();
		return { isAuthenticated: false as const, user: null, token: null, organizations: [] };
	}
});

// =============================================================================
// COOKIE MANAGEMENT
// =============================================================================

/**
 * Set auth cookies after login/register.
 * Pass rememberMe: true for extended session (30 days), false for 1 day.
 */
export const setServerAuthCookie = createServerFn({ method: "POST" })
	.inputValidator((input: { token: string; rememberMe?: boolean }) => input)
	.handler(async ({ data }) => {
		const { setAuthCookies } = await import("@/server/auth-helpers.server");
		setAuthCookies(data.token, data.rememberMe);
	});

/** Clear both auth cookies on logout or auth errors. */
export const clearServerAuthCookie = createServerFn({ method: "POST" }).handler(async () => {
	const { clearAuthCookies } = await import("@/server/auth-helpers.server");
	clearAuthCookies();
});

// =============================================================================
// ORGANIZATIONS
// =============================================================================

/** Fetch organizations server-side. */
export const getOrganizationsFromServer = createServerFn({ method: "GET" }).handler(async () => {
	const { readAuthCookie, getServerClient } = await import("@/server/auth-helpers.server");

	const token = readAuthCookie();
	if (!token) throw new Error("UNAUTHORIZED");

	try {
		const client = getServerClient(token);
		const result = await client.auth.listOrganizations();
		const organizations = (result.organizations ?? []).map((org) => ({
			id: org.id,
			name: org.name,
			slug: org.slug,
			logo: org.logo,
			createdAt: org.createdAt,
			approvalStatus: org.status,
		}));
		return { organizations };
	} catch {
		return { organizations: [] };
	}
});

// =============================================================================
// RBAC DATA
// =============================================================================

/** Fetch organization roles server-side (for custom role permission resolution). */
export const getOrgRolesFromServer = createServerFn({ method: "GET" })
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ data }) => {
		const { readAuthCookie, getServerClient } = await import("@/server/auth-helpers.server");

		const token = readAuthCookie();
		if (!token) throw new Error("UNAUTHORIZED");

		try {
			const client = getServerClient(token);
			const result = await client.auth.listOrganizationRoles(data.organizationId);
			return { roles: result.roles ?? [] };
		} catch {
			return { roles: [] };
		}
	});

/** Fetch current user's member record for an organization (RBAC). */
export const getActiveMemberFromServer = createServerFn({ method: "GET" })
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ data }) => {
		const { readAuthCookie, getServerClient } = await import("@/server/auth-helpers.server");

		const token = readAuthCookie();
		if (!token) throw new Error("UNAUTHORIZED");

		try {
			const client = getServerClient(token);
			const result = await client.auth.getActiveMember(data.organizationId);
			return { member: result.member ?? null };
		} catch (error) {
			console.error(
				`[getActiveMember] Failed for org ${data.organizationId}:`,
				error instanceof Error ? error.message : error
			);
			return { member: null };
		}
	});
