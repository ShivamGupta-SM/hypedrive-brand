import { createLazyFileRoute } from "@tanstack/react-router";
import { EnrollmentsLayout } from "@/pages/enrollments";

export const Route = createLazyFileRoute("/_app/$orgSlug/enrollments")({
  component: EnrollmentsLayout,
});
