import { createFileRoute } from "@tanstack/react-router";
import { ListingShow } from "@/pages/listings";

export const Route = createFileRoute("/_app/$orgSlug/listings_/$id")({
	head: () => ({
		meta: [{ title: "Listing | Hypedrive" }],
	}),
	component: ListingShow,
});
