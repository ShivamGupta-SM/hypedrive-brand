import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import Client from "@/lib/brand-client";
import {
	API_URL,
	AUTH_COOKIE_MAX_AGE,
	AUTH_COOKIE_NAME,
	AUTH_COOKIE_PUBLIC_NAME,
	AUTH_COOKIE_SESSION_MAX_AGE,
} from "@/lib/config";

const AUTH_COOKIE = AUTH_COOKIE_NAME;
const AUTH_COOKIE_PUBLIC = AUTH_COOKIE_PUBLIC_NAME;
const IS_PROD = process.env.NODE_ENV === "production";

// =============================================================================
// COOKIE HELPERS (shared, used by both server-auth and auth-actions)
// =============================================================================

/** Set both auth cookies: httpOnly (SSR) + public (JS Bearer header) */
export function setAuthCookies(token: string, rememberMe = false) {
	const maxAge = rememberMe ? AUTH_COOKIE_MAX_AGE : AUTH_COOKIE_SESSION_MAX_AGE;
	const base = { path: "/", sameSite: "lax" as const, secure: IS_PROD, maxAge };
	setCookie(AUTH_COOKIE, token, { ...base, httpOnly: true });
	setCookie(AUTH_COOKIE_PUBLIC, token, base);
}

/** Clear both auth cookies */
export function clearAuthCookies() {
	deleteCookie(AUTH_COOKIE, { path: "/" });
	deleteCookie(AUTH_COOKIE_PUBLIC, { path: "/" });
}

/** Read the auth token from the httpOnly cookie (server-side only) */
export function readAuthCookie(): string | null {
	return getCookie(AUTH_COOKIE) ?? null;
}

// =============================================================================
// AUTHENTICATED CLIENT HELPER
// =============================================================================

/** Create an authenticated Encore client on the server using the cookie token */
function getServerClient(token: string): Client {
	return new Client(API_URL, {
		requestInit: {
			headers: { Authorization: `Bearer ${token}` },
		},
	});
}

// =============================================================================
// AUTH MIDDLEWARE — official TanStack Start pattern
// Reads cookie, creates authenticated client, passes via context.
// Server functions that need auth use .middleware([authMiddleware]).
// =============================================================================

export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const token = readAuthCookie();
	if (!token) {
		throw new Error("UNAUTHORIZED");
	}
	return next({ context: { token, client: getServerClient(token) } });
});

// =============================================================================
// COOKIE MANAGEMENT (server functions callable from client)
// =============================================================================

/**
 * Combined auth + organizations fetch in a single server round-trip.
 * Calls getSession() and listOrganizations() in parallel on the server,
 * eliminating the serial waterfall between root and _app beforeLoad.
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

/**
 * Set auth cookies after login/register (callable from client via RPC).
 * Pass rememberMe: true for extended session (30 days), false for 1 day.
 */
export const setServerAuthCookie = createServerFn({ method: "POST" })
	.inputValidator((input: { token: string; rememberMe?: boolean }) => input)
	.handler(async ({ data }) => {
		setAuthCookies(data.token, data.rememberMe);
	});

/**
 * Clear both auth cookies on logout or auth errors (callable from client via RPC).
 */
export const clearServerAuthCookie = createServerFn({ method: "POST" }).handler(async () => {
	clearAuthCookies();
});

// =============================================================================
// AUTHENTICATED SERVER FUNCTIONS — use authMiddleware, no boilerplate
// =============================================================================

/**
 * Fetch organizations server-side.
 * Maps API `status` field to `approvalStatus` for consistency.
 */
export const getOrganizationsFromServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		try {
			const result = await context.client.auth.listOrganizations();
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

/**
 * Fetch organization roles server-side.
 * Used to resolve custom role permissions when the member's role
 * is not one of the hardcoded static roles.
 */
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

/**
 * Fetch current user's member record for an organization, server-side.
 * Used in route guards for RBAC.
 */
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
