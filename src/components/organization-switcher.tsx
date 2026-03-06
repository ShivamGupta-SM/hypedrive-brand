import * as Headless from "@headlessui/react";
import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpDownIcon,
	Cog6ToothIcon,
	PlusIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { BuildingStorefrontIcon } from "@heroicons/react/20/solid";
import { useLocation, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useCallback, useState } from "react";
import type { Organization } from "@/components/app-layout";
import { Avatar } from "@/components/avatar";
import { SidebarItem } from "@/components/sidebar";
import { getInitials } from "@/lib/design-tokens";

// =============================================================================
// ORG COLORS — vibrant, distinct palette for avatar backgrounds
// =============================================================================

const ORG_COLORS = [
	{ bg: "bg-violet-600", text: "text-violet-50" },
	{ bg: "bg-sky-600", text: "text-sky-50" },
	{ bg: "bg-emerald-600", text: "text-emerald-50" },
	{ bg: "bg-amber-600", text: "text-amber-50" },
	{ bg: "bg-rose-600", text: "text-rose-50" },
	{ bg: "bg-indigo-600", text: "text-indigo-50" },
	{ bg: "bg-teal-600", text: "text-teal-50" },
	{ bg: "bg-fuchsia-600", text: "text-fuchsia-50" },
];

function getOrgColor(id: string) {
	const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return ORG_COLORS[index % ORG_COLORS.length];
}

// =============================================================================
// STATUS INDICATORS
// =============================================================================

