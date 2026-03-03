/**
 * Server-only auth helpers — cookie management, middleware, and client factory.
 *
 * The .server.ts suffix ensures TanStack Start's import-protection blocks
 * any direct import from client code. Only import from other .server.ts files
 * or from within createServerFn handlers.
 */

import { createMiddleware } from "@tanstack/react-start";
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
// COOKIE HELPERS
// =============================================================================

export function setAuthCookies(token: string, rememberMe = false) {
	const maxAge = rememberMe ? AUTH_COOKIE_MAX_AGE : AUTH_COOKIE_SESSION_MAX_AGE;
	const base = { path: "/", sameSite: "lax" as const, secure: IS_PROD, maxAge };
	setCookie(AUTH_COOKIE, token, { ...base, httpOnly: true });
	setCookie(AUTH_COOKIE_PUBLIC, token, base);
}

export function clearAuthCookies() {
	deleteCookie(AUTH_COOKIE, { path: "/" });
	deleteCookie(AUTH_COOKIE_PUBLIC, { path: "/" });
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

// =============================================================================
// AUTH MIDDLEWARE
// =============================================================================

export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const token = readAuthCookie();
	if (!token) {
		throw new Error("UNAUTHORIZED");
	}
	return next({ context: { token, client: getServerClient(token) } });
});
