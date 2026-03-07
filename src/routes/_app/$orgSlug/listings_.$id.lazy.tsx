import { createLazyFileRoute } from "@tanstack/react-router";
import { ListingShow } from "@/pages/listings";

export const Route = createLazyFileRoute("/_app/$orgSlug/listings_/$id")({
	component: ListingShow,
});
