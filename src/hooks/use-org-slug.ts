/**
 * URL-based org slug utilities.
 *
 * For the full org object (id, name, slug, activeMember), use useOrgContext()
 * from use-org-context.ts instead. These helpers are for components that only
 * need the slug string or path builder (e.g., AppLayout, ContentHeader).
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

		// Guard against empty orgSlug producing //path
		if (!orgSlug) return `/${cleanPath}`;
		return `/${orgSlug}/${cleanPath}`;
	};
}
