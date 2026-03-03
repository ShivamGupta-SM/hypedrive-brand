/**
 * Listing Mutations — create, update, delete.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import type { brand } from "@/lib/brand-client";

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
