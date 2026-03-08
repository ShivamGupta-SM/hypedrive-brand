import {
  ArrowsUpDownIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { getRouteApi } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BsTable as TableIcon } from "react-icons/bs";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { EnrollmentCardFull, isEnrollmentOverdue } from "@/components/enrollment-card";
import { Field, Label } from "@/components/fieldset";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FilterDropdown, type FilterOption } from "@/components/shared/filter-dropdown";
import { Textarea } from "@/components/textarea";
import { useCampaigns } from "@/features/campaigns/hooks";
import { useInfiniteEnrollments } from "@/features/enrollments/hooks";
import {
  useBulkApproveEnrollments,
  useBulkRejectEnrollments,
  useExportOrganizationEnrollments,
} from "@/features/enrollments/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import type { db } from "@/lib/brand-client";
import { downloadExcel } from "@/lib/download";
import { showToast } from "@/lib/toast";

const enrollmentsRouteApi = getRouteApi("/_app/$orgSlug/enrollments");

// =============================================================================
// GRID SKELETON
// =============================================================================

export function EnrollmentsGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-3 w-28 skeleton-shimmer rounded bg-zinc-200 animate-fade-in dark:bg-zinc-800" />
      <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4 2xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 animate-fade-in dark:bg-zinc-900 dark:ring-zinc-800"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start gap-3.5 p-3.5 sm:gap-4 sm:p-4">
              <div className="size-12 shrink-0 rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 skeleton-shimmer rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-1/2 skeleton-shimmer rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-3/4 skeleton-shimmer rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
            <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="grid grid-cols-3 divide-x divide-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:bg-zinc-800/30">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex flex-col items-center gap-1 py-2.5 sm:py-3">
                  <div className="h-2.5 w-10 skeleton-shimmer rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3.5 w-14 skeleton-shimmer rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ENROLLMENTS GRID
// =============================================================================

const sortOptions: FilterOption[] = [
  { value: "newest", label: "Newest", icon: CalendarIcon, iconColor: "text-sky-500" },
  { value: "oldest", label: "Oldest", icon: CalendarIcon, iconColor: "text-zinc-400" },
  { value: "orderValue", label: "Order Value", icon: CurrencyRupeeIcon, iconColor: "text-emerald-500" },
  { value: "status", label: "Status", icon: ArrowsUpDownIcon, iconColor: "text-violet-500" },
];

const sortMap = {
  newest: { sortBy: "createdAt" as const, sortOrder: "desc" as const },
  oldest: { sortBy: "createdAt" as const, sortOrder: "asc" as const },
  orderValue: { sortBy: "orderValue" as const, sortOrder: "desc" as const },
  status: { sortBy: "status" as const, sortOrder: "asc" as const },
};

interface EnrollmentsGridProps {
  status?: db.EnrollmentStatus;
}

