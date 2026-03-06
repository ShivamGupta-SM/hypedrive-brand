import { ArrowPathIcon, ClockIcon, EnvelopeIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useCallback, useState } from "react";
import { Badge } from "@/components/badge";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { useInvitations } from "@/features/team/hooks";
import { useCancelInvitation } from "@/features/team/mutations";
import { useOrgContext } from "@/hooks/use-org-context";
import { showToast } from "@/lib/toast";
import type { Invitation } from "./components";
import { getRoleBadgeConfig } from "./components";

function formatTimeRemaining(expiresAt: Date): string {
	const diff = expiresAt.getTime() - Date.now();
	if (diff <= 0) return "Expired";
	const hours = Math.floor(diff / (1000 * 60 * 60));
	if (hours < 24) return `${hours}h left`;
	const days = Math.floor(hours / 24);
	return `${days}d left`;
}

function formatSentDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

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
		[cancelInvitation, refetchInvitations]
	);

	const now = new Date();
	// Filter out canceled/rejected invitations — they should disappear after revoke
	const pendingInvitations = (invitations as Invitation[]).filter(
		(inv) => inv.status !== "canceled" && inv.status !== "rejected"
	);
	const activeInvitations = pendingInvitations.filter(
		(inv) => !inv.expiresAt || new Date(inv.expiresAt) > now
	);
	const expiredInvitations = pendingInvitations.filter(
		(inv) => inv.expiresAt && new Date(inv.expiresAt) <= now
	);

	if (activeInvitations.length === 0 && expiredInvitations.length === 0) {
		return (
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="p-6">
					<EmptyState
						preset="generic"
						title="No pending invitations"
						description="Use the invite button in the header to send invitations."
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			{/* Active invitations — card grid */}
			{activeInvitations.length > 0 && (
				<div>
					<p className="mb-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
						{activeInvitations.length} pending invitation{activeInvitations.length !== 1 ? "s" : ""}
					</p>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{activeInvitations.map((invitation) => {
							const roleConfig = getRoleBadgeConfig(invitation.role);
							const expiresAt = invitation.expiresAt ? new Date(invitation.expiresAt) : null;
							const timeLeft = expiresAt ? formatTimeRemaining(expiresAt) : null;
							const isCancelling = cancellingInvitationId === invitation.id;

							return (
								<div
									key={invitation.id}
									className="group/card flex flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 transition-all hover:shadow-sm hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
								>
									<div className="flex items-start gap-3.5 p-4 sm:p-5">
										{/* Icon */}
										<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
											<EnvelopeIcon className="size-5 text-amber-600 dark:text-amber-400" />
										</div>

										{/* Info */}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
												{invitation.email}
											</p>
											{invitation.createdAt && (
												<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
													Sent {formatSentDate(invitation.createdAt)}
												</p>
											)}
										</div>

										{/* Revoke button */}
										{canManageMembers && (
											<button
												type="button"
												onClick={() => handleCancelInvitation(invitation.id)}
												disabled={isCancelling}
												className="flex size-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover/card:opacity-100 disabled:opacity-50 dark:hover:bg-red-950/30"
												aria-label="Revoke invitation"
											>
												{isCancelling ? (
													<ArrowPathIcon className="size-3.5 animate-spin" />
												) : (
													<XMarkIcon className="size-4" />
												)}
											</button>
										)}
									</div>

									{/* Footer: role + time left */}
									<div className="mt-auto grid grid-cols-2 divide-x divide-zinc-200 border-t border-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/30">
										<div className="flex items-center justify-center gap-1.5 py-2.5">
											<Badge color={roleConfig.color}>{roleConfig.label}</Badge>
										</div>
										<div className="flex items-center justify-center gap-1 py-2.5">
											{timeLeft ? (
												<span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
													<ClockIcon className="size-3" />
													{timeLeft}
												</span>
											) : (
												<span className="text-xs text-zinc-400 dark:text-zinc-500">No expiry</span>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{activeInvitations.length === 0 && (
				<div className="rounded-xl bg-white px-4 py-5 text-center text-sm text-zinc-500 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800">
					No active invitations
				</div>
			)}

			{/* Expired invitations */}
			{expiredInvitations.length > 0 && (
				<div>
					<p className="mb-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
						Expired ({expiredInvitations.length})
					</p>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{expiredInvitations.map((invitation) => {
							const isCancelling = cancellingInvitationId === invitation.id;

							return (
								<div
									key={invitation.id}
									className="group/card flex flex-col overflow-hidden rounded-xl bg-zinc-50/50 ring-1 ring-zinc-200 dark:bg-zinc-800/20 dark:ring-zinc-800"
								>
									<div className="flex items-start gap-3.5 p-4 sm:p-5">
										{/* Icon */}
										<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
											<EnvelopeIcon className="size-5 text-red-500 dark:text-red-400" />
										</div>

										{/* Info */}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
												{invitation.email}
											</p>
											{invitation.createdAt && (
												<p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
													Sent {formatSentDate(invitation.createdAt)}
												</p>
											)}
										</div>

										{/* Revoke button */}
										{canManageMembers && (
											<button
												type="button"
												onClick={() => handleCancelInvitation(invitation.id)}
												disabled={isCancelling}
												className="flex size-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover/card:opacity-100 disabled:opacity-50 dark:hover:bg-red-950/30"
												aria-label="Revoke invitation"
											>
												{isCancelling ? (
													<ArrowPathIcon className="size-3.5 animate-spin" />
												) : (
													<XMarkIcon className="size-4" />
												)}
											</button>
										)}
									</div>

									{/* Footer */}
									<div className="mt-auto flex items-center justify-center border-t border-zinc-200 bg-red-50/50 py-2.5 dark:border-zinc-800 dark:bg-red-950/10">
										<Badge color="red">Expired</Badge>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
