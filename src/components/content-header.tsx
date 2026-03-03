import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
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
		const href = `/${orgSlug}/${segments.slice(0, i + 1).join("/")}`;

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

	return (
		<div className="hidden shrink-0 items-center justify-between border-b border-zinc-950/5 px-6 py-2.5 lg:flex dark:border-white/5">
			{/* Breadcrumbs */}
			<nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
				<Link
					to="/$orgSlug"
					params={{ orgSlug }}
					className="flex items-center text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
				>
					<HomeIcon className="size-4" />
				</Link>
				{crumbs.map((crumb, i) => (
					<span key={crumb.label} className="flex items-center gap-1.5">
						<ChevronRightIcon className="size-3.5 text-zinc-300 dark:text-zinc-600" />
						{i < crumbs.length - 1 && crumb.href ? (
							<Link
								to={crumb.href}
								className="text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
							>
								{crumb.label}
							</Link>
						) : (
							<span className="max-w-50 truncate font-medium text-zinc-700 dark:text-zinc-200">{crumb.label}</span>
						)}
					</span>
				))}
			</nav>

			{/* Actions */}
			<div className="flex items-center gap-1">
				<NotificationBell organizationId={organizationId} />
			</div>
		</div>
	);
}
