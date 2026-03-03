import { EnvelopeIcon } from "@heroicons/react/16/solid";
import { useCallback, useState } from "react";
import { Button } from "@/components/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getAPIErrorMessage, useCancelInvitation, useInvitations, useOrgContext } from "@/hooks";
import { useCan } from "@/store/permissions-store";
import type { Invitation } from "./components";
import { InvitationRow, InviteMemberModal } from "./components";

export function TeamInvitations() {
	const { organizationId } = useOrgContext();

	const canInviteMembers = useCan("member", "create");
	const canManageMembers = useCan("member", "update");

	const { data: invitations, refetch: refetchInvitations } = useInvitations(organizationId);
	const cancelInvitation = useCancelInvitation(organizationId);

	const [cancellingInvitationId, setCancellingInvitationId] = useState<string | null>(null);
	const [showInviteModal, setShowInviteModal] = useState(false);

	const handleCancelInvitation = useCallback(
		async (invitationId: string) => {
			setCancellingInvitationId(invitationId);
			try {
				await cancelInvitation.mutateAsync(invitationId);
				refetchInvitations();
			} catch (err) {
				console.error("Failed to cancel invitation:", getAPIErrorMessage(err));
			} finally {
				setCancellingInvitationId(null);
			}
		},
		[cancelInvitation, refetchInvitations]
	);

	return (
		<div>
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
						Pending Invitations
						<span className="ml-2 text-xs font-normal text-zinc-500">{invitations.length}</span>
					</h3>
					{canInviteMembers && (
						<Button color="dark/zinc" onClick={() => setShowInviteModal(true)}>
							<EnvelopeIcon className="size-4" />
							Invite
						</Button>
					)}
				</div>
				<div className="p-3 sm:p-4">
					{invitations.length === 0 ? (
						<EmptyState
							preset="generic"
							title="No pending invitations"
							description="Send invitations to add new team members."
							action={
								canInviteMembers ? { label: "Invite Member", onClick: () => setShowInviteModal(true) } : undefined
							}
						/>
					) : (
						<div className="space-y-px">
							{(invitations as Invitation[]).map((invitation) => (
								<InvitationRow
									key={invitation.id}
									invitation={invitation}
									canManage={canManageMembers}
									onCancel={() => handleCancelInvitation(invitation.id)}
									isCancelling={cancellingInvitationId === invitation.id}
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
				onSuccess={refetchInvitations}
			/>
		</div>
	);
}
