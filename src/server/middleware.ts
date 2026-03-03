/**
 * Server Function Middleware — reusable middleware for createServerFn chains.
 *
 * This file deliberately does NOT have a .server.ts suffix so it can be
 * imported by feature server.ts files (which are themselves imported by hooks).
 * The actual server-only logic (cookie reading) is dynamically imported at
 * runtime inside the .server() handler, which only executes on the server.
 */

import { createMiddleware } from "@tanstack/react-start";
import Client from "@/lib/brand-client";
import { API_URL } from "@/lib/config";

/**
 * Auth middleware for server functions.
 * Reads the httpOnly auth cookie, creates an authenticated API client,
 * and passes both `token` and `client` in the server function context.
 *
 * Usage:
 * ```ts
 * export const myServerFn = createServerFn({ method: "GET" })
 *   .middleware([authMiddleware])
 *   .handler(async ({ context }) => {
 *     return context.client.brand.getSomething();
 *   });
 * ```
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const { readAuthCookie } = await import("@/server/auth-helpers.server");
	const token = readAuthCookie();
	if (!token) {
		throw Object.assign(new Error("UNAUTHORIZED"), { status: 401 });
	}
	const client = new Client(API_URL, {
		requestInit: {
			headers: { Authorization: `Bearer ${token}` },
		},
	});
	return next({ context: { token, client } });
});
