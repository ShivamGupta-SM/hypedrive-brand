import { Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/shared/empty-state";
import {
	useCurrentOrganization,
	useInfiniteWalletTransactions,
	useVirtualAccount,
	useWalletHolds,
} from "@/hooks";
import { useOrgPath } from "@/hooks/use-org-slug";
import { DepositAccountCard, HoldRow, TransactionRow } from "./components";

export function WalletOverview() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgPath = useOrgPath();

	// Cache hits — layout already fetched these
	const { data: transactions } = useInfiniteWalletTransactions(organizationId);
	const { data: holds } = useWalletHolds(organizationId);
	const { data: depositAccount, loading: depositLoading } = useVirtualAccount(organizationId);

	return (
		<div className="space-y-6">
			{/* Deposit Account */}
			<DepositAccountCard account={depositAccount} loading={depositLoading} />

			{/* Active Holds */}
			{holds.length > 0 && (
				<div className="overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
					<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
							Active Holds
							<span className="ml-2 text-xs font-normal text-zinc-500">{holds.length}</span>
						</h3>
					</div>
					<div className="space-y-2 p-3 sm:p-4">
						{holds.map((hold) => (
							<HoldRow key={hold.id} hold={hold} />
						))}
					</div>
				</div>
			)}

			{/* Recent Transactions Preview */}
			{transactions.length > 0 ? (
				<div className="overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
					<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
							Recent Transactions
						</h3>
						<Link
							to={orgPath("/wallet/transactions")}
							className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
						>
							View all
						</Link>
					</div>
					<div className="space-y-2 p-3 sm:p-4">
						{transactions.slice(0, 5).map((transaction) => (
							<TransactionRow key={transaction.id} transaction={transaction} />
						))}
					</div>
				</div>
			) : (
				<EmptyState
					preset="generic"
					title="No transactions yet"
					description="Your transaction history will appear here once you add funds or make payments."
				/>
			)}
		</div>
	);
}
