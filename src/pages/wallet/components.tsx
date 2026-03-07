/**
 * Wallet shared sub-components
 * Extracted from the wallet monolith — used across layout and sub-pages
 */

import {
	ArrowDownLeftIcon,
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
	ArrowUpRightIcon,
	BuildingLibraryIcon,
	BuildingOffice2Icon,
	ChevronDownIcon,
	ClipboardDocumentListIcon,
	CreditCardIcon,
	DocumentDuplicateIcon,
	ExclamationTriangleIcon,
	HashtagIcon,
	ShieldExclamationIcon,
	UserIcon,
} from "@heroicons/react/16/solid";
import { startAuthentication } from "@simplewebauthn/browser";
import { Link } from "@tanstack/react-router";
import clsx from "clsx";
import { useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { useCan } from "@/components/shared/can";
import { CopyButton } from "@/components/shared/copy-button";
import { Skeleton } from "@/components/skeleton";
import { Textarea } from "@/components/textarea";
import { usePasskeyReauthOptions } from "@/features/auth/hooks-passkeys";
import { useCancelWithdrawal, useCreateWithdrawal } from "@/features/wallet/mutations";
import { getFriendlyErrorMessage } from "@/hooks/api-client";
import type { brand } from "@/lib/brand-client";
import { formatCurrency, formatDateTime } from "@/lib/design-tokens";
import { showToast } from "@/lib/toast";

type WalletTransaction = brand.WalletTransaction;
type ActiveHold = brand.ActiveHold;
type VirtualAccountResponse = brand.VirtualAccountResponse;

// =============================================================================
// LOADING SKELETON
// =============================================================================

export function LoadingSkeleton() {
	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<Skeleton width={150} height={32} borderRadius={8} />
					<Skeleton width={250} height={20} borderRadius={6} />
				</div>
				<Skeleton width={140} height={40} borderRadius={8} />
			</div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Skeleton key={i} width="100%" height={120} borderRadius={12} />
				))}
			</div>
			<Skeleton width="100%" height={180} borderRadius={12} />
			<div className="space-y-3">
				<Skeleton width={200} height={24} borderRadius={8} />
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} width="100%" height={72} borderRadius={12} />
				))}
			</div>
		</div>
	);
}

// =============================================================================
// DEPOSIT ACCOUNT DIALOG
// =============================================================================

const depositFields: { key: string; label: string; icon: typeof BuildingLibraryIcon; mono: boolean }[] = [
	{ key: "bankName", label: "Bank Name", icon: BuildingLibraryIcon, mono: false },
	{ key: "accountNumber", label: "Account Number", icon: CreditCardIcon, mono: true },
	{ key: "ifscCode", label: "IFSC Code", icon: HashtagIcon, mono: true },
	{ key: "accountHolderName", label: "Account Holder", icon: UserIcon, mono: false },
	{ key: "upiId", label: "UPI ID", icon: ArrowDownLeftIcon, mono: true },
];

