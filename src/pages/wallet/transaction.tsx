import {
	ArrowDownLeftIcon,
	ArrowUpRightIcon,
	BanknotesIcon,
	CalendarIcon,
	CurrencyRupeeIcon,
	DocumentTextIcon,
	HashtagIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi } from "@tanstack/react-router";
import { useMemo } from "react";
import { Badge } from "@/components/badge";
import { ContentCard, DetailPageHeader } from "@/components/page-header";
import { CopyButton } from "@/components/shared";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";
import { useWalletTransactions } from "@/features/wallet/hooks";
import { usePageTitle } from "@/hooks/use-breadcrumb";
import { useOrgContext } from "@/hooks/use-org-context";
import { formatCurrency, formatDateTime } from "@/lib/design-tokens";

const routeApi = getRouteApi("/_app/$orgSlug/wallet_/transactions_/$id");

// =============================================================================
// TRANSACTION TYPE CONFIG
// =============================================================================

function getTransactionTypeConfig(type: string): {
	label: string;
	icon: typeof ArrowDownLeftIcon;
	color: "emerald" | "red" | "amber" | "sky" | "zinc";
	bgClass: string;
} {
	const typeMap: Record<
		string,
		{
			label: string;
			icon: typeof ArrowDownLeftIcon;
			color: "emerald" | "red" | "amber" | "sky" | "zinc";
			bgClass: string;
		}
	> = {
		credit: {
			label: "Credit",
			icon: ArrowDownLeftIcon,
			color: "emerald",
			bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
		},
		debit: {
			label: "Debit",
			icon: ArrowUpRightIcon,
			color: "red",
			bgClass: "bg-red-50 dark:bg-red-950/30",
		},
	};
	return (
		typeMap[type] || {
			label: type,
			icon: BanknotesIcon,
			color: "zinc",
			bgClass: "bg-zinc-100 dark:bg-zinc-800",
		}
	);
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
	return (
		<div className="space-y-6 animate-fade-in">
			{/* Back button */}
			<Skeleton width={120} height={36} borderRadius={8} />

			{/* Header */}
			<div className="flex items-start gap-4">
				<Skeleton width={80} height={80} borderRadius={16} />
				<div className="space-y-2">
					<Skeleton width={200} height={28} borderRadius={8} />
					<Skeleton width={150} height={20} borderRadius={6} />
					<Skeleton width={100} height={24} borderRadius={12} />
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} width="100%" height={100} borderRadius={12} />
				))}
			</div>

			{/* Details */}
			<Skeleton width="100%" height={300} borderRadius={12} />
		</div>
	);
}

// =============================================================================
// TRANSACTION SHOW PAGE
// =============================================================================

