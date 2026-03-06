import {
	ArrowDownLeftIcon,
	ArrowTopRightOnSquareIcon,
	ArrowUpRightIcon,
	BanknotesIcon,
	CalendarIcon,
	ClockIcon,
	CurrencyRupeeIcon,
	DocumentTextIcon,
	HashtagIcon,
	TagIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi, Link } from "@tanstack/react-router";
import clsx from "clsx";
import { Badge } from "@/components/badge";
import { ContentCard } from "@/components/page-header";
import { CopyButton } from "@/components/shared/copy-button";
import { ErrorState } from "@/components/shared/error-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";
import { useWalletTransaction } from "@/features/wallet/hooks";
import { usePageTitle } from "@/hooks/use-breadcrumb";
import { useOrgContext } from "@/hooks/use-org-context";
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/design-tokens";

const routeApi = getRouteApi("/_app/$orgSlug/wallet_/transactions_/$id");

// =============================================================================
// TRANSACTION TYPE CONFIG
// =============================================================================

function getTransactionTypeConfig(type: string) {
	const typeMap: Record<
		string,
		{
			label: string;
			icon: typeof ArrowDownLeftIcon;
			color: "emerald" | "red" | "zinc";
			bgClass: string;
			iconColor: string;
			gradientClass: string;
		}
	> = {
		credit: {
			label: "Credit",
			icon: ArrowDownLeftIcon,
			color: "emerald",
			bgClass: "bg-emerald-500 dark:bg-emerald-600",
			iconColor: "text-white",
			gradientClass: "from-emerald-500/20 via-emerald-500/5 to-transparent dark:from-emerald-500/15 dark:via-emerald-500/5",
		},
		debit: {
			label: "Debit",
			icon: ArrowUpRightIcon,
			color: "red",
			bgClass: "bg-red-500 dark:bg-red-600",
			iconColor: "text-white",
			gradientClass: "from-red-500/20 via-red-500/5 to-transparent dark:from-red-500/15 dark:via-red-500/5",
		},
	};
	return (
		typeMap[type] || {
			label: type,
			icon: BanknotesIcon,
			color: "zinc" as const,
			bgClass: "bg-zinc-500 dark:bg-zinc-600",
			iconColor: "text-white",
			gradientClass: "from-zinc-500/15 via-zinc-500/5 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5",
		}
	);
}

// =============================================================================
// CATEGORY & STATUS CONFIG
// =============================================================================

const CATEGORY_CONFIG: Record<string, { label: string; color: "emerald" | "amber" | "red" | "sky" | "zinc" }> = {
	deposit: { label: "Deposit", color: "emerald" },
	enrollment_hold: { label: "Enrollment Hold", color: "amber" },
	payout: { label: "Payout", color: "sky" },
	refund: { label: "Refund", color: "emerald" },
	admin_credit: { label: "Admin Credit", color: "sky" },
	other: { label: "Other", color: "zinc" },
};

const STATUS_CONFIG: Record<string, { label: string; color: "emerald" | "amber" | "zinc" }> = {
	completed: { label: "Completed", color: "emerald" },
	pending: { label: "Pending", color: "amber" },
	voided: { label: "Voided", color: "zinc" },
};

// =============================================================================
// COLOR HELPERS
// =============================================================================

const COLOR_BG: Record<string, string> = {
	emerald: "bg-emerald-50 dark:bg-emerald-950/30",
	amber: "bg-amber-50 dark:bg-amber-950/30",
	sky: "bg-sky-50 dark:bg-sky-950/30",
	red: "bg-red-50 dark:bg-red-950/30",
	zinc: "bg-zinc-100 dark:bg-zinc-800",
};

const COLOR_TEXT: Record<string, string> = {
	emerald: "text-emerald-500",
	amber: "text-amber-500",
	sky: "text-sky-500",
	red: "text-red-500",
	zinc: "text-zinc-500 dark:text-zinc-400",
};

// =============================================================================
// INFO ROW
// =============================================================================

