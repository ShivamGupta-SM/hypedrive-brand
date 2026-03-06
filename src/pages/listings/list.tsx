import {
	ArrowPathIcon,
	ArrowsUpDownIcon,
	CalendarIcon,
	CheckCircleIcon,
	CubeIcon,
	EllipsisVerticalIcon,
	EyeIcon,
	LinkIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { PageHeader } from "@/components/page-header";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { IconButton } from "@/components/shared/icon-button";
import { useInfiniteListings } from "@/features/listings/hooks";
import { useBatchListings } from "@/features/listings/mutations";
import { getAssetUrl } from "@/hooks/api-client";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand } from "@/lib/brand-client";
import { formatCurrency } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";
import { CreateListingModal } from "./create-listing-modal";

type Listing = brand.ListingWithStats;

// =============================================================================
// SHIMMER COMPONENT
// =============================================================================

function Shimmer({ className }: { className?: string }) {
	return <div className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700 ${className || ""}`} />;
}

// =============================================================================
// FILTER CHIP
// =============================================================================

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 py-1 pl-2.5 pr-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
			{label}
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					onRemove();
				}}
				className="rounded p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
			>
				<XMarkIcon className="size-3" />
			</button>
		</span>
	);
}

// =============================================================================
// FILTER BOTTOM SHEET - Mobile

// =============================================================================
// PRODUCT CARD - iOS-style with 3-column footer
// =============================================================================

interface ListingCardProps {
	listing: Listing;
	orgSlug: string;
	canEdit?: boolean;
}

function ListingCard({ listing, orgSlug, canEdit }: ListingCardProps) {
	const imageUrl = listing.listingImages?.[0] ? getAssetUrl(listing.listingImages[0].imageUrl) : null;

	return (
		<div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			{/* Listing Image */}
			<div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
				{imageUrl ? (
					<img src={imageUrl} alt={listing.name} className="h-full w-full object-contain p-2" />
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<CubeIcon className="size-12 text-zinc-300 dark:text-zinc-600" />
					</div>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
				<Link href={`/${orgSlug}/listings/${listing.id}`}>
					<h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
						{listing.name}
					</h3>
				</Link>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">SKU: {listing.identifier}</p>
				<p className="mt-auto text-base font-bold text-zinc-900 dark:text-white">
					{formatCurrency(listing.priceDecimal)}
				</p>
			</div>

			{/* Edge-to-edge divider */}
			<div className="h-px bg-zinc-200 dark:bg-zinc-700" />

			{/* Footer Stats - 2-column layout: Views | Link */}
			<div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-700">
				{/* Views */}
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] text-zinc-500 dark:text-zinc-400">Views</span>
					<span className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
						{listing.views.toLocaleString("en-IN")}
					</span>
				</div>

				{/* Listing Link */}
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] text-zinc-500 dark:text-zinc-400">Link</span>
					{listing.link ? (
						<a
							href={listing.link}
							target="_blank"
							rel="noopener noreferrer"
							className="text-xs font-semibold text-sky-600 hover:text-sky-700 sm:text-sm dark:text-sky-400 dark:hover:text-sky-300"
						>
							<LinkIcon className="size-4" />
						</a>
					) : (
						<span className="text-xs text-zinc-400 sm:text-sm">—</span>
					)}
				</div>
			</div>

			{/* Actions footer */}
			<div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
				<Link
					href={`/${orgSlug}/listings/${listing.id}`}
					className="text-xs font-medium text-zinc-500 hover:text-zinc-900 sm:text-sm dark:text-zinc-400 dark:hover:text-zinc-200"
				>
					View details
				</Link>
				<Dropdown>
					<DropdownButton plain aria-label="More options" className="-m-2.5 p-2.5">
						<EllipsisVerticalIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
					</DropdownButton>
					<DropdownMenu anchor="bottom end">
						<DropdownItem href={`/${orgSlug}/listings/${listing.id}`}>View details</DropdownItem>
						{canEdit && <DropdownItem href={`/${orgSlug}/listings/${listing.id}/edit`}>Edit listing</DropdownItem>}
						{listing.link && (
							<DropdownItem href={listing.link} target="_blank">
								Open listing link
							</DropdownItem>
						)}
					</DropdownMenu>
				</Dropdown>
			</div>
		</div>
	);
}

// =============================================================================
// LISTING CARD SKELETON
// =============================================================================

function ListingCardSkeleton() {
	return (
		<div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			{/* Image */}
			<div className="relative aspect-square w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
				<Shimmer className="h-full w-full rounded-none" />
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-2.5 sm:p-3">
				<Shimmer className="h-4 w-3/4" />
				<Shimmer className="mt-1.5 h-3 w-1/2" />
				<Shimmer className="mt-2 h-5 w-20" />
			</div>

			<div className="h-px bg-zinc-200 dark:bg-zinc-700" />

			{/* Footer Stats - 3 columns */}
			<div className="grid grid-cols-3 divide-x divide-zinc-200 dark:divide-zinc-700">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex flex-col items-center justify-center py-2">
						<Shimmer className="h-2.5 w-8" />
						<Shimmer className="mt-0.5 h-3.5 w-10" />
					</div>
				))}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
				<Shimmer className="h-3 w-16" />
				<Shimmer className="size-5 rounded" />
			</div>
		</div>
	);
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function ListingsListSkeleton() {
	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Shimmer className="h-8 w-32" />
					<Shimmer className="mt-2 h-4 w-48 sm:w-64" />
				</div>
				<Shimmer className="size-10 shrink-0 rounded-lg" />
			</div>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total", value: "" },
					{ name: "Total Views", value: "" },
				]}
				loading
				columns={2}
			/>

			{/* Search + Sort pills */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Shimmer className="h-10 w-full rounded-lg sm:w-64" />
				<div className="flex gap-1.5 overflow-x-auto">
					{[75, 80, 65, 95].map((w, i) => (
						<Shimmer key={i} className="h-9 shrink-0 rounded-full" style={{ width: w }} />
					))}
				</div>
			</div>

			{/* Cards Grid */}
			<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
				{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
					<ListingCardSkeleton key={i} />
				))}
			</div>
		</div>
	);
}

// =============================================================================
// PRODUCTS LIST
// =============================================================================

export function ListingsList() {
	const { organizationId, orgSlug } = useOrgContext();

	// Permission checks
	const canCreateListing = useCan("listing", "create");
	const canUpdateListing = useCan("listing", "update");

	const canDeleteListing = useCan("listing", "delete");

	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("date");
	const [showCreateModal, setShowCreateModal] = useState(false);

	// Batch selection state
	const batchListings = useBatchListings();
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchLoading, setIsBatchLoading] = useState(false);

	const toggleSelect = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id); else next.add(id);
			return next;
		});
	}, []);

	const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

	// Debounced search for API
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		clearTimeout(searchTimerRef.current);
		searchTimerRef.current = setTimeout(() => setDebouncedSearch(value), 300);
	};

	// Map sort pill to API sort params
	const sortMapping: Record<string, { sortBy?: "createdAt" | "name" | "price"; sortOrder?: "asc" | "desc" }> = {
		date: { sortBy: "createdAt", sortOrder: "desc" },
		name: { sortBy: "name", sortOrder: "asc" },
		price: { sortBy: "price", sortOrder: "desc" },
		views: { sortBy: "createdAt", sortOrder: "desc" }, // views not sortable server-side, fallback
	};

	const {
		data: listings,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteListings(organizationId, {
		q: debouncedSearch || undefined,
		...sortMapping[sortBy],
	});

	// Only client-side sort for views (not available server-side)
	const filteredListings = useMemo(() => {
		if (sortBy === "views") {
			return [...listings].sort((a, b) => b.views - a.views);
		}
		return listings;
	}, [listings, sortBy]);

	// Stats
	const stats = useMemo(() => {
		const totalViews = listings.reduce((sum, p) => sum + p.views, 0);
		return { total: listings.length, totalViews };
	}, [listings]);

	// Active filters for chips
	const activeFilters = useMemo(() => {
		const filters: { key: string; label: string; onRemove: () => void }[] = [];
		if (searchQuery) {
			filters.push({
				key: "search",
				label: `"${searchQuery}"`,
				onRemove: () => { setSearchQuery(""); setDebouncedSearch(""); },
			});
		}
		return filters;
	}, [searchQuery]);

	const clearAllFilters = () => {
		setSearchQuery("");
		setDebouncedSearch("");
		setSortBy("date");
	};

	const handleBatchAction = useCallback(async (action: "delete") => {
		if (!organizationId || selectedIds.size === 0) return;
		setIsBatchLoading(true);
		try {
			await batchListings.mutateAsync({
				organizationId,
				action,
				listingIds: Array.from(selectedIds),
			});
			showToast.success(`${selectedIds.size} listing${selectedIds.size > 1 ? "s" : ""} deleted`);
			setSelectedIds(new Set());
			refetch();
		} catch (err) {
			showToast.error(err, `Failed to ${action} listings`);
		} finally {
			setIsBatchLoading(false);
		}
	}, [organizationId, selectedIds, batchListings, refetch]);

	const hasActiveFilters = !!searchQuery;

	if (loading) {
		return <ListingsListSkeleton />;
	}

	return (
		<div className="space-y-5">
			{/* Header */}
			<PageHeader
				title="Listings"
				description="Manage your listing catalog for campaigns"
				actions={
					canCreateListing ? (
						<IconButton color="emerald" onClick={() => setShowCreateModal(true)}>
							<PlusIcon className="size-5" />
						</IconButton>
					) : undefined
				}
			/>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total", value: stats.total },
					{ name: "Total Views", value: stats.totalViews.toLocaleString("en-IN") },
				]}
				columns={2}
			/>

			{/* Search + Filter Row */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="w-full sm:w-64 sm:shrink-0">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => handleSearchChange(e.target.value)}
							placeholder="Search listings..."
							aria-label="Search listings"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-4" />
							</button>
						)}
					</InputGroup>
				</div>

				{/* Sort pills */}
				<div className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1 py-1">
					<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
						{(
							[
								{ value: "date", label: "Newest", icon: CalendarIcon, iconColor: "text-sky-500" },
								{ value: "name", label: "Name A-Z", icon: CubeIcon, iconColor: "text-violet-500" },
								{ value: "price", label: "Price", icon: ArrowsUpDownIcon, iconColor: "text-emerald-500" },
								{ value: "views", label: "Most Viewed", icon: EyeIcon, iconColor: "text-amber-500" },
							] as { value: string; label: string; icon: typeof CalendarIcon; iconColor: string }[]
						).map((opt) => {
							const isActive = sortBy === opt.value;
							return (
								<button
									type="button"
									key={opt.value}
									onClick={() => setSortBy(opt.value)}
									className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ring-1 transition-all duration-200 active:scale-95 ${isActive ? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white" : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800"}`}
								>
									<opt.icon className={`size-3.5 ${isActive ? "text-white dark:text-zinc-900" : opt.iconColor}`} />
									{opt.label}
								</button>
							);
						})}
					</div>
				</div>
			</div>

			{/* Active filter chips */}
			{activeFilters.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					{activeFilters.map((filter) => (
						<FilterChip key={filter.key} label={filter.label} onRemove={filter.onRemove} />
					))}
					<button
						type="button"
						onClick={clearAllFilters}
						className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
					>
						Clear all
					</button>
				</div>
			)}

			{/* Results Grid */}
			{error ? (
				<ErrorState message="Unable to load listings." onRetry={refetch} />
			) : filteredListings.length > 0 ? (
				<>
					<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
						{filteredListings.map((listing) => (
							<div key={listing.id} className="group relative">
								{/* Selection checkbox */}
								<button
									type="button"
									onClick={(e) => { e.preventDefault(); toggleSelect(listing.id); }}
									className={`absolute left-2 top-2 z-10 flex size-5 items-center justify-center rounded border transition-all ${
										selectedIds.has(listing.id)
											? "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white"
											: "border-zinc-300 bg-white opacity-0 group-hover:opacity-100 dark:border-zinc-600 dark:bg-zinc-800"
									}`}
								>
									{selectedIds.has(listing.id) && (
										<CheckCircleIcon className="size-3.5 text-white dark:text-zinc-900" />
									)}
								</button>
								<ListingCard listing={listing} orgSlug={orgSlug} canEdit={canUpdateListing} />
							</div>
						))}
					</div>

					{/* Load More */}
					{hasMore && (
						<div className="flex justify-center">
							<Button outline onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
								{isFetchingNextPage ? (
									<>
										<ArrowPathIcon className="size-4 animate-spin" />
										Loading...
									</>
								) : (
									"Load More"
								)}
							</Button>
						</div>
					)}
				</>
			) : (
				<EmptyState
					preset="listings"
					title={hasActiveFilters ? "No listings found" : "No listings yet"}
					description={
						hasActiveFilters
							? "Try adjusting your filters or search query"
							: "Add your first listing to use in campaigns"
					}
					action={
						hasActiveFilters
							? { label: "Clear filters", onClick: clearAllFilters }
							: canCreateListing
								? { label: "Add Listing", onClick: () => setShowCreateModal(true) }
								: undefined
					}
				/>
			)}

			{/* Floating Batch Actions Bar */}
			<BulkActionsBar selectedCount={selectedIds.size} onClear={clearSelection}>
				{canDeleteListing && (
					<Button color="red" onClick={() => handleBatchAction("delete")} disabled={isBatchLoading}>
						<TrashIcon className="size-4" /> Delete
					</Button>
				)}
			</BulkActionsBar>

			{/* Create Listing Modal */}
			<CreateListingModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				organizationId={organizationId}
				onSuccess={refetch}
			/>
		</div>
	);
}
