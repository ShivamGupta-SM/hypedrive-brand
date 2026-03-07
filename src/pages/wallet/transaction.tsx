import {
	ArrowDownLeftIcon,
	ArrowTopRightOnSquareIcon,
	ArrowUpRightIcon,
	BanknotesIcon,
	ChevronDownIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi, Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useState } from "react";
import { Badge } from "@/components/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/skeleton";
import { useWalletTransaction } from "@/features/wallet/hooks";
import { usePageTitle } from "@/hooks/use-breadcrumb";
import { useOrgContext } from "@/hooks/use-org-context";
import { formatCurrency, formatRelativeTime } from "@/lib/design-tokens";

const routeApi = getRouteApi("/_app/$orgSlug/wallet_/transactions_/$id");

// =============================================================================
// CONFIG
// =============================================================================

const TYPE_CONFIG = {
	credit: { label: "Credit", icon: ArrowDownLeftIcon, color: "emerald" as const, sign: "+" },
	debit: { label: "Debit", icon: ArrowUpRightIcon, color: "red" as const, sign: "-" },
} as const;

const CATEGORY_LABELS: Record<string, string> = {
	deposit: "Deposit",
	enrollment_hold: "Campaign Payment",
	payout: "Payout",
	refund: "Refund",
	admin_credit: "Credit Adjustment",
	other: "Other",
};

const STATUS_CONFIG: Record<string, { label: string; color: "emerald" | "amber" | "zinc" }> = {
	completed: { label: "Completed", color: "emerald" },
	pending: { label: "Pending", color: "amber" },
	voided: { label: "Voided", color: "zinc" },
};

// =============================================================================
// DETAIL ROW
// =============================================================================

function DetailRow({
	label,
	children,
	muted = false,
}: {
	label: string;
	children: React.ReactNode;
	muted?: boolean;
}) {
	return (
		<div className="flex items-baseline justify-between gap-4 py-2.5 sm:py-3">
			<dt className="shrink-0 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">{label}</dt>
			<dd
				className={clsx(
					"min-w-0 text-right text-xs font-medium sm:text-sm",
					muted ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-white",
				)}
			>
				{children}
			</dd>
		</div>
	);
}

// =============================================================================
// LOADING
// =============================================================================

