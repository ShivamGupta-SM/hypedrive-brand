import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/skeleton";
import { useCurrentOrganization, useInfiniteWalletTransactions } from "@/hooks";
import { TransactionRow } from "./components";

export function WalletTransactions() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;

	const {
		data: transactions,
		loading,
		hasMore,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteWalletTransactions(organizationId);

	return (
		<div className="overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
			<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
					All Transactions
					{transactions.length > 0 && (
						<span className="ml-2 text-xs font-normal text-zinc-500">{transactions.length}</span>
					)}
				</h3>
			</div>
			<div className="p-3 sm:p-4">
				{loading ? (
					<div className="space-y-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} width="100%" height={72} borderRadius={12} />
						))}
					</div>
				) : transactions.length === 0 ? (
					<EmptyState
						preset="generic"
						title="No transactions yet"
						description="Your transaction history will appear here once you add funds or make payments."
					/>
				) : (
					<div className="space-y-2">
						{transactions.map((transaction) => (
							<TransactionRow key={transaction.id} transaction={transaction} />
						))}
						{hasMore && (
							<div className="flex justify-center pt-3">
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
					</div>
				)}
			</div>
		</div>
	);
}
