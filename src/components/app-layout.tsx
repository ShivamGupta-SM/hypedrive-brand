import * as Headless from "@headlessui/react";
import {
	ArrowRightIcon,
	ArrowRightStartOnRectangleIcon,
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	ClipboardDocumentListIcon,
	ClockIcon,
	Cog6ToothIcon,
	CubeIcon,
	DocumentTextIcon,
	HomeIcon,
	LightBulbIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	QuestionMarkCircleIcon,
	RocketLaunchIcon,
	ShieldCheckIcon,
	SparklesIcon,
	UserCircleIcon,
	UserGroupIcon,
	WalletIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useActiveMember, useCurrentOrganization, useOrgSlug, useUnifiedSearch } from "@/hooks";
import type { brand } from "@/lib/brand-client";
import { HighlightText } from "@/lib/highlight-text";
import { Can } from "@/providers/ability-provider";
import { useAuthStore, useLogout } from "@/store/auth-store";
import { type Organization, useOrganizationStore } from "@/store/organization-store";
import { usePermissionsStore } from "@/store/permissions-store";

function AccountDropdownMenu({
	anchor,
	onOpenAccountSettings,
}: {
	anchor: "top start" | "bottom end";
	onOpenAccountSettings: () => void;
}) {
	const { mutate: logout } = useLogout();
	const navigate = useNavigate();

	const handleLogout = async () => {
		const result = await logout();
		if (result.success && result.redirectTo) {
			navigate({ to: result.redirectTo as "/" | "/login" });
		}
	};

	return (
		<DropdownMenu className="min-w-64" anchor={anchor}>
			<DropdownItem onClick={onOpenAccountSettings}>
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
 * Now navigates to org-specific URLs when switching
 */
function OrganizationSwitcher({
	serverOrganizations,
	serverCurrentOrg,
	onOpenOrgSettings,
}: {
	serverOrganizations: Organization[];
	serverCurrentOrg: Organization | null;
	onOpenOrgSettings: () => void;
}) {
	const { currentOrganization: storeOrg, organizations: storeOrgs, switchOrganization } = useOrganizationStore();
	// Use store data if populated, otherwise fall back to server data (SSR)
	const currentOrganization = storeOrg || serverCurrentOrg;
	const organizations = storeOrgs.length > 0 ? storeOrgs : serverOrganizations;
	const navigate = useNavigate();

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
			"bg-emerald-500",
			"bg-sky-500",
			"bg-amber-500",
			"bg-red-500",
			"bg-zinc-500",
			"bg-cyan-500",
			"bg-teal-500",
			"bg-lime-500",
		];
		const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
		return colors[index % colors.length];
	};

	// Switch org and navigate to new org's dashboard
	const handleSwitchOrg = (org: (typeof organizations)[0]) => {
		if (org.id !== currentOrganization?.id) {
			// Clear stale permissions before navigating — new org's route will set fresh ones
			usePermissionsStore.getState().clearPermissions();
			switchOrganization(org.id);
			// Navigate to the new org's dashboard
			navigate({ to: "/$orgSlug", params: { orgSlug: org.slug } });
		}
	};

	return (
		<Dropdown>
			<DropdownButton as={SidebarItem}>
				{currentOrganization?.logo ? (
					<Avatar src={currentOrganization.logo} className="size-7 sm:size-6" />
				) : (
					<Avatar
						initials={getInitials(currentOrganization?.name || "O")}
						className={`size-7 sm:size-6 ${getOrgColor(currentOrganization?.id || "")} text-white`}
					/>
				)}
				<SidebarLabel>{currentOrganization?.name || "Select Organization"}</SidebarLabel>
				<ChevronDownIcon />
			</DropdownButton>
			<DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
				{/* Organization List */}
				{organizations.map((org) => (
					<DropdownItem key={org.id} onClick={() => handleSwitchOrg(org)}>
						{org.logo ? (
							<Avatar src={org.logo} className="size-6!" />
						) : (
							<Avatar
								initials={getInitials(org.name)}
								className={`size-6! text-[10px] ${getOrgColor(org.id)} text-white`}
							/>
						)}
						<DropdownLabel>
							<span className="flex items-center gap-2">
								<span className="flex-1">{org.name}</span>
								{org.id === currentOrganization?.id && <CheckIcon className="size-4 shrink-0 text-emerald-500" />}
							</span>
						</DropdownLabel>
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
				<DropdownItem onClick={onOpenOrgSettings}>
					<Cog6ToothIcon />
					<DropdownLabel>Settings</DropdownLabel>
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
}

// =============================================================================
// SEARCH CONSTANTS & TYPES
// =============================================================================

const RECENT_SEARCHES_KEY = "hd_brand_recent_searches";
const MAX_RECENT_SEARCHES = 5;

type SearchFilterType = "all" | "campaigns" | "enrollments" | "listings" | "invoices";

interface RecentSearch {
	query: string;
	timestamp: number;
}

interface QuickAction {
	id: string;
	label: string;
	description: string;
	icon: React.ReactNode;
	path: string;
	keywords?: string[];
}

// =============================================================================
// SEARCH HELPERS
// =============================================================================

function getSearchResultPath(orgSlug: string, result: brand.BrandSearchResult) {
	switch (result.resultType) {
		case "campaign":
			return `/${orgSlug}/campaigns/${result.id}`;
		case "enrollment":
			return `/${orgSlug}/enrollments/${result.id}`;
		case "invoice":
			return `/${orgSlug}/invoices`;
		case "listing":
			return `/${orgSlug}/listings/${result.id}`;
		default:
			return `/${orgSlug}`;
	}
}

function getResultIcon(type: string) {
	switch (type) {
		case "campaign":
			return <RocketLaunchIcon className="size-4 text-sky-500" />;
		case "enrollment":
			return <ClipboardDocumentListIcon className="size-4 text-amber-500" />;
		case "invoice":
			return <DocumentTextIcon className="size-4 text-emerald-500" />;
		case "listing":
			return <CubeIcon className="size-4 text-violet-500" />;
		default:
			return <MagnifyingGlassIcon className="size-4 text-zinc-400" />;
	}
}

function getStatusBadgeClasses(status: string): string {
	const s = status.toLowerCase();
	if (s === "active") return "bg-lime-100 text-lime-700 dark:bg-lime-950/40 dark:text-lime-400";
	if (s === "draft") return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
	if (s.includes("pending") || s.includes("awaiting"))
		return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
	if (s === "approved" || s === "completed")
		return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
	if (s.includes("reject") || s === "cancelled" || s === "expired")
		return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";
	if (s === "paused") return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
	return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
}

function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
	return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function groupByType(results: brand.BrandSearchResult[]) {
	return {
		campaigns: results.filter((r) => r.resultType === "campaign"),
		enrollments: results.filter((r) => r.resultType === "enrollment"),
		listings: results.filter((r) => r.resultType === "listing"),
		invoices: results.filter((r) => r.resultType === "invoice"),
	};
}

// =============================================================================
// HOOKS
// =============================================================================

function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);
	useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(handler);
	}, [value, delay]);
	return debouncedValue;
}

