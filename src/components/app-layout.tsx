import {
	ChevronUpIcon,
	ClipboardDocumentListIcon,
	Cog6ToothIcon,
	CubeIcon,
	DocumentTextIcon,
	HomeIcon,
	MagnifyingGlassIcon,
	QuestionMarkCircleIcon,
	RocketLaunchIcon,
	UserGroupIcon,
	WalletIcon,
} from "@heroicons/react/16/solid";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AccountDropdownMenu } from "@/components/account-dropdown-menu";
import { Avatar } from "@/components/avatar";
import { ContentHeader } from "@/components/content-header";
import { Dropdown, DropdownButton } from "@/components/dropdown";
import { Logo } from "@/components/logo";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import { NotificationPopoverNavbar } from "@/components/notification-popover";
import { MobileOrgSwitcher, OrganizationSwitcher } from "@/components/organization-switcher";
import { SearchDialog } from "@/components/search-dialog";
import { SettingsDialog } from "@/components/settings-dialog";
import {
	Sidebar,
	SidebarBody,
	SidebarDivider,
	SidebarFooter,
	SidebarHeader,
	SidebarHeading,
	SidebarItem,
	SidebarLabel,
	SidebarSection,
	SidebarSpacer,
} from "@/components/sidebar";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useOrgSlug } from "@/hooks";
import { Can } from "@/providers/ability-provider";
import { useAuthStore } from "@/store/auth-store";
import type { Organization } from "@/store/organization-store";

