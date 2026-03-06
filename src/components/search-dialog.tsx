import * as Headless from "@headlessui/react";
import {
	ArrowRightIcon,
	ClipboardDocumentListIcon,
	ClockIcon,
	Cog6ToothIcon,
	CubeIcon,
	DocumentTextIcon,
	ExclamationCircleIcon,
	HomeIcon,
	MagnifyingGlassIcon,
	RocketLaunchIcon,
	WalletIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/badge";
import { Skeleton, SkeletonProvider } from "@/components/skeleton";
import { useUnifiedSearch } from "@/features/organization/hooks";
import type { brand } from "@/lib/brand-client";
import { formatRelativeTime, formatStatus, getStatusColor } from "@/lib/design-tokens";
import { HighlightText } from "@/lib/highlight-text";

// =============================================================================
// CONSTANTS & TYPES
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
// HELPERS
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
// SKELETON
// =============================================================================

function SearchResultSkeleton() {
	return (
		<div className="flex items-center gap-3 px-2.5 py-2.5">
			<Skeleton width={40} height={40} borderRadius={8} />
			<div className="flex-1 space-y-1.5">
				<Skeleton width="55%" height={14} />
				<Skeleton width="35%" height={11} />
			</div>
			<Skeleton width={40} height={11} />
		</div>
	);
}

// =============================================================================
// SEARCH RESULT ROW
// =============================================================================

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
			className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all ${
				isFocused ? "bg-zinc-950/[0.04] dark:bg-white/[0.06]" : "hover:bg-zinc-950/[0.03] dark:hover:bg-white/[0.04]"
			}`}
		>
			{thumbnail ? (
				<img
					src={thumbnail}
					alt=""
					className="size-10 shrink-0 rounded-lg bg-zinc-100 object-contain dark:bg-zinc-800"
				/>
			) : (
				<div
					className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${getResultIconBg(result.resultType)}`}
				>
					{getResultIcon(result.resultType)}
				</div>
			)}

			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="truncate text-sm font-medium text-zinc-900 dark:text-white">
						<HighlightText text={result.title} query={query} />
					</span>
					<Badge color={getStatusColor(result.status)} className="shrink-0 text-[10px]/4">
						{formatStatus(result.status)}
					</Badge>
				</div>
				{meta.length > 0 && (
					<p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
						{meta.map((m, i) => (
							<span key={i}>
								{i > 0 && " · "}
								<HighlightText text={m} query={query} />
							</span>
						))}
					</p>
				)}
				{result.displayId && (
					<p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
						<HighlightText text={result.displayId} query={query} />
					</p>
				)}
			</div>

			<div className="flex shrink-0 flex-col items-end gap-1">
				<p className="text-[11px] text-zinc-500 dark:text-zinc-400">{formatRelativeTime(result.createdAt)}</p>
				<ArrowRightIcon className="size-3 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600" />
			</div>
		</button>
	);
}

// =============================================================================
// SEARCH DIALOG
// =============================================================================

