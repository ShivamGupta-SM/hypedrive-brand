/**
 * Storage Query Factories — single source of truth for query keys + options.
 * Used by route loaders (ensureQueryData) and hooks (useQuery).
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, queryKeys } from "@/hooks/api-client";
import { listFilesServer, logoPreviewServer } from "./server";

// -- File List ----------------------------------------------------------------

export const listFilesQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.files(),
		queryFn: () => listFilesServer(),
		staleTime: CACHE.list,
	});

// -- Logo Preview -------------------------------------------------------------

export const logoPreviewQueryOptions = (domain: string) =>
	queryOptions({
		queryKey: queryKeys.logoPreview(domain),
		queryFn: () => logoPreviewServer({ data: { domain } }),
		staleTime: CACHE.static,
	});
