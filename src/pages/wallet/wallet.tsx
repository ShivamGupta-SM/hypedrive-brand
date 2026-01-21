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
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Skeleton } from "@/components/skeleton";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import { Card, CardGrid, StatCard } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  useWallet,
  useWalletTransactions,
  useWalletHolds,
  useDepositAccount,
  useFundWallet,
  useCurrentOrganization,
  getAPIErrorMessage,
} from "@/hooks/use-api";
import { formatCurrency, formatDateTime } from "@/lib/design-tokens";
import type { organizations } from "@/lib/brand-client";
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  PlusIcon,
} from "@heroicons/react/16/solid";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type WalletTransaction = organizations.WalletTransaction;
type ActiveHold = organizations.ActiveHold;

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ onRetry }: { onRetry: () => void }) {
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

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width={150} height={32} borderRadius={8} />
          <Skeleton width={250} height={20} borderRadius={6} />
        </div>
        <Skeleton width={140} height={40} borderRadius={8} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="100%" height={120} borderRadius={12} />
        ))}
      </div>

      {/* Deposit Account */}
      <Skeleton width="100%" height={180} borderRadius={12} />

      {/* Transactions */}
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
// ADD FUNDS DIALOG
// =============================================================================

function AddFundsDialog({
  open,
  onClose,
  organizationId,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fundWallet = useFundWallet(organizationId);

  const handleSubmit = async () => {
    setError(null);

    const amountNum = parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!reference.trim()) {
      setError("Please enter a transaction reference");
      return;
    }

    try {
      await fundWallet.mutateAsync({
        amount: amountNum,
        reference: reference.trim(),
        reason: reason.trim() || "Manual deposit",
      });

      toast.success("Funds added successfully");
      onSuccess();
      onClose();
      setAmount("");
      setReference("");
      setReason("");
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to add funds"));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogTitle>Add Funds to Wallet</DialogTitle>
      <DialogDescription>
        Record a manual deposit to your wallet. Enter the transaction details below.
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
            <Label>Transaction Reference</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., Bank transfer ID, UPI reference"
            />
          </Field>

          <Field>
            <Label>Notes (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add any notes about this deposit..."
              rows={2}
            />
          </Field>
        </div>
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose} disabled={fundWallet.isPending}>
          Cancel
        </Button>
        <Button
          color="emerald"
          onClick={handleSubmit}
          disabled={fundWallet.isPending || !amount || !reference}
        >
          {fundWallet.isPending ? "Processing..." : "Add Funds"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// DEPOSIT ACCOUNT CARD
// =============================================================================

function DepositAccountCard({
  account,
  loading,
}: {
  account: organizations.DepositAccountResponse | null;
  loading: boolean;
}) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
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

  if (!account || !account.found || !account.account) {
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

  const accountDetails = account.account;
  const details = [
    { label: "Bank Name", value: accountDetails.bankName },
    { label: "Account Number", value: accountDetails.accountNumber },
    { label: "IFSC Code", value: accountDetails.ifsc },
    { label: "Account Holder", value: accountDetails.beneficiaryName },
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
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Deposit Account
            </h3>
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
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {detail.label}
              </p>
              <p className="mt-0.5 font-mono text-sm text-zinc-900 dark:text-white">
                {detail.value}
              </p>
            </div>
            <button
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

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const isCredit = transaction.type === "credit";

  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
      <div className="flex items-center gap-4">
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${
            isCredit
              ? "bg-emerald-50 dark:bg-emerald-950/30"
              : "bg-red-50 dark:bg-red-950/30"
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
            isCredit
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(transaction.amountDecimal)}
        </p>
        {transaction.reference && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Ref: {transaction.reference}
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HOLD ROW
// =============================================================================

function HoldRow({ hold }: { hold: ActiveHold }) {
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
          {formatCurrency(hold.amountDecimal)}
        </p>
        <Badge color="amber" className="mt-1">
          On Hold
        </Badge>
      </div>
    </div>
  );
}

// =============================================================================
// WALLET PAGE
// =============================================================================

export function Wallet() {
  const organization = useCurrentOrganization();
  const organizationId = organization?.id;

  const { data: wallet, loading: walletLoading, error: walletError, refetch: refetchWallet } = useWallet(organizationId);
  const { data: transactions, loading: txLoading, error: txError, refetch: refetchTx } = useWalletTransactions(organizationId, { take: 20 });
  const { data: holds, loading: holdsLoading, refetch: refetchHolds } = useWalletHolds(organizationId);
  const { data: depositAccount, loading: depositLoading } = useDepositAccount(organizationId);

  const [showAddFunds, setShowAddFunds] = useState(false);

  // Calculate stats
  const stats = useMemo(() => {
    const balance = parseFloat(wallet?.balanceDecimal || "0");
    const holdAmount = holds.reduce((sum, h) => sum + parseFloat(h.amountDecimal || "0"), 0);
    const available = balance - holdAmount;

    // Count recent transactions
    const recentCredits = transactions.filter((t) => t.type === "credit").length;
    const recentDebits = transactions.filter((t) => t.type === "debit").length;

    return {
      balance,
      holdAmount,
      available,
      recentCredits,
      recentDebits,
    };
  }, [wallet, holds, transactions]);

  const handleRefresh = () => {
    refetchWallet();
    refetchTx();
    refetchHolds();
  };

  const loading = walletLoading || txLoading || holdsLoading;
  const error = walletError || txError;

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState onRetry={handleRefresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading>Wallet</Heading>
          <Text className="mt-1">Manage your campaign funds and transactions</Text>
        </div>
        <Button color="emerald" onClick={() => setShowAddFunds(true)}>
          <PlusIcon className="size-4" />
          Add Funds
        </Button>
      </div>

      {/* Stats */}
      <CardGrid columns={4} gap="md">
        <StatCard
          icon={<CurrencyRupeeIcon className="size-5" />}
          label="Total Balance"
          value={formatCurrency(stats.balance)}
          variant="default"
          size="sm"
        />
        <StatCard
          icon={<BanknotesIcon className="size-5" />}
          label="Available"
          value={formatCurrency(stats.available)}
          variant="success"
          size="sm"
        />
        <StatCard
          icon={<LockClosedIcon className="size-5" />}
          label="On Hold"
          value={formatCurrency(stats.holdAmount)}
          variant="warning"
          size="sm"
        />
        <StatCard
          icon={<ClockIcon className="size-5" />}
          label="Active Holds"
          value={holds.length}
          variant="info"
          size="sm"
        />
      </CardGrid>

      {/* Deposit Account */}
      <DepositAccountCard account={depositAccount} loading={depositLoading} />

      {/* Active Holds */}
      {holds.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Active Holds
          </h3>
          <div className="space-y-2">
            {holds.map((hold) => (
              <HoldRow key={hold.id} hold={hold} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Recent Transactions
          </h3>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <ArrowPathIcon className="size-3.5" />
            Refresh
          </button>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            preset="generic"
            title="No transactions yet"
            description="Your transaction history will appear here once you add funds or make payments."
          />
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>

      {/* Add Funds Dialog */}
      <AddFundsDialog
        open={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        organizationId={organizationId || ""}
        onSuccess={() => {
          refetchWallet();
          refetchTx();
        }}
      />
    </div>
  );
}
