import { useState } from "react";
import { Badge } from "@/components/badge";
import {
	Dialog,
	DialogActions,
	DialogBody,
	DialogDescription,
	DialogTitle,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/skeleton";
import {
	useCurrentOrganization,
	useWithdrawalDetail,
	useWithdrawals,
	useWithdrawalStats,
} from "@/hooks";
import { formatCurrency, formatDateTime } from "@/lib/design-tokens";
import { WithdrawalRow } from "./components";

export function WalletWithdrawals() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;

	const { data: withdrawals, loading: withdrawalsLoading } = useWithdrawals(organizationId);
	const { data: withdrawalStats } = useWithdrawalStats(organizationId);

	const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);
	const { data: withdrawalDetail, loading: withdrawalDetailLoading } = useWithdrawalDetail(
		organizationId,
		selectedWithdrawalId ?? undefined
	);

	return (
		<div className="space-y-4">
			{/* Withdrawal Stats */}
			{withdrawalStats && (
				<div className="grid grid-cols-2 gap-4">
					<div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
						<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pending</p>
						<p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
							{withdrawalStats.pendingApprovalCount ?? 0}
						</p>
					</div>
					<div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
						<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Withdrawn</p>
						<p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
							{formatCurrency(withdrawalStats.totalAmount ?? 0)}
						</p>
					</div>
				</div>
			)}

			{/* Withdrawal List */}
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
				<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
						Withdrawal Requests
						{withdrawals.length > 0 && (
							<span className="ml-2 text-xs font-normal text-zinc-500">{withdrawals.length}</span>
						)}
					</h3>
				</div>
				<div className="p-3 sm:p-4">
					{withdrawalsLoading ? (
						<div className="space-y-2">
							{[1, 2].map((i) => (
								<Skeleton key={i} width="100%" height={72} borderRadius={12} />
							))}
						</div>
					) : withdrawals.length === 0 ? (
						<EmptyState
							preset="generic"
							title="No withdrawals"
							description="Your withdrawal history will appear here."
						/>
					) : (
						<div className="space-y-2">
							{withdrawals.map((w) => (
								<WithdrawalRow
									key={w.id}
									withdrawal={w}
									organizationId={organizationId}
									onClick={() => setSelectedWithdrawalId(w.id)}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Withdrawal Detail Dialog */}
			<Dialog open={!!selectedWithdrawalId} onClose={() => setSelectedWithdrawalId(null)} size="md">
				<DialogTitle>Withdrawal Details</DialogTitle>
				<DialogDescription>View details for this withdrawal request.</DialogDescription>
				<DialogBody>
					{withdrawalDetailLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} width="100%" height={48} borderRadius={8} />
							))}
						</div>
					) : withdrawalDetail ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
								<span className="text-sm text-zinc-500">Amount</span>
								<span className="text-lg font-bold text-zinc-900 dark:text-white">
									{formatCurrency(withdrawalDetail.amount)}
								</span>
							</div>
							<div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
								<span className="text-sm text-zinc-500">Status</span>
								<Badge
									color={
										withdrawalDetail.status === "completed"
											? "emerald"
											: withdrawalDetail.status === "pending"
												? "amber"
												: withdrawalDetail.status === "rejected"
													? "red"
													: "zinc"
									}
								>
									{withdrawalDetail.status}
								</Badge>
							</div>
							<div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
								<span className="text-sm text-zinc-500">Requested</span>
								<span className="text-sm text-zinc-900 dark:text-white">
									{formatDateTime(withdrawalDetail.requestedAt)}
								</span>
							</div>
							{withdrawalDetail.processedAt && (
								<div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
									<span className="text-sm text-zinc-500">Processed</span>
									<span className="text-sm text-zinc-900 dark:text-white">
										{formatDateTime(withdrawalDetail.processedAt)}
									</span>
								</div>
							)}
							{(withdrawalDetail.rejectionReason || withdrawalDetail.failureReason) && (
								<div className="border-b border-zinc-200 pb-3 dark:border-zinc-700">
									<span className="text-sm text-zinc-500">
										{withdrawalDetail.rejectionReason ? "Rejection Reason" : "Failure Reason"}
									</span>
									<p className="mt-1 text-sm text-zinc-900 dark:text-white">
										{withdrawalDetail.rejectionReason || withdrawalDetail.failureReason}
									</p>
								</div>
							)}
							<div className="flex items-center justify-between">
								<span className="text-sm text-zinc-500">ID</span>
								<span className="max-w-50 truncate font-mono text-xs text-zinc-400">
									{withdrawalDetail.id}
								</span>
							</div>
						</div>
					) : (
						<p className="text-sm text-zinc-500">Withdrawal not found.</p>
					)}
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setSelectedWithdrawalId(null)}>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