function LoadingSkeleton() {
	return (
		<div className="mx-auto max-w-2xl animate-fade-in space-y-4">
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="space-y-3 p-5 sm:p-6">
					<div className="flex items-center justify-between">
						<Skeleton width={200} height={36} borderRadius={8} />
						<Skeleton width={80} height={24} borderRadius={12} />
					</div>
					<Skeleton width={140} height={16} borderRadius={6} />
				</div>
				<div className="border-t border-zinc-200 dark:border-zinc-800">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="flex items-center justify-between px-5 py-3 sm:px-6">
							<Skeleton width={80} height={14} borderRadius={4} />
							<Skeleton width={120} height={14} borderRadius={4} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// TRANSACTION SHOW
// =============================================================================

export function TransactionShow() {
	const { id: transactionId } = routeApi.useParams();
	const { organizationId, orgSlug } = useOrgContext();
	const [showIds, setShowIds] = useState(false);

	const { data: transaction, loading, error, refetch } = useWalletTransaction(organizationId, transactionId);
	usePageTitle(transaction?.description || transaction?.type || null);

	if (loading) return <LoadingSkeleton />;

	if (error || !transaction) {
		return (
			<ErrorState
				title="Transaction not found"
				message="The transaction you're looking for doesn't exist or has been removed."
				onRetry={refetch}
			/>
		);
	}

	const type = TYPE_CONFIG[transaction.type as keyof typeof TYPE_CONFIG];
	const TypeIcon = type?.icon ?? BanknotesIcon;
	const color = type?.color ?? ("zinc" as const);
	const sign = type?.sign ?? "";
	const isCredit = transaction.type === "credit";
	const isDebit = transaction.type === "debit";

	const statusConfig = STATUS_CONFIG[transaction.status] ?? STATUS_CONFIG.pending;
	const categoryLabel = transaction.category ? CATEGORY_LABELS[transaction.category] : null;
	const createdDate = new Date(transaction.createdAt);

	return (
		<div className="mx-auto max-w-2xl">
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				{/* Header */}
				<div className="space-y-3 p-5 sm:p-6">
					{/* Amount row */}
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div
								className={clsx("flex size-10 items-center justify-center rounded-xl sm:size-11", {
									"bg-emerald-100 dark:bg-emerald-900/40": isCredit,
									"bg-red-100 dark:bg-red-900/40": isDebit,
									"bg-zinc-100 dark:bg-zinc-800": !isCredit && !isDebit,
								})}
							>
								<TypeIcon
									className={clsx("size-5 sm:size-5.5", {
										"text-emerald-600 dark:text-emerald-400": isCredit,
										"text-red-600 dark:text-red-400": isDebit,
										"text-zinc-500": !isCredit && !isDebit,
									})}
								/>
							</div>
							<div>
								<h1
									className={clsx("text-2xl font-bold tracking-tight sm:text-3xl", {
										"text-emerald-600 dark:text-emerald-400": isCredit,
										"text-red-600 dark:text-red-400": isDebit,
										"text-zinc-900 dark:text-white": !isCredit && !isDebit,
									})}
								>
									{sign}
									{formatCurrency(transaction.amountDecimal)}
								</h1>
								{categoryLabel && categoryLabel !== "Other" && (
									<p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">{categoryLabel}</p>
								)}
							</div>
						</div>
						<Badge color={statusConfig.color}>{statusConfig.label}</Badge>
					</div>

					{/* Short ID */}
					<div className="flex items-center gap-1.5">
						<span className="inline-flex items-center gap-0.5 rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-zinc-600 sm:text-[11px] dark:bg-zinc-800 dark:text-zinc-400">
							#{transaction.id.slice(-8).toUpperCase()}
						</span>
						<CopyButton value={transaction.id} label="Transaction ID" />
						<span className="text-[10px] text-zinc-400 sm:text-[11px] dark:text-zinc-500">
							{formatRelativeTime(transaction.createdAt)}
						</span>
					</div>
				</div>

				{/* Details */}
				<div className="divide-y divide-zinc-100 border-t border-zinc-200 px-5 sm:px-6 dark:divide-zinc-800/60 dark:border-zinc-800">
					{transaction.description && (
						<DetailRow label="Description">{transaction.description}</DetailRow>
					)}

					<DetailRow label="Type">
						<span className="inline-flex items-center gap-1">
							<TypeIcon className={clsx("size-3.5", `text-${color}-500`)} />
							{type?.label ?? transaction.type}
						</span>
					</DetailRow>

					{categoryLabel && (
						<DetailRow label="Category">
							<Badge color={transaction.category === "deposit" || transaction.category === "refund" ? "emerald" : transaction.category === "enrollment_hold" ? "amber" : transaction.category === "payout" || transaction.category === "admin_credit" ? "sky" : "zinc"}>
								{categoryLabel}
							</Badge>
						</DetailRow>
					)}

					<DetailRow label="Date">
						{createdDate.toLocaleDateString("en-IN", {
							weekday: "short",
							day: "numeric",
							month: "short",
							year: "numeric",
						})}
						{" at "}
						{createdDate.toLocaleTimeString("en-IN", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</DetailRow>

					<DetailRow label="Currency">{transaction.currency}</DetailRow>

					{transaction.reference && (
						<DetailRow label="Reference">
							<span className="inline-flex items-center gap-1">
								<span className="max-w-40 truncate font-mono text-[11px] sm:max-w-56">{transaction.reference}</span>
								<CopyButton value={transaction.reference} label="Reference" />
							</span>
						</DetailRow>
					)}

					{transaction.enrollmentId && (
						<DetailRow label="Enrollment">
							<Link
								to="/$orgSlug/enrollments/$id"
								params={{ orgSlug, id: transaction.enrollmentId }}
								className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
							>
								View Enrollment
								<ArrowTopRightOnSquareIcon className="size-3.5" />
							</Link>
						</DetailRow>
					)}
				</div>

				{/* Technical IDs — collapsible */}
				<div className="border-t border-zinc-200 dark:border-zinc-800">
					<button
						type="button"
						onClick={() => setShowIds(!showIds)}
						className="flex w-full items-center justify-center gap-1 px-5 py-2.5 text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-600 sm:text-xs dark:text-zinc-500 dark:hover:text-zinc-300"
					>
						{showIds ? "Hide" : "Show"} technical details
						<ChevronDownIcon className={clsx("size-3.5 transition-transform", showIds && "rotate-180")} />
					</button>

					{showIds && (
						<div className="space-y-0 border-t border-zinc-100 px-5 pb-4 sm:px-6 dark:border-zinc-800/60">
							<div className="flex items-center justify-between py-2">
								<span className="text-[11px] text-zinc-400 sm:text-xs dark:text-zinc-500">Transaction ID</span>
								<span className="inline-flex items-center gap-1">
									<code className="max-w-44 truncate text-[11px] text-zinc-500 sm:max-w-64 sm:text-xs dark:text-zinc-400">
										{transaction.id}
									</code>
									<CopyButton value={transaction.id} label="Transaction ID" />
								</span>
							</div>
							<div className="flex items-center justify-between py-2">
								<span className="text-[11px] text-zinc-400 sm:text-xs dark:text-zinc-500">Wallet ID</span>
								<span className="inline-flex items-center gap-1">
									<code className="max-w-44 truncate text-[11px] text-zinc-500 sm:max-w-64 sm:text-xs dark:text-zinc-400">
										{transaction.walletId}
									</code>
									<CopyButton value={transaction.walletId} label="Wallet ID" />
								</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
