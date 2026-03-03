import { EnvelopeIcon, UserIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { Button } from "@/components/button";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { useMembers } from "@/features/team/hooks";
import { useOrgContext } from "@/hooks/use-org-context";
import type { Member, MemberRole } from "./components";
import { AddMemberDialog, ChangeRoleDialog, InviteMemberModal, MemberRow, RemoveMemberDialog } from "./components";

export function TeamMembers() {
	const { organizationId, userId } = useOrgContext();

	const canInviteMembers = useCan("member", "create");
	const canManageMembers = useCan("member", "update");

	const { data: members, refetch: refetchMembers } = useMembers(organizationId);

	const [showInviteModal, setShowInviteModal] = useState(false);
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [memberToChangeRole, setMemberToChangeRole] = useState<Member | null>(null);
	const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

	const currentUserId = userId || "";

	return (
		<div>
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
						Members
						<span className="ml-2 text-xs font-normal text-zinc-500">{members.length}</span>
					</h3>
					{canInviteMembers && (
						<div className="flex items-center gap-2">
							<Button outline onClick={() => setShowAddMemberModal(true)}>
								<UserIcon className="size-4" />
								<span className="hidden sm:inline">Add Directly</span>
								<span className="sm:hidden">Add</span>
							</Button>
							<Button color="dark/zinc" onClick={() => setShowInviteModal(true)}>
								<EnvelopeIcon className="size-4" />
								Invite
							</Button>
						</div>
					)}
				</div>
				<div className="p-3 sm:p-4">
					{members.length === 0 ? (
						<EmptyState
							preset="generic"
							title="No team members"
							description="Invite team members to collaborate"
							action={
								canInviteMembers ? { label: "Invite Member", onClick: () => setShowInviteModal(true) } : undefined
							}
						/>
					) : (
						<div className="space-y-px">
							{members.map((member) => (
								<MemberRow
									key={member.id}
									member={member}
									isCurrentUser={member.userId === currentUserId}
									canManage={canManageMembers}
									onChangeRole={(_role: MemberRole) => setMemberToChangeRole(member)}
									onRemove={() => setMemberToRemove(member)}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			<InviteMemberModal
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
				organizationId={organizationId}
				onSuccess={refetchMembers}
			/>
			<AddMemberDialog
				isOpen={showAddMemberModal}
				onClose={() => setShowAddMemberModal(false)}
				organizationId={organizationId}
				onSuccess={refetchMembers}
			/>
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
