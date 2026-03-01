import { ArrowDownLeftIcon, ArrowUpRightIcon } from "@heroicons/react/16/solid";
import { Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { IconButton } from "@/components/shared/icon-button";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";
import { Text } from "@/components/text";
import {
	useCurrentOrganization,
	useDeposits,
	useInfiniteWalletTransactions,
	useVirtualAccount,
	useWallet,
	useWalletHolds,
	useWithdrawals,
} from "@/hooks";
import { useOrgPath } from "@/hooks/use-org-slug";
import { formatCurrency } from "@/lib/design-tokens";
import { useCan } from "@/store/permissions-store";
import { DepositAccountDialog, ErrorState, LoadingSkeleton, WithdrawDialog } from "./components";

export function WalletLayout() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgPath = useOrgPath();

	const {
		data: wallet,
		loading: walletLoading,
		error: walletError,
		refetch: refetchWallet,
	} = useWallet(organizationId);
	const { data: holds, loading: holdsLoading, refetch: refetchHolds } = useWalletHolds(organizationId);

	// For tab badge counts — TanStack Query deduplicates these with sub-page calls
	const { data: transactions } = useInfiniteWalletTransactions(organizationId);
	const { data: withdrawals } = useWithdrawals(organizationId);
	const { data: deposits } = useDeposits(organizationId);

	const { data: depositAccount, loading: depositLoading } = useVirtualAccount(organizationId);

	const canDeposit = useCan("wallet", "deposit");
	const canWithdraw = useCan("withdrawal", "create");

	const [showWithdraw, setShowWithdraw] = useState(false);
	const [showDeposit, setShowDeposit] = useState(false);

	const stats = useMemo(() => {
		const balance = wallet?.balanceDecimal || "0";
		const holdAmount = wallet?.pendingBalanceDecimal || "0";
		const available = wallet?.availableBalanceDecimal || "0";
		const creditLimit = wallet?.creditLimitDecimal || "0";
		const creditUtilized = wallet?.creditUtilizedDecimal || "0";
		const creditAvailable = Math.max(0, parseFloat(creditLimit) - parseFloat(creditUtilized));
		return { balance, holdAmount, available, creditLimit, creditUtilized, creditAvailable };
	}, [wallet]);

	const isLowBalance = parseFloat(stats.available) < 500; // < ₹500
	const loading = walletLoading || holdsLoading;

	if (loading) return <LoadingSkeleton />;
	if (walletError)
		return (
			<ErrorState
				onRetry={() => {
					refetchWallet();
					refetchHolds();
				}}
			/>
		);

	const tabs: TabNavItem[] = [
		{ label: "Transactions", to: orgPath("/wallet"), exact: true, count: transactions.length },
		{ label: "Holds", to: orgPath("/wallet/holds"), count: holds.length },
		{ label: "Withdrawals", to: orgPath("/wallet/withdrawals"), count: withdrawals.length },
		{ label: "Deposits", to: orgPath("/wallet/deposits"), count: deposits.length },
	];

	const balanceNum = parseFloat(stats.balance);
	const holdNum = parseFloat(stats.holdAmount);
	const availNum = parseFloat(stats.available);
	const holdPercent = balanceNum > 0 ? (holdNum / balanceNum) * 100 : 0;
	const availPercent = balanceNum > 0 ? (availNum / balanceNum) * 100 : 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Heading>Wallet</Heading>
					<Text className="mt-1">Manage your campaign funds and transactions</Text>
				</div>
				{(canDeposit || canWithdraw) && (
				<div className="flex items-center gap-2">
					{/* Mobile: icon-only circle buttons */}
					<div className="flex items-center gap-2 sm:hidden">
						{canDeposit && (
							<IconButton color="emerald" onClick={() => setShowDeposit(true)}>
								<ArrowDownLeftIcon className="size-5" />
							</IconButton>
						)}
						{canWithdraw && (
							<IconButton color="zinc" onClick={() => setShowWithdraw(true)}>
								<ArrowUpRightIcon className="size-5" />
							</IconButton>
						)}
					</div>
					{/* Desktop: text buttons */}
					<div className="hidden items-center gap-2 sm:flex">
						{canDeposit && (
							<Button outline onClick={() => setShowDeposit(true)}>
								<ArrowDownLeftIcon className="size-4 text-emerald-500" />
								Add Funds
							</Button>
						)}
						{canWithdraw && (
							<Button color="dark/zinc" onClick={() => setShowWithdraw(true)}>
								<ArrowUpRightIcon className="size-4" />
								Withdraw
							</Button>
						)}
					</div>
				</div>
			)}
			</div>

			{/* Balance Card */}
			<div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
				{/* Hero row — balance + bar side by side on desktop */}
				<div className="p-4 sm:p-5">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div className="min-w-0 shrink-0">
							<div className="flex items-center gap-2">
								<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Balance</p>
								{isLowBalance && (
									<span className="rounded-full bg-rose-50 px-1.5 py-px text-[10px] font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
										Low
									</span>
								)}
							</div>
							<p className="mt-0.5 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
								{formatCurrency(stats.balance)}
							</p>
						</div>

						{/* Bar breakdown — sits beside balance on desktop, below on mobile */}
						{balanceNum > 0 && (
							<div className="min-w-0 flex-1 sm:max-w-xs">
								<div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
									<div
										className="bg-emerald-500 dark:bg-emerald-400"
										style={{ width: `${availPercent}%`, minWidth: availPercent > 0 ? "3px" : 0 }}
									/>
									{holdNum > 0 && (
										<div
											className="bg-amber-400"
											style={{ width: `${holdPercent}%`, minWidth: holdPercent > 0 ? "3px" : 0 }}
										/>
									)}
								</div>
								<div className="mt-1.5 flex items-center gap-3">
									<span className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
										<span className="inline-block size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
										{Math.round(availPercent)}% available
									</span>
									{holdNum > 0 && (
										<span className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400">
											<span className="inline-block size-1.5 rounded-full bg-amber-400" />
											{Math.round(holdPercent)}% held
										</span>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Stats row — every cell same structure: label → number → optional subtext */}
				<div
					className={`grid gap-px border-t border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700 ${parseFloat(stats.creditLimit) > 0 ? "grid-cols-3" : "grid-cols-2"}`}
				>
					<div className="bg-white px-4 py-3 sm:px-5 dark:bg-zinc-900">
						<p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Available</p>
						<p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-zinc-900 sm:text-base dark:text-white">
							{formatCurrency(stats.available)}
						</p>
					</div>
					<div className="bg-white px-4 py-3 sm:px-5 dark:bg-zinc-900">
						<p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
							On Hold{holds.length > 0 ? ` (${holds.length})` : ""}
						</p>
						<p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-zinc-900 sm:text-base dark:text-white">
							{formatCurrency(stats.holdAmount)}
						</p>
					</div>
					{parseFloat(stats.creditLimit) > 0 && (
						<div className="bg-white px-4 py-3 sm:px-5 dark:bg-zinc-900">
							<p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Credit</p>
							<p className="mt-0.5 truncate text-sm font-semibold tabular-nums text-zinc-900 sm:text-base dark:text-white">
								{formatCurrency(stats.creditAvailable)}
							</p>
							<div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
								<div
									className="h-full rounded-full bg-sky-500 transition-all dark:bg-sky-400"
									style={{ width: `${Math.round((parseFloat(stats.creditUtilized) / parseFloat(stats.creditLimit)) * 100)}%` }}
								/>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* URL-based tab navigation */}
			<TabNav tabs={tabs} />

			{/* Child route renders here */}
			<Outlet />

			{/* Dialogs at layout level — accessible from any tab */}
			<DepositAccountDialog
				open={showDeposit}
				onClose={() => setShowDeposit(false)}
				account={depositAccount}
				loading={depositLoading}
			/>
			<WithdrawDialog
				open={showWithdraw}
				onClose={() => setShowWithdraw(false)}
				organizationId={organizationId || ""}
				availableBalance={availNum}
				onSuccess={() => refetchWallet()}
			/>
		</div>
	);
}
