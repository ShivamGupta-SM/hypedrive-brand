import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import Client from "@/lib/brand-client";
import { API_URL, AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME, AUTH_COOKIE_PUBLIC_NAME } from "@/lib/config";

const AUTH_COOKIE = AUTH_COOKIE_NAME;
const AUTH_COOKIE_PUBLIC = AUTH_COOKIE_PUBLIC_NAME;
const COOKIE_MAX_AGE = AUTH_COOKIE_MAX_AGE;
const IS_PROD = process.env.NODE_ENV === "production";

// =============================================================================
// COOKIE MANAGEMENT
// =============================================================================

/**
 * Check auth status server-side by reading the auth cookie.
 * Safe to call from beforeLoad — runs as a server function.
 */
export const getServerAuth = createServerFn({ method: "GET" }).handler(async () => {
	const token = getCookie(AUTH_COOKIE);
	return { isAuthenticated: !!token, token: token ?? null };
});

/**
 * Set auth cookies after login/register.
 * Two cookies: httpOnly (SSR reads) + public (JS reads for Bearer headers).
 */
export const setServerAuthCookie = createServerFn({ method: "POST" })
	.inputValidator((input: { token: string }) => input)
	.handler(async ({ data }) => {
		const base = { path: "/", sameSite: "lax" as const, secure: IS_PROD, maxAge: COOKIE_MAX_AGE };
		setCookie(AUTH_COOKIE, data.token, { ...base, httpOnly: true });
		setCookie(AUTH_COOKIE_PUBLIC, data.token, base);
	});

/**
 * Clear both auth cookies on logout or auth errors.
 */
export const clearServerAuthCookie = createServerFn({ method: "POST" }).handler(async () => {
	deleteCookie(AUTH_COOKIE, { path: "/" });
	deleteCookie(AUTH_COOKIE_PUBLIC, { path: "/" });
});

// =============================================================================
// SERVER-SIDE SESSION & ORG RESOLUTION
// =============================================================================

/** Create an authenticated Encore client on the server using the cookie token */
function getServerClient(token: string): Client {
	return new Client(API_URL, {
		requestInit: {
			headers: { Authorization: `Bearer ${token}` },
		},
	});
}

/**
 * Validate session from cookie by calling the Encore API.
 * Returns user info if valid, clears cookie if expired/invalid.
 */
export const getSessionFromCookie = createServerFn({ method: "GET" }).handler(async () => {
	const token = getCookie(AUTH_COOKIE);
	if (!token) {
		return { isAuthenticated: false as const, user: null, token: null };
	}

	try {
		const client = getServerClient(token);
		const session = await client.auth.getSession();
		if (!session.user) {
			deleteCookie(AUTH_COOKIE, { path: "/" });
			return { isAuthenticated: false as const, user: null, token: null };
		}
		return {
			isAuthenticated: true as const,
			user: session.user,
			token,
		};
	} catch {
		// Token invalid/expired — clear cookie
		deleteCookie(AUTH_COOKIE, { path: "/" });
		return { isAuthenticated: false as const, user: null, token: null };
	}
});

/**
 * Fetch organizations server-side using the cookie token.
 * Maps API `status` field to `approvalStatus` for consistency.
 */
export const getOrganizationsFromServer = createServerFn({ method: "GET" }).handler(async () => {
	const token = getCookie(AUTH_COOKIE);
	if (!token) {
		return { organizations: [] };
	}

	try {
		const client = getServerClient(token);
		const result = await client.auth.listOrganizations();
		// Map API `status` to `approvalStatus` for the Organization interface
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
 * Fetch current user's member record for an organization, server-side.
 * Used in route guards for RBAC.
 *
 * The backend queries the member table directly using the explicit organizationId —
 * no dependency on Better Auth's session activeOrganizationId.
 * This supports URL-based multitenancy where org comes from the URL.
 */
export const getActiveMemberFromServer = createServerFn({ method: "GET" })
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ data }) => {
		const token = getCookie(AUTH_COOKIE);
		if (!token) {
			return { member: null };
		}

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
