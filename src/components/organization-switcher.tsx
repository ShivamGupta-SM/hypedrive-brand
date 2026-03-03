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

/** Richer palette — each org gets a distinct but professional color */
const ORG_COLORS = [
	{ bg: "bg-zinc-800", border: "border-zinc-700" },
	{ bg: "bg-slate-700", border: "border-slate-600" },
	{ bg: "bg-stone-700", border: "border-stone-600" },
	{ bg: "bg-neutral-700", border: "border-neutral-600" },
	{ bg: "bg-zinc-700", border: "border-zinc-600" },
	{ bg: "bg-slate-800", border: "border-slate-700" },
	{ bg: "bg-stone-800", border: "border-stone-700" },
	{ bg: "bg-neutral-800", border: "border-neutral-700" },
];

function getOrgColor(id: string) {
	const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return ORG_COLORS[index % ORG_COLORS.length];
}

/** Small colored dot for approval status — only renders for known non-approved states */
const STATUS_COLORS: Record<string, string> = {
	pending: "bg-amber-400",
	draft: "bg-zinc-400",
	rejected: "bg-red-400",
	banned: "bg-red-400",
};

function StatusDot({ status }: { status?: string }) {
	const color = status ? STATUS_COLORS[status] : undefined;
	if (!color) return null;
	return (
		<span
			className={clsx("absolute -right-0.5 -top-0.5 size-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900", color)}
		/>
	);
}

function OrgAvatar({
	org,
	size = "sm",
	selected = false,
}: {
	org: Organization;
	size?: "xs" | "sm" | "md" | "lg";
	selected?: boolean;
}) {
	const colors = getOrgColor(org.id);
	const sizeClass =
		size === "lg" ? "size-11" : size === "md" ? "size-9" : size === "sm" ? "size-7 sm:size-6" : "size-6";
	const textSize = size === "lg" ? "text-sm" : size === "md" ? "text-xs" : size === "sm" ? "text-[10px]" : "text-[9px]";

	return (
		<span className="relative shrink-0">
			{org.logo ? (
				<Avatar
					src={org.logo}
					className={clsx(sizeClass, "outline-0!", selected && "ring-2 ring-zinc-900 dark:ring-white")}
				/>
			) : (
				<Avatar
					initials={getInitials(org.name)}
					className={clsx(
						sizeClass,
						textSize,
						"outline-0!",
						colors.bg,
						"text-white",
						selected && "ring-2 ring-zinc-900 dark:ring-white"
					)}
				/>
			)}
			<StatusDot status={org.approvalStatus} />
		</span>
	);
}