export function DepositAccountDialog({
	open,
	onClose,
	account,
	loading,
}: {
	open: boolean;
	onClose: () => void;
	account: VirtualAccountResponse | null;
	loading: boolean;
}) {
	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		showToast.copy(label);
	};

	const accountDetails = account?.virtualAccount;

	const details = accountDetails
		? depositFields
				.map((f) => ({ ...f, value: accountDetails[f.key as keyof typeof accountDetails] as string | undefined }))
				.filter((f) => f.key !== "upiId" || f.value)
				.map((f) => ({ ...f, value: f.value || "—" }))
		: [];

	const copyAll = () => {
		const text = details
			.filter((d) => d.value !== "—")
			.map((d) => `${d.label}: ${d.value}`)
			.join("\n");
		navigator.clipboard.writeText(text);
		showToast.copy("All details");
	};

	return (
		<Dialog open={open} onClose={onClose} size="md">
			<DialogHeader
				icon={BuildingLibraryIcon}
				iconColor="sky"
				title="Deposit Account"
				description="Transfer funds to this account to top up your wallet."
				onClose={onClose}
			/>

			<DialogBody>
				{loading ? (
					<div className="space-y-3">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} width="100%" height={48} borderRadius={8} />
						))}
					</div>
				) : !accountDetails ? (
					<div className="flex flex-col items-center py-8 text-center">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
							<BuildingOffice2Icon className="size-7 text-zinc-500 dark:text-zinc-400" />
						</div>
						<p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-white">Deposit Account Not Set Up</p>
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
							Contact support to set up your deposit account.
						</p>
					</div>
				) : (
					<div className="overflow-hidden rounded-xl shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800">
						{details.map((detail, idx) => {
							const Icon = detail.icon;
							return (
								<div
									key={detail.key}
									className={clsx(
										"group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40",
										idx > 0 && "border-t border-zinc-200 dark:border-zinc-800"
									)}
								>
									<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
										<Icon className="size-4 text-zinc-500 dark:text-zinc-400" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{detail.label}</p>
										<p
											className={clsx(
												"mt-0.5 truncate text-sm font-medium text-zinc-900 dark:text-white",
												detail.mono && "font-mono tracking-wide"
											)}
										>
											{detail.value}
										</p>
									</div>
									{detail.value !== "—" && (
										<button
											type="button"
											onClick={() => copyToClipboard(detail.value, detail.label)}
											className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-500 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
										>
											<DocumentDuplicateIcon className="size-3.5" />
										</button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</DialogBody>

			<DialogActions>
				{accountDetails && !loading && (
					<Button outline onClick={copyAll} className="mr-auto!">
						<ClipboardDocumentListIcon className="size-4" />
						Copy All
					</Button>
				)}
				<Button plain onClick={onClose}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// TRANSACTION ROW
// =============================================================================

const CATEGORY_LABELS: Record<string, string> = {
	deposit: "Deposit",
	enrollment_hold: "Campaign Payment",
	payout: "Payout",
	refund: "Refund",
	admin_credit: "Credit Adjustment",
	other: "Transaction",
};

function getTransactionLabel(transaction: WalletTransaction): string {
	// Use category-based label for cleaner display
	const categoryLabel = transaction.category ? CATEGORY_LABELS[transaction.category] : null;
	if (categoryLabel && categoryLabel !== "Transaction") return categoryLabel;
	// Fallback to description, then type
	if (transaction.description) return transaction.description;
	return transaction.type === "credit" ? "Deposit" : "Debit";
}

export function TransactionRow({
	transaction,
	orgSlug,
	onClick,
}: {
	transaction: WalletTransaction;
	orgSlug: string;
	onClick?: (transaction: WalletTransaction) => void;
}) {
	const isCredit = transaction.type === "credit";
	const label = getTransactionLabel(transaction);

	const content = (
		<>
			<div
				className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
					isCredit ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"
				}`}
			>
				{isCredit ? (
					<ArrowDownLeftIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
				) : (
					<ArrowUpRightIcon className="size-4 text-red-600 dark:text-red-400" />
				)}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
						{label}
					</p>
					<span className="shrink-0 rounded bg-zinc-100 px-1 py-px font-mono text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
						#{transaction.id.slice(-8).toUpperCase()}
					</span>
				</div>
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					{formatDateTime(transaction.createdAt)}
				</p>
			</div>
			<p
				className={`shrink-0 text-sm font-semibold tabular-nums ${
					isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
				}`}
			>
				{isCredit ? "+" : "-"}
				{formatCurrency(transaction.amountDecimal)}
			</p>
		</>
	);

	if (onClick) {
		return (
			<button
				type="button"
				onClick={() => onClick(transaction)}
				className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
			>
				{content}
			</button>
		);
	}

	return (
		<Link
			to="/$orgSlug/wallet/transactions/$id"
			params={{ orgSlug, id: transaction.id }}
			className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
		>
			{content}
		</Link>
	);
}

// =============================================================================
// HOLD ROW
// =============================================================================

export function HoldRow({ hold }: { hold: ActiveHold }) {
	return (
		<div className="flex items-center gap-3 px-4 py-3">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/30">
				<ShieldExclamationIcon className="size-4 text-amber-600 dark:text-amber-400" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
					{hold.holdType === "withdrawal"
						? `Withdrawal ${hold.withdrawalDisplayId ?? ""} — pending`
						: hold.campaignTitle || "Hold"}
				</p>
				<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
					{formatDateTime(hold.createdAt)}
					{hold.expiresAt && ` · Expires ${formatDateTime(hold.expiresAt)}`}
				</p>
			</div>
			<div className="flex shrink-0 items-center gap-2">
				<p className="text-sm font-semibold tabular-nums text-amber-600 dark:text-amber-400">
					{formatCurrency(hold.amountDecimal)}
				</p>
				<Badge color="amber">Held</Badge>
			</div>
		</div>
	);
}

// =============================================================================
// WITHDRAW DIALOG
// =============================================================================

export function WithdrawDialog({
	open,
	onClose,
	organizationId,
	availableBalance,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	organizationId: string;
	availableBalance: number;
	onSuccess: () => void;
}) {
	const [amount, setAmount] = useState("");
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);

	const createWithdrawal = useCreateWithdrawal(organizationId);
	const passkeyReauth = usePasskeyReauthOptions();

	const isPending = createWithdrawal.isPending || passkeyReauth.isPending;

	const MIN_WITHDRAWAL = 500; // ₹500 minimum for organizations
	const MAX_WITHDRAWAL = 50000; // ₹50,000 maximum

	const handleSubmit = async () => {
		setError(null);
		const amountNum = parseFloat(amount);
		if (Number.isNaN(amountNum) || amountNum <= 0) {
			setError("Please enter a valid amount");
			return;
		}
		if (amountNum < MIN_WITHDRAWAL) {
			setError(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL.toLocaleString("en-IN")}`);
			return;
		}
		if (amountNum > MAX_WITHDRAWAL) {
			setError(`Maximum withdrawal amount is ₹${MAX_WITHDRAWAL.toLocaleString("en-IN")}`);
			return;
		}
		if (amountNum > availableBalance) {
			setError("Amount exceeds available balance");
			return;
		}
		try {
			// Step 1: Get passkey challenge
			const { options, challengeId } = await passkeyReauth.mutateAsync();
			// Step 2: Prompt user for biometric/passkey
			const assertion = await startAuthentication({
				optionsJSON: options as Parameters<typeof startAuthentication>[0]["optionsJSON"],
			});
			// Step 3: Submit withdrawal with verified passkey
			await createWithdrawal.mutateAsync({
				amount: Math.round(amountNum * 100),
				notes: notes.trim() || undefined,
				passkeyResponse: assertion,
				challengeId,
			});
			showToast.success("Withdrawal request submitted");
			onSuccess();
			onClose();
			setAmount("");
			setNotes("");
		} catch (err) {
			if (err instanceof Error && err.message === "Passkey verification cancelled") {
				setError("Passkey verification was cancelled.");
			} else {
				setError(getFriendlyErrorMessage(err, "Failed to request withdrawal"));
			}
		}
	};

	return (
		<Dialog open={open} onClose={onClose} size="md">
			<DialogHeader
				icon={ArrowUpRightIcon}
				iconColor="emerald"
				title="Request Withdrawal"
				description={`Withdraw to your linked bank account. Available: ${formatCurrency(availableBalance)}`}
				onClose={onClose}
			/>

			<DialogBody>
				{error && (
					<div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
						<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
						<p className="text-sm text-red-700 dark:text-red-300">{error}</p>
					</div>
				)}

				<div className="space-y-4">
					<Field>
						<Label>Amount (₹)</Label>
						<Input
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="Enter amount"
							min="1"
							step="0.01"
						/>
					</Field>
					<Field>
						<Label>Notes (optional)</Label>
						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Add any notes..."
							rows={2}
						/>
					</Field>
				</div>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={onClose} disabled={isPending}>
					Cancel
				</Button>
				<Button color="emerald" onClick={handleSubmit} disabled={isPending || !amount}>
					{isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							{passkeyReauth.isPending ? "Verifying..." : "Submitting..."}
						</>
					) : (
						<>
							<ArrowUpRightIcon className="size-4" />
							Request Withdrawal
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// WITHDRAWAL ROW
// =============================================================================

export function WithdrawalRow({
	withdrawal,
	organizationId,
	onClick,
}: {
	withdrawal: brand.Withdrawal;
	organizationId: string | undefined;
	onClick?: () => void;
}) {
	const statusColors: Record<string, "emerald" | "amber" | "red" | "zinc"> = {
		pending: "amber",
		approved: "emerald",
		processing: "amber",
		completed: "emerald",
		rejected: "red",
		cancelled: "zinc",
	};

	const cancelWithdrawal = useCancelWithdrawal(organizationId);
	// Use server-driven allowedActions if available, fallback to permission + status check
	const canCancelWithdrawal = useCan("withdrawal", "cancel");
	const canCancel = withdrawal.allowedActions
		? withdrawal.allowedActions.includes("cancel")
		: withdrawal.status === "pending" && canCancelWithdrawal;

	const [showCancelConfirm, setShowCancelConfirm] = useState(false);

	const handleCancelClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShowCancelConfirm(true);
	};

	const handleConfirmCancel = async () => {
		try {
			await cancelWithdrawal.mutateAsync({ withdrawalId: withdrawal.id });
			showToast.success("Withdrawal request cancelled");
			setShowCancelConfirm(false);
		} catch (err) {
			showToast.error(err, "Failed to cancel withdrawal");
		}
	};

	return (
		<>
			<button
				type="button"
				className={`flex w-full items-center gap-3 px-4 py-3 text-left ${onClick ? "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50" : ""}`}
				onClick={onClick}
			>
				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
					<ArrowUpRightIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">Withdrawal</p>
						<Badge color={statusColors[withdrawal.status] || "zinc"}>{withdrawal.status}</Badge>
					</div>
					<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
						{formatDateTime(withdrawal.requestedAt)}
						<span className="ml-1.5 font-mono text-zinc-500 dark:text-zinc-400">#{withdrawal.id.slice(-8)}</span>
					</p>
				</div>
				<div className="flex shrink-0 items-center gap-2">
					<p className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-white">
						{formatCurrency(withdrawal.amountDecimal)}
					</p>
					{canCancel && (
						<Button
							plain
							onClick={handleCancelClick}
							disabled={cancelWithdrawal.isPending}
							className="text-xs text-red-500 hover:text-red-700"
						>
							{cancelWithdrawal.isPending ? "..." : "Cancel"}
						</Button>
					)}
				</div>
			</button>

			{/* Cancel Confirmation Dialog */}
			<Dialog open={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} size="sm">
				<DialogHeader
					icon={ExclamationTriangleIcon}
					iconColor="red"
					title="Cancel Withdrawal"
					description={`Cancel withdrawal of ${formatCurrency(withdrawal.amountDecimal)}?`}
					onClose={() => setShowCancelConfirm(false)}
				/>
				<DialogBody>
					<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
						<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
						<p className="text-sm text-red-700 dark:text-red-300">
							The funds will be returned to your available balance. This cannot be undone.
						</p>
					</div>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setShowCancelConfirm(false)} disabled={cancelWithdrawal.isPending}>
						Go Back
					</Button>
					<Button color="red" onClick={handleConfirmCancel} disabled={cancelWithdrawal.isPending}>
						{cancelWithdrawal.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Cancelling...
							</>
						) : (
							"Cancel Withdrawal"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

// =============================================================================
// TRANSACTION DETAIL DIALOG
// =============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: "emerald" | "amber" | "zinc" }> = {
	completed: { label: "Completed", color: "emerald" },
	pending: { label: "Pending", color: "amber" },
	voided: { label: "Voided", color: "zinc" },
};

const CATEGORY_BADGE_COLORS: Record<string, "emerald" | "amber" | "sky" | "zinc"> = {
	deposit: "emerald",
	enrollment_hold: "amber",
	payout: "sky",
	refund: "emerald",
	admin_credit: "sky",
	other: "zinc",
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex min-h-10 items-center justify-between gap-4 py-2">
			<dt className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">{label}</dt>
			<dd className="min-w-0 text-right text-sm font-medium text-zinc-900 dark:text-white">{children}</dd>
		</div>
	);
}

export function TransactionDetailDialog({
	transaction,
	orgSlug,
	onClose,
}: {
	transaction: WalletTransaction | null;
	orgSlug: string;
	onClose: () => void;
}) {
	const [showIds, setShowIds] = useState(false);

	// Reset collapsed state when a different transaction opens
	const txId = transaction?.id;
	const [prevTxId, setPrevTxId] = useState(txId);
	if (txId !== prevTxId) {
		setPrevTxId(txId);
		setShowIds(false);
	}

	// Derive display values from the current (or last-seen) transaction
	// so the dialog body stays visible during the close animation
	const isOpen = !!transaction;
	const tx = transaction;

	const isCredit = tx?.type === "credit";
	const isDebit = tx?.type === "debit";
	const sign = isCredit ? "+" : isDebit ? "-" : "";
	const statusConfig = STATUS_CONFIG[tx?.status ?? "pending"] ?? STATUS_CONFIG.pending;
	const categoryLabel = tx?.category ? CATEGORY_LABELS[tx.category] : null;
	const createdDate = tx ? new Date(tx.createdAt) : new Date();

	return (
		<Dialog open={isOpen} onClose={onClose} size="md">
			{tx && (
				<>
					<DialogHeader
						icon={isCredit ? ArrowDownLeftIcon : ArrowUpRightIcon}
						iconColor={isCredit ? "emerald" : isDebit ? "red" : "zinc"}
						title={categoryLabel && categoryLabel !== "Transaction" ? categoryLabel : isCredit ? "Credit" : "Debit"}
						description={tx.description || undefined}
						onClose={onClose}
					/>

					{/* Amount hero */}
					<div className="mt-5 flex items-center justify-between">
						<span
							className={clsx("text-2xl font-bold tracking-tight sm:text-3xl", {
								"text-emerald-600 dark:text-emerald-400": isCredit,
								"text-red-600 dark:text-red-400": isDebit,
								"text-zinc-900 dark:text-white": !isCredit && !isDebit,
							})}
						>
							{sign}{formatCurrency(tx.amountDecimal)}
						</span>
						<Badge color={statusConfig.color}>{statusConfig.label}</Badge>
					</div>

					{/* Details */}
					<DialogBody>
						<div className="divide-y divide-zinc-200 dark:divide-zinc-700/60">
							<DetailRow label="Type">
								<span className="inline-flex items-center gap-1.5">
									{isCredit ? (
										<ArrowDownLeftIcon className="size-3.5 text-emerald-500" />
									) : (
										<ArrowUpRightIcon className="size-3.5 text-red-500" />
									)}
									{isCredit ? "Credit" : "Debit"}
								</span>
							</DetailRow>

							{categoryLabel && (
								<DetailRow label="Category">
									<Badge color={CATEGORY_BADGE_COLORS[tx.category ?? "other"] ?? "zinc"}>
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

							<DetailRow label="Currency">{tx.currency}</DetailRow>

							{tx.reference && (
								<DetailRow label="Reference">
									<span className="inline-flex items-center gap-1">
										<span className="max-w-36 truncate font-mono text-xs text-zinc-700 sm:max-w-48 dark:text-zinc-300">{tx.reference}</span>
										<CopyButton value={tx.reference} label="Reference" />
									</span>
								</DetailRow>
							)}

							{tx.enrollmentId && (
								<DetailRow label="Enrollment">
									<Link
										to="/$orgSlug/enrollments/$id"
										params={{ orgSlug, id: tx.enrollmentId }}
										className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
										onClick={onClose}
									>
										<span className="rounded bg-sky-50 px-1 py-px font-mono text-[10px] font-medium text-sky-600 dark:bg-sky-950/30 dark:text-sky-400">
											#{tx.enrollmentId.slice(-6).toUpperCase()}
										</span>
										View
										<ArrowTopRightOnSquareIcon className="size-3" />
									</Link>
								</DetailRow>
							)}
						</div>

						{/* Technical IDs — collapsible */}
						<button
							type="button"
							onClick={() => setShowIds(!showIds)}
							className="mt-3 flex w-full items-center justify-center gap-1 border-t border-zinc-200 pt-2.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:border-zinc-700/60 dark:text-zinc-400 dark:hover:text-zinc-200"
						>
							{showIds ? "Hide" : "Show"} technical details
							<ChevronDownIcon className={clsx("size-3.5 transition-transform", showIds && "rotate-180")} />
						</button>

						{showIds && (
							<div className="mt-2 space-y-2 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
								<div className="flex items-center justify-between">
									<span className="text-xs text-zinc-500 dark:text-zinc-400">Transaction ID</span>
									<span className="inline-flex items-center gap-1">
										<code className="max-w-40 truncate text-xs text-zinc-700 sm:max-w-56 dark:text-zinc-300">
											{tx.id}
										</code>
										<CopyButton value={tx.id} label="Transaction ID" />
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-xs text-zinc-500 dark:text-zinc-400">Wallet ID</span>
									<span className="inline-flex items-center gap-1">
										<code className="max-w-40 truncate text-xs text-zinc-700 sm:max-w-56 dark:text-zinc-300">
											{tx.walletId}
										</code>
										<CopyButton value={tx.walletId} label="Wallet ID" />
									</span>
								</div>
							</div>
						)}
					</DialogBody>

					<DialogActions>
						<Button plain onClick={onClose}>Close</Button>
					</DialogActions>
				</>
			)}
		</Dialog>
	);
}

// =============================================================================
// DEPOSIT ROW
// =============================================================================

export function DepositRow({ deposit }: { deposit: brand.DepositTransaction }) {
	return (
		<div className="flex items-center gap-3 px-4 py-3">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
				<ArrowDownLeftIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="text-sm font-medium text-zinc-900 dark:text-white">Deposit</p>
					<Badge color={deposit.status === "completed" ? "emerald" : "amber"}>{deposit.status}</Badge>
				</div>
				<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
					{formatDateTime(deposit.createdAt)}
					<span className="ml-1.5 font-mono text-zinc-500 dark:text-zinc-400">#{deposit.id.slice(-8)}</span>
				</p>
			</div>
			<p className="shrink-0 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
				+{formatCurrency(deposit.amountDecimal)}
			</p>
		</div>
	);
}
