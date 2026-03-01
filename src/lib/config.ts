/**
 * Central application configuration.
 * All env vars and derived constants go here — import from @/lib/config everywhere.
 *
 * VITE_API_URL   — Backend API base URL (client-exposed, must be prefixed VITE_)
 * NODE_ENV       — Runtime environment (server-side only)
 */

import { Local } from "@/lib/brand-client";

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * Encore backend URL.
 * - Client bundle: reads VITE_API_URL (injected by Vite at build time)
 * - Server bundle: reads process.env.VITE_API_URL (available at runtime)
 * Falls back to Encore's Local sentinel which resolves to http://localhost:4000.
 */
export const API_URL: string =
	(typeof import.meta !== "undefined" && (import.meta.env as Record<string, string>)?.VITE_API_URL) ||
	process.env.VITE_API_URL ||
	Local;

// ─── ENVIRONMENT ──────────────────────────────────────────────────────────────

export const IS_PRODUCTION: boolean =
	(typeof import.meta !== "undefined" && import.meta.env?.PROD) || process.env.NODE_ENV === "production";

export const IS_DEV: boolean = !IS_PRODUCTION;

// ─── AUTH ─────────────────────────────────────────────────────────────────────

/** Name of the HttpOnly auth cookie — readable only by the server (SSR auth checks). */
export const AUTH_COOKIE_NAME = "hd_auth";

/**
 * Name of the public (non-HttpOnly) auth cookie — readable by JS for Bearer headers.
 * Mirrors AUTH_COOKIE_NAME but without httpOnly so client can attach the token.
 */
export const AUTH_COOKIE_PUBLIC_NAME = "hd_auth_pub";

/** Cookie max-age in seconds when "Keep me signed in" is checked (30 days). */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/** Cookie max-age in seconds for normal sessions (1 day). */
export const AUTH_COOKIE_SESSION_MAX_AGE = 60 * 60 * 24;