/** Shared org list content — used by both desktop popover and mobile bottom sheet */
function OrgListContent({
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
	const avatarSize = isMobile ? "lg" : "md";

	return (
		<>
			{/* Organization list */}
			<div className={clsx("overflow-y-auto", isMobile ? "max-h-[50vh] px-3 py-2" : "max-h-64 p-1.5")}>
				<div className={clsx(isMobile ? "space-y-1.5" : "space-y-0.5")}>
					{organizations.map((org) => {
						const isCurrent = org.id === currentOrganization?.id;
						return (
							<button
								key={org.id}
								type="button"
								onClick={() => onSelect(org)}
								className={clsx(
									"flex w-full items-center text-left transition-colors",
									isMobile ? "gap-4 rounded-2xl px-3.5 py-3" : "gap-3 rounded-lg px-2.5 py-2",
									isCurrent
										? isMobile
											? "bg-zinc-100 dark:bg-zinc-800"
											: "bg-zinc-950/5 dark:bg-white/6"
										: isMobile
											? "active:bg-zinc-50 dark:active:bg-zinc-800/50"
											: "hover:bg-zinc-950/3 dark:hover:bg-white/4"
								)}
							>
								<OrgAvatar org={org} size={avatarSize} selected={isCurrent} />
								<div className="min-w-0 flex-1">
									<span
										className={clsx(
											"block truncate",
											isMobile ? "text-base/5" : "text-sm/5",
											isCurrent
												? "font-bold text-zinc-950 dark:text-white"
												: "font-semibold text-zinc-800 dark:text-zinc-200"
										)}
									>
										{org.name}
									</span>
									{org.approvalStatus && org.approvalStatus !== "approved" && (
										<span
											className={clsx(
												"mt-1 block font-medium capitalize",
												isMobile ? "text-xs" : "text-[11px]",
												org.approvalStatus === "pending" && "text-amber-600 dark:text-amber-400",
												org.approvalStatus === "draft" && "text-zinc-500 dark:text-zinc-500",
												(org.approvalStatus === "rejected" || org.approvalStatus === "banned") &&
													"text-red-600 dark:text-red-400"
											)}
										>
											{org.approvalStatus}
										</span>
									)}
								</div>
								{isCurrent && (
									<span
										className={clsx(
											"flex shrink-0 items-center justify-center rounded-full bg-zinc-900 shadow-sm dark:bg-white",
											isMobile ? "size-7" : "size-5"
										)}
									>
										<CheckIcon className={clsx("text-white dark:text-zinc-900", isMobile ? "size-4" : "size-3")} />
									</span>
								)}
							</button>
						);
					})}
				</div>

				{organizations.length === 0 && (
					<div className={clsx("text-center", isMobile ? "px-4 py-12" : "px-3 py-6")}>
						<BuildingStorefrontIcon
							className={clsx("mx-auto text-zinc-300 dark:text-zinc-600", isMobile ? "size-12" : "size-8")}
						/>
						<p
							className={clsx("mt-3 font-medium text-zinc-500 dark:text-zinc-400", isMobile ? "text-base" : "text-sm")}
						>
							No organizations yet
						</p>
					</div>
				)}
			</div>

			{/* Footer actions */}
			<div
				className={clsx(
					"border-t border-zinc-200/80 dark:border-zinc-700/80",
					isMobile ? "px-3 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]" : "p-1.5"
				)}
			>
				<button
					type="button"
					onClick={onNewOrg}
					className={clsx(
						"flex w-full items-center transition-colors",
						isMobile
							? "gap-3.5 rounded-2xl px-3.5 py-3 text-base font-semibold text-zinc-700 active:bg-zinc-50 dark:text-zinc-300 dark:active:bg-zinc-800/50"
							: "gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-950/3 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/4 dark:hover:text-white"
					)}
				>
					<span
						className={clsx(
							"flex shrink-0 items-center justify-center bg-zinc-100 dark:bg-zinc-800",
							isMobile ? "size-9 rounded-xl" : "size-5 rounded-md"
						)}
					>
						<PlusIcon className={clsx("text-zinc-600 dark:text-zinc-400", isMobile ? "size-5" : "size-3.5")} />
					</span>
					New organization
				</button>
				<button
					type="button"
					onClick={onSettings}
					className={clsx(
						"flex w-full items-center transition-colors",
						isMobile
							? "gap-3.5 rounded-2xl px-3.5 py-3 text-base font-semibold text-zinc-700 active:bg-zinc-50 dark:text-zinc-300 dark:active:bg-zinc-800/50"
							: "gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-950/3 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/4 dark:hover:text-white"
					)}
				>
					<span
						className={clsx(
							"flex shrink-0 items-center justify-center bg-zinc-100 dark:bg-zinc-800",
							isMobile ? "size-9 rounded-xl" : "size-5 rounded-md"
						)}
					>
						<Cog6ToothIcon className={clsx("text-zinc-600 dark:text-zinc-400", isMobile ? "size-5" : "size-3.5")} />
					</span>
					Settings
				</button>
			</div>
		</>
	);
}

/** Mobile bottom sheet — inspired by the mockup's rounded-top design */
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
				className="fixed inset-0 bg-black/30 backdrop-blur-sm transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
			/>

			<div className="fixed inset-0 flex items-end">
				<Headless.DialogPanel
					transition
					className="max-h-[85vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-xl transition duration-300 ease-out data-closed:translate-y-full dark:bg-zinc-900"
				>
					{/* Drag handle */}
					<div className="flex justify-center pb-1 pt-3">
						<div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
					</div>

					{/* Header */}
					<div className="flex items-center justify-between px-5 pb-4 pt-2">
						<div>
							<Headless.DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
								Switch Brand
							</Headless.DialogTitle>
							<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">Select an organization to manage</p>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="flex size-9 items-center justify-center rounded-full bg-zinc-100 transition-colors active:bg-zinc-200 dark:bg-zinc-800 dark:active:bg-zinc-700"
						>
							<XMarkIcon className="size-4.5 text-zinc-500 dark:text-zinc-400" />
						</button>
					</div>

					<OrgListContent
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

/** Shared hook for org switching logic — pure props, no Zustand */
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
							<div className="border-b border-zinc-100 px-3.5 pb-2.5 pt-3 dark:border-zinc-800">
								<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Switch organization</p>
							</div>

							<OrgListContent
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

/** Compact org switcher trigger for mobile header bar */
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
				className="flex min-w-0 items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-zinc-100 active:bg-zinc-100 dark:hover:bg-zinc-800 dark:active:bg-zinc-800"
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
