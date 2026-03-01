import { PlusIcon, UserIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
	useCurrentOrganization,
	useMembers,
} from "@/hooks";
import { useAuthStore } from "@/store/auth-store";
import { useCan } from "@/store/permissions-store";
import type { Member, MemberRole } from "./components";
import {
	AddMemberDialog,
	ChangeRoleDialog,
	InviteMemberModal,
	MemberRow,
	RemoveMemberDialog,
} from "./components";

export function TeamMembers() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;

	const canInviteMembers = useCan("member", "create");
	const canManageMembers = useCan("member", "update");

	const { data: members, refetch: refetchMembers } = useMembers(organizationId);

	const [showInviteModal, setShowInviteModal] = useState(false);
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [memberToChangeRole, setMemberToChangeRole] = useState<Member | null>(null);
	const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

	const authUser = useAuthStore((state) => state.user);
	const currentUserId = authUser?.id || "";

	return (
		<div>
			{/* CTA buttons */}
			{canInviteMembers && (
				<div className="mb-4 flex items-center justify-end gap-2">
					<Button outline onClick={() => setShowAddMemberModal(true)}>
						<UserIcon className="size-4" />
						Add Directly
					</Button>
					<Button color="emerald" onClick={() => setShowInviteModal(true)}>
						<PlusIcon className="size-4" />
						Invite Member
					</Button>
				</div>
			)}

			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
				<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
						Members
						<span className="ml-2 text-xs font-normal text-zinc-500">{members.length}</span>
					</h3>
				</div>
				<div className="p-3 sm:p-4">
					{members.length === 0 ? (
						<EmptyState
							preset="generic"
							title="No team members"
							description="Invite team members to collaborate"
							action={
								canInviteMembers
									? { label: "Invite Member", onClick: () => setShowInviteModal(true) }
									: undefined
							}
						/>
					) : (
						<div className="space-y-2">
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