export function EnrollmentsGrid({ status }: EnrollmentsGridProps) {
  const { organizationId, orgSlug } = useOrgContext();
  const { q } = enrollmentsRouteApi.useSearch();

  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Campaign name lookup
  const { data: campaigns } = useCampaigns(organizationId, { take: 100 });
  const campaignNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of campaigns) {
      map.set(c.id, c.title);
    }
    return map;
  }, [campaigns]);

  // Bulk action mutations
  const bulkApprove = useBulkApproveEnrollments(organizationId);
  const bulkReject = useBulkRejectEnrollments(organizationId);
  const exportEnrollments = useExportOrganizationEnrollments(organizationId);

  const activeSort = sortMap[sortBy as keyof typeof sortMap] || sortMap.newest;

  const {
    data: enrollments,
    loading,
    error,
    refetch,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteEnrollments(organizationId, {
    status,
    q: q || undefined,
    sortBy: activeSort.sortBy,
    sortOrder: activeSort.sortOrder,
  });

  // Reference time for overdue calculation (stable during render)
  const referenceTime = useMemo(() => new Date(), []);

  // Selection handlers
  const handleSelect = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk approve dialog state
  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);

  // Bulk reject dialog state
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState("");

  // Bulk action handlers
  const handleBulkApproveRequest = useCallback(() => {
    if (selectedIds.size === 0) return;
    setShowBulkApproveDialog(true);
  }, [selectedIds.size]);

  const handleBulkApproveConfirm = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsBulkLoading(true);
    try {
      await bulkApprove.mutateAsync({ enrollmentIds: Array.from(selectedIds) });
      showToast.success(`${selectedIds.size} enrollment${selectedIds.size > 1 ? "s" : ""} approved`);
      setSelectedIds(new Set());
      setShowBulkApproveDialog(false);
      refetch();
    } catch (err) {
      showToast.error(err, "Failed to approve enrollments");
    } finally {
      setIsBulkLoading(false);
    }
  }, [selectedIds, bulkApprove, refetch]);

  const handleBulkRejectRequest = useCallback(() => {
    if (selectedIds.size === 0) return;
    setBulkRejectReason("");
    setShowBulkRejectDialog(true);
  }, [selectedIds.size]);

  const handleBulkRejectConfirm = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsBulkLoading(true);
    try {
      await bulkReject.mutateAsync({
        enrollmentIds: Array.from(selectedIds),
        reason: bulkRejectReason.trim() || "Rejected by brand",
      });
      showToast.success(`${selectedIds.size} enrollment${selectedIds.size > 1 ? "s" : ""} rejected`);
      setSelectedIds(new Set());
      setShowBulkRejectDialog(false);
      refetch();
    } catch (err) {
      showToast.error(err, "Failed to reject enrollments");
    } finally {
      setIsBulkLoading(false);
    }
  }, [selectedIds, bulkReject, bulkRejectReason, refetch]);

  // Export handler
  const handleExport = useCallback(async () => {
    try {
      const result = await exportEnrollments.mutateAsync({
        status,
      });
      downloadExcel(result.data, result.filename);
      showToast.exported();
    } catch (err) {
      showToast.error(err, "Failed to export enrollments");
    }
  }, [exportEnrollments, status]);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0, rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  if (loading) {
    return <EnrollmentsGridSkeleton />;
  }

  if (error) {
    return <ErrorState message="Failed to load enrollments. Please try again." onRetry={refetch} />;
  }

  return (
    <div className="animate-page-enter space-y-4">
      {/* Enrollments List */}
      {enrollments.length === 0 ? (
        <EmptyState
          preset="enrollments"
          title={q ? "No enrollments found" : "No enrollments yet"}
          description={
            q ? "Try adjusting your search query" : "Enrollments will appear here when shoppers join your campaigns"
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <FilterDropdown label="Sort" options={sortOptions} value={sortBy} onChange={setSortBy} />
            <div className="flex-1" />
            <Button color="emerald" onClick={handleExport} loading={exportEnrollments.isPending}>
              <TableIcon data-slot="icon" className="size-4" />
              Export
            </Button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-2.5 min-[480px]:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4 2xl:grid-cols-4">
            {enrollments.map((enrollment, i) => (
              <div key={enrollment.id} className="animate-scale-in" style={{ animationDelay: `${i * 50}ms` }}>
                <EnrollmentCardFull
                  enrollment={enrollment}
                  orgSlug={orgSlug}
                  isSelected={selectedIds.has(enrollment.id)}
                  onSelect={enrollment.status === "awaiting_review" ? handleSelect : undefined}
                  showOverdueAlert={
                    enrollment.status === "awaiting_review" && isEnrollmentOverdue(enrollment.createdAt, referenceTime)
                  }
                  campaignName={campaignNameMap.get(enrollment.campaignId)}
                />
              </div>
            ))}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              {isFetchingNextPage && (
                <div className="size-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-600 dark:border-t-white" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Actions Bar */}
      <BulkActionsBar selectedCount={selectedIds.size} onClear={clearSelection}>
        <Button color="emerald" onClick={handleBulkApproveRequest} loading={isBulkLoading}>
          <CheckCircleIcon data-slot="icon" className="size-4" />
          Approve
        </Button>
        <Button color="red" onClick={handleBulkRejectRequest} disabled={isBulkLoading}>
          <XCircleIcon data-slot="icon" className="size-4" />
          Reject
        </Button>
      </BulkActionsBar>

      {/* Bulk Approve Confirmation Dialog */}
      <Dialog open={showBulkApproveDialog} onClose={() => setShowBulkApproveDialog(false)} size="sm">
        <DialogHeader
          icon={CheckCircleIcon}
          iconColor="emerald"
          title="Approve Enrollments"
          description={`Approve ${selectedIds.size} enrollment${selectedIds.size > 1 ? "s" : ""}?`}
          onClose={() => setShowBulkApproveDialog(false)}
        />
        <DialogActions>
          <Button plain onClick={() => setShowBulkApproveDialog(false)} disabled={isBulkLoading}>
            Cancel
          </Button>
          <Button color="emerald" onClick={handleBulkApproveConfirm} loading={isBulkLoading}>
            <CheckCircleIcon className="size-4" />
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Reject Reason Dialog */}
      <Dialog open={showBulkRejectDialog} onClose={() => setShowBulkRejectDialog(false)} size="sm">
        <DialogHeader
          icon={ExclamationTriangleIcon}
          iconColor="red"
          title="Reject Enrollments"
          description={`Reject ${selectedIds.size} selected enrollment${selectedIds.size > 1 ? "s" : ""}?`}
          onClose={() => setShowBulkRejectDialog(false)}
        />
        <DialogBody>
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
            <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-300">
              This action is permanent. The creators will be notified immediately.
            </p>
          </div>
          <Field>
            <Label>Rejection reason</Label>
            <Textarea
              value={bulkRejectReason}
              onChange={(e) => setBulkRejectReason(e.target.value)}
              placeholder="e.g., Content does not meet campaign requirements..."
              rows={3}
            />
          </Field>
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowBulkRejectDialog(false)} disabled={isBulkLoading}>
            Cancel
          </Button>
          <Button color="red" onClick={handleBulkRejectConfirm} loading={isBulkLoading}>
            <XMarkIcon className="size-4" />
            Reject {selectedIds.size} enrollment{selectedIds.size > 1 ? "s" : ""}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
