import {
	ArrowPathIcon,
	ArrowsUpDownIcon,
	ArrowUpRightIcon,
	CalendarIcon,
	CubeIcon,
	EllipsisVerticalIcon,
	EyeIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";

import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { PageHeader } from "@/components/page-header";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { SelectionCheckbox } from "@/components/shared/selection-checkbox";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
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

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
	return <div className={clsx("animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700", className)} style={style} />;
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
	selected?: boolean;
}

function ListingCard({ listing, orgSlug, canEdit, selected }: ListingCardProps) {
	const imageUrl = listing.listingImages?.[0] ? getAssetUrl(listing.listingImages[0].imageUrl) : null;

	return (
		<Link
			href={`/${orgSlug}/listings/${listing.id}`}
			className={clsx(
				"group/card flex flex-col overflow-hidden rounded-xl shadow-xs ring-1 transition-all hover:shadow-md dark:bg-zinc-900",
				selected
					? "ring-sky-300 bg-sky-50/50 dark:ring-sky-700 dark:bg-sky-950/20"
					: "bg-white ring-zinc-200 hover:ring-zinc-300 dark:ring-zinc-800 dark:hover:ring-zinc-700"
			)}
		>
			{/* Product Image */}
			<div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={listing.name}
						className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover/card:scale-105"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center">
						<CubeIcon className="size-10 text-zinc-400 dark:text-zinc-600" />
					</div>
				)}
				{/* Views overlay badge */}
				<div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
					<EyeIcon className="size-3" />
					{listing.views.toLocaleString("en-IN")}
				</div>
				{/* External link badge */}
				{listing.link && (
					<button
						type="button"
						onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (listing.link) window.open(listing.link, "_blank"); }}
						className="absolute bottom-2 right-2 flex items-center justify-center rounded-md bg-black/60 p-1 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
					>
						<ArrowUpRightIcon className="size-3" />
					</button>
				)}
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-3">
				<h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900 dark:text-white">
					{listing.name}
				</h3>
				<p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
					{listing.identifier}
				</p>
				<div className="mt-auto flex items-end justify-between pt-2">
					<p className="text-base font-bold text-zinc-900 dark:text-white">
						{formatCurrency(listing.priceDecimal)}
					</p>
					{canEdit && (
						<Dropdown>
							<DropdownButton
								plain
								aria-label="More options"
								className="rounded-lg p-1 opacity-0 transition-opacity group-hover/card:opacity-100"
								onClick={(e: React.MouseEvent) => e.preventDefault()}
							>
								<EllipsisVerticalIcon className="size-4 text-zinc-400" />
							</DropdownButton>
							<DropdownMenu anchor="bottom end">
								<DropdownItem href={`/${orgSlug}/listings/${listing.id}`}>View details</DropdownItem>
								<DropdownItem href={`/${orgSlug}/listings/${listing.id}/edit`}>Edit listing</DropdownItem>
								{listing.link && (
									<DropdownItem href={listing.link} target="_blank">
										Open listing link
									</DropdownItem>
								)}
							</DropdownMenu>
						</Dropdown>
					)}
				</div>
			</div>
		</Link>
	);
}

// =============================================================================
// LISTING CARD SKELETON
// =============================================================================

function ListingCardSkeleton() {
	return (
		<div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			{/* Image */}
			<div className="aspect-4/3 w-full bg-zinc-100 dark:bg-zinc-800">
				<Shimmer className="h-full w-full rounded-none" />
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-3">
				<Shimmer className="h-4 w-3/4" />
				<Shimmer className="mt-1.5 h-3 w-1/3" />
				<Shimmer className="mt-3 h-5 w-16" />
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
				<div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
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

const listingsRouteApi = getRouteApi("/_app/$orgSlug/listings");

export function ListingsList() {
	const { organizationId, orgSlug } = useOrgContext();
	const { q, sort } = listingsRouteApi.useSearch();
	const navigate = useNavigate();

	// Permission checks
	const canCreateListing = useCan("listing", "create");
	const canUpdateListing = useCan("listing", "update");

	const canDeleteListing = useCan("listing", "delete");

	const searchQuery = q || "";
	const sortBy = sort || "date";
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

	// Debounced search — writes to URL params
	const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const [localSearch, setLocalSearch] = useState(searchQuery);
	const handleSearchChange = (value: string) => {
		setLocalSearch(value);
		clearTimeout(searchTimerRef.current);
		searchTimerRef.current = setTimeout(() => {
			navigate({ search: ((prev: Record<string, unknown>) => ({ ...prev, q: value || undefined })) as never });
		}, 300);
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
		q: searchQuery || undefined,
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
				onRemove: () => { setLocalSearch(""); navigate({ search: ((prev: Record<string, unknown>) => ({ ...prev, q: undefined })) as never }); },
			});
		}
		return filters;
	}, [searchQuery, navigate]);

	const clearAllFilters = () => {
		setLocalSearch("");
		navigate({ search: {} as never });
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
							value={localSearch}
							onChange={(e) => handleSearchChange(e.target.value)}
							placeholder="Search listings..."
							aria-label="Search listings"
						/>
						{localSearch && (
							<button
								type="button"
								onClick={() => handleSearchChange("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-4" />
							</button>
						)}
					</InputGroup>
				</div>

				{/* Sort dropdown */}
				<FilterDropdown
					label="Sort"
					options={[
						{ value: "date", label: "Newest", icon: CalendarIcon, iconColor: "text-sky-500" },
						{ value: "name", label: "Name A-Z", icon: CubeIcon, iconColor: "text-violet-500" },
						{ value: "price", label: "Price", icon: ArrowsUpDownIcon, iconColor: "text-emerald-500" },
						{ value: "views", label: "Most Viewed", icon: EyeIcon, iconColor: "text-amber-500" },
					]}
					value={sortBy}
					onChange={(value) => navigate({ search: ((prev: Record<string, unknown>) => ({ ...prev, sort: value === "date" ? undefined : value })) as never })}
				/>
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
							<div key={listing.id} className="group relative rounded-xl">
								<SelectionCheckbox
									selected={selectedIds.has(listing.id)}
									onToggle={(e) => { e.preventDefault(); toggleSelect(listing.id); }}
								/>
								<ListingCard listing={listing} orgSlug={orgSlug} canEdit={canUpdateListing} selected={selectedIds.has(listing.id)} />
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
						<TrashIcon data-slot="icon" className="size-4" /> Delete
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