function useRecentSearches() {
	const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
			if (stored) setRecentSearches(JSON.parse(stored));
		} catch {
			// ignore
		}
	}, []);

	const addRecentSearch = useCallback((q: string) => {
		if (!q.trim()) return;
		setRecentSearches((prev) => {
			const filtered = prev.filter((s) => s.query.toLowerCase() !== q.toLowerCase());
			const updated = [{ query: q.trim(), timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_SEARCHES);
			try {
				localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
			} catch {
				// ignore
			}
			return updated;
		});
	}, []);

	const removeRecentSearch = useCallback((q: string) => {
		setRecentSearches((prev) => {
			const updated = prev.filter((s) => s.query.toLowerCase() !== q.toLowerCase());
			try {
				localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
			} catch {
				// ignore
			}
			return updated;
		});
	}, []);

	const clearRecentSearches = useCallback(() => {
		setRecentSearches([]);
		try {
			localStorage.removeItem(RECENT_SEARCHES_KEY);
		} catch {
			// ignore
		}
	}, []);

	return { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches };
}

// =============================================================================
// SEARCH RESULT ROW
// =============================================================================

function getResultIconBg(type: string) {
	switch (type) {
		case "campaign":
			return "bg-sky-100 dark:bg-sky-950/40";
		case "enrollment":
			return "bg-amber-100 dark:bg-amber-950/40";
		case "invoice":
			return "bg-emerald-100 dark:bg-emerald-950/40";
		case "listing":
			return "bg-violet-100 dark:bg-violet-950/40";
		default:
			return "bg-zinc-100 dark:bg-zinc-800";
	}
}