const STATUS_COLORS: Record<string, string> = {
	onboarding: "bg-sky-400",
	suspended: "bg-red-400",
};

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
	onboarding: { text: "Onboarding", className: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400" },
	suspended: { text: "Suspended", className: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400" },
};

function StatusDot({ status }: { status?: string }) {
	const color = status ? STATUS_COLORS[status] : undefined;
	if (!color) return null;
	return (
		<span
			className={clsx(
				"absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900",
				color
			)}
		/>
	);
}

// =============================================================================
// ORG AVATAR — vibrant colored initials or logo
// =============================================================================

function OrgAvatar({
	org,
	size = "sm",
	selected = false,
}: {
	org: Organization;
	size?: "xs" | "sm" | "md";
	selected?: boolean;
}) {
	const colors = getOrgColor(org.id);
	const sizeClasses = {
		xs: "size-6",
		sm: "size-7 sm:size-6",
		md: "size-9",
	};
	const textSizes = {
		xs: "text-[9px]",
		sm: "text-[10px]",
		md: "text-xs",
	};

	return (
		<span className="relative shrink-0">
			{org.logo ? (
				<Avatar
					src={org.logo}
					square
					className={clsx(
						sizeClasses[size],
						"outline-0!",
						selected && "ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900"
					)}
				/>
			) : (
				<Avatar
					initials={getInitials(org.name)}
					square
					className={clsx(
						sizeClasses[size],
						textSizes[size],
						"outline-0!",
						colors.bg,
						colors.text,
						selected && "ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900"
					)}
				/>
			)}
			<StatusDot status={org.status} />
		</span>
	);
}

// =============================================================================
// ORG LIST — shared between desktop popover and mobile sheet
// =============================================================================

function OrgList({
	organizations,
	currentOrganization,
	onSelect,
	onNewOrg,
	onSettings,
	variant,
}: {
	organizations: Organization[];
	currentOrganization: Organization | null;
	onSelect: (org: Organization) => void;
	onNewOrg: () => void;
	onSettings: () => void;
	variant: "desktop" | "mobile";
}) {
	const isMobile = variant === "mobile";

	return (
		<>
			{/* Org list */}
			<div className={clsx("overflow-y-auto scrollbar-hide", isMobile ? "max-h-[55vh] px-3 py-2" : "max-h-72 p-1.5")}>
				{organizations.length === 0 ? (
					<div className={clsx("text-center", isMobile ? "px-4 py-14" : "px-3 py-8")}>
						<BuildingStorefrontIcon
							className={clsx("mx-auto text-zinc-300 dark:text-zinc-600", isMobile ? "size-12" : "size-8")}
						/>
						<p className={clsx("mt-3 font-medium text-zinc-500 dark:text-zinc-400", isMobile ? "text-base" : "text-sm")}>
							No organizations yet
						</p>
					</div>
				) : (
					<div className={clsx(isMobile ? "space-y-1" : "space-y-0.5")}>
						{organizations.map((org) => {
							const isCurrent = org.id === currentOrganization?.id;
							const statusInfo = org.status ? STATUS_LABELS[org.status] : undefined;

							return (
								<button
									key={org.id}
									type="button"
									onClick={() => onSelect(org)}
									className={clsx(
										"group flex w-full items-center text-left transition-all duration-100",
										isMobile ? "gap-3.5 rounded-xl px-3 py-3" : "gap-2.5 rounded-lg px-2.5 py-2",
										isCurrent
											? "bg-zinc-950/5 dark:bg-white/6"
											: "hover:bg-zinc-950/3 active:bg-zinc-950/5 dark:hover:bg-white/4 dark:active:bg-white/6"
									)}
								>
									<OrgAvatar org={org} size={isMobile ? "md" : "md"} selected={isCurrent} />
									<div className="min-w-0 flex-1">
										<span
											className={clsx(
												"block truncate",
												isMobile ? "text-[15px]/5" : "text-sm/5",
												isCurrent
													? "font-semibold text-zinc-950 dark:text-white"
													: "font-medium text-zinc-800 dark:text-zinc-200"
											)}
										>
											{org.name}
										</span>
										{statusInfo && (
											<span
												className={clsx(
													"mt-0.5 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-none",
													statusInfo.className
												)}
											>
												{statusInfo.text}
											</span>
										)}
									</div>
									{isCurrent && (
										<CheckIcon className="size-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
									)}
								</button>
							);
						})}
					</div>
				)}
			</div>

			{/* Footer actions */}
			<div
				className={clsx(
					"border-t border-zinc-950/5 dark:border-white/5",
					isMobile ? "px-3 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]" : "p-1.5"
				)}
			>
				<button
					type="button"
					onClick={onNewOrg}
					className={clsx(
						"flex w-full items-center transition-colors duration-100",
						isMobile
							? "gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-zinc-600 active:bg-zinc-950/3 dark:text-zinc-400 dark:active:bg-white/4"
							: "gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-950/3 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-white/4 dark:hover:text-zinc-200"
					)}
				>
					<span
						className={clsx(
							"flex shrink-0 items-center justify-center rounded-lg bg-zinc-950/5 dark:bg-white/5",
							isMobile ? "size-9" : "size-7"
						)}
					>
						<PlusIcon className={clsx("text-zinc-500 dark:text-zinc-400", isMobile ? "size-4" : "size-3.5")} />
					</span>
					New organization
				</button>
				<button
					type="button"
					onClick={onSettings}
					className={clsx(
						"flex w-full items-center transition-colors duration-100",
						isMobile
							? "gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-zinc-600 active:bg-zinc-950/3 dark:text-zinc-400 dark:active:bg-white/4"
							: "gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-950/3 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-white/4 dark:hover:text-zinc-200"
					)}
				>
					<span
						className={clsx(
							"flex shrink-0 items-center justify-center rounded-lg bg-zinc-950/5 dark:bg-white/5",
							isMobile ? "size-9" : "size-7"
						)}
					>
						<Cog6ToothIcon className={clsx("text-zinc-500 dark:text-zinc-400", isMobile ? "size-4" : "size-3.5")} />
					</span>
					Settings
				</button>
			</div>
		</>
	);
}

// =============================================================================
// MOBILE BOTTOM SHEET
// =============================================================================

function MobileOrgSheet({
	open,
	onClose,
	organizations,
	currentOrganization,
	onSelect,
	onNewOrg,
	onSettings,
}: {
	open: boolean;
	onClose: () => void;
	organizations: Organization[];
	currentOrganization: Organization | null;
	onSelect: (org: Organization) => void;
	onNewOrg: () => void;
	onSettings: () => void;
}) {
	return (
		<Headless.Dialog open={open} onClose={onClose} className="relative z-50">
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 bg-black/25 backdrop-blur-sm transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
			/>

			<div className="fixed inset-0 flex items-end">
				<Headless.DialogPanel
					transition
					className="max-h-[85vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl ring-1 ring-zinc-950/5 transition duration-300 ease-out data-closed:translate-y-full dark:bg-zinc-900 dark:ring-white/10"
				>
					{/* Drag handle */}
					<div className="flex justify-center pb-1 pt-3">
						<div className="h-1 w-9 rounded-full bg-zinc-300 dark:bg-zinc-700" />
					</div>

					{/* Header */}
					<div className="flex items-center justify-between px-4 pb-3 pt-1">
						<Headless.DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
							Switch Organization
						</Headless.DialogTitle>
						<button
							type="button"
							onClick={onClose}
							className="flex size-8 items-center justify-center rounded-full bg-zinc-950/5 transition-colors active:bg-zinc-950/10 dark:bg-white/5 dark:active:bg-white/10"
						>
							<XMarkIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
						</button>
					</div>

					<OrgList
						organizations={organizations}
						currentOrganization={currentOrganization}
						onSelect={onSelect}
						onNewOrg={onNewOrg}
						onSettings={onSettings}
						variant="mobile"
					/>
				</Headless.DialogPanel>
			</div>
		</Headless.Dialog>
	);
}

// =============================================================================
// SWITCHING LOGIC HOOK
// =============================================================================

function useOrgSwitching({
	organizations,
	currentOrganization,
	onOpenOrgSettings,
}: {
	organizations: Organization[];
	currentOrganization: Organization;
	onOpenOrgSettings: () => void;
}) {
	const navigate = useNavigate();
	const location = useLocation();
	const [mobileOpen, setMobileOpen] = useState(false);

	const performSwitch = useCallback(
		(org: Organization) => {
			if (org.id !== currentOrganization.id) {
				const currentSlug = currentOrganization.slug;
				if (currentSlug && location.pathname.startsWith(`/${currentSlug}`)) {
					const subPath = location.pathname.slice(`/${currentSlug}`.length);
					navigate({ to: `/${org.slug}${subPath || ""}` });
				} else {
					navigate({ to: "/$orgSlug", params: { orgSlug: org.slug } });
				}
			}
		},
		[currentOrganization, navigate, location.pathname]
	);

	const handleDesktopSelect = useCallback(
		(org: Organization, close: () => void) => {
			performSwitch(org);
			close();
		},
		[performSwitch]
	);

	const handleMobileSelect = useCallback(
		(org: Organization) => {
			performSwitch(org);
			setMobileOpen(false);
		},
		[performSwitch]
	);

	const handleNewOrg = useCallback(
		(close?: () => void) => {
			close?.();
			setMobileOpen(false);
			navigate({ to: "/onboarding" });
		},
		[navigate]
	);

	const handleSettings = useCallback(
		(close?: () => void) => {
			close?.();
			setMobileOpen(false);
			onOpenOrgSettings();
		},
		[onOpenOrgSettings]
	);

	return {
		organizations,
		currentOrganization,
		displayOrg: currentOrganization,
		mobileOpen,
		setMobileOpen,
		handleDesktopSelect,
		handleMobileSelect,
		handleNewOrg,
		handleSettings,
	};
}

// =============================================================================
// DESKTOP SIDEBAR SWITCHER (Popover)
// =============================================================================

export function OrganizationSwitcher({
	organizations,
	currentOrganization,
	onOpenOrgSettings,
}: {
	organizations: Organization[];
	currentOrganization: Organization;
	onOpenOrgSettings: () => void;
}) {
	const {
		displayOrg,
		mobileOpen,
		setMobileOpen,
		handleDesktopSelect,
		handleMobileSelect,
		handleNewOrg,
		handleSettings,
	} = useOrgSwitching({ organizations, currentOrganization, onOpenOrgSettings });

	return (
		<>
			{/* Desktop: popover anchored to sidebar trigger */}
			<Headless.Popover className="relative hidden lg:block">
				{({ close }) => (
					<>
						<Headless.PopoverButton as={SidebarItem} className="w-full">
							<OrgAvatar org={displayOrg} size="sm" />
							<span className="min-w-0 flex-1 truncate text-left">{displayOrg.name || "Select Organization"}</span>
							<ChevronUpDownIcon />
						</Headless.PopoverButton>

						<Headless.PopoverPanel
							transition
							anchor="bottom start"
							className={clsx(
								"z-50 w-72 rounded-xl",
								"bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-900 dark:ring-white/10",
								"[--anchor-gap:6px] [--anchor-offset:-8px]",
								"transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
							)}
						>
							{/* Header */}
							<div className="border-b border-zinc-950/5 px-3.5 pb-2.5 pt-3 dark:border-white/5">
								<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Switch organization</p>
							</div>

							<OrgList
								organizations={organizations}
								currentOrganization={currentOrganization}
								onSelect={(org) => handleDesktopSelect(org, close)}
								onNewOrg={() => handleNewOrg(close)}
								onSettings={() => handleSettings(close)}
								variant="desktop"
							/>
						</Headless.PopoverPanel>
					</>
				)}
			</Headless.Popover>

			{/* Mobile: button in sidebar that opens bottom sheet */}
			<span className="lg:hidden">
				<SidebarItem onClick={() => setMobileOpen(true)}>
					<OrgAvatar org={displayOrg} size="sm" />
					<span className="min-w-0 flex-1 truncate text-left">{displayOrg.name || "Select Organization"}</span>
					<ChevronUpDownIcon />
				</SidebarItem>
			</span>

			<MobileOrgSheet
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				organizations={organizations}
				currentOrganization={currentOrganization}
				onSelect={handleMobileSelect}
				onNewOrg={() => handleNewOrg()}
				onSettings={() => handleSettings()}
			/>
		</>
	);
}

// =============================================================================
// MOBILE HEADER BAR SWITCHER (compact trigger)
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
	const { displayOrg, mobileOpen, setMobileOpen, handleMobileSelect, handleNewOrg, handleSettings } = useOrgSwitching({
		organizations,
		currentOrganization,
		onOpenOrgSettings,
	});

	return (
		<>
			<button
				type="button"
				onClick={() => setMobileOpen(true)}
				className="flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-zinc-950/5 active:bg-zinc-950/5 dark:hover:bg-white/5 dark:active:bg-white/5"
				aria-label="Switch organization"
			>
				<OrgAvatar org={displayOrg} size="xs" />
				<span className="truncate text-sm/5 font-semibold text-zinc-900 dark:text-white">
					{displayOrg.name || "Select"}
				</span>
				<ChevronDownIcon className="-ml-0.5 size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
			</button>

			<MobileOrgSheet
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				organizations={organizations}
				currentOrganization={currentOrganization}
				onSelect={handleMobileSelect}
				onNewOrg={() => handleNewOrg()}
				onSettings={() => handleSettings()}
			/>
		</>
	);
}
