/**
 * Listing Server Functions — authenticated API calls proxied through the server.
 */

import { createServerFn } from "@tanstack/react-start";
import type { brand } from "@/lib/brand-client";
import { authMiddleware } from "@/server/middleware";

// -- Queries ------------------------------------------------------------------

export const getListingServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; listingId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getOrganizationListing(data.orgId, data.listingId);
	});

export const listListingsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			params: {
				categoryId?: string;
				platformId?: string;
				q?: string;
				skip?: number;
				take?: number;
				cursor?: string;
				limit?: number;
				sortBy?: "createdAt" | "name" | "price";
				sortOrder?: "asc" | "desc";
			};
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.listOrganizationListings(data.orgId, data.params);
	});

// -- Mutations ----------------------------------------------------------------

export const createListingServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; params: brand.CreateListingRequest }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.createListing(data.orgId, data.params);
	});

export const updateListingServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; listingId: string; params: brand.UpdateListingRequest }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.updateListing(data.orgId, data.listingId, data.params);
	});

export const deleteListingServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; listingId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.deleteListing(data.orgId, data.listingId);
	});

// -- Batch Listing Operations -------------------------------------------------

export const batchListingsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: {
			orgId: string;
			action: "delete";
			listingIds: string[];
		}) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.batchListings(data.orgId, {
			action: data.action,
			listingIds: data.listingIds,
		});
	});