export function SearchDialog({
	isOpen,
	onClose,
	orgSlug,
	organizationId,
}: {
	isOpen: boolean;
	onClose: () => void;
	orgSlug: string;
	organizationId: string;
}) {
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState<SearchFilterType>("all");
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const debouncedQuery = useDebounce(query, 300);
	const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } = useRecentSearches();

	const hasQuery = debouncedQuery.trim().length >= 2;

	const {
		data: searchResults,
		loading,
		isFetching,
		error: searchError,
	} = useUnifiedSearch(hasQuery ? organizationId : undefined, {
		q: debouncedQuery,
		limit: 50,
	});

	const allResults = searchResults?.data ?? [];
	const facets = searchResults?.facets;
	const hasMore = searchResults?.hasMore ?? false;

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
					className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-950/5 transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 dark:bg-zinc-900 dark:ring-white/10"
				>
					{/* Search Input */}
					<div className="flex items-center gap-3 border-b border-zinc-200 px-5 dark:border-zinc-800">
						<MagnifyingGlassIcon className="size-5 shrink-0 text-zinc-400" />
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								setFocusedIndex(-1);
							}}
							placeholder="Search campaigns, enrollments, listings..."
							className="h-13 w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-white dark:placeholder:text-zinc-500 sm:text-sm"
						/>
						{query && (
							<button
								type="button"
								onClick={() => {
									setQuery("");
									setFocusedIndex(-1);
									inputRef.current?.focus();
								}}
								className="flex size-6 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-3.5" />
							</button>
						)}
						<kbd className="hidden shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 sm:block dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
							Esc
						</kbd>
					</div>

					{/* Refetch progress bar */}
					{hasQuery && isFetching && !loading && (
						<div className="h-0.5 bg-zinc-200/60 dark:bg-zinc-700/60">
							<div className="h-full w-1/3 animate-pulse rounded-full bg-zinc-400/50 dark:bg-zinc-500/50" />
						</div>
					)}

					{/* Filter Tabs */}
					{hasQuery && facets && (
						<div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-zinc-200 px-5 py-2 dark:border-zinc-800">
							{tabs.map((tab) => (
								<button
									key={tab.key}
									type="button"
									onClick={() => setFilter(tab.key)}
									className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
										filter === tab.key
											? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
											: "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
									}`}
								>
									{tab.label}
									{tab.count > 0 && (
										<span className={`ml-1 ${filter === tab.key ? "opacity-60" : "text-zinc-500 dark:text-zinc-400"}`}>
											{tab.count}
										</span>
									)}
								</button>
							))}
						</div>
					)}

					{/* Results list */}
					<div ref={listRef} className="max-h-[420px] overflow-y-auto scrollbar-hide px-2 py-2">
						{/* Empty state — recent searches + quick actions */}
						{!hasQuery && (
							<>
								{recentSearches.length > 0 && (
									<>
										<div className="flex items-center justify-between px-2.5 py-1.5">
											<span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
												Recent
											</span>
											<button
												type="button"
												onClick={clearRecentSearches}
												className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
											>
												Clear
											</button>
										</div>
										{recentSearches.map((search, i) => (
											<div
												key={search.query}
												className={`flex items-center gap-3 rounded-xl px-2.5 py-2 transition-all ${
													focusedIndex === getRecentFlatIndex(i)
														? "bg-zinc-950/[0.04] dark:bg-white/[0.06]"
														: "hover:bg-zinc-950/[0.03] dark:hover:bg-white/[0.04]"
												}`}
											>
												<button
													type="button"
													onClick={() => setQuery(search.query)}
													className="flex flex-1 items-center gap-3 text-left"
												>
													<ClockIcon className="size-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
													<span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">{search.query}</span>
												</button>
												<button
													type="button"
													onClick={() => removeRecentSearch(search.query)}
													className="rounded-md p-0.5 text-zinc-300 transition-colors hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
												>
													<XMarkIcon className="size-3.5" />
												</button>
											</div>
										))}
										<div className="my-2 h-px bg-zinc-100 dark:bg-zinc-800" />
									</>
								)}
								<div className="px-2.5 py-1.5">
									<span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										Quick Actions
									</span>
								</div>
								{filteredActions.map((action, i) => (
									<button
										key={action.id}
										type="button"
										onClick={() => {
											navigate({ to: action.path });
											onClose();
										}}
										className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 transition-all ${
											focusedIndex === getActionFlatIndex(i)
												? "bg-zinc-950/[0.04] dark:bg-white/[0.06]"
												: "hover:bg-zinc-950/[0.03] dark:hover:bg-white/[0.04]"
										}`}
									>
										<div className="flex size-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
											{action.icon}
										</div>
										<div className="flex-1 text-left">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">{action.label}</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">{action.description}</p>
										</div>
										<ArrowRightIcon className="size-3.5 text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600" />
									</button>
								))}
							</>
						)}

						{/* Loading — skeleton shimmer */}
						{hasQuery && loading && (
							<SkeletonProvider>
								{Array.from({ length: 5 }).map((_, i) => (
									<SearchResultSkeleton key={i} />
								))}
							</SkeletonProvider>
						)}

						{/* Error state */}
						{hasQuery && !loading && searchError && (
							<div className="py-8 text-center">
								<ExclamationCircleIcon className="mx-auto size-6 text-red-400 dark:text-red-500" />
								<p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Search unavailable</p>
								<p className="mt-1 text-xs text-zinc-400">Something went wrong. Try again in a moment.</p>
							</div>
						)}

						{/* No results */}
						{hasQuery && !loading && !searchError && filteredResults.length === 0 && (
							<div className="py-8 text-center">
								<MagnifyingGlassIcon className="mx-auto size-6 text-zinc-300 dark:text-zinc-600" />
								<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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
										<div className="px-2.5 py-1.5">
											<span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
												Campaigns
											</span>
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
										<div className="px-2.5 py-1.5">
											<span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
												Enrollments
											</span>
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
										<div className="px-2.5 py-1.5">
											<span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
												Listings
											</span>
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
										<div className="px-2.5 py-1.5">
											<span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
												Invoices
											</span>
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

								{/* Has more results notice */}
								{hasMore && (
									<div className="mt-1 border-t border-zinc-100 px-2 py-2 dark:border-zinc-800">
										<p className="text-center text-xs text-zinc-400">
											Showing top results — refine your query to narrow down
										</p>
									</div>
								)}
							</>
						)}
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between border-t border-zinc-200 px-5 py-2.5 text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
						<div className="flex items-center gap-3">
							<span className="flex items-center gap-1.5">
								<kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
									↑↓
								</kbd>
								navigate
							</span>
							<span className="flex items-center gap-1.5">
								<kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
									↵
								</kbd>
								select
							</span>
						</div>
						<span className="flex items-center gap-1.5">
							<kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
								Esc
							</kbd>
							close
						</span>
					</div>
				</Headless.DialogPanel>
			</div>
		</Headless.Dialog>
	);
}