function InfoRow({
	icon,
	iconBgClass,
	iconColorClass,
	label,
	sublabel,
	value,
	copyValue,
	isLast = false,
}: {
	icon: React.ReactNode;
	iconBgClass?: string;
	iconColorClass?: string;
	label: string;
	sublabel?: string;
	value: React.ReactNode;
	copyValue?: string;
	isLast?: boolean;
}) {
	return (
		<div
			className={clsx(
				"flex items-center justify-between gap-3 sm:gap-4",
				!isLast && "border-b border-zinc-200 pb-3 sm:pb-4 dark:border-zinc-800"
			)}
		>
			<div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
				<div
					className={clsx(
						"flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10",
						iconBgClass || "bg-zinc-100 dark:bg-zinc-800"
					)}
				>
					<span className={clsx("size-4 sm:size-5", iconColorClass || "text-zinc-500 dark:text-zinc-400")}>{icon}</span>
				</div>
				<div className="min-w-0">
					<p className="text-xs font-medium text-zinc-900 sm:text-sm dark:text-white">{label}</p>
					{sublabel && (
						<p className="truncate text-[11px] text-zinc-500 sm:text-sm dark:text-zinc-400">
							{sublabel}
						</p>
					)}
				</div>
			</div>
			<div className="flex shrink-0 items-center gap-1">
				{typeof value === "string" ? (
					<span className="max-w-32 truncate text-xs font-medium text-zinc-900 sm:max-w-50 sm:text-sm dark:text-white">
						{value}
					</span>
				) : (
					value
				)}
				{copyValue && <CopyButton value={copyValue} label={label} />}
			</div>
		</div>
	);
}

// =============================================================================
// SECTION CARD HEADER
// =============================================================================

function SectionHeader({
	icon,
	iconBg,
	iconColor,
	title,
}: {
	icon: React.ReactNode;
	iconBg: string;
	iconColor: string;
	title: string;
}) {
	return (
		<div className="flex items-center gap-2 border-b border-zinc-200 px-3.5 py-2.5 sm:gap-2.5 sm:px-5 sm:py-3 dark:border-zinc-800">
			<div className={clsx("flex size-5 items-center justify-center rounded-md sm:size-6", iconBg)}>
				<span className={clsx("size-3 sm:size-3.5", iconColor)}>{icon}</span>
			</div>
			<h3 className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-white">{title}</h3>
		</div>
	);
}

// =============================================================================
// QUICK DETAIL ITEM (hero card grid)
// =============================================================================

function QuickDetail({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div>
			<dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 sm:text-[11px] dark:text-zinc-400">
				{label}
			</dt>
			<dd className="mt-0.5 text-xs text-zinc-900 sm:text-sm dark:text-white">{children}</dd>
		</div>
	);
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function LoadingSkeleton() {
	return (
		<div className="animate-fade-in space-y-4 sm:space-y-5">
			{/* Hero card skeleton */}
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="space-y-2.5 p-4 sm:space-y-3 sm:p-6">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<Skeleton width={40} height={40} borderRadius={12} className="sm:h-12! sm:w-12!" />
							<Skeleton width={160} height={28} borderRadius={8} />
						</div>
						<Skeleton width={70} height={22} borderRadius={8} />
					</div>
					<Skeleton width={130} height={14} borderRadius={6} />
					<div className="flex gap-1 sm:gap-1.5">
						<Skeleton width={55} height={20} borderRadius={12} />
						<Skeleton width={65} height={20} borderRadius={12} />
						<Skeleton width={80} height={20} borderRadius={12} />
					</div>
					<div className="grid grid-cols-2 gap-2.5 border-t border-zinc-200 pt-3 sm:gap-3 sm:pt-4 dark:border-zinc-800">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="space-y-1">
								<Skeleton width={45} height={9} borderRadius={4} />
								<Skeleton width={70} height={14} borderRadius={6} />
							</div>
						))}
					</div>
				</div>
			</div>
			{/* Stats skeleton */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Amount", value: "" },
					{ name: "Status", value: "" },
					{ name: "Category", value: "" },
					{ name: "Date", value: "" },
				]}
				loading
				columns={4}
			/>
			{/* Grid skeleton */}
			<div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<Skeleton width="100%" height={340} borderRadius={12} />
				</div>
				<Skeleton width="100%" height={340} borderRadius={12} />
			</div>
		</div>
	);
}

// =============================================================================
// TRANSACTION SHOW PAGE
// =============================================================================

