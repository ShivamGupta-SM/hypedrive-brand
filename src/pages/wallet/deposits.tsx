import {
	ArrowDownLeftIcon,
	BanknotesIcon,
	CalendarIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown, type FilterOption } from "@/components/shared/filter-dropdown";
import { Skeleton } from "@/components/skeleton";
import { useDeposits } from "@/features/wallet/hooks";
import { useOrgContext } from "@/hooks/use-org-context";
import { DepositRow } from "./components";

const sortMap = {
	newest: { sortBy: "createdAt" as const, sortOrder: "desc" as const },
	oldest: { sortBy: "createdAt" as const, sortOrder: "asc" as const },
	"amount-high": { sortBy: "amount" as const, sortOrder: "desc" as const },
	"amount-low": { sortBy: "amount" as const, sortOrder: "asc" as const },
};

type SortValue = keyof typeof sortMap;

const sortOptions: FilterOption<SortValue>[] = [
	{ value: "newest", label: "Newest", icon: CalendarIcon, iconColor: "text-sky-500" },
	{ value: "oldest", label: "Oldest", icon: CalendarIcon, iconColor: "text-zinc-400" },
	{ value: "amount-high", label: "Highest", icon: BanknotesIcon, iconColor: "text-emerald-500" },
	{ value: "amount-low", label: "Lowest", icon: BanknotesIcon, iconColor: "text-amber-500" },
];

export function WalletDeposits() {
	const { organizationId } = useOrgContext();
	const [sortBy, setSortBy] = useState<SortValue>("newest");
	const activeSort = sortMap[sortBy] || sortMap.newest;

	const { data: deposits, loading: depositsLoading, error, refetch } = useDeposits(organizationId, {
		sortBy: activeSort.sortBy,
		sortOrder: activeSort.sortOrder,
	});

	if (error) {
		return <ErrorState message="Failed to load deposits. Please try again." onRetry={refetch} />;
	}

	return (
		<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
				<div className="flex items-center gap-2.5">
					<ArrowDownLeftIcon className="size-4 text-emerald-500" />
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Deposits</h3>
				</div>
				<FilterDropdown label="Sort" options={sortOptions} value={sortBy} onChange={setSortBy} />
			</div>
			{depositsLoading ? (
				<div className="space-y-2 p-4">
					{[1, 2].map((i) => (
						<Skeleton key={i} width="100%" height={56} borderRadius={8} />
					))}
				</div>
			) : deposits.length === 0 ? (
				<div className="p-4">
					<EmptyState
						preset="generic"
						title="No deposits yet"
						description="Your deposit history will appear here once you add funds."
					/>
				</div>
			) : (
				<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
					{deposits.map((d) => (
						<DepositRow key={d.id} deposit={d} />
					))}
				</div>
			)}
		</div>
	);
}
