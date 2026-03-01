/**
 * useOrgSlug Hook - Access current organization slug from URL
 *
 * This hook provides the orgSlug from the URL and helpers for
 * building org-scoped paths.
 *
 * Usage:
 * const { orgSlug, orgPath } = useOrgSlug();
 * orgPath("/campaigns") => "/$orgSlug/campaigns"
 */

import { useParams } from "@tanstack/react-router";

/**
 * Get the current organization slug from URL params.
 * All org-scoped routes live under /$orgSlug, so params always has the slug.
 */
export function useOrgSlug(): string {
	const params = useParams({ strict: false }) as { orgSlug?: string };
	return params.orgSlug || "";
}

/**
 * Build an org-scoped path
 * @param path - The path without orgSlug (e.g., "/campaigns")
 * @returns Full path with orgSlug (e.g., "/acme-corp/campaigns")
 */
export function useOrgPath() {
	const orgSlug = useOrgSlug();

	return (path: string) => {
		// Remove leading slash if present
		const cleanPath = path.startsWith("/") ? path.slice(1) : path;

		// Return org-scoped path
		return `/${orgSlug}/${cleanPath}`;
	};
}

/**
 * Combined hook for org slug and path builder
 */
export function useOrg() {
	const orgSlug = useOrgSlug();
	const orgPath = useOrgPath();

	return {
		orgSlug,
		orgPath,
	};
}
