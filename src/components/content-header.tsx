import {
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  DocumentTextIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  WalletIcon,
} from "@heroicons/react/16/solid";
import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import type { ComponentType, SVGProps } from "react";
import { NotificationBell } from "@/components/notification-popover";
import { SidebarCollapseButton } from "@/components/sidebar";
import { useBreadcrumbStore } from "@/hooks/use-breadcrumb";
import { useOrgContext } from "@/hooks/use-org-context";

interface RouteConfig {
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  campaigns: { label: "Campaigns", icon: RocketLaunchIcon, iconColor: "text-violet-500 dark:text-violet-400" },
  enrollments: { label: "Enrollments", icon: ClipboardDocumentListIcon, iconColor: "text-sky-500 dark:text-sky-400" },
  listings: { label: "Listings", icon: CubeIcon, iconColor: "text-amber-500 dark:text-amber-400" },
  invoices: { label: "Invoices", icon: DocumentTextIcon, iconColor: "text-rose-500 dark:text-rose-400" },
  wallet: { label: "Wallet", icon: WalletIcon, iconColor: "text-emerald-500 dark:text-emerald-400" },
  team: { label: "Team", icon: UserGroupIcon, iconColor: "text-indigo-500 dark:text-indigo-400" },
  support: { label: "Support", icon: QuestionMarkCircleIcon, iconColor: "text-teal-500 dark:text-teal-400" },
  settings: { label: "Settings", icon: Cog6ToothIcon, iconColor: "text-zinc-500 dark:text-zinc-400" },
  transactions: { label: "Transactions" },
  withdrawals: { label: "Withdrawals" },
  deposits: { label: "Deposits" },
  invitations: { label: "Invitations" },
  roles: { label: "Roles" },
  members: { label: "Members" },
};

const BREADCRUMB_HREF_OVERRIDES: Record<string, string> = {
  "wallet/transactions": "wallet",
  "wallet/withdrawals": "wallet",
  "wallet/deposits": "wallet",
};

interface Crumb {
  label: string;
  href?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  iconColor?: string;
}

function useBreadcrumbs(): Crumb[] {
  const { pathname } = useLocation();
  const { orgSlug } = useOrgContext();
  const { pageTitle } = useBreadcrumbStore();

  const prefix = `/${orgSlug}`;
  const rest = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : pathname;
  const segments = rest.split("/").filter(Boolean);

  const crumbs: Crumb[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const config = ROUTE_CONFIG[seg];
    const relativePath = segments.slice(0, i + 1).join("/");
    const overridePath = BREADCRUMB_HREF_OVERRIDES[relativePath];
    const href = `/${orgSlug}/${overridePath ?? relativePath}`;

    if (config) {
      crumbs.push({ label: config.label, href, icon: config.icon, iconColor: config.iconColor });
    } else if (i > 0 && pageTitle) {
      crumbs.push({ label: pageTitle });
    }
  }

  return crumbs;
}

function Separator() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="shrink-0 text-zinc-250 dark:text-zinc-650"
    >
      <path d="M5.5 13L10.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function ContentHeader() {
  const { orgSlug, organization, organizationId } = useOrgContext();
  const crumbs = useBreadcrumbs();
  const parentCrumb = crumbs.length >= 2 ? crumbs[crumbs.length - 2] : null;

  return (
    <div className="shrink-0">
      {/* Mobile */}
      {parentCrumb?.href && (
        <div className="flex items-center px-4 py-2.5 lg:hidden">
          <Link
            to={parentCrumb.href}
            className="group -ml-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-zinc-500 transition-all active:scale-[0.97] hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            {parentCrumb.label}
          </Link>
        </div>
      )}

      {/* Desktop */}
      <div className="hidden h-12 items-center justify-between px-3 lg:flex">
        <div className="flex items-center">
          <SidebarCollapseButton />

          <div className="mx-2 h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

          <nav aria-label="Breadcrumb">
            <ol className="flex items-center text-[13px]">
              {/* Org root */}
              <li>
                <Link
                  to="/$orgSlug"
                  params={{ orgSlug }}
                  className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                >
                  <HomeIcon className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                  <span className="max-w-28 truncate">{organization.name}</span>
                </Link>
              </li>

              {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                const Icon = crumb.icon;

                return (
                  <li key={`${i}-${crumb.label}`} className="flex items-center">
                    <Separator />
                    {!isLast && crumb.href ? (
                      <Link
                        to={crumb.href}
                        className="group inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      >
                        {Icon && <Icon className={clsx("size-3.5", crumb.iconColor)} />}
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 font-medium text-zinc-800 dark:text-zinc-100">
                        {Icon && <Icon className={clsx("size-3.5 shrink-0", crumb.iconColor)} />}
                        <span className="max-w-48 truncate">{crumb.label}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <div className="flex items-center">
          <NotificationBell organizationId={organizationId} />
        </div>
      </div>
      <hr className="border-t border-zinc-200/80 dark:border-zinc-700/50" />
    </div>
  );
}
