/**
 * Listing Query Factories.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, queryKeys } from "@/hooks/api-client";
import { getListingServer, listListingsServer } from "./server";

// -- Listing Detail -----------------------------------------------------------

export const listingQueryOptions = (orgId: string, listingId: string) =>
	queryOptions({
		queryKey: queryKeys.listing(orgId, listingId),
		queryFn: () => getListingServer({ data: { orgId, listingId } }),
		staleTime: CACHE.detail,
	});

// -- Listing Lists (paginated) ------------------------------------------------

export const listingsQueryOptions = (
	orgId: string,
	params?: {
		categoryId?: string;
		platformId?: string;
		q?: string;
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "name" | "price";
		sortOrder?: "asc" | "desc";
	}
) =>
	queryOptions({
		queryKey: queryKeys.listings(orgId, params),
		queryFn: () => listListingsServer({ data: { orgId, params: params || {} } }),
		staleTime: CACHE.list,
	});

// -- Listing Lists (infinite) ------------------------------------------------

export const infiniteListingsQueryOptions = (
	orgId: string,
	params?: {
		categoryId?: string;
		platformId?: string;
		q?: string;
		sortBy?: "createdAt" | "name" | "price";
		sortOrder?: "asc" | "desc";
	}
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteListings(orgId, params),
		queryFn: ({ pageParam }) =>
			listListingsServer({
				data: { orgId, params: { ...params, cursor: pageParam, limit: DEFAULT_PAGE_SIZE } },
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		staleTime: CACHE.list,
	});
