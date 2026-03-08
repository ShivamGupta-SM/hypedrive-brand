import { createLazyFileRoute } from "@tanstack/react-router";
import { InvoicesList } from "@/pages/invoices";

export const Route = createLazyFileRoute("/_app/$orgSlug/invoices")({
  component: InvoicesList,
});
