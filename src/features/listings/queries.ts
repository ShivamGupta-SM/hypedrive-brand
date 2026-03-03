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
		search?: string;
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
	params?: { categoryId?: string; platformId?: string; search?: string }
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteListings(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			listListingsServer({
				data: { orgId, params: { ...params, skip: pageParam, take: DEFAULT_PAGE_SIZE } },
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});
