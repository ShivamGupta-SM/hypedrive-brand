import { Avatar } from "@/components/avatar";
import {
	Dropdown,
	DropdownButton,
	DropdownDivider,
	DropdownItem,
	DropdownLabel,
	DropdownMenu,
} from "@/components/dropdown";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import {
	Sidebar,
	SidebarBody,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarLabel,
	SidebarSection,
	SidebarSpacer,
} from "@/components/sidebar";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useOrganizationStore } from "@/store/organization-store";
import { useAuthStore, useLogout } from "@/store/auth-store";
import {
	ArrowRightStartOnRectangleIcon,
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	Cog8ToothIcon,
	LightBulbIcon,
	PlusIcon,
	ShieldCheckIcon,
	UserCircleIcon,
} from "@heroicons/react/16/solid";
import {
	AcademicCapIcon,
	Cog6ToothIcon,
	HomeIcon,
	MegaphoneIcon,
	QuestionMarkCircleIcon,
	SparklesIcon,
} from "@heroicons/react/20/solid";
import { Outlet, useLocation, useNavigate } from "react-router";

function AccountDropdownMenu({ anchor }: { anchor: "top start" | "bottom end" }) {
	const { mutate: logout } = useLogout();
	const navigate = useNavigate();

	const handleLogout = async () => {
		const result = await logout();
		if (result.success && result.redirectTo) {
			navigate(result.redirectTo);
		}
	};

	return (
		<DropdownMenu className="min-w-64" anchor={anchor}>
			<DropdownItem href="#">
				<UserCircleIcon />
				<DropdownLabel>My account</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem href="#">
				<ShieldCheckIcon />
				<DropdownLabel>Privacy policy</DropdownLabel>
			</DropdownItem>
			<DropdownItem href="#">
				<LightBulbIcon />
				<DropdownLabel>Share feedback</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem onClick={handleLogout}>
				<ArrowRightStartOnRectangleIcon />
				<DropdownLabel>Sign out</DropdownLabel>
			</DropdownItem>
		</DropdownMenu>
	);
}

/**
 * Organization Switcher Component
 * Displays current org and allows switching between organizations
 */
function OrganizationSwitcher() {
	const { currentOrganization, organizations, switchOrganization } = useOrganizationStore();

	// Generate initials from org name
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	// Generate a consistent color based on org id
	const getOrgColor = (id: string) => {
		const colors = [
			"bg-blue-500",
			"bg-purple-500",
			"bg-green-500",
			"bg-orange-500",
			"bg-pink-500",
			"bg-cyan-500",
			"bg-indigo-500",
			"bg-teal-500",
		];
		const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return colors[index % colors.length];
	};

	const handleSwitchOrg = (orgId: string) => {
		if (orgId !== currentOrganization?.id) {
			switchOrganization(orgId);
		}
	};

	return (
		<Dropdown>
			<DropdownButton as={SidebarItem}>
				{currentOrganization?.logo ? (
					<Avatar src={currentOrganization.logo} />
				) : (
					<Avatar
						initials={getInitials(currentOrganization?.name || "O")}
						className={`${getOrgColor(currentOrganization?.id || "")} text-white`}
					/>
				)}
				<SidebarLabel>{currentOrganization?.name || "Select Organization"}</SidebarLabel>
				<ChevronDownIcon />
			</DropdownButton>
			<DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
				<DropdownItem href="/settings">
					<Cog8ToothIcon />
					<DropdownLabel>Settings</DropdownLabel>
				</DropdownItem>
				<DropdownDivider />

				{/* Organization List */}
				{organizations.map((org) => (
					<DropdownItem
						key={org.id}
						onClick={() => handleSwitchOrg(org.id)}
						className="justify-between"
					>
						<span className="flex items-center gap-3">
							{org.logo ? (
								<Avatar slot="icon" src={org.logo} />
							) : (
								<Avatar
									slot="icon"
									initials={getInitials(org.name)}
									className={`${getOrgColor(org.id)} text-white`}
								/>
							)}
							<DropdownLabel>{org.name}</DropdownLabel>
						</span>
						{org.id === currentOrganization?.id && (
							<CheckIcon className="size-4 text-zinc-500" />
						)}
					</DropdownItem>
				))}

				{organizations.length === 0 && (
					<DropdownItem disabled>
						<DropdownLabel className="text-zinc-400">No organizations</DropdownLabel>
					</DropdownItem>
				)}

				<DropdownDivider />
				<DropdownItem href="/onboarding">
					<PlusIcon />
					<DropdownLabel>New organization&hellip;</DropdownLabel>
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

export function AppLayout() {
	const location = useLocation();
	const pathname = location.pathname;
	const user = useAuthStore((state) => state.user);

	return (
		<SidebarLayout
			navbar={
				<Navbar>
					<NavbarSpacer />
					<NavbarSection>
						<Dropdown>
							<DropdownButton as={NavbarItem}>
								{user?.image ? (
									<Avatar src={user.image} square />
								) : (
									<Avatar
										initials={user?.name?.charAt(0).toUpperCase() || "U"}
										square
										className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
									/>
								)}
							</DropdownButton>
							<AccountDropdownMenu anchor="bottom end" />
						</Dropdown>
					</NavbarSection>
				</Navbar>
			}
			sidebar={
				<Sidebar>
					<SidebarHeader>
						<OrganizationSwitcher />
					</SidebarHeader>

					<SidebarBody>
						<SidebarSection>
							<SidebarItem href="/" current={pathname === "/"}>
								<HomeIcon />
								<SidebarLabel>Home</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/campaigns" current={pathname.startsWith("/campaigns")}>
								<MegaphoneIcon />
								<SidebarLabel>Campaigns</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/enrollments" current={pathname.startsWith("/enrollments")}>
								<AcademicCapIcon />
								<SidebarLabel>Enrollments</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="/settings" current={pathname.startsWith("/settings")}>
								<Cog6ToothIcon />
								<SidebarLabel>Settings</SidebarLabel>
							</SidebarItem>
						</SidebarSection>

						<SidebarSpacer />

						<SidebarSection>
							<SidebarItem href="#">
								<QuestionMarkCircleIcon />
								<SidebarLabel>Support</SidebarLabel>
							</SidebarItem>
							<SidebarItem href="#">
								<SparklesIcon />
								<SidebarLabel>Changelog</SidebarLabel>
							</SidebarItem>
						</SidebarSection>
					</SidebarBody>

					<SidebarFooter className="max-lg:hidden">
						<Dropdown>
							<DropdownButton as={SidebarItem}>
								<span className="flex min-w-0 items-center gap-3">
									{user?.image ? (
										<Avatar src={user.image} className="size-10" square alt="" />
									) : (
										<Avatar
											initials={user?.name?.charAt(0).toUpperCase() || "U"}
											className="size-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
											square
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
							<AccountDropdownMenu anchor="top start" />
						</Dropdown>
					</SidebarFooter>
				</Sidebar>
			}
		>
			<Outlet />
		</SidebarLayout>
	);
}
