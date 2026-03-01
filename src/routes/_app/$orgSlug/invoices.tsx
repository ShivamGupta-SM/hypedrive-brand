import { createFileRoute } from "@tanstack/react-router";
import { InvoicesList } from "@/pages/invoices";

export const Route = createFileRoute("/_app/$orgSlug/invoices")({
	head: () => ({
		meta: [{ title: "Invoices | Hypedrive" }],
	}),
	component: InvoicesList,
});