export function AppLayout({
	serverOrganizations,
	serverAuth,
}: {
	serverOrganizations: Organization[];
	serverAuth: {
		isAuthenticated: boolean;
		user?: { id: string; name: string; email: string; image?: string | null } | null;
		token: string | null;
	};
}) {
	const location = useLocation();
	const pathname = location.pathname;
	const orgSlug = useOrgSlug();
	const serverCurrentOrg = serverOrganizations.find((o) => o.slug === orgSlug) ?? serverOrganizations[0] ?? null;
	const user = useAuthStore((state) => state.user);

	// Sync server auth user into Zustand store on mount/refresh
	useEffect(() => {
		if (serverAuth.user && !user) {
			useAuthStore.getState().setUser(serverAuth.user);
			useAuthStore.getState().setAuthenticated(true);
		}
	}, [serverAuth.user, user]);

	const [showSettings, setShowSettings] = useState(false);
	const [settingsTab, setSettingsTab] = useState<"org" | "account">("org");
	const [showSearch, setShowSearch] = useState(false);

	const openOrgSettings = () => {
		setSettingsTab("org");
		setShowSettings(true);
	};

	const openAccountSettings = () => {
		setSettingsTab("account");
		setShowSettings(true);
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setShowSearch((prev) => !prev);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const isActive = (path: string) => pathname.includes(path);

	return (
		<>
			<SidebarLayout
				contentHeader={<ContentHeader />}
				mobileOrgSwitcher={
					<MobileOrgSwitcher
						serverOrganizations={serverOrganizations}
						serverCurrentOrg={serverCurrentOrg}
						onOpenOrgSettings={openOrgSettings}
					/>
				}
				navbar={
					<Navbar>
						<NavbarSpacer />
						<NavbarSection>
							<NavbarItem onClick={() => setShowSearch(true)} aria-label="Search">
								<MagnifyingGlassIcon />
							</NavbarItem>
							<NotificationPopoverNavbar />
							<Dropdown>
								<DropdownButton as={NavbarItem}>
									{user?.image ? (
										<Avatar src={user.image} />
									) : (
										<Avatar
											initials={user?.name?.charAt(0).toUpperCase() || "U"}
											className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
										/>
									)}
								</DropdownButton>
								<AccountDropdownMenu anchor="bottom end" onOpenAccountSettings={openAccountSettings} />
							</Dropdown>
						</NavbarSection>
					</Navbar>
				}
				sidebar={
					<Sidebar>
						<SidebarHeader>
							<Link to="/$orgSlug" params={{ orgSlug }} className="px-2">
								<Logo className="h-6 w-auto self-start text-zinc-950 dark:text-white" />
							</Link>
							<OrganizationSwitcher
								serverOrganizations={serverOrganizations}
								serverCurrentOrg={serverCurrentOrg}
								onOpenOrgSettings={openOrgSettings}
							/>
						</SidebarHeader>

						<SidebarBody>
							<button
								type="button"
								onClick={() => setShowSearch(true)}
								className="mb-1 flex w-full items-center gap-2 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-left text-sm text-zinc-500 transition-colors hover:bg-zinc-200/80 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-200"
							>
								<MagnifyingGlassIcon className="size-4 shrink-0" />
								<span className="flex-1">Search...</span>
								<kbd className="hidden rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 lg:block dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500">
									⌘K
								</kbd>
							</button>

							<SidebarDivider />

							<SidebarSection>
								<SidebarItem href={`/${orgSlug}`} current={pathname === `/${orgSlug}` || pathname === `/${orgSlug}/`}>
									<HomeIcon />
									<SidebarLabel>Dashboard</SidebarLabel>
								</SidebarItem>
								<SidebarItem href={`/${orgSlug}/listings`} current={isActive(`/${orgSlug}/listings`)}>
									<CubeIcon />
									<SidebarLabel>Listings</SidebarLabel>
								</SidebarItem>
							</SidebarSection>

							<SidebarDivider />

							<SidebarSection>
								<SidebarHeading>Marketing</SidebarHeading>
								<SidebarItem href={`/${orgSlug}/campaigns`} current={isActive(`/${orgSlug}/campaigns`)}>
									<RocketLaunchIcon />
									<SidebarLabel>Campaigns</SidebarLabel>
								</SidebarItem>
								<SidebarItem href={`/${orgSlug}/enrollments`} current={isActive(`/${orgSlug}/enrollments`)}>
									<ClipboardDocumentListIcon />
									<SidebarLabel>Enrollments</SidebarLabel>
								</SidebarItem>
							</SidebarSection>

							<SidebarDivider />

							<SidebarSection>
								<SidebarHeading>Finance</SidebarHeading>
								<SidebarItem href={`/${orgSlug}/invoices`} current={isActive(`/${orgSlug}/invoices`)}>
									<DocumentTextIcon />
									<SidebarLabel>Invoices</SidebarLabel>
								</SidebarItem>
								<SidebarItem href={`/${orgSlug}/wallet`} current={isActive(`/${orgSlug}/wallet`)}>
									<WalletIcon />
									<SidebarLabel>Wallet</SidebarLabel>
								</SidebarItem>
							</SidebarSection>

							<SidebarDivider />

							<SidebarSection>
								<Can resource="member" action="read">
									<SidebarItem href={`/${orgSlug}/team`} current={isActive(`/${orgSlug}/team`)}>
										<UserGroupIcon />
										<SidebarLabel>Team</SidebarLabel>
									</SidebarItem>
								</Can>
								<SidebarItem onClick={openOrgSettings}>
									<Cog6ToothIcon />
									<SidebarLabel>Settings</SidebarLabel>
								</SidebarItem>
							</SidebarSection>

							<SidebarSpacer />

							<SidebarSection>
								<SidebarItem href={`/${orgSlug}/support`} current={isActive(`/${orgSlug}/support`)}>
									<QuestionMarkCircleIcon />
									<SidebarLabel>Support</SidebarLabel>
								</SidebarItem>
							</SidebarSection>
						</SidebarBody>

						<SidebarFooter className="max-lg:hidden">
							<Dropdown>
								<DropdownButton as={SidebarItem}>
									<span className="flex min-w-0 items-center gap-3">
										{user?.image ? (
											<Avatar src={user.image} className="size-10" alt="" />
										) : (
											<Avatar
												initials={user?.name?.charAt(0).toUpperCase() || "U"}
												className="size-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
												alt=""
											/>
										)}
										<span className="min-w-0">
											<span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
												{user?.name || "User"}
											</span>
											<span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
												{user?.email || ""}
											</span>
										</span>
									</span>
									<ChevronUpIcon />
								</DropdownButton>
								<AccountDropdownMenu anchor="top start" onOpenAccountSettings={openAccountSettings} />
							</Dropdown>
						</SidebarFooter>
					</Sidebar>
				}
			>
				<Outlet />
			</SidebarLayout>

			<SearchDialog isOpen={showSearch} onClose={() => setShowSearch(false)} orgSlug={orgSlug} />
			<SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} initialTab={settingsTab} />
		</>
	);
}
