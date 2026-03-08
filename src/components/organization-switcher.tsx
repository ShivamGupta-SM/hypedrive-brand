import * as Headless from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpDownIcon,
  Cog6ToothIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useLocation, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useState } from "react";
import type { Organization } from "@/components/app-layout";
import { getInitials } from "@/lib/design-tokens";

// =============================================================================
// COLORS
// =============================================================================

const PALETTE = [
  ["#7c3aed", "#ede9fe"], // violet
  ["#0284c7", "#e0f2fe"], // sky
  ["#059669", "#d1fae5"], // emerald
  ["#d97706", "#fef3c7"], // amber
  ["#e11d48", "#ffe4e6"], // rose
  ["#4f46e5", "#e0e7ff"], // indigo
  ["#0d9488", "#ccfbf1"], // teal
  ["#c026d3", "#fae8ff"], // fuchsia
] as const;

function orgColor(id: string) {
  const i = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length;
  return { bg: PALETTE[i][0], fg: PALETTE[i][1] };
}

const STATUS_DOT: Record<string, string> = { onboarding: "bg-sky-400", suspended: "bg-red-400" };
const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  onboarding: { text: "Onboarding", cls: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400" },
  suspended: { text: "Suspended", cls: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
};

// =============================================================================
// AVATAR — renders inline styles so no parent can override colors
// =============================================================================

function OrgAvatar({ org, size = 28 }: { org: Organization; size?: number }) {
  const { bg, fg } = orgColor(org.id);
  const dot = org.status ? STATUS_DOT[org.status] : null;
  const r = Math.round(size * 0.22);
  const fs = Math.round(size * 0.38);

  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      {org.logo ? (
        <img src={org.logo} alt="" className="size-full object-cover" style={{ borderRadius: r }} />
      ) : (
        <span
          className="flex size-full items-center justify-center font-semibold leading-none select-none"
          style={{ borderRadius: r, backgroundColor: bg, color: fg, fontSize: fs }}
        >
          {getInitials(org.name)}
        </span>
      )}
      {dot && (
        <span
          className={clsx(
            "absolute -bottom-px -right-px size-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900",
            dot
          )}
        />
      )}
    </span>
  );
}

// =============================================================================
// HOOK — org switching logic
// =============================================================================