function SearchResultRow({
	result,
	query,
	onSelect,
	isFocused,
}: {
	result: brand.BrandSearchResult;
	query: string;
	onSelect: () => void;
	isFocused: boolean;
}) {
	const thumbnail = result.listing?.primaryImage ?? null;

	const meta: string[] = [];
	if (result.resultType === "campaign") {
		if (result.listing?.name) meta.push(result.listing.name);
		if (result.amountDecimal) meta.push(`₹${result.amountDecimal} bonus`);
		if (result.platform?.name) meta.push(result.platform.name);
	} else if (result.resultType === "enrollment") {
		if (result.campaign?.title) meta.push(result.campaign.title);
		if (result.creator?.displayName) meta.push(result.creator.displayName);
		if (result.amountDecimal) meta.push(`₹${result.amountDecimal}`);
	} else if (result.resultType === "listing") {
		if (result.listing?.priceDecimal) meta.push(`₹${result.listing.priceDecimal}`);
		if (result.platform?.name) meta.push(result.platform.name);
	} else if (result.resultType === "invoice") {
		if (result.invoiceNumber) meta.push(`#${result.invoiceNumber}`);
		if (result.amountDecimal) meta.push(`₹${result.amountDecimal}`);
	}

	return (
		<button
			type="button"
			onClick={onSelect}
			className={`group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
				isFocused ? "bg-zinc-100 dark:bg-zinc-800" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
			}`}
		>
			{thumbnail ? (
				<img
					src={thumbnail}
					alt=""
					className="size-9 shrink-0 rounded-lg bg-zinc-100 object-contain dark:bg-zinc-800"
				/>
			) : (
				<div
					className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${getResultIconBg(result.resultType)}`}
				>
					{getResultIcon(result.resultType)}
				</div>
			)}

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
						<HighlightText text={result.title} query={query} />
					</span>
					<span
						className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${getStatusBadgeClasses(result.status)}`}
					>
						{result.status.replace(/_/g, " ")}
					</span>
				</div>
				{meta.length > 0 && <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{meta.join(" · ")}</p>}
				{result.displayId && <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{result.displayId}</p>}
			</div>

			<div className="shrink-0 text-right">
				<p className="text-xs text-zinc-400">{formatRelativeTime(result.createdAt)}</p>
				<ArrowRightIcon className="ml-auto mt-0.5 size-3 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600" />
			</div>
		</button>
	);
}

// =============================================================================
// SEARCH DIALOG
// =============================================================================

function SearchDialog({ isOpen, onClose, orgSlug }: { isOpen: boolean; onClose: () => void; orgSlug: string }) {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<SearchFilterType>("all");
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const organization = useCurrentOrganization();
	const navigate = useNavigate();
	const debouncedQuery = useDebounce(query, 300);
	const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

	const hasQuery = debouncedQuery.trim().length >= 2;

	const { data: searchResults, loading } = useUnifiedSearch(hasQuery ? organization?.id : undefined, {
		q: debouncedQuery,
		limit: 50,
	});

	const allResults = searchResults?.data ?? [];
	const facets = searchResults?.facets;

	const filteredResults = useMemo(() => {
		if (filter === "all") return allResults;
		const typeMap: Record<SearchFilterType, string> = {
			all: "",
			campaigns: "campaign",
			enrollments: "enrollment",
			listings: "listing",
			invoices: "invoice",
		};
		return allResults.filter((r) => r.resultType === typeMap[filter]);
	}, [allResults, filter]);

	const grouped = useMemo(() => groupByType(filteredResults), [filteredResults]);

	const quickActions: QuickAction[] = useMemo(
		() => [
			{
				id: "dashboard",
				label: "Dashboard",
				description: "View your overview",
				icon: <HomeIcon className="size-4" />,
				path: `/${orgSlug}`,
				keywords: ["home", "dashboard"],
			},
			{
				id: "campaigns",
				label: "Campaigns",
				description: "Manage your campaigns",
				icon: <RocketLaunchIcon className="size-4" />,
				path: `/${orgSlug}/campaigns`,
				keywords: ["campaigns"],
			},
			{
				id: "enrollments",
				label: "Enrollments",
				description: "Review creator enrollments",
				icon: <ClipboardDocumentListIcon className="size-4" />,
				path: `/${orgSlug}/enrollments`,
				keywords: ["enrollments", "creators"],
			},
			{
				id: "listings",
				label: "Listings",
				description: "Browse your product listings",
				icon: <CubeIcon className="size-4" />,
				path: `/${orgSlug}/listings`,
				keywords: ["listings", "products"],
			},
			{
				id: "wallet",
				label: "Wallet",
				description: "Check balance & transactions",
				icon: <WalletIcon className="size-4" />,
				path: `/${orgSlug}/wallet`,
				keywords: ["wallet", "balance"],
			},
			{
				id: "settings",
				label: "Settings",
				description: "Organisation settings",
				icon: <Cog6ToothIcon className="size-4" />,
				path: `/${orgSlug}/settings`,
				keywords: ["settings"],
			},
		],
		[orgSlug]
	);

	const filteredActions = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return quickActions;
		return quickActions.filter(
			(a) =>
				a.label.toLowerCase().includes(q) ||
				a.description.toLowerCase().includes(q) ||
				a.keywords?.some((k) => k.includes(q))
		);
	}, [query, quickActions]);

	const flatItems = useMemo(() => {
		if (!hasQuery) {
			return [
				...recentSearches.map((s) => ({ type: "recent" as const, data: s })),
				...filteredActions.map((a) => ({ type: "action" as const, data: a })),
			];
		}
		return filteredResults.map((r) => ({ type: "result" as const, data: r }));
	}, [hasQuery, recentSearches, filteredActions, filteredResults]);

	const recentCount = recentSearches.length;
	const getRecentFlatIndex = (i: number) => i;
	const getActionFlatIndex = (i: number) => recentCount + i;
	const getResultFlatIndex = (result: brand.BrandSearchResult) => filteredResults.indexOf(result);

	useEffect(() => {
		if (isOpen) {
			setQuery("");
			setFilter("all");
			setFocusedIndex(-1);
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [isOpen]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentionally react to debouncedQuery changes
	useEffect(() => {
		setFilter("all");
		setFocusedIndex(-1);
	}, [debouncedQuery]);

	useEffect(() => {
		if (!isOpen) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setFocusedIndex((i) => Math.min(i + 1, flatItems.length - 1));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setFocusedIndex((i) => Math.max(i - 1, -1));
			} else if (e.key === "Enter" && focusedIndex >= 0) {
				e.preventDefault();
				const item = flatItems[focusedIndex];
				if (!item) return;
				if (item.type === "recent") {
					setQuery((item.data as RecentSearch).query);
					setFocusedIndex(-1);
				} else if (item.type === "action") {
					navigate({ to: (item.data as QuickAction).path });
					onClose();
				} else {
					const result = item.data as brand.BrandSearchResult;
					addRecentSearch(debouncedQuery);
					navigate({ to: getSearchResultPath(orgSlug, result) });
					onClose();
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, flatItems, focusedIndex, navigate, onClose, addRecentSearch, orgSlug, debouncedQuery]);

	const handleSelectResult = useCallback(
		(result: brand.BrandSearchResult) => {
			addRecentSearch(debouncedQuery);
			navigate({ to: getSearchResultPath(orgSlug, result) });
			onClose();
		},
		[addRecentSearch, debouncedQuery, navigate, orgSlug, onClose]
	);

	const tabs: { key: SearchFilterType; label: string; count: number }[] = [
		{
			key: "all",
			label: "All",
			count: facets ? facets.campaigns + facets.enrollments + facets.listings + facets.invoices : 0,
		},
		{ key: "campaigns", label: "Campaigns", count: facets?.campaigns ?? 0 },
		{ key: "enrollments", label: "Enrollments", count: facets?.enrollments ?? 0 },
		{ key: "listings", label: "Listings", count: facets?.listings ?? 0 },
		{ key: "invoices", label: "Invoices", count: facets?.invoices ?? 0 },
	];

	return (
		<Headless.Dialog open={isOpen} onClose={onClose} className="relative z-50">
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 bg-black/40 backdrop-blur-sm transition duration-200 ease-out data-closed:opacity-0"
			/>
			<div className="fixed inset-x-4 top-[8%] z-50 mx-auto sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-xl sm:-translate-x-1/2 md:max-w-2xl">
				<Headless.DialogPanel
					transition
					className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-zinc-200 transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-900 dark:ring-zinc-800"
				>
					{/* Search Input */}
					<div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-700">
						<MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" />
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								setFocusedIndex(-1);
							}}
							placeholder="Search campaigns, enrollments, listings, invoices..."
							className="h-12 w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white"
						/>
						{query && (
							<button
								type="button"
								onClick={() => {
									setQuery("");
									setFocusedIndex(-1);
									inputRef.current?.focus();
								}}
								className="shrink-0 p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-4" />
							</button>
						)}
					</div>

					{/* Filter Tabs */}
					{hasQuery && facets && (
						<div className="flex gap-1.5 overflow-x-auto border-b border-zinc-200 px-4 py-2 dark:border-zinc-700">
							{tabs.map((tab) => (
								<button
									key={tab.key}
									type="button"
									onClick={() => setFilter(tab.key)}
									className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
										filter === tab.key
											? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
											: "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
									}`}
								>
									{tab.label}
									{tab.count > 0 && <span className="ml-1 opacity-60">{tab.count}</span>}
								</button>
							))}
						</div>
					)}

					{/* Results list */}
					<div ref={listRef} className="max-h-[420px] overflow-y-auto p-2">
						{/* Empty state */}
						{!hasQuery && (
							<>
								{recentSearches.length > 0 && (
									<>
										<div className="flex items-center justify-between px-2 py-1.5">
											<span className="text-xs font-medium text-zinc-400">Recent</span>
											<button
												type="button"
												onClick={clearRecentSearches}
												className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
											>
												Clear
											</button>
										</div>
										{recentSearches.map((search, i) => (
											<div
												key={search.query}
												className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
													focusedIndex === getRecentFlatIndex(i)
														? "bg-zinc-100 dark:bg-zinc-800"
														: "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
												}`}
											>
												<button
													type="button"
													onClick={() => setQuery(search.query)}
													className="flex flex-1 items-center gap-3 text-left"
												>
													<ClockIcon className="size-4 shrink-0 text-zinc-400" />
													<span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{search.query}</span>
												</button>
												<button
													type="button"
													onClick={() => removeRecentSearch(search.query)}
													className="text-zinc-400 transition-colors hover:text-zinc-600"
												>
													<XMarkIcon className="size-3.5" />
												</button>
											</div>
										))}
										<div className="my-1.5 h-px bg-zinc-100 dark:bg-zinc-800" />
									</>
								)}
								<div className="px-2 py-1.5">
									<span className="text-xs font-medium text-zinc-400">Quick Actions</span>
								</div>
								{filteredActions.map((action, i) => (
									<button
										key={action.id}
										type="button"
										onClick={() => {
											navigate({ to: action.path });
											onClose();
										}}
										className={`group flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
											focusedIndex === getActionFlatIndex(i)
												? "bg-zinc-100 dark:bg-zinc-800"
												: "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
										}`}
									>
										<div className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
											{action.icon}
										</div>
										<div className="flex-1 text-left">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">{action.label}</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">{action.description}</p>
										</div>
										<ArrowRightIcon className="size-4 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600" />
									</button>
								))}
							</>
						)}

						{/* Loading */}
						{hasQuery && loading && (
							<div className="flex items-center justify-center py-8">
								<div className="size-4 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
								<span className="ml-2 text-xs text-zinc-500">Searching...</span>
							</div>
						)}

						{/* No results */}
						{hasQuery && !loading && filteredResults.length === 0 && (
							<div className="py-8 text-center">
								<MagnifyingGlassIcon className="mx-auto size-6 text-zinc-300 dark:text-zinc-600" />
								<p className="mt-2 text-sm text-zinc-500">
									No results for &ldquo;{debouncedQuery}&rdquo;
									{filter !== "all" && ` in ${filter}`}
								</p>
							</div>
						)}

						{/* Results grouped by type */}
						{hasQuery && !loading && filteredResults.length > 0 && (
							<>
								{(filter === "all" || filter === "campaigns") && grouped.campaigns.length > 0 && (
									<>
										<div className="px-2 py-1.5">
											<span className="text-xs font-medium text-zinc-400">Campaigns</span>
										</div>
										{grouped.campaigns.map((result) => (
											<SearchResultRow
												key={result.id}
												result={result}
												query={debouncedQuery}
												onSelect={() => handleSelectResult(result)}
												isFocused={focusedIndex === getResultFlatIndex(result)}
											/>
										))}
									</>
								)}
								{(filter === "all" || filter === "enrollments") && grouped.enrollments.length > 0 && (
									<>
										<div className="px-2 py-1.5">
											<span className="text-xs font-medium text-zinc-400">Enrollments</span>
										</div>
										{grouped.enrollments.map((result) => (
											<SearchResultRow
												key={result.id}
												result={result}
												query={debouncedQuery}
												onSelect={() => handleSelectResult(result)}
												isFocused={focusedIndex === getResultFlatIndex(result)}
											/>
										))}
									</>
								)}
								{(filter === "all" || filter === "listings") && grouped.listings.length > 0 && (
									<>
										<div className="px-2 py-1.5">
											<span className="text-xs font-medium text-zinc-400">Listings</span>
										</div>
										{grouped.listings.map((result) => (
											<SearchResultRow
												key={result.id}
												result={result}
												query={debouncedQuery}
												onSelect={() => handleSelectResult(result)}
												isFocused={focusedIndex === getResultFlatIndex(result)}
											/>
										))}
									</>
								)}
								{(filter === "all" || filter === "invoices") && grouped.invoices.length > 0 && (
									<>
										<div className="px-2 py-1.5">
											<span className="text-xs font-medium text-zinc-400">Invoices</span>
										</div>
										{grouped.invoices.map((result) => (
											<SearchResultRow
												key={result.id}
												result={result}
												query={debouncedQuery}
												onSelect={() => handleSelectResult(result)}
												isFocused={focusedIndex === getResultFlatIndex(result)}
											/>
										))}
									</>
								)}
							</>
						)}
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between border-t border-zinc-200 px-4 py-2 text-[10px] text-zinc-400 dark:border-zinc-700">
						<div className="flex items-center gap-3">
							<span className="flex items-center gap-1">
								<kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">↑↓</kbd>
								navigate
							</span>
							<span className="flex items-center gap-1">
								<kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">↵</kbd>
								select
							</span>
						</div>
						<span className="flex items-center gap-1">
							<kbd className="rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800">Esc</kbd>
							close
						</span>
					</div>
				</Headless.DialogPanel>
			</div>
		</Headless.Dialog>
	);
}

