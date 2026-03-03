/**
 * Storage Query Factories — single source of truth for query keys + options.
 * Used by route loaders (ensureQueryData) and hooks (useQuery).
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

// -- File List ----------------------------------------------------------------

export const listFilesQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.files(),
		queryFn: () => getAuthenticatedClient().storage.listFiles(),
		staleTime: CACHE.list,
	});

// -- Logo Preview -------------------------------------------------------------

export const logoPreviewQueryOptions = (domain: string) =>
	queryOptions({
		queryKey: queryKeys.logoPreview(domain),
		queryFn: () => getAuthenticatedClient().storage.previewLogoByDomain({ domain }),
		staleTime: CACHE.static,
	});
