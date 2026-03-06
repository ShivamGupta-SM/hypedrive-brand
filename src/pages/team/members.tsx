import { CheckCircleIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/button";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { useMembers } from "@/features/team/hooks";
import { useBatchMembers } from "@/features/team/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import { showToast } from "@/lib/toast";
import type { Member, MemberRole } from "./components";
import { ChangeRoleDialog, MemberRow, RemoveMemberDialog } from "./components";

import { Route } from "@/routes/_app/$orgSlug/team";

export function TeamMembers() {
	const { organizationId, userId } = useOrgContext();
	const { q } = Route.useSearch();

	const canManageMembers = useCan("member", "update");

	const { data: members, refetch: refetchMembers } = useMembers(organizationId);
	const batchMembers = useBatchMembers();

	const [memberToChangeRole, setMemberToChangeRole] = useState<Member | null>(null);
	const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

	// Batch selection state
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBatchLoading, setIsBatchLoading] = useState(false);

	const currentUserId = userId || "";

	const isSelectable = useCallback(
		(member: Member) => member.userId !== currentUserId && member.role !== "owner",
		[currentUserId],
	);

	const toggleSelect = useCallback((id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}, []);

	const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

	const filteredMembers = useMemo(() => {
		const search = q?.trim().toLowerCase() || "";
		if (!search) return members;
		return members.filter(
			(m) =>
				m.user?.name?.toLowerCase().includes(search) ||
				m.user?.email?.toLowerCase().includes(search) ||
				m.role.toLowerCase().includes(search),
		);
	}, [members, q]);

	const selectableMembers = useMemo(
		() => filteredMembers.filter(isSelectable),
		[filteredMembers, isSelectable],
	);

	const allSelected = selectableMembers.length > 0 && selectableMembers.every((m) => selectedIds.has(m.id));

	const toggleSelectAll = useCallback(() => {
		if (allSelected) {
			clearSelection();
		} else {
			setSelectedIds(new Set(selectableMembers.map((m) => m.id)));
		}
	}, [allSelected, selectableMembers, clearSelection]);

	const handleBatchRemove = useCallback(async () => {
		if (!organizationId || selectedIds.size === 0) return;
		setIsBatchLoading(true);
		try {
			await batchMembers.mutateAsync({
				organizationId,
				action: "remove",
				memberIds: Array.from(selectedIds),
			});
			showToast.success(`${selectedIds.size} member${selectedIds.size > 1 ? "s" : ""} removed`);
			setSelectedIds(new Set());
			refetchMembers();
		} catch (err) {
			showToast.error(err, "Failed to remove members");
		} finally {
			setIsBatchLoading(false);
		}
	}, [organizationId, selectedIds, batchMembers, refetchMembers]);

	return (
		<div>
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				{/* Column header */}
				{filteredMembers.length > 0 && canManageMembers && selectableMembers.length > 0 && (
					<div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
						<button
							type="button"
							onClick={toggleSelectAll}
							className={`flex size-4 items-center justify-center rounded border transition-all ${
								allSelected
									? "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white"
									: selectedIds.size > 0
										? "border-zinc-900 bg-zinc-900/20 dark:border-white dark:bg-white/20"
										: "border-zinc-300 dark:border-zinc-600"
							}`}
						>
							{allSelected && <CheckCircleIcon className="size-3 text-white dark:text-zinc-900" />}
							{!allSelected && selectedIds.size > 0 && (
								<div className="h-0.5 w-2 rounded-full bg-zinc-900 dark:bg-white" />
							)}
						</button>
						<span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
							{selectedIds.size > 0
								? `${selectedIds.size} selected`
								: `Select all (${selectableMembers.length})`}
						</span>
					</div>
				)}

				{/* Member list */}
				<div>
					{filteredMembers.length === 0 ? (
						<div className="p-6">
							{members.length === 0 ? (
								<EmptyState
									preset="generic"
									title="No team members"
									description="Use the invite button in the header to add team members."
								/>
							) : (
								<EmptyState
									preset="generic"
									title="No results"
									description={`No members match "${q}"`}
								/>
							)}
						</div>
					) : (
						<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{filteredMembers.map((member) => {
								const checkable = isSelectable(member);
								const selected = selectedIds.has(member.id);
								return (
									<div
										key={member.id}
										className={selected ? "bg-zinc-50 dark:bg-zinc-800/40" : ""}
									>
										<MemberRow
											member={member}
											isCurrentUser={member.userId === currentUserId}
											canManage={canManageMembers}
											onChangeRole={(_role: MemberRole) => setMemberToChangeRole(member)}
											onRemove={() => setMemberToRemove(member)}
											showCheckbox={canManageMembers && selectableMembers.length > 0}
											checkable={canManageMembers && checkable}
											selected={selected}
											onToggleSelect={() => toggleSelect(member.id)}
										/>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Footer count */}
				{filteredMembers.length > 0 && (
					<div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
						<p className="text-xs text-zinc-500 dark:text-zinc-400">
							{filteredMembers.length === members.length
								? `${members.length} member${members.length !== 1 ? "s" : ""}`
								: `${filteredMembers.length} of ${members.length} members`}
						</p>
					</div>
				)}
			</div>

			{/* Floating Batch Actions Bar */}
			<BulkActionsBar selectedCount={selectedIds.size} onClear={clearSelection}>
				<Button color="red" onClick={handleBatchRemove} disabled={isBatchLoading}>
					<TrashIcon className="size-4" /> Remove
				</Button>
			</BulkActionsBar>

			<ChangeRoleDialog
				open={!!memberToChangeRole}
				onClose={() => setMemberToChangeRole(null)}
				member={memberToChangeRole}
				organizationId={organizationId}
				onSuccess={refetchMembers}
			/>
			<RemoveMemberDialog
				open={!!memberToRemove}
				onClose={() => setMemberToRemove(null)}
				member={memberToRemove}
				organizationId={organizationId}
				onSuccess={refetchMembers}
			/>
		</div>
	);
}
