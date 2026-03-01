/**
 * Wallet shared sub-components
 * Extracted from the wallet monolith — used across layout and sub-pages
 */

import {
	ArrowDownTrayIcon,
	ArrowPathIcon,
	ArrowUpTrayIcon,
	BuildingLibraryIcon,
	ClipboardDocumentIcon,
	ExclamationTriangleIcon,
	LockClosedIcon,
} from "@heroicons/react/16/solid";
import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { showToast } from "@/lib/toast";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import {
	Dialog,
	DialogActions,
	DialogBody,
	DialogDescription,
	DialogTitle,
} from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Card } from "@/components/shared/card";
import { Skeleton } from "@/components/skeleton";
import { Textarea } from "@/components/textarea";
import {
	getAPIErrorMessage,
	useCancelWithdrawal,
	useCreateWithdrawal,
	usePasskeyReauthOptions,
} from "@/hooks";
import type { brand } from "@/lib/brand-client";
import { formatCurrency, formatDateTime } from "@/lib/design-tokens";

type WalletTransaction = brand.WalletTransaction;
type ActiveHold = brand.ActiveHold;
type VirtualAccountResponse = brand.VirtualAccountResponse;

// =============================================================================
// ERROR STATE
// =============================================================================

export function ErrorState({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
				<ExclamationTriangleIcon className="size-8 text-red-400" />
			</div>
			<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
				Something went wrong
			</p>
			<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
				Failed to load wallet. Please try again.
			</p>
			<Button className="mt-6" onClick={onRetry} color="dark/zinc">
				<ArrowPathIcon className="size-4" />
				Try Again
			</Button>
		</div>
	);
}

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
// DEPOSIT ACCOUNT CARD
// =============================================================================

export function DepositAccountCard({
	account,
	loading,
}: {
	account: VirtualAccountResponse | null;
	loading: boolean;
}) {
	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		showToast.copy(label);
	};

	if (loading) {
		return (
			<Card padding="lg">
				<div className="space-y-4">
					<Skeleton width={200} height={24} />
					<div className="space-y-3">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} width="100%" height={48} borderRadius={8} />
						))}
					</div>
				</div>
			</Card>
		);
	}

	if (!account || !account.virtualAccount) {
		return (
			<Card padding="lg">
				<div className="flex items-center gap-4">
					<div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30">
						<BuildingLibraryIcon className="size-6 text-amber-500" />
					</div>
					<div>
						<h3 className="font-semibold text-zinc-900 dark:text-white">
							Deposit Account Not Set Up
						</h3>
						<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
							Contact support to set up your deposit account for receiving funds.
						</p>
					</div>
				</div>
			</Card>
		);
	}

	const accountDetails = account.virtualAccount;
	const details = [
		{ label: "Bank Name", value: accountDetails.bankName },
		{ label: "Account Number", value: accountDetails.accountNumber },
		{ label: "IFSC Code", value: accountDetails.ifscCode },
		{ label: "Account Holder", value: accountDetails.accountHolderName },
		{ label: "UPI ID", value: accountDetails.upiId },
	].filter((d) => d.value);

	return (
		<Card padding="lg">
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-4">
					<div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
						<BuildingLibraryIcon className="size-6 text-emerald-500" />
					</div>
					<div>
						<h3 className="font-semibold text-zinc-900 dark:text-white">Deposit Account</h3>
						<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
							Transfer funds to this account to top up your wallet
						</p>
					</div>
				</div>
			</div>

			<div className="mt-6 grid gap-3 sm:grid-cols-2">
				{details.map((detail) => (
					<div
						key={detail.label}
						className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50"
					>
						<div>
							<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{detail.label}</p>
							<p className="mt-0.5 font-mono text-sm text-zinc-900 dark:text-white">
								{detail.value}
							</p>
						</div>
						<button
							type="button"
							onClick={() => copyToClipboard(detail.value || "", detail.label)}
							className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
						>
							<ClipboardDocumentIcon className="size-4" />
						</button>
					</div>
				))}
			</div>
		</Card>
	);
}

// =============================================================================
// TRANSACTION ROW
// =============================================================================

