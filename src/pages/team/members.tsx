import { EllipsisVerticalIcon, ShieldCheckIcon, TrashIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { BulkActionsBar } from "@/components/shared/bulk-actions-bar";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { SelectionCheckbox } from "@/components/shared/selection-checkbox";
import { useMembers } from "@/features/team/hooks";
import { useBatchMembers } from "@/features/team/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import { showToast } from "@/lib/toast";
import { Route } from "@/routes/_app/$orgSlug/team";
import type { Member } from "./components";
import { ChangeRoleDialog, formatJoinedAgo, getRoleBadgeConfig, MemberAvatar, RemoveMemberDialog } from "./components";

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
		[currentUserId]
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
				m.role.toLowerCase().includes(search)
		);
	}, [members, q]);

	const selectableMembers = useMemo(() => filteredMembers.filter(isSelectable), [filteredMembers, isSelectable]);

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

	if (filteredMembers.length === 0) {
		return (
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="p-6">
					{members.length === 0 ? (
						<EmptyState
							preset="generic"
							title="No team members"
							description="Use the invite button in the header to add team members."
						/>
					) : (
						<EmptyState preset="generic" title="No results" description={`No members match "${q}"`} />
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Select all bar */}
			{canManageMembers && selectableMembers.length > 0 && (
				<div className="mb-3 flex items-center gap-3">
					<SelectionCheckbox
						variant="inline"
						selected={allSelected}
						indeterminate={!allSelected && selectedIds.size > 0}
						onToggle={toggleSelectAll}
					/>
					<span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
						{selectedIds.size > 0 ? `${selectedIds.size} selected` : `Select all (${selectableMembers.length})`}
					</span>
				</div>
			)}

			{/* Member card grid */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{filteredMembers.map((member) => {
					const isCurrentUser = member.userId === currentUserId;
					const checkable = canManageMembers && isSelectable(member);
					const selected = selectedIds.has(member.id);
					const roleConfig = getRoleBadgeConfig(member.role);
					const displayName = member.user?.name || "Member";
					const displayEmail = member.user?.email || `ID: ${member.userId.slice(0, 8)}...`;
					const joinedAgo = member.createdAt ? formatJoinedAgo(member.createdAt) : null;
					const joinedFull = member.createdAt
						? new Date(member.createdAt).toLocaleDateString("en-IN", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})
						: null;

					return (
						<div
							key={member.id}
							className={clsx(
								"group/card flex flex-col rounded-xl bg-white shadow-xs ring-1 transition-all hover:shadow-sm dark:bg-zinc-900",
								selected
									? "ring-sky-300 bg-sky-50/50 dark:ring-sky-700 dark:bg-sky-950/20"
									: "ring-zinc-200 hover:ring-zinc-300 dark:ring-zinc-800 dark:hover:ring-zinc-700"
							)}
						>
							<div className="relative flex items-start gap-3.5 p-4 sm:p-5">
								{/* Selection checkbox — overlay, no layout shift */}
								{checkable && (
									<SelectionCheckbox
										variant="overlay"
										selected={selected}
										onToggle={() => toggleSelect(member.id)}
									/>
								)}

								{/* Avatar */}
								<div className="relative shrink-0">
									<MemberAvatar name={member.user?.name} userId={member.userId} image={member.user?.image} size="lg" />
									{member.role === "owner" && (
										<span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-900">
											<ShieldCheckIcon className="size-3 text-white" />
										</span>
									)}
								</div>

								{/* Info */}
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-1.5">
										<p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">{displayName}</p>
										{isCurrentUser && (
											<span className="shrink-0 rounded bg-sky-50 px-1.5 py-px text-[10px] font-semibold text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
												you
											</span>
										)}
									</div>
									<p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{displayEmail}</p>
								</div>

								{/* Actions */}
								{canManageMembers && !isCurrentUser && member.role !== "owner" && (
									<Dropdown>
										<DropdownButton
											plain
											aria-label="Member options"
											className="size-7 shrink-0 rounded-lg opacity-0 group-hover/card:opacity-100"
										>
											<EllipsisVerticalIcon className="size-4 text-zinc-400" />
										</DropdownButton>
										<DropdownMenu anchor="bottom end">
											<DropdownItem onClick={() => setMemberToChangeRole(member)}>
												<ShieldCheckIcon className="size-4" />
												Change Role
											</DropdownItem>
											<DropdownItem onClick={() => setMemberToRemove(member)}>
												<TrashIcon className="size-4 text-red-500" />
												Remove Member
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								)}
							</div>

							{/* Footer: role + joined */}
							<div className="mt-auto grid grid-cols-2 divide-x divide-zinc-200 border-t border-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/30">
								<div className="flex items-center justify-center gap-1.5 py-2.5">
									<Badge color={roleConfig.color}>{roleConfig.label}</Badge>
								</div>
								<div className="flex flex-col items-center justify-center py-2.5">
									<span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">Joined</span>
									<span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300" title={joinedFull || undefined}>
										{joinedAgo || "—"}
									</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Footer count */}
			<div className="mt-3">
				<p className="text-xs text-zinc-500 dark:text-zinc-400">
					{filteredMembers.length === members.length
						? `${members.length} member${members.length !== 1 ? "s" : ""}`
						: `${filteredMembers.length} of ${members.length} members`}
				</p>
			</div>

			{/* Floating Batch Actions Bar */}
			<BulkActionsBar selectedCount={selectedIds.size} onClear={clearSelection}>
				<Button color="red" onClick={handleBatchRemove} disabled={isBatchLoading}>
					<TrashIcon data-slot="icon" className="size-4" /> Remove
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
