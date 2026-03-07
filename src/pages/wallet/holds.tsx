import { LockClosedIcon } from "@heroicons/react/16/solid";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/skeleton";
import { useWalletHolds } from "@/features/wallet/hooks";
import { useOrgContext } from "@/hooks/use-org-context";
import { HoldRow } from "./components";

export function WalletHolds() {
	const { organizationId } = useOrgContext();

	const { data: holds, loading, error, refetch } = useWalletHolds(organizationId);

	if (error) {
		return <ErrorState message="Failed to load holds. Please try again." onRetry={refetch} />;
	}

	return (
		<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="flex items-center justify-between border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
				<div className="flex items-center gap-2.5">
					<LockClosedIcon className="size-4 text-amber-500" />
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
						Active Holds
						{holds.length > 0 && <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">{holds.length}</span>}
					</h3>
				</div>
			</div>
			{loading ? (
				<div className="space-y-2 p-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} width="100%" height={56} borderRadius={8} />
					))}
				</div>
			) : holds.length === 0 ? (
				<div className="p-4">
					<EmptyState
						preset="generic"
						title="No active holds"
						description="Funds held for active campaigns will appear here."
					/>
				</div>
			) : (
				<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
					{holds.map((hold) => (
						<HoldRow key={hold.id} hold={hold} />
					))}
				</div>
			)}
		</div>
	);
}
