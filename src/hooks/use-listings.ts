import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { brand } from "@/lib/brand-client";
import { DEFAULT_PAGE_SIZE, getAuthenticatedClient, queryKeys } from "./api-client";

export function useListings(
	organizationId: string | undefined,
	params?: {
		categoryId?: string;
		platformId?: string;
		search?: string;
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "name" | "price";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useQuery({
		queryKey: queryKeys.listings(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.listOrganizationListings(organizationId as string, params || {});
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useInfiniteListings(
	organizationId: string | undefined,
	params?: { categoryId?: string; platformId?: string; search?: string }
) {
	const query = useInfiniteQuery({
		queryKey: queryKeys.infiniteListings(organizationId || "", params),
		queryFn: async ({ pageParam = 0 }) => {
			const client = getAuthenticatedClient();
			return client.brand.listOrganizationListings(organizationId as string, {
				...params,
				skip: pageParam,
				take: DEFAULT_PAGE_SIZE,
			});
		},
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		enabled: !!organizationId,
	});

	const data = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];
	const total = query.data?.pages[0]?.total ?? data.length;

	return {
		data,
		total,
		hasMore: query.hasNextPage ?? false,
		loading: query.isLoading,
		isFetchingNextPage: query.isFetchingNextPage,
		error: query.error,
		refetch: query.refetch,
		fetchNextPage: query.fetchNextPage,
	};
}

export function useListing(organizationId: string | undefined, listingId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.listing(organizationId || "", listingId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganizationListing(organizationId as string, listingId as string);
		},
		enabled: !!organizationId && !!listingId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCreateListing(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateListingRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.createListing(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.listings(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteListings(organizationId || "") });
		},
	});
}

export function useUpdateListing(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ listingId, ...params }: { listingId: string } & brand.UpdateListingRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.updateListing(organizationId as string, listingId, params);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.listing(organizationId || "", variables.listingId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.listings(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteListings(organizationId || "") });
		},
	});
}

export function useDeleteListing(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (listingId: string) => {
			const client = getAuthenticatedClient();
			return client.brand.deleteListing(organizationId as string, listingId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.listings(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteListings(organizationId || "") });
		},
	});
}
