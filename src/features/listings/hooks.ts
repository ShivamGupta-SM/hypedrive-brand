/**
 * Listing Query Hooks.
 */

import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { infiniteListingsQueryOptions, listingQueryOptions, listingsQueryOptions } from "./queries";

export function useListings(
	organizationId: string | undefined,
	params?: {
		categoryId?: string;
		platformId?: string;
		q?: string;
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "name" | "price";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useQuery({
		...listingsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useInfiniteListings(
	organizationId: string | undefined,
	params?: {
		categoryId?: string;
		platformId?: string;
		q?: string;
		sortBy?: "createdAt" | "name" | "price";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useInfiniteQuery({
		...infiniteListingsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
		placeholderData: keepPreviousData,
	});

	const data = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];
	const total = query.data?.pages[0]?.total ?? data.length;

	return {
		data,
		total,
		hasMore: query.hasNextPage ?? false,
		loading: query.isPending && !query.data,
		isFetchingNextPage: query.isFetchingNextPage,
		error: query.error,
		refetch: query.refetch,
		fetchNextPage: query.fetchNextPage,
	};
}

export function useListing(organizationId: string | undefined, listingId: string | undefined) {
	const query = useQuery({
		...listingQueryOptions(organizationId || "", listingId || ""),
		enabled: !!organizationId && !!listingId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}
