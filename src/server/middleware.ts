/**
 * Server Function Middleware — reusable middleware for createServerFn chains.
 *
 * Imported by feature server.ts files and auth-queries.ts. The .server()
 * handler is tree-shaken from client bundles by TanStack Start.
 */

import { createMiddleware } from "@tanstack/react-start";
import Client from "@/lib/brand-client";
import { API_URL } from "@/lib/config";
import { readAuthCookie } from "@/server/auth-helpers.server";

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
