import {
	ArrowUpRightIcon,
	CalendarIcon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	HashtagIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/skeleton";
import { useOrgContext, useWithdrawalDetail, useWithdrawalStats, useWithdrawals } from "@/hooks";
import { formatCurrency, formatDateTime } from "@/lib/design-tokens";
import { WithdrawalRow } from "./components";

export function WalletWithdrawals() {
	const { organizationId } = useOrgContext();

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
				<div className="grid grid-cols-2 gap-3 sm:gap-4">
					<div className="rounded-xl bg-white p-3.5 sm:p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<p className="text-[10px] font-medium text-zinc-500 sm:text-xs dark:text-zinc-400">Pending Requests</p>
						<p className="mt-1 text-xl font-bold tabular-nums text-zinc-900 sm:text-2xl dark:text-white">
							{withdrawalStats.pendingApprovalCount ?? 0}
						</p>
						{(withdrawalStats.pendingApprovalCount ?? 0) > 0 && (
							<p className="mt-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">awaiting approval</p>
						)}
					</div>
					<div className="rounded-xl bg-white p-3.5 sm:p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<p className="text-[10px] font-medium text-zinc-500 sm:text-xs dark:text-zinc-400">Total Withdrawn</p>
						<p className="mt-1 text-xl font-bold tabular-nums text-zinc-900 sm:text-2xl dark:text-white">
							{formatCurrency(withdrawalStats.totalAmountDecimal ?? "0")}
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
				{withdrawalsLoading ? (
					<div className="space-y-2 p-4">
						{[1, 2].map((i) => (
							<Skeleton key={i} width="100%" height={56} borderRadius={8} />
						))}
					</div>
				) : withdrawals.length === 0 ? (
					<div className="p-4">
						<EmptyState
							preset="generic"
							title="No withdrawals"
							description="Your withdrawal history will appear here."
						/>
					</div>
				) : (
					<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
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

			{/* Withdrawal Detail Dialog */}
			<Dialog open={!!selectedWithdrawalId} onClose={() => setSelectedWithdrawalId(null)} size="md">
				<DialogHeader
					icon={ArrowUpRightIcon}
					iconColor="zinc"
					title="Withdrawal Details"
					onClose={() => setSelectedWithdrawalId(null)}
				/>
				<DialogBody>
					{withdrawalDetailLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} width="100%" height={48} borderRadius={8} />
							))}
						</div>
					) : withdrawalDetail ? (
						<div className="space-y-5">
							{/* Amount highlight */}
							<div className="rounded-xl bg-zinc-50 p-4 text-center dark:bg-zinc-800/50">
								<p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
									Amount
								</p>
								<p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-white">
									{formatCurrency(withdrawalDetail.amountDecimal)}
								</p>
								<Badge
									className="mt-2"
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

							{/* Detail rows */}
							<div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
								<div className="flex items-center gap-3 px-4 py-3">
									<CalendarIcon className="size-4 shrink-0 text-zinc-400" />
									<span className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">Requested</span>
									<span className="text-sm font-medium text-zinc-900 dark:text-white">
										{formatDateTime(withdrawalDetail.requestedAt)}
									</span>
								</div>
								{withdrawalDetail.processedAt && (
									<div className="flex items-center gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
										<CheckCircleIcon className="size-4 shrink-0 text-zinc-400" />
										<span className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">Processed</span>
										<span className="text-sm font-medium text-zinc-900 dark:text-white">
											{formatDateTime(withdrawalDetail.processedAt)}
										</span>
									</div>
								)}
								<div className="flex items-center gap-3 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
									<HashtagIcon className="size-4 shrink-0 text-zinc-400" />
									<span className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">ID</span>
									<span className="max-w-40 truncate font-mono text-xs text-zinc-400">{withdrawalDetail.id}</span>
								</div>
							</div>

							{/* Rejection / failure reason */}
							{(withdrawalDetail.rejectionReason || withdrawalDetail.failureReason) && (
								<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
									<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
									<div>
										<p className="text-xs font-medium text-red-700 dark:text-red-300">
											{withdrawalDetail.rejectionReason ? "Rejection Reason" : "Failure Reason"}
										</p>
										<p className="mt-0.5 text-sm text-red-600 dark:text-red-400">
											{withdrawalDetail.rejectionReason || withdrawalDetail.failureReason}
										</p>
									</div>
								</div>
							)}
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
