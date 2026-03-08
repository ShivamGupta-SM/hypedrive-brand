import { createLazyFileRoute } from "@tanstack/react-router";
import { TeamLayout } from "@/pages/team";

export const Route = createLazyFileRoute("/_app/$orgSlug/team")({
  component: TeamLayout,
});
