import { useCallback, useState } from "react";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { useInvitations } from "@/features/team/hooks";
import { useCancelInvitation } from "@/features/team/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import { showToast } from "@/lib/toast";
import type { Invitation } from "./components";
import { InvitationRow } from "./components";

export function TeamInvitations() {
	const { organizationId } = useOrgContext();

	const canManageMembers = useCan("member", "update");

	const { data: invitations, refetch: refetchInvitations } = useInvitations(organizationId);
	const cancelInvitation = useCancelInvitation(organizationId);

	const [cancellingInvitationId, setCancellingInvitationId] = useState<string | null>(null);

	const handleCancelInvitation = useCallback(
		async (invitationId: string) => {
			setCancellingInvitationId(invitationId);
			try {
				await cancelInvitation.mutateAsync(invitationId);
				showToast.success("Invitation revoked");
				refetchInvitations();
			} catch (err) {
				showToast.error(err, "Failed to revoke invitation");
			} finally {
				setCancellingInvitationId(null);
			}
		},
		[cancelInvitation, refetchInvitations],
	);

	// Split expired vs active for grouped display
	const now = new Date();
	const activeInvitations = (invitations as Invitation[]).filter(
		(inv) => !inv.expiresAt || new Date(inv.expiresAt) > now,
	);
	const expiredInvitations = (invitations as Invitation[]).filter(
		(inv) => inv.expiresAt && new Date(inv.expiresAt) <= now,
	);

	return (
		<div className="space-y-4">
			{/* Active invitations */}
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				{activeInvitations.length === 0 && expiredInvitations.length === 0 ? (
					<div className="p-6">
						<EmptyState
							preset="generic"
							title="No pending invitations"
							description="Use the invite button in the header to send invitations."
						/>
					</div>
				) : activeInvitations.length === 0 ? (
					<div className="px-4 py-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
						No active invitations
					</div>
				) : (
					<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
						{activeInvitations.map((invitation) => (
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

				{/* Footer count */}
				{activeInvitations.length > 0 && (
					<div className="border-t border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
						<p className="text-xs text-zinc-500 dark:text-zinc-400">
							{activeInvitations.length} pending invitation{activeInvitations.length !== 1 ? "s" : ""}
						</p>
					</div>
				)}
			</div>

			{/* Expired invitations — collapsed section */}
			{expiredInvitations.length > 0 && (
				<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
					<div className="border-b border-zinc-100 px-4 py-2.5 dark:border-zinc-800">
						<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
							Expired ({expiredInvitations.length})
						</p>
					</div>
					<div className="divide-y divide-zinc-100 dark:divide-zinc-800">
						{expiredInvitations.map((invitation) => (
							<InvitationRow
								key={invitation.id}
								invitation={invitation}
								canManage={canManageMembers}
								onCancel={() => handleCancelInvitation(invitation.id)}
								isCancelling={cancellingInvitationId === invitation.id}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
