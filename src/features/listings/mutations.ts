/**
 * Listing Mutations — create, update, delete.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import type { brand } from "@/lib/brand-client";
import { batchListingsServer, createListingServer, deleteListingServer, updateListingServer } from "./server";

export function useCreateListing(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateListingRequest) => {
			return createListingServer({
				data: {
					orgId: organizationId as string,
					params: { ...params, idempotencyKey: params.idempotencyKey ?? crypto.randomUUID() },
				},
			});
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
			return updateListingServer({ data: { orgId: organizationId as string, listingId, params } });
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
			return deleteListingServer({ data: { orgId: organizationId as string, listingId } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.listings(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteListings(organizationId || "") });
		},
	});
}

// =============================================================================
// BATCH OPERATIONS
// =============================================================================

export function useBatchListings() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			organizationId,
			action,
			listingIds,
		}: {
			organizationId: string;
			action: "delete";
			listingIds: string[];
		}) => {
			return batchListingsServer({
				data: { orgId: organizationId, action, listingIds },
			});
		},
		onSuccess: (_, v) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.listings(v.organizationId) });
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteListings(v.organizationId) });
		},
	});
}