export function TransactionShow() {
	const { id: transactionId } = routeApi.useParams();
	const { organizationId, orgSlug } = useOrgContext();

	// Fetch transactions — limit to a smaller page size since we only need one
	const { data: transactions, loading, error, refetch } = useWalletTransactions(organizationId, { take: 20 });

	const transaction = useMemo(() => {
		return transactions.find((t) => t.id === transactionId) || null;
	}, [transactions, transactionId]);
	usePageTitle(transaction?.description || transaction?.type || null);

	if (loading) {
		return <LoadingSkeleton />;
	}

	if (error || !transaction) {
		return (
			<ErrorState
				title="Transaction not found"
				message="The transaction you're looking for doesn't exist or has been removed."
				onRetry={refetch}
			/>
		);
	}

	const typeConfig = getTransactionTypeConfig(transaction.type);
	const TypeIcon = typeConfig.icon;
	const isCredit = transaction.type === "credit";
	const isDebit = transaction.type === "debit";

	return (
		<div className="space-y-6">
			{/* Header */}
			<DetailPageHeader
				backHref={`/${orgSlug}/wallet`}
				backLabel="Wallet"
				icon={
					<TypeIcon
						className={`size-10 ${
							typeConfig.color === "emerald"
								? "text-emerald-500"
								: typeConfig.color === "red"
									? "text-red-500"
									: typeConfig.color === "amber"
										? "text-amber-500"
										: typeConfig.color === "sky"
											? "text-sky-500"
											: "text-zinc-500"
						}`}
					/>
				}
				iconClassName={typeConfig.bgClass}
				title={`${isCredit ? "+" : isDebit ? "-" : ""}${formatCurrency(transaction.amountDecimal)}`}
				subtitle={transaction.description || typeConfig.label}
				badges={
					<Badge color={typeConfig.color} className="inline-flex items-center gap-1">
						<TypeIcon className="size-3" />
						{typeConfig.label}
					</Badge>
				}
			/>

			{/* Stats Row */}
			<FinancialStatsGridBordered
				stats={[
					{
						name: "Amount",
						value: formatCurrency(transaction.amountDecimal),
						change: isCredit ? "credit" : isDebit ? "debit" : undefined,
						changeType: isCredit ? "positive" : isDebit ? "negative" : undefined,
					},
					{ name: "Type", value: typeConfig.label },
					{
						name: "Date",
						value: new Date(transaction.createdAt).toLocaleDateString("en-IN", {
							month: "short",
							day: "numeric",
							year: "numeric",
						}),
					},
					{
						name: "Time",
						value: new Date(transaction.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
					},
				]}
				columns={4}
			/>

			{/* Transaction Details */}
			<ContentCard>
				<div className="p-6">
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Transaction Details</h3>

					<div className="mt-6 space-y-4">
						{/* Transaction ID */}
						<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
									<HashtagIcon className="size-5 text-zinc-500" />
								</div>
								<div>
									<p className="text-sm font-medium text-zinc-900 dark:text-white">Transaction ID</p>
									<p className="text-sm text-zinc-500 dark:text-zinc-400">Unique identifier</p>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<span className="max-w-50 truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">
									{transaction.id}
								</span>
								<CopyButton value={transaction.id} label="Transaction ID" />
							</div>
						</div>

						{/* Wallet ID */}
						<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
									<BanknotesIcon className="size-5 text-zinc-500" />
								</div>
								<div>
									<p className="text-sm font-medium text-zinc-900 dark:text-white">Wallet ID</p>
									<p className="text-sm text-zinc-500 dark:text-zinc-400">Associated wallet</p>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<span className="max-w-50 truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">
									{transaction.walletId}
								</span>
								<CopyButton value={transaction.walletId} label="Wallet ID" />
							</div>
						</div>

						{/* Amount */}
						<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
							<div className="flex items-center gap-3">
								<div className={`flex size-10 items-center justify-center rounded-lg ${typeConfig.bgClass}`}>
									<CurrencyRupeeIcon
										className={`size-5 ${
											typeConfig.color === "emerald"
												? "text-emerald-500"
												: typeConfig.color === "red"
													? "text-red-500"
													: "text-amber-500"
										}`}
									/>
								</div>
								<div>
									<p className="text-sm font-medium text-zinc-900 dark:text-white">Amount</p>
									<p className="text-sm text-zinc-500 dark:text-zinc-400">INR</p>
								</div>
							</div>
							<span
								className={`text-xl font-bold ${
									isCredit
										? "text-emerald-600 dark:text-emerald-400"
										: isDebit
											? "text-red-600 dark:text-red-400"
											: "text-zinc-900 dark:text-white"
								}`}
							>
								{isCredit ? "+" : isDebit ? "-" : ""}
								{formatCurrency(transaction.amountDecimal)}
							</span>
						</div>

						{/* Reference */}
						{transaction.reference && (
							<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
								<div className="flex items-center gap-3">
									<div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-950/30">
										<DocumentTextIcon className="size-5 text-sky-500" />
									</div>
									<div>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">Reference</p>
										<p className="text-sm text-zinc-500 dark:text-zinc-400">External reference</p>
									</div>
								</div>
								<div className="flex items-center gap-1">
									<span className="max-w-50 truncate text-sm text-zinc-900 dark:text-white">
										{transaction.reference}
									</span>
									<CopyButton value={transaction.reference} label="Reference" />
								</div>
							</div>
						)}

						{/* Description */}
						<div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
									<DocumentTextIcon className="size-5 text-amber-500" />
								</div>
								<div>
									<p className="text-sm font-medium text-zinc-900 dark:text-white">Description</p>
									<p className="text-sm text-zinc-500 dark:text-zinc-400">Transaction note</p>
								</div>
							</div>
							<span className="max-w-[250px] text-right text-sm text-zinc-900 dark:text-white">
								{transaction.description || "—"}
							</span>
						</div>

						{/* Created At */}
						<div className="flex items-center justify-between pt-2">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
									<CalendarIcon className="size-5 text-zinc-500" />
								</div>
								<div>
									<p className="text-sm font-medium text-zinc-900 dark:text-white">Created</p>
									<p className="text-sm text-zinc-500 dark:text-zinc-400">{formatDateTime(transaction.createdAt)}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ContentCard>
		</div>
	);
}