export function TransactionShow() {
	const { id: transactionId } = routeApi.useParams();
	const { organizationId, orgSlug } = useOrgContext();

	const { data: transaction, loading, error, refetch } = useWalletTransaction(organizationId, transactionId);
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
	const categoryConfig = transaction.category ? CATEGORY_CONFIG[transaction.category] : null;
	const statusConfig = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.pending;
	const createdDate = new Date(transaction.createdAt);

	const amountSign = isCredit ? "+" : isDebit ? "-" : "";

	return (
		<div className="space-y-4 sm:space-y-5">
			{/* Hero Card */}
			<div className="relative overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className={clsx("pointer-events-none absolute inset-px top-px h-24 rounded-t-[11px] bg-linear-to-b sm:h-32", typeConfig.gradientClass)} />
				<div className="relative space-y-2.5 p-4 sm:space-y-3 sm:p-6">
					{/* Amount + Icon + ID */}
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3">
							<div
								className={clsx(
									"flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12",
									typeConfig.bgClass
								)}
							>
								<TypeIcon className={clsx("size-5 sm:size-6", typeConfig.iconColor)} />
							</div>
							<h1
								className={clsx("text-xl font-bold tracking-tight sm:text-3xl", {
									"text-emerald-600 dark:text-emerald-400": isCredit,
									"text-red-600 dark:text-red-400": isDebit,
									"text-zinc-900 dark:text-white": !isCredit && !isDebit,
								})}
							>
								{amountSign}
								{formatCurrency(transaction.amountDecimal)}
							</h1>
						</div>
						<span className="inline-flex shrink-0 items-center gap-0.5 rounded-md bg-zinc-900 py-px pr-0.5 pl-1.5 font-mono text-[10px] font-bold leading-none text-zinc-100 sm:text-[11px] dark:bg-zinc-100 dark:text-zinc-900">
							#{transaction.id.slice(-8).toUpperCase()}
							<CopyButton value={transaction.id} label="Transaction ID" className="p-0.5! text-zinc-400! hover:text-zinc-200! hover:bg-transparent! dark:text-zinc-500! dark:hover:text-zinc-700!" />
						</span>
					</div>

					{/* Description */}
					{transaction.description && (
						<p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">{transaction.description}</p>
					)}

					{/* Badges */}
					<div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
						<Badge color={typeConfig.color} className="inline-flex items-center gap-1">
							<TypeIcon className="size-3" />
							{typeConfig.label}
						</Badge>
						<Badge color={statusConfig.color}>{statusConfig.label}</Badge>
						{categoryConfig && <Badge color={categoryConfig.color}>{categoryConfig.label}</Badge>}
						<Badge color="zinc">{transaction.currency}</Badge>
					</div>

					{/* Quick details grid */}
					<dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-zinc-200 pt-3 sm:gap-x-4 sm:gap-y-2.5 sm:pt-4 dark:border-zinc-800">
						<QuickDetail label="Date">
							{createdDate.toLocaleDateString("en-IN", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</QuickDetail>
						<QuickDetail label="Time">
							{createdDate.toLocaleTimeString("en-IN", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</QuickDetail>
						<QuickDetail label="Reference">
							<span className="flex items-center gap-1">
								<span className="truncate font-mono">{transaction.reference || "—"}</span>
								{transaction.reference && <CopyButton value={transaction.reference} label="Reference" />}
							</span>
						</QuickDetail>
						{transaction.enrollmentId && (
							<QuickDetail label="Enrollment">
								<Link
									to="/$orgSlug/enrollments/$id"
									params={{ orgSlug, id: transaction.enrollmentId }}
									className="inline-flex items-center gap-1 font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
								>
									View
									<ArrowTopRightOnSquareIcon className="size-3" />
								</Link>
							</QuickDetail>
						)}
					</dl>
				</div>
			</div>

			{/* Stats Row */}
			<FinancialStatsGridBordered
				stats={[
					{
						name: "Amount",
						value: formatCurrency(transaction.amountDecimal),
						change: isCredit ? "credit" : isDebit ? "debit" : undefined,
						changeType: isCredit ? "positive" : isDebit ? "negative" : undefined,
					},
					{ name: "Status", value: statusConfig.label },
					{ name: "Category", value: categoryConfig?.label || "—" },
					{
						name: "Date",
						value: createdDate.toLocaleDateString("en-IN", {
							month: "short",
							day: "numeric",
							year: "numeric",
						}),
					},
				]}
				columns={4}
			/>

			{/* Content Grid */}
			<div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
				{/* Left Column — Transaction Details */}
				<ContentCard padding="none" className="lg:col-span-2">
					<SectionHeader
						icon={<BanknotesIcon />}
						iconBg="bg-sky-50 dark:bg-sky-900/30"
						iconColor="text-sky-500"
						title="Transaction Details"
					/>
					<div className="space-y-3 p-3.5 sm:space-y-4 sm:p-5">
						<InfoRow
							icon={<CurrencyRupeeIcon />}
							iconBgClass={typeConfig.bgClass}
							iconColorClass={typeConfig.iconColor}
							label="Amount"
							sublabel={transaction.currency}
							value={
								<span
									className={clsx("text-base font-bold sm:text-lg", {
										"text-emerald-600 dark:text-emerald-400": isCredit,
										"text-red-600 dark:text-red-400": isDebit,
										"text-zinc-900 dark:text-white": !isCredit && !isDebit,
									})}
								>
									{amountSign}
									{formatCurrency(transaction.amountDecimal)}
								</span>
							}
						/>
						<InfoRow
							icon={<HashtagIcon />}
							label="Transaction ID"
							sublabel="Unique identifier"
							value={
								<span className="max-w-28 truncate font-mono text-xs text-zinc-600 sm:max-w-45 dark:text-zinc-400">
									{transaction.id}
								</span>
							}
							copyValue={transaction.id}
						/>
						<InfoRow
							icon={<BanknotesIcon />}
							label="Wallet ID"
							sublabel="Associated wallet"
							value={
								<span className="max-w-28 truncate font-mono text-xs text-zinc-600 sm:max-w-45 dark:text-zinc-400">
									{transaction.walletId}
								</span>
							}
							copyValue={transaction.walletId}
						/>
						{transaction.reference && (
							<InfoRow
								icon={<DocumentTextIcon />}
								iconBgClass="bg-sky-50 dark:bg-sky-950/30"
								iconColorClass="text-sky-500"
								label="Reference"
								sublabel="External reference"
								value={
									<span className="max-w-28 truncate text-xs font-medium text-zinc-900 sm:max-w-45 sm:text-sm dark:text-white">
										{transaction.reference}
									</span>
								}
								copyValue={transaction.reference}
							/>
						)}
						<InfoRow
							icon={<DocumentTextIcon />}
							iconBgClass="bg-amber-50 dark:bg-amber-950/30"
							iconColorClass="text-amber-500"
							label="Description"
							sublabel="Transaction note"
							value={transaction.description || "—"}
							isLast={!transaction.enrollmentId}
						/>
						{transaction.enrollmentId && (
							<InfoRow
								icon={<ArrowTopRightOnSquareIcon />}
								iconBgClass="bg-sky-50 dark:bg-sky-950/30"
								iconColorClass="text-sky-500"
								label="Enrollment"
								sublabel="Linked enrollment"
								value={
									<Link
										to="/$orgSlug/enrollments/$id"
										params={{ orgSlug, id: transaction.enrollmentId }}
										className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 sm:text-sm dark:text-sky-400 dark:hover:text-sky-300"
									>
										View Enrollment
										<ArrowTopRightOnSquareIcon className="size-3.5" />
									</Link>
								}
								isLast
							/>
						)}
					</div>
				</ContentCard>

				{/* Right Column — Metadata & Timeline */}
				<ContentCard padding="none">
					<SectionHeader
						icon={<TagIcon />}
						iconBg="bg-violet-50 dark:bg-violet-900/30"
						iconColor="text-violet-500"
						title="Metadata"
					/>
					<div className="space-y-3 p-3.5 sm:space-y-4 sm:p-5">
						<InfoRow
							icon={<TagIcon />}
							iconBgClass={typeConfig.bgClass}
							iconColorClass={typeConfig.iconColor}
							label="Type"
							value={<Badge color={typeConfig.color}>{typeConfig.label}</Badge>}
						/>
						<InfoRow
							icon={<ClockIcon />}
							iconBgClass={COLOR_BG[statusConfig.color] || COLOR_BG.zinc}
							iconColorClass={COLOR_TEXT[statusConfig.color] || COLOR_TEXT.zinc}
							label="Status"
							value={<Badge color={statusConfig.color}>{statusConfig.label}</Badge>}
						/>
						{categoryConfig && (
							<InfoRow
								icon={<TagIcon />}
								iconBgClass={COLOR_BG[categoryConfig.color] || COLOR_BG.zinc}
								iconColorClass={COLOR_TEXT[categoryConfig.color] || COLOR_TEXT.zinc}
								label="Category"
								value={<Badge color={categoryConfig.color}>{categoryConfig.label}</Badge>}
							/>
						)}
						<InfoRow
							icon={<CurrencyRupeeIcon />}
							iconBgClass="bg-emerald-50 dark:bg-emerald-950/30"
							iconColorClass="text-emerald-500"
							label="Currency"
							value={transaction.currency}
						/>
						<InfoRow
							icon={<CalendarIcon />}
							iconBgClass="bg-sky-50 dark:bg-sky-950/30"
							iconColorClass="text-sky-500"
							label="Created"
							sublabel={formatRelativeTime(transaction.createdAt)}
							value={
								<span className="text-right text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">
									{formatDateTime(transaction.createdAt)}
								</span>
							}
							isLast
						/>
					</div>
				</ContentCard>
			</div>
		</div>
	);
}
