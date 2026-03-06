/**
 * SettingsDialog — Full-screen settings dialog with sidebar navigation.
 * Single source of truth for all settings. Old page routes redirect here.
 *
 * Panel system: sub-actions render inline (no nested dialogs).
 * Use `usePanelNav()` in any settings component to push/pop inline panels.
 */

import * as Headless from "@headlessui/react";
import {
	AdjustmentsHorizontalIcon,
	BuildingStorefrontIcon,
	ChevronLeftIcon,
	Cog6ToothIcon,
	ComputerDesktopIcon,
	CreditCardIcon,
	FingerPrintIcon,
	IdentificationIcon,
	MoonIcon,
	ReceiptPercentIcon,
	ShieldCheckIcon,
	SunIcon,
	UserCircleIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Settings as OrgSettings, type OrgSettingsSection } from "@/pages/settings";
import { AccountSettings, type AccountSettingsSection } from "@/pages/settings/account";

// =============================================================================
// PANEL CONTEXT — lets any child push/pop inline panels without dialogs
// =============================================================================

interface ActivePanel {
	id: string;
	title: string;
	content: React.ReactNode;
}

interface PanelNavValue {
	pushPanel: (id: string, title: string, content: React.ReactNode) => void;
	popPanel: () => void;
}

const PanelNavContext = createContext<PanelNavValue | null>(null);

/** Returns null when rendered outside a SettingsDialog (e.g. standalone settings page). */
export function usePanelNav(): PanelNavValue | null {
	return useContext(PanelNavContext);
}

// =============================================================================
// THEME TOGGLE — compact 3-button strip in sidebar footer
// =============================================================================

type ThemeOption = "light" | "dark" | "system";

function applyTheme(theme: ThemeOption) {
	const root = document.documentElement;
	if (theme === "system") {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		root.setAttribute("data-theme", prefersDark ? "dark" : "light");
	} else {
		root.setAttribute("data-theme", theme);
	}
}

