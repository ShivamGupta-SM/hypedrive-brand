import {
  ArrowDownLeftIcon,
  ArrowsRightLeftIcon,
  ArrowUpRightIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import { Input, InputGroup } from "@/components/input";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown, type FilterOption } from "@/components/shared/filter-dropdown";
import { Skeleton } from "@/components/skeleton";
import { useInfiniteWalletTransactions } from "@/features/wallet/hooks";
import { useDebounce } from "@/hooks/use-debounce";
import { useOrgContext } from "@/hooks/use-org-context";
import type { brand } from "@/lib/brand-client";
import { TransactionDetailDialog, TransactionRow } from "./components";

const typeFilterOptions: FilterOption[] = [
  { value: "all", label: "All", icon: Squares2X2Icon, iconColor: "text-sky-500" },
  { value: "credit", label: "Credits", icon: ArrowDownLeftIcon, iconColor: "text-emerald-500" },
  { value: "debit", label: "Debits", icon: ArrowUpRightIcon, iconColor: "text-red-500" },
];

type TypeFilter = "all" | "credit" | "debit";

export function WalletTransactions() {
  const { organizationId, orgSlug } = useOrgContext();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedTransaction, setSelectedTransaction] = useState<brand.WalletTransaction | null>(null);

  const {
    data: transactions,
    loading,
    error,
    refetch,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteWalletTransactions(organizationId, {
    type: typeFilter === "all" ? undefined : typeFilter,
    q: debouncedSearch || undefined,
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0, rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  const hasFilters = typeFilter !== "all" || debouncedSearch;

  if (error) {
    return <ErrorState message="Failed to load transactions. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="animate-page-enter space-y-3">
      {/* Search + Filter bar — outside the card, matching campaigns/enrollments layout */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 sm:max-w-64">
          <InputGroup>
            <MagnifyingGlassIcon data-slot="icon" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              aria-label="Search transactions"
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
        <FilterDropdown
          label="Type"
          options={typeFilterOptions}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as TypeFilter)}
        />
      </div>

      {/* Transaction list card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
        <div className="flex items-center gap-2.5 border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
          <ArrowsRightLeftIcon className="size-4 text-sky-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Transactions</h3>
        </div>
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width="100%" height={56} borderRadius={8} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-4">
            <EmptyState
              preset="generic"
              title={hasFilters ? "No matching transactions" : "No transactions yet"}
              description={
                hasFilters
                  ? "Try adjusting your search or filters."
                  : "Your transaction history will appear here once you add funds or make payments."
              }
            />
          </div>
        ) : (
          <>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  orgSlug={orgSlug}
                  onClick={setSelectedTransaction}
                  searchQuery={debouncedSearch}
                />
              ))}
            </div>
            {hasMore && (
              <div ref={loadMoreRef} className="flex justify-center py-6">
                {isFetchingNextPage && (
                  <div className="size-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
                )}
              </div>
            )}
          </>
        )}
      </div>

      <TransactionDetailDialog
        transaction={selectedTransaction}
        orgSlug={orgSlug}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
