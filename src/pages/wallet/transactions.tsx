import {
	ArrowDownLeftIcon,
	ArrowPathIcon,
	ArrowUpRightIcon,
	ArrowsRightLeftIcon,
	Squares2X2Icon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown, type FilterOption } from "@/components/shared/filter-dropdown";
import { Skeleton } from "@/components/skeleton";
import { useInfiniteWalletTransactions } from "@/features/wallet/hooks";
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
	});

	if (error) {
		return <ErrorState message="Failed to load transactions. Please try again." onRetry={refetch} />;
	}

	return (
		<>
			<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
					<div className="flex items-center gap-2.5">
						<ArrowsRightLeftIcon className="size-4 text-sky-500" />
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Transactions</h3>
					</div>
					<FilterDropdown label="Type" options={typeFilterOptions} value={typeFilter} onChange={(v) => setTypeFilter(v as TypeFilter)} />
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
								title="No transactions yet"
								description={
									typeFilter !== "all"
										? `No ${typeFilter} transactions found.`
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
									/>
								))}
							</div>
							{hasMore && (
								<div className="flex justify-center border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
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
					)}
				</div>

			<TransactionDetailDialog
				transaction={selectedTransaction}
				orgSlug={orgSlug}
				onClose={() => setSelectedTransaction(null)}
			/>
		</>
	);
}
