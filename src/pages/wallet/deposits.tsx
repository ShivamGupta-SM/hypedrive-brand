import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/skeleton";
import { useCurrentOrganization, useDeposits } from "@/hooks";
import { DepositRow } from "./components";

export function WalletDeposits() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;

	const { data: deposits, loading: depositsLoading } = useDeposits(organizationId);

	return (
		<div className="space-y-6">
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
				<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
						Deposit History
						{deposits.length > 0 && <span className="ml-2 text-xs font-normal text-zinc-500">{deposits.length}</span>}
					</h3>
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
					<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
						{deposits.map((d) => (
							<DepositRow key={d.id} deposit={d} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