// =============================================================================
// APP LAYOUT
// =============================================================================

export function AppLayout({
	serverOrganizations,
	serverAuth: _serverAuth,
}: {
	serverOrganizations: Organization[];
	serverAuth: { isAuthenticated: boolean; token: string | null };
}) {
	const location = useLocation();
	const pathname = location.pathname;
	const orgSlug = useOrgSlug();
	const serverCurrentOrg = serverOrganizations.find((o) => o.slug === orgSlug) ?? serverOrganizations[0] ?? null;
	const user = useAuthStore((state) => state.user);
	const activeMember = useActiveMember(orgSlug);

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
				navbar={
					<Navbar>
						<NavbarSpacer />
						<NavbarSection>
							<NavbarItem onClick={() => setShowSearch(true)}>
								<MagnifyingGlassIcon />
							</NavbarItem>
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
								<AccountDropdownMenu anchor="bottom end" onOpenAccountSettings={openAccountSettings} />
							</Dropdown>
						</NavbarSection>
					</Navbar>
				}
				sidebar={
					<Sidebar>
						<SidebarHeader>
							<OrganizationSwitcher
								serverOrganizations={serverOrganizations}
								serverCurrentOrg={serverCurrentOrg}
								onOpenOrgSettings={openOrgSettings}
							/>
							{/* Search trigger */}
							<SidebarSection>
								<SidebarItem onClick={() => setShowSearch(true)}>
									<MagnifyingGlassIcon />
									<SidebarLabel>Search</SidebarLabel>
									<kbd className="ml-auto hidden rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 lg:block dark:bg-zinc-800 dark:text-zinc-500">
										⌘K
									</kbd>
								</SidebarItem>
							</SidebarSection>
						</SidebarHeader>

						<SidebarBody>
							{/* Main */}
							<SidebarSection>
								<SidebarItem href={`/${orgSlug}`} current={pathname === `/${orgSlug}` || pathname === `/${orgSlug}/`}>
									<HomeIcon />
									<SidebarLabel>Dashboard</SidebarLabel>
								</SidebarItem>
								<SidebarItem href={`/${orgSlug}/campaigns`} current={isActive(`/${orgSlug}/campaigns`)}>
									<RocketLaunchIcon />
									<SidebarLabel>Campaigns</SidebarLabel>
								</SidebarItem>
								<SidebarItem href={`/${orgSlug}/enrollments`} current={isActive(`/${orgSlug}/enrollments`)}>
									<ClipboardDocumentListIcon />
									<SidebarLabel>Enrollments</SidebarLabel>
								</SidebarItem>
								<SidebarItem href={`/${orgSlug}/listings`} current={isActive(`/${orgSlug}/listings`)}>
									<CubeIcon />
									<SidebarLabel>Listings</SidebarLabel>
								</SidebarItem>
								<SidebarItem href={`/${orgSlug}/invoices`} current={isActive(`/${orgSlug}/invoices`)}>
									<DocumentTextIcon />
									<SidebarLabel>Invoices</SidebarLabel>
								</SidebarItem>
							</SidebarSection>

							<SidebarDivider />

							{/* Finance & People */}
							<SidebarSection>
								<SidebarHeading>Manage</SidebarHeading>
								<SidebarItem href={`/${orgSlug}/wallet`} current={isActive(`/${orgSlug}/wallet`)}>
									<WalletIcon />
									<SidebarLabel>Wallet</SidebarLabel>
								</SidebarItem>
								<Can resource="member" action="read">
									<SidebarItem href={`/${orgSlug}/team`} current={isActive(`/${orgSlug}/team`)}>
										<UserGroupIcon />
										<SidebarLabel>Team</SidebarLabel>
									</SidebarItem>
								</Can>
							</SidebarSection>

							<SidebarSpacer />

							{/* Bottom utility */}
							<SidebarSection>
								<SidebarItem href={`/${orgSlug}/changelog`} current={isActive(`/${orgSlug}/changelog`)}>
									<SparklesIcon />
									<SidebarLabel>What&apos;s new</SidebarLabel>
								</SidebarItem>
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
										{activeMember?.data?.user?.image ? (
											<Avatar src={activeMember.data.user?.image} className="size-10" square alt="" />
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
								<AccountDropdownMenu anchor="top start" onOpenAccountSettings={openAccountSettings} />
							</Dropdown>
						</SidebarFooter>
					</Sidebar>
				}
			>
				<Outlet />
			</SidebarLayout>

			{/* Search Dialog */}
			<SearchDialog isOpen={showSearch} onClose={() => setShowSearch(false)} orgSlug={orgSlug} />

			{/* Settings Dialog */}
			<SettingsDialog open={showSettings} onClose={() => setShowSettings(false)} initialTab={settingsTab} />
		</>
	);
}
