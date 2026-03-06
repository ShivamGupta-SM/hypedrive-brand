/**
 * Auth Query Server Functions — read-only server functions for auth data.
 *
 * Most functions use authMiddleware for automatic cookie→client resolution.
 * Special cases (getServerAuthWithOrgs, cookie management) handle auth manually.
 */

import { createServerFn } from "@tanstack/react-start";
import { clearAuthCookies, getServerClient, readAuthCookie, setAuthCookies } from "@/server/auth-helpers.server";
import { authMiddleware } from "@/server/middleware";

// =============================================================================
// SESSION + ORGANIZATIONS (combined fetch for root beforeLoad)
// =============================================================================

/**
 * Combined auth + organizations fetch in a single server round-trip.
 * Calls getSession() and listOrganizations() in parallel on the server.
 *
 * NOTE: Cannot use authMiddleware — must return gracefully when not authenticated.
 */
export const getServerAuthWithOrgs = createServerFn({ method: "GET" }).handler(async () => {
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
			status: org.status,
		}));

		return {
			isAuthenticated: true as const,
			user: session.user,
			token: null,
			organizations,
		};
	} catch {
		clearAuthCookies();
		return { isAuthenticated: false as const, user: null, token: null, organizations: [] };
	}
});

// =============================================================================
// STREAM TOKEN (for WebSocket connections that need client-side auth)
// =============================================================================

/**
 * Returns the auth token from the httpOnly cookie so the client can use it
 * for WebSocket stream connections (notifications, setup progress).
 * The token is only held in JS memory briefly for the WS handshake.
 *
 * Uses authMiddleware to read the cookie and extract the raw token from context.
 */
export const getStreamTokenServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return { token: context.token };
	});

// =============================================================================
// COOKIE MANAGEMENT
// =============================================================================

/**
 * Set auth cookies after login/register.
 * Pass rememberMe: true for extended session (30 days), false for 1 day.
 *
 * NOTE: Cannot use authMiddleware — called before auth cookie exists.
 */
export const setServerAuthCookie = createServerFn({ method: "POST" })
	.inputValidator((input: { token: string; rememberMe?: boolean }) => input)
	.handler(async ({ data }) => {
		setAuthCookies(data.token, data.rememberMe);
	});

/** Clear auth cookies on logout or auth errors. */
export const clearServerAuthCookie = createServerFn({ method: "POST" }).handler(async () => {
	clearAuthCookies();
});

// =============================================================================
// RBAC DATA
// =============================================================================

/** Fetch organization roles server-side (for custom role permission resolution). */
export const getOrgRolesFromServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ context, data }) => {
		try {
			const result = await context.client.auth.listOrganizationRoles(data.organizationId);
			return { roles: result.roles ?? [] };
		} catch {
			return { roles: [] };
		}
	});

/** Fetch current user's member record for an organization (RBAC). */
export const getActiveMemberFromServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ context, data }) => {
		try {
			const result = await context.client.auth.getActiveMember(data.organizationId);
			return { member: result.member ?? null };
		} catch (error) {
			console.error(
				`[getActiveMember] Failed for org ${data.organizationId}:`,
				error instanceof Error ? error.message : error
			);
			return { member: null };
		}
	});
