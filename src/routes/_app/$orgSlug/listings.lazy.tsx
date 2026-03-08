import { createLazyFileRoute } from "@tanstack/react-router";
import { ListingsList } from "@/pages/listings";

export const Route = createLazyFileRoute("/_app/$orgSlug/listings")({
  component: ListingsList,
});