function SidebarThemeToggle() {
	const [theme, setTheme] = useState<ThemeOption>("system");

	useEffect(() => {
		const stored = localStorage.getItem("theme") as ThemeOption | null;
		if (stored) setTheme(stored);
	}, []);

	useEffect(() => {
		localStorage.setItem("theme", theme);
		applyTheme(theme);

		// Listen for OS theme changes when set to "system"
		if (theme === "system") {
			const mql = window.matchMedia("(prefers-color-scheme: dark)");
			const handler = () => applyTheme("system");
			mql.addEventListener("change", handler);
			return () => mql.removeEventListener("change", handler);
		}
	}, [theme]);

	const options: Array<{ id: ThemeOption; icon: React.ComponentType<{ className?: string }>; label: string }> = [
		{ id: "light", icon: SunIcon, label: "Light" },
		{ id: "dark", icon: MoonIcon, label: "Dark" },
		{ id: "system", icon: ComputerDesktopIcon, label: "Auto" },
	];

	return (
		<div className="shrink-0 border-t border-zinc-200/80 px-2 py-3 dark:border-zinc-800">
			<p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
				Appearance
			</p>
			<div className="flex gap-0.5 rounded-xl bg-zinc-200/60 p-1 dark:bg-zinc-800/80">
				{options.map(({ id, icon: Icon, label }) => (
					<button
						key={id}
						type="button"
						onClick={() => setTheme(id)}
						title={label}
						className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all duration-150 ${
							theme === id
								? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-700 dark:text-white dark:ring-zinc-600"
								: "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
						}`}
					>
						<Icon className="size-3.5" />
						<span className="hidden sm:inline">{label}</span>
					</button>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// TYPES & NAV DEFINITION
// =============================================================================

type SettingsTab = "org" | "account";

interface NavItem {
	id: string;
	tab: SettingsTab;
	section: OrgSettingsSection | AccountSettingsSection;
	label: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	iconBgActive: string;
}

const NAV_ITEMS: NavItem[] = [
	{
		id: "org-profile",
		tab: "org",
		section: "profile" as OrgSettingsSection,
		label: "Organization",
		description: "Profile & contact details",
		icon: BuildingStorefrontIcon,
		iconColor: "text-sky-600 dark:text-sky-400",
		iconBgActive: "bg-sky-100 dark:bg-sky-900/50",
	},
	{
		id: "org-gst",
		tab: "org",
		section: "gst" as OrgSettingsSection,
		label: "GST & Compliance",
		description: "Tax registration details",
		icon: IdentificationIcon,
		iconColor: "text-amber-600 dark:text-amber-400",
		iconBgActive: "bg-amber-100 dark:bg-amber-900/50",
	},
	{
		id: "org-bank",
		tab: "org",
		section: "bank" as OrgSettingsSection,
		label: "Bank Account",
		description: "Withdrawal destination",
		icon: CreditCardIcon,
		iconColor: "text-emerald-600 dark:text-emerald-400",
		iconBgActive: "bg-emerald-100 dark:bg-emerald-900/50",
	},
	{
		id: "org-billing",
		tab: "org",
		section: "billing" as OrgSettingsSection,
		label: "Billing",
		description: "Invoices & payment history",
		icon: ReceiptPercentIcon,
		iconColor: "text-violet-600 dark:text-violet-400",
		iconBgActive: "bg-violet-100 dark:bg-violet-900/50",
	},
	{
		id: "account-profile",
		tab: "account",
		section: "profile" as AccountSettingsSection,
		label: "My Profile",
		description: "Name, email & linked accounts",
		icon: UserCircleIcon,
		iconColor: "text-sky-600 dark:text-sky-400",
		iconBgActive: "bg-sky-100 dark:bg-sky-900/50",
	},
	{
		id: "account-security",
		tab: "account",
		section: "security" as AccountSettingsSection,
		label: "Security",
		description: "2FA, sessions & backup codes",
		icon: ShieldCheckIcon,
		iconColor: "text-emerald-600 dark:text-emerald-400",
		iconBgActive: "bg-emerald-100 dark:bg-emerald-900/50",
	},
	{
		id: "account-passkeys",
		tab: "account",
		section: "passkeys" as AccountSettingsSection,
		label: "Passkeys",
		description: "Face ID & biometric login",
		icon: FingerPrintIcon,
		iconColor: "text-violet-600 dark:text-violet-400",
		iconBgActive: "bg-violet-100 dark:bg-violet-900/50",
	},
	{
		id: "account-preferences",
		tab: "account",
		section: "preferences" as AccountSettingsSection,
		label: "Preferences",
		description: "Notifications & danger zone",
		icon: AdjustmentsHorizontalIcon,
		iconColor: "text-zinc-600 dark:text-zinc-400",
		iconBgActive: "bg-zinc-200 dark:bg-zinc-700",
	},
];

const DEFAULT_ITEM: Record<SettingsTab, string> = {
	org: "org-profile",
	account: "account-profile",
};

// =============================================================================
// NAV ITEM BUTTON
// =============================================================================

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
	const Icon = item.icon;
	return (
		<button
			type="button"
			onClick={onClick}
			className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-150 ${
				active
					? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700/80"
					: "text-zinc-500 hover:bg-white/70 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
			}`}
		>
			<div
				className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150 ${
					active
						? `${item.iconBgActive} ${item.iconColor}`
						: "bg-zinc-200/70 text-zinc-500 group-hover:bg-zinc-200 group-hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-700 dark:group-hover:text-zinc-300"
				}`}
			>
				<Icon className="size-3.5" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium leading-tight">{item.label}</p>
				<p className="mt-0.5 truncate text-xs leading-tight text-zinc-500 dark:text-zinc-400">{item.description}</p>
			</div>
		</button>
	);
}

// =============================================================================
// SETTINGS DIALOG
// =============================================================================

export interface SettingsDialogProps {
	open: boolean;
	onClose: () => void;
	initialTab?: SettingsTab;
}

export function SettingsDialog({ open, onClose, initialTab = "org" }: SettingsDialogProps) {
	const [activeId, setActiveId] = useState<string>(DEFAULT_ITEM[initialTab]);
	const [activePanel, setActivePanel] = useState<ActivePanel | null>(null);
	const [mobilePane, setMobilePane] = useState<"nav" | "content">("nav");

	useEffect(() => {
		if (open) {
			setActiveId(DEFAULT_ITEM[initialTab]);
			setActivePanel(null);
			setMobilePane("nav");
		}
	}, [open, initialTab]);

	const panelNav: PanelNavValue = {
		pushPanel: (id, title, content) => setActivePanel({ id, title, content }),
		popPanel: () => setActivePanel(null),
	};

	const handleNavClick = (id: string) => {
		setActiveId(id);
		setActivePanel(null);
		setMobilePane("content");
	};

	const activeItem = NAV_ITEMS.find((i) => i.id === activeId) ?? NAV_ITEMS[0];
	const activeTab = activeItem.tab;
	const orgItems = NAV_ITEMS.filter((i) => i.tab === "org");
	const accountItems = NAV_ITEMS.filter((i) => i.tab === "account");

	const orgSection = activeTab === "org" ? (activeItem.section as OrgSettingsSection) : "profile";
	const accountSection = activeTab === "account" ? (activeItem.section as AccountSettingsSection) : "profile";

	const ActiveIcon = activeItem.icon;

	return (
		<Headless.Dialog open={open} onClose={onClose} className="relative z-40">
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 bg-black/30 backdrop-blur-sm transition duration-200 ease-out data-closed:opacity-0 dark:bg-black/60"
			/>

			<div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-8">
				<Headless.DialogPanel
					transition
					className="flex h-full w-full overflow-hidden bg-white shadow-2xl ring-1 ring-black/8 transition duration-200 ease-out data-closed:opacity-0 sm:h-[88vh] sm:max-h-195 sm:max-w-230 sm:rounded-2xl dark:bg-zinc-950 dark:ring-white/8"
				>
					{/* ── Left Sidebar ── */}
					<div
						className={`flex w-full shrink-0 flex-col bg-zinc-50/80 dark:bg-zinc-900 sm:flex sm:w-58 ${mobilePane === "nav" ? "flex" : "hidden"}`}
					>
						<div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/80 px-4 dark:border-zinc-800">
							<div className="flex items-center gap-2.5">
								<div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
									<Cog6ToothIcon className="size-3.5 text-white dark:text-zinc-900" />
								</div>
								<span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Settings</span>
							</div>
							<button
								type="button"
								onClick={onClose}
								className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 sm:hidden dark:hover:bg-red-950/40 dark:hover:text-red-400"
								aria-label="Close settings"
							>
								<XMarkIcon className="size-4" />
							</button>
						</div>

						<nav className="flex-1 overflow-y-auto scrollbar-hide px-2 py-3">
							{/* Workspace group */}
							<div className="mb-1">
								<p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
									Workspace
								</p>
								<div className="space-y-0.5">
									{orgItems.map((item) => (
										<NavButton
											key={item.id}
											item={item}
											active={activeId === item.id}
											onClick={() => handleNavClick(item.id)}
										/>
									))}
								</div>
							</div>

							<div className="my-3 border-t border-zinc-200/80 dark:border-zinc-800" />

							{/* Account group */}
							<div>
								<p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
									Account
								</p>
								<div className="space-y-0.5">
									{accountItems.map((item) => (
										<NavButton
											key={item.id}
											item={item}
											active={activeId === item.id}
											onClick={() => handleNavClick(item.id)}
										/>
									))}
								</div>
							</div>
						</nav>

						{/* Theme toggle pinned to sidebar bottom */}
						<SidebarThemeToggle />
					</div>

					{/* ── Right Content ── */}
					<PanelNavContext.Provider value={panelNav}>
						<div
							className={`flex min-w-0 flex-1 flex-col border-l border-zinc-200/80 dark:border-zinc-800 ${mobilePane === "content" ? "flex" : "hidden"} sm:flex`}
						>
							{/* Header */}
							<div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/80 px-4 sm:px-6 dark:border-zinc-800">
								{activePanel ? (
									<button
										type="button"
										onClick={() => setActivePanel(null)}
										className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
									>
										<ChevronLeftIcon className="size-4 text-zinc-400" />
										<span>{activePanel.title}</span>
									</button>
								) : (
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => setMobilePane("nav")}
											className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 sm:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
											aria-label="Back to menu"
										>
											<ChevronLeftIcon className="size-4" />
										</button>
										<Headless.DialogTitle className="flex items-center gap-2">
											<div
												className={`flex size-7 items-center justify-center rounded-lg ${activeItem.iconBgActive} ${activeItem.iconColor}`}
											>
												<ActiveIcon className="size-3.5" />
											</div>
											<div className="flex items-baseline gap-2">
												<span className="text-sm font-semibold text-zinc-900 dark:text-white">{activeItem.label}</span>
												<span className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:inline">
													{activeItem.description}
												</span>
											</div>
										</Headless.DialogTitle>
									</div>
								)}
								<button
									type="button"
									onClick={onClose}
									className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
									aria-label="Close settings"
								>
									<XMarkIcon className="size-4" />
								</button>
							</div>

							{/* Scrollable content */}
							<div className="flex-1 overflow-y-auto scrollbar-hide">
								{activePanel ? (
									<div key={activePanel.id} className="px-4 py-5 pb-10 sm:px-6">
										{activePanel.content}
									</div>
								) : activeTab === "org" ? (
									<OrgSettings key={orgSection} section={orgSection} />
								) : (
									<AccountSettings key={accountSection} section={accountSection} />
								)}
							</div>
						</div>
					</PanelNavContext.Provider>
				</Headless.DialogPanel>
			</div>
		</Headless.Dialog>
	);
}
