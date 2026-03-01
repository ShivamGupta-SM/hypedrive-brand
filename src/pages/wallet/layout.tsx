import {
	ArrowPathIcon,
	ArrowUpTrayIcon,
	BanknotesIcon,
	LockClosedIcon,
	WalletIcon,
} from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { Button } from "@/components/button";
import { Heading } from "@/components/heading";
import { StatCard } from "@/components/shared/card";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";
import { Text } from "@/components/text";
import {
	useCurrentOrganization,
	useDeposits,
	useInfiniteWalletTransactions,
	useWallet,
	useWalletHolds,
	useWithdrawals,
} from "@/hooks";
import { useOrgPath } from "@/hooks/use-org-slug";
import { formatCurrency } from "@/lib/design-tokens";
import { useCan } from "@/store/permissions-store";
import { ErrorState, LoadingSkeleton, WithdrawDialog } from "./components";

export function WalletLayout() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgPath = useOrgPath();
	const canUpdateWallet = useCan("wallet", "deposit");

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

	const [showWithdraw, setShowWithdraw] = useState(false);

	const stats = useMemo(() => {
		const balance = wallet?.balance || 0;
		const holdAmount = holds.reduce((sum, h) => sum + (h.amount || 0), 0);
		const available = balance - holdAmount;
		return { balance, holdAmount, available };
	}, [wallet, holds]);

	const isLowBalance = stats.available < 50000; // < ₹500
	const loading = walletLoading || holdsLoading;

	if (loading) return <LoadingSkeleton />;
	if (walletError) return <ErrorState onRetry={() => { refetchWallet(); refetchHolds(); }} />;

	const tabs: TabNavItem[] = [
		{ label: "Overview", to: orgPath("/wallet"), exact: true },
		{ label: "Transactions", to: orgPath("/wallet/transactions"), count: transactions.length },
		{ label: "Withdrawals", to: orgPath("/wallet/withdrawals"), count: withdrawals.length },
		{ label: "Deposits", to: orgPath("/wallet/deposits"), count: deposits.length },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<Heading>Wallet</Heading>
					<Text className="mt-1">Manage your campaign funds and transactions</Text>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => { refetchWallet(); refetchHolds(); }}
						className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
					>
						<ArrowPathIcon className="size-3.5" />
						Refresh
					</button>
					{canUpdateWallet && (
						<Button outline onClick={() => setShowWithdraw(true)}>
							<ArrowUpTrayIcon className="size-4" />
							Withdraw
						</Button>
					)}
				</div>
			</div>

			{/* Balance Hero + Supporting Stats */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div
					className={`relative overflow-hidden rounded-2xl p-5 sm:col-span-1 ${
						isLowBalance
							? "bg-amber-50 ring-1 ring-inset ring-amber-200/60 dark:bg-amber-950/20 dark:ring-amber-800/40"
							: "bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg"
					}`}
				>
					<div
						className={`mb-3 flex size-10 items-center justify-center rounded-full ${
							isLowBalance ? "bg-amber-500 text-white" : "bg-white/20 text-white"
						}`}
					>
						<WalletIcon className="size-5" />
					</div>
					<div
						className={`text-2xl font-bold tracking-tight sm:text-3xl ${
							isLowBalance ? "text-amber-900 dark:text-amber-100" : "text-white"
						}`}
					>
						{formatCurrency(stats.balance)}
					</div>
					<div
						className={`mt-1 text-sm ${
							isLowBalance ? "text-amber-700 dark:text-amber-300" : "text-white/75"
						}`}
					>
						Total Balance
					</div>
					{isLowBalance && (
						<span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
							Low Balance
						</span>
					)}
					<div
						className={`pointer-events-none absolute -right-6 -top-6 size-28 rounded-full ${
							isLowBalance ? "bg-amber-200/30" : "bg-white/5"
						}`}
					/>
				</div>

				<StatCard
					icon={<BanknotesIcon className="size-5" />}
					label="Available"
					value={formatCurrency(stats.available)}
					sublabel="Ready to use"
					variant="success"
					size="sm"
					className="h-full"
				/>

				<StatCard
					icon={<LockClosedIcon className="size-5" />}
					label="On Hold"
					value={formatCurrency(stats.holdAmount)}
					sublabel={`${holds.length} active hold${holds.length !== 1 ? "s" : ""}`}
					variant={stats.holdAmount > 0 ? "warning" : "default"}
					size="sm"
					className="h-full"
				/>
			</div>

			{/* URL-based tab navigation */}
			<TabNav tabs={tabs} />

			{/* Child route renders here */}
			<Outlet />

			{/* WithdrawDialog at layout level — accessible from any tab */}
			<WithdrawDialog
				open={showWithdraw}
				onClose={() => setShowWithdraw(false)}
				organizationId={organizationId || ""}
				availableBalance={stats.available}
				onSuccess={() => refetchWallet()}
			/>
		</div>
	);
}
