import { createFileRoute } from "@tanstack/react-router";
import { ListingsList } from "@/pages/listings";

export const Route = createFileRoute("/_app/$orgSlug/listings")({
	head: () => ({
		meta: [{ title: "Listings | Hypedrive" }],
	}),
	component: ListingsList,
});