export function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
	const isCredit = transaction.type === "credit";

	return (
		<div className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="flex items-center gap-4">
				<div
					className={`flex size-10 items-center justify-center rounded-xl ${
						isCredit ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30"
					}`}
				>
					{isCredit ? (
						<ArrowDownTrayIcon className="size-5 text-emerald-500" />
					) : (
						<ArrowUpTrayIcon className="size-5 text-red-500" />
					)}
				</div>
				<div>
					<p className="font-medium text-zinc-900 dark:text-white">
						{transaction.description || (isCredit ? "Deposit" : "Debit")}
					</p>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						{formatDateTime(transaction.createdAt)}
					</p>
				</div>
			</div>

			<div className="text-right">
				<p
					className={`font-semibold ${
						isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
					}`}
				>
					{isCredit ? "+" : "-"}
					{formatCurrency(transaction.amount)}
				</p>
				{transaction.reference && (
					<p className="text-xs text-zinc-400 dark:text-zinc-500">Ref: {transaction.reference}</p>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// HOLD ROW
// =============================================================================

export function HoldRow({ hold }: { hold: ActiveHold }) {
	return (
		<div className="flex items-center justify-between rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200/60 dark:bg-amber-950/20 dark:ring-amber-800/40">
			<div className="flex items-center gap-4">
				<div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
					<LockClosedIcon className="size-5 text-amber-600 dark:text-amber-400" />
				</div>
				<div>
					<p className="font-medium text-amber-900 dark:text-amber-100">
						{hold.campaignTitle || "Hold"}
					</p>
					<p className="text-sm text-amber-700 dark:text-amber-300">
						{formatDateTime(hold.createdAt)}
						{hold.expiresAt && ` • Expires ${formatDateTime(hold.expiresAt)}`}
					</p>
				</div>
			</div>

			<div className="text-right">
				<p className="font-semibold text-amber-700 dark:text-amber-300">
					{formatCurrency(hold.amount)}
				</p>
				<Badge color="amber" className="mt-1">
					On Hold
				</Badge>
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

	const handleSubmit = async () => {
		setError(null);
		const amountNum = parseFloat(amount);
		if (Number.isNaN(amountNum) || amountNum <= 0) {
			setError("Please enter a valid amount");
			return;
		}
		if (amountNum > availableBalance / 100) {
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
				setError(getAPIErrorMessage(err, "Failed to request withdrawal"));
			}
		}
	};

	return (
		<Dialog open={open} onClose={onClose} size="md">
			<DialogTitle>Request Withdrawal</DialogTitle>
			<DialogDescription>
				Request a withdrawal to your linked bank account. Available:{" "}
				{formatCurrency(availableBalance)}
			</DialogDescription>

			<DialogBody>
				{error && (
					<div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
				<Button
					color="dark/zinc"
					onClick={handleSubmit}
					disabled={isPending || !amount}
				>
					{passkeyReauth.isPending
						? "Verifying passkey..."
						: createWithdrawal.isPending
							? "Submitting..."
							: "Request Withdrawal"}
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
	const canCancel = withdrawal.status === "pending";

	const handleCancel = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await cancelWithdrawal.mutateAsync({ withdrawalId: withdrawal.id });
			showToast.success("Withdrawal request cancelled");
		} catch (err) {
			showToast.error(err, "Failed to cancel withdrawal");
		}
	};

	return (
		<button
			type="button"
			className={`flex w-full items-center justify-between rounded-xl bg-white p-4 text-left ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 ${onClick ? "transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/80" : ""}`}
			onClick={onClick}
		>
			<div className="flex items-center gap-4">
				<div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
					<ArrowUpTrayIcon className="size-5 text-zinc-500" />
				</div>
				<div>
					<p className="font-medium text-zinc-900 dark:text-white">Withdrawal Request</p>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						{formatDateTime(withdrawal.requestedAt)}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<p className="font-semibold text-zinc-900 dark:text-white">
					{formatCurrency(withdrawal.amount)}
				</p>
				<Badge color={statusColors[withdrawal.status] || "zinc"}>{withdrawal.status}</Badge>
				{canCancel && (
					<Button
						plain
						onClick={handleCancel}
						disabled={cancelWithdrawal.isPending}
						className="text-xs text-red-500 hover:text-red-700"
					>
						{cancelWithdrawal.isPending ? "Cancelling..." : "Cancel"}
					</Button>
				)}
			</div>
		</button>
	);
}

// =============================================================================
// DEPOSIT ROW
// =============================================================================

export function DepositRow({ deposit }: { deposit: brand.DepositTransaction }) {
	return (
		<div className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="flex items-center gap-4">
				<div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
					<ArrowDownTrayIcon className="size-5 text-emerald-500" />
				</div>
				<div>
					<p className="font-medium text-zinc-900 dark:text-white">Deposit</p>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						{formatDateTime(deposit.createdAt)}
						{deposit.reference && ` · Ref: ${deposit.reference}`}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-3">
				<p className="font-semibold text-emerald-600 dark:text-emerald-400">
					+{formatCurrency(deposit.amount)}
				</p>
				<Badge color={deposit.status === "completed" ? "emerald" : "amber"}>{deposit.status}</Badge>
			</div>
		</div>
	);
}
