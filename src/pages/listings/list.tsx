import {
	ArrowPathIcon,
	CubeIcon,
	EllipsisVerticalIcon,
	LinkIcon,
	MagnifyingGlassIcon,
	PlusIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";

import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Heading } from "@/components/heading";
import { Input, InputGroup } from "@/components/input";
import { Link } from "@/components/link";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { IconButton } from "@/components/shared/icon-button";
import { Text } from "@/components/text";
import { getAssetUrl, useInfiniteListings, useOrgContext } from "@/hooks";
import type { brand } from "@/lib/brand-client";
import { formatCurrency } from "@/lib/design-tokens";
import { useCan } from "@/store/permissions-store";
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
					<span className="text-[10px] text-zinc-400 dark:text-zinc-500">Views</span>
					<span className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">
						{listing.views.toLocaleString("en-IN")}
					</span>
				</div>

				{/* Listing Link */}
				<div className="flex flex-col items-center justify-center py-2">
					<span className="text-[10px] text-zinc-400 dark:text-zinc-500">Link</span>
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
					<DropdownButton plain aria-label="More options" className="-m-1 p-1">
						<EllipsisVerticalIcon className="size-5 text-zinc-400 dark:text-zinc-500" />
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
				<Shimmer className="h-10 w-10 shrink-0 rounded-lg sm:w-32" />
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

			{/* Search + Filter Row */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Shimmer className="h-9 w-full rounded-lg sm:w-52" />
				<div className="flex items-center gap-1.5">
					{[1, 2, 3].map((i) => (
						<Shimmer key={i} className="h-8 w-20 rounded-full" />
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

	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState("date");
	const [showCreateModal, setShowCreateModal] = useState(false);

	const {
		data: listings,
		loading,
		error,
		refetch,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteListings(organizationId);

	// Filter and sort listings locally
	const filteredListings = useMemo(() => {
		let result = [...listings];

		// Search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(listing) =>
					listing.name.toLowerCase().includes(query) ||
					listing.identifier?.toLowerCase().includes(query) ||
					listing.description?.toLowerCase().includes(query)
			);
		}

		// Sort
		result.sort((a, b) => {
			if (sortBy === "name") return a.name.localeCompare(b.name);
			if (sortBy === "price") return b.price - a.price;
			if (sortBy === "views") return b.views - a.views;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

		return result;
	}, [listings, searchQuery, sortBy]);

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
				onRemove: () => setSearchQuery(""),
			});
		}
		return filters;
	}, [searchQuery]);

	const clearAllFilters = () => {
		setSearchQuery("");
		setSortBy("date");
	};

	const hasActiveFilters = !!searchQuery;

	if (loading) {
		return <ListingsListSkeleton />;
	}

	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Heading>Listings</Heading>
					<Text className="mt-1">Manage your listing catalog for campaigns</Text>
				</div>
				{canCreateListing && (
					<IconButton color="emerald" onClick={() => setShowCreateModal(true)}>
						<PlusIcon className="size-5" />
					</IconButton>
				)}
			</div>

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
				<div className="w-full sm:w-52 sm:shrink-0">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
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
				<div className="min-w-0 flex-1 overflow-x-auto">
					<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
						{(
							[
								{ value: "date", label: "Newest" },
								{ value: "name", label: "Name A-Z" },
								{ value: "price", label: "Price" },
								{ value: "views", label: "Most Viewed" },
							] as { value: string; label: string }[]
						).map((opt) => {
							const isActive = sortBy === opt.value;
							return (
								<button
									type="button"
									key={opt.value}
									onClick={() => setSortBy(opt.value)}
									className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${isActive ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
								>
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
							<ListingCard key={listing.id} listing={listing} orgSlug={orgSlug} canEdit={canUpdateListing} />
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
