/**
 * Server-only auth helpers — cookie management and client factory.
 *
 * The .server.ts suffix ensures TanStack Start's import-protection blocks
 * any direct import from client code. Only import from other .server.ts files
 * or from within createServerFn handlers.
 *
 * NOTE: The shared authMiddleware lives in src/server/middleware.ts (non-.server.ts)
 * so feature server.ts files can import it without triggering import-protection.
 */

import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import Client from "@/lib/brand-client";
import { API_URL, AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME, AUTH_COOKIE_SESSION_MAX_AGE } from "@/lib/config";

const AUTH_COOKIE = AUTH_COOKIE_NAME;
const IS_PROD = process.env.NODE_ENV === "production";

// =============================================================================
// COOKIE HELPERS
// =============================================================================

export function setAuthCookies(token: string, rememberMe = false) {
	const maxAge = rememberMe ? AUTH_COOKIE_MAX_AGE : AUTH_COOKIE_SESSION_MAX_AGE;
	setCookie(AUTH_COOKIE, token, { path: "/", sameSite: "lax", secure: IS_PROD, maxAge, httpOnly: true });
}

export function clearAuthCookies() {
	deleteCookie(AUTH_COOKIE, { path: "/" });
}

export function readAuthCookie(): string | null {
	return getCookie(AUTH_COOKIE) ?? null;
}

// =============================================================================
// AUTHENTICATED CLIENT HELPER
// =============================================================================

export function getServerClient(token: string): Client {
	return new Client(API_URL, {
		requestInit: {
			headers: { Authorization: `Bearer ${token}` },
		},
	});
}
