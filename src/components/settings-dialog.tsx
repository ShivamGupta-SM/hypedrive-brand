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
	ChevronLeftIcon,
	Cog6ToothIcon,
	ComputerDesktopIcon,
	CreditCardIcon,
	FingerPrintIcon,
	HomeModernIcon,
	IdentificationIcon,
	MoonIcon,
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

function getStoredTheme(): ThemeOption {
	if (typeof window === "undefined") return "system";
	return (localStorage.getItem("theme") as ThemeOption) || "system";
}

function SidebarThemeToggle() {
	const [theme, setTheme] = useState<ThemeOption>(getStoredTheme);

	useEffect(() => {
		localStorage.setItem("theme", theme);
		applyTheme(theme);

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
		<div className="shrink-0 border-t border-zinc-950/5 px-3 py-3 dark:border-white/5">
			<div className="flex rounded-lg bg-zinc-950/5 p-0.5 dark:bg-white/5">
				{options.map(({ id, icon: Icon, label }) => (
					<button
						key={id}
						type="button"
						onClick={() => setTheme(id)}
						title={label}
						className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition-all duration-150 ${
							theme === id
								? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-700 dark:text-white dark:ring-white/10"
								: "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
						}`}
					>
						<Icon className="size-3.5" />
						{label}
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
	icon: React.ComponentType<{ className?: string }>;
}

const ORG_NAV: NavItem[] = [
	{
		id: "org-profile",
		tab: "org",
		section: "profile" as OrgSettingsSection,
		label: "General",
		icon: HomeModernIcon,
	},
	{
		id: "org-gst",
		tab: "org",
		section: "gst" as OrgSettingsSection,
		label: "GST & Compliance",
		icon: IdentificationIcon,
	},
	{
		id: "org-bank",
		tab: "org",
		section: "bank" as OrgSettingsSection,
		label: "Bank Account",
		icon: CreditCardIcon,
	},
];

const ACCOUNT_NAV: NavItem[] = [
	{
		id: "account-profile",
		tab: "account",
		section: "profile" as AccountSettingsSection,
		label: "Profile",
		icon: UserCircleIcon,
	},
	{
		id: "account-security",
		tab: "account",
		section: "security" as AccountSettingsSection,
		label: "Security",
		icon: ShieldCheckIcon,
	},
	{
		id: "account-passkeys",
		tab: "account",
		section: "passkeys" as AccountSettingsSection,
		label: "Passkeys",
		icon: FingerPrintIcon,
	},
	{
		id: "account-preferences",
		tab: "account",
		section: "preferences" as AccountSettingsSection,
		label: "Preferences",
		icon: AdjustmentsHorizontalIcon,
	},
];

const DEFAULT_ITEM: Record<SettingsTab, string> = {
	org: "org-profile",
	account: "account-profile",
};

// =============================================================================
// TAB SWITCHER — top of sidebar
// =============================================================================

function TabSwitcher({
	activeTab,
	onChange,
}: {
	activeTab: SettingsTab;
	onChange: (tab: SettingsTab) => void;
}) {
	return (
		<div className="flex rounded-lg bg-zinc-950/5 p-0.5 dark:bg-white/5">
			<button
				type="button"
				onClick={() => onChange("org")}
				className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
					activeTab === "org"
						? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-700 dark:text-white dark:ring-white/10"
						: "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
				}`}
			>
				<HomeModernIcon className="size-3.5" />
				Workspace
			</button>
			<button
				type="button"
				onClick={() => onChange("account")}
				className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
					activeTab === "account"
						? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-700 dark:text-white dark:ring-white/10"
						: "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
				}`}
			>
				<UserCircleIcon className="size-3.5" />
				Account
			</button>
		</div>
	);
}

// =============================================================================
// NAV ITEM BUTTON
// =============================================================================

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
	const Icon = item.icon;
	return (
		<button
			type="button"
			onClick={onClick}
			className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-100 ${
				active
					? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-800 dark:text-white dark:ring-white/10"
					: "text-zinc-600 hover:bg-white/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-200"
			}`}
		>
			<Icon
				className={`size-4 transition-colors duration-100 ${
					active
						? "text-zinc-800 dark:text-zinc-200"
						: "text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300"
				}`}
			/>
			<span className="truncate text-[13px] font-medium">{item.label}</span>
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

	const allItems = [...ORG_NAV, ...ACCOUNT_NAV];
	const activeItem = allItems.find((i) => i.id === activeId) ?? allItems[0];
	const activeTab = activeItem.tab;
	const navItems = activeTab === "org" ? ORG_NAV : ACCOUNT_NAV;

	const handleTabChange = (tab: SettingsTab) => {
		setActiveId(DEFAULT_ITEM[tab]);
		setActivePanel(null);
	};

	const handleNavClick = (id: string) => {
		setActiveId(id);
		setActivePanel(null);
		setMobilePane("content");
	};

	const orgSection = activeTab === "org" ? (activeItem.section as OrgSettingsSection) : "profile";
	const accountSection = activeTab === "account" ? (activeItem.section as AccountSettingsSection) : "profile";

	return (
		<Headless.Dialog open={open} onClose={onClose} className="relative z-40">
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 bg-black/25 backdrop-blur-sm transition duration-200 ease-out data-closed:opacity-0 dark:bg-black/50"
			/>

			<div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4">
				<Headless.DialogPanel
					transition
					className="flex h-full w-full overflow-hidden bg-white shadow-2xl ring-1 ring-zinc-950/5 transition duration-200 ease-out data-closed:translate-y-4 data-closed:opacity-0 sm:h-[min(92vh,860px)] sm:max-w-260 sm:rounded-2xl sm:data-closed:translate-y-2 sm:data-closed:scale-[0.98] dark:bg-zinc-950 dark:ring-white/10"
				>
					{/* ── Left Sidebar ── */}
					<div
						className={`flex w-full shrink-0 flex-col bg-zinc-50 dark:bg-zinc-900/80 sm:flex sm:w-56 ${mobilePane === "nav" ? "flex" : "hidden"}`}
					>
						{/* Sidebar header */}
						<div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-950/5 px-4 dark:border-white/5">
							<div className="flex items-center gap-2.5">
								<div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-200">
									<Cog6ToothIcon className="size-3.5 text-white dark:text-zinc-900" />
								</div>
								<span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Settings</span>
							</div>
							<button
								type="button"
								onClick={onClose}
								className="flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 sm:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
								aria-label="Close settings"
							>
								<XMarkIcon className="size-4" />
							</button>
						</div>

						{/* Tab switcher */}
						<div className="shrink-0 px-3 pt-3">
							<TabSwitcher activeTab={activeTab} onChange={handleTabChange} />
						</div>

						{/* Nav items */}
						<nav className="flex-1 overflow-y-auto px-3 pt-3 pb-2 scrollbar-hide">
							<div className="space-y-0.5">
								{navItems.map((item) => (
									<NavButton
										key={item.id}
										item={item}
										active={activeId === item.id}
										onClick={() => handleNavClick(item.id)}
									/>
								))}
							</div>
						</nav>

						{/* Theme toggle */}
						<SidebarThemeToggle />
					</div>

					{/* ── Right Content ── */}
					<PanelNavContext.Provider value={panelNav}>
						<div
							className={`flex min-w-0 flex-1 flex-col border-l border-zinc-950/5 dark:border-white/5 ${mobilePane === "content" ? "flex" : "hidden"} sm:flex`}
						>
							{/* Content header */}
							<div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-950/5 px-5 sm:px-6 dark:border-white/5">
								{activePanel ? (
									<button
										type="button"
										onClick={() => setActivePanel(null)}
										className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
									>
										<ChevronLeftIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
										{activePanel.title}
									</button>
								) : (
									<div className="flex items-center gap-1.5">
										{/* Mobile back button */}
										<button
											type="button"
											onClick={() => setMobilePane("nav")}
											className="flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 sm:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
											aria-label="Back to menu"
										>
											<ChevronLeftIcon className="size-4" />
										</button>
										<Headless.DialogTitle className="text-[15px] font-semibold text-zinc-900 dark:text-white">
											{activeItem.label}
										</Headless.DialogTitle>
									</div>
								)}
								<button
									type="button"
									onClick={onClose}
									className="flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
									aria-label="Close settings"
								>
									<XMarkIcon className="size-4" />
								</button>
							</div>

							{/* Scrollable content */}
							<div className="flex-1 overflow-y-auto scrollbar-hide">
								{activePanel ? (
									<div key={activePanel.id} className="px-5 py-5 pb-10 sm:px-6">
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
