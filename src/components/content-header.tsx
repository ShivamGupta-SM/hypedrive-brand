import { ArrowLeftIcon, ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { Link, useLocation } from "@tanstack/react-router";
import { NotificationBell } from "@/components/notification-popover";
import { useBreadcrumbStore } from "@/hooks/use-breadcrumb";
import { useOrgContext } from "@/hooks/use-org-context";

const ROUTE_LABELS: Record<string, string> = {
	campaigns: "Campaigns",
	enrollments: "Enrollments",
	listings: "Listings",
	invoices: "Invoices",
	wallet: "Wallet",
	team: "Team",
	support: "Support",
	settings: "Settings",
	transactions: "Transactions",
	withdrawals: "Withdrawals",
	deposits: "Deposits",
	invitations: "Invitations",
	roles: "Roles",
	members: "Members",
};

/**
 * Sub-routes that use breakout syntax (e.g. wallet_.transactions_.$id) appear
 * in the URL as /wallet/transactions/:id but the "transactions" segment doesn't
 * have its own route — the list lives at the parent (e.g. /wallet).
 * This map redirects breadcrumb links for these segments to the correct parent.
 */
const BREADCRUMB_HREF_OVERRIDES: Record<string, string> = {
	"wallet/transactions": "wallet",
	"wallet/withdrawals": "wallet",
	"wallet/deposits": "wallet",
};

function useBreadcrumbs() {
	const { pathname } = useLocation();
	const { orgSlug } = useOrgContext();
	const { pageTitle } = useBreadcrumbStore();

	// Strip org slug prefix: /my-org/campaigns/123 → ["campaigns", "123"]
	const prefix = `/${orgSlug}`;
	const rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
	const segments = rest.split("/").filter(Boolean);

	const crumbs: Array<{ label: string; href?: string }> = [];

	for (let i = 0; i < segments.length; i++) {
		const seg = segments[i];
		const label = ROUTE_LABELS[seg];
		const relativePath = segments.slice(0, i + 1).join("/");
		const overridePath = BREADCRUMB_HREF_OVERRIDES[relativePath];
		const href = `/${orgSlug}/${overridePath ?? relativePath}`;

		if (label) {
			crumbs.push({ label, href });
		} else if (i > 0 && pageTitle) {
			// Dynamic segment (ID) — show page title from context
			crumbs.push({ label: pageTitle });
		}
	}

	return crumbs;
}

export function ContentHeader() {
	const { orgSlug, organizationId } = useOrgContext();
	const crumbs = useBreadcrumbs();

	// Mobile: find the parent crumb to link back to
	const parentCrumb = crumbs.length >= 2 ? crumbs[crumbs.length - 2] : null;

	return (
		<div className="shrink-0 border-b border-zinc-950/5 dark:border-white/5">
			{/* Mobile: back link */}
			{parentCrumb?.href && (
				<div className="flex items-center px-4 py-2 lg:hidden">
					<Link
						to={parentCrumb.href}
						className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						<ArrowLeftIcon className="size-3.5" />
						{parentCrumb.label}
					</Link>
				</div>
			)}

			{/* Desktop: full breadcrumbs */}
			<div className="hidden items-center justify-between px-6 py-2.5 lg:flex">
				<nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
					<Link
						to="/$orgSlug"
						params={{ orgSlug }}
						className="flex items-center text-zinc-500 transition-colors hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
					>
						<HomeIcon className="size-4" />
					</Link>
					{crumbs.map((crumb, i) => (
						<span key={`${i}-${crumb.label}`} className="flex items-center gap-1.5">
							<ChevronRightIcon className="size-3.5 text-zinc-400 dark:text-zinc-500" />
							{i < crumbs.length - 1 && crumb.href ? (
								<Link
									to={crumb.href}
									className="text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
								>
									{crumb.label}
								</Link>
							) : (
								<span className="max-w-50 truncate font-medium text-zinc-700 dark:text-zinc-200">
									{crumb.label}
								</span>
							)}
						</span>
					))}
				</nav>

				{/* Actions */}
				<div className="flex items-center gap-1">
					<NotificationBell organizationId={organizationId} />
				</div>
			</div>
		</div>
	);
}