function useOrgSwitching({
  currentOrganization,
  onOpenOrgSettings,
}: {
  currentOrganization: Organization;
  onOpenOrgSettings: () => void;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const switchTo = useCallback(
    (org: Organization) => {
      if (org.id === currentOrganization.id) return;
      const slug = currentOrganization.slug;
      if (slug && pathname.startsWith(`/${slug}`)) {
        navigate({ to: `/${org.slug}${pathname.slice(`/${slug}`.length) || ""}` });
      } else {
        navigate({ to: "/$orgSlug", params: { orgSlug: org.slug } });
      }
    },
    [currentOrganization, navigate, pathname]
  );

  const desktopSelect = useCallback(
    (org: Organization, close: () => void) => {
      switchTo(org);
      close();
    },
    [switchTo]
  );
  const mobileSelect = useCallback(
    (org: Organization) => {
      switchTo(org);
      setMobileOpen(false);
    },
    [switchTo]
  );
  const newOrg = useCallback(
    (close?: () => void) => {
      close?.();
      setMobileOpen(false);
      navigate({ to: "/onboarding" });
    },
    [navigate]
  );
  const settings = useCallback(
    (close?: () => void) => {
      close?.();
      setMobileOpen(false);
      onOpenOrgSettings();
    },
    [onOpenOrgSettings]
  );

  return { org: currentOrganization, mobileOpen, setMobileOpen, desktopSelect, mobileSelect, newOrg, settings };
}

// =============================================================================
// ORG LIST PANEL — shared between popover & bottom sheet
// =============================================================================

function OrgPanel({
  orgs,
  current,
  onSelect,
  onNew,
  onSettings,
}: {
  orgs: Organization[];
  current: Organization | null;
  onSelect: (o: Organization) => void;
  onNew: () => void;
  onSettings: () => void;
}) {
  return (
    <div className="flex flex-col">
      {/* List */}
      <div className="max-h-64 overflow-y-auto p-1 scrollbar-hide">
        {orgs.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">No organizations</p>
        ) : (
          orgs.map((org) => {
            const active = org.id === current?.id;
            const status = org.status ? STATUS_LABEL[org.status] : null;

            return (
              <button
                key={org.id}
                type="button"
                onClick={() => onSelect(org)}
                className={clsx(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                  active
                    ? "bg-zinc-100 dark:bg-zinc-800"
                    : "hover:bg-zinc-50 active:bg-zinc-100 dark:hover:bg-zinc-800/60 dark:active:bg-zinc-800"
                )}
              >
                <OrgAvatar org={org} size={32} />
                <div className="min-w-0 flex-1">
                  <p
                    className={clsx(
                      "truncate text-[13px]/5",
                      active
                        ? "font-semibold text-zinc-900 dark:text-white"
                        : "font-medium text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    {org.name}
                  </p>
                  {status && (
                    <span className={clsx("inline-block rounded px-1 py-px text-[10px]/3 font-medium", status.cls)}>
                      {status.text}
                    </span>
                  )}
                </div>
                {active && <CheckIcon className="size-4 shrink-0 text-emerald-500" />}
              </button>
            );
          })
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-zinc-100 p-1 dark:border-zinc-800">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
        >
          <PlusIcon className="size-4" />
          New organization
        </button>
        <button
          type="button"
          onClick={onSettings}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
        >
          <Cog6ToothIcon className="size-4" />
          Settings
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// MOBILE BOTTOM SHEET
// =============================================================================

function MobileSheet({
  open,
  onClose,
  orgs,
  current,
  onSelect,
  onNew,
  onSettings,
}: {
  open: boolean;
  onClose: () => void;
  orgs: Organization[];
  current: Organization | null;
  onSelect: (o: Organization) => void;
  onNew: () => void;
  onSettings: () => void;
}) {
  return (
    <Headless.Dialog open={open} onClose={onClose} className="relative z-50">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition data-closed:opacity-0 data-enter:duration-200 data-leave:duration-150"
      />
      <div className="fixed inset-0 flex items-end">
        <Headless.DialogPanel
          transition
          className="max-h-[80vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-zinc-950/5 transition duration-300 ease-out data-closed:translate-y-full dark:bg-zinc-900 dark:ring-white/10"
        >
          {/* Handle */}
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="h-1 w-8 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 pt-1">
            <Headless.DialogTitle className="text-base font-semibold text-zinc-900 dark:text-white">
              Organizations
            </Headless.DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="flex size-7 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <XMarkIcon className="size-4" />
            </button>
          </div>

          <div className="px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <OrgPanel orgs={orgs} current={current} onSelect={onSelect} onNew={onNew} onSettings={onSettings} />
          </div>
        </Headless.DialogPanel>
      </div>
    </Headless.Dialog>
  );
}

// =============================================================================
// DESKTOP + MOBILE SIDEBAR SWITCHER
// =============================================================================

export function OrganizationSwitcher({
  organizations,
  currentOrganization,
  onOpenOrgSettings,
  collapsed = false,
}: {
  organizations: Organization[];
  currentOrganization: Organization;
  onOpenOrgSettings: () => void;
  collapsed?: boolean;
}) {
  const { org, mobileOpen, setMobileOpen, desktopSelect, mobileSelect, newOrg, settings } = useOrgSwitching({
    currentOrganization,
    onOpenOrgSettings,
  });

  return (
    <>
      {/* ── Desktop ── */}
      <Headless.Popover className="relative hidden lg:block">
        {({ close }) => (
          <>
            {collapsed ? (
              <Headless.PopoverButton
                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-zinc-950/5 focus:outline-none dark:hover:bg-white/5"
                title={org.name}
              >
                <OrgAvatar org={org} size={26} />
              </Headless.PopoverButton>
            ) : (
              <Headless.PopoverButton className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-zinc-950/5 focus:outline-none dark:hover:bg-white/5">
                <OrgAvatar org={org} size={28} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">
                  {org.name || "Select Organization"}
                </span>
                <ChevronUpDownIcon className="size-4 shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400" />
              </Headless.PopoverButton>
            )}

            <Headless.PopoverPanel
              transition
              anchor="bottom start"
              className={clsx(
                "z-50 w-64 rounded-xl",
                "bg-white shadow-lg ring-1 ring-black/8 dark:bg-zinc-900 dark:ring-white/10",
                "[--anchor-gap:4px] [--anchor-offset:-4px]",
                "origin-top-left transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
              )}
            >
              <OrgPanel
                orgs={organizations}
                current={currentOrganization}
                onSelect={(o) => desktopSelect(o, close)}
                onNew={() => newOrg(close)}
                onSettings={() => settings(close)}
              />
            </Headless.PopoverPanel>
          </>
        )}
      </Headless.Popover>

      {/* ── Mobile sidebar trigger ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-zinc-950/5 lg:hidden dark:hover:bg-white/5"
      >
        <OrgAvatar org={org} size={28} />
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">
          {org.name || "Select Organization"}
        </span>
        <ChevronUpDownIcon className="size-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
      </button>

      <MobileSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        orgs={organizations}
        current={currentOrganization}
        onSelect={mobileSelect}
        onNew={() => newOrg()}
        onSettings={() => settings()}
      />
    </>
  );
}

// =============================================================================
// MOBILE HEADER BAR SWITCHER (compact pill)
// =============================================================================

export function MobileOrgSwitcher({
  organizations,
  currentOrganization,
  onOpenOrgSettings,
}: {
  organizations: Organization[];
  currentOrganization: Organization;
  onOpenOrgSettings: () => void;
}) {
  const { org, mobileOpen, setMobileOpen, mobileSelect, newOrg, settings } = useOrgSwitching({
    currentOrganization,
    onOpenOrgSettings,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-zinc-950/5 active:bg-zinc-950/5 dark:hover:bg-white/5"
        aria-label="Switch organization"
      >
        <OrgAvatar org={org} size={20} />
        <span className="truncate text-sm/5 font-semibold text-zinc-900 dark:text-white">{org.name || "Select"}</span>
        <ChevronDownIcon className="-ml-0.5 size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
      </button>

      <MobileSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        orgs={organizations}
        current={currentOrganization}
        onSelect={mobileSelect}
        onNew={() => newOrg()}
        onSettings={() => settings()}
      />
    </>
  );
}
