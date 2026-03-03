/**
 * Team shared sub-components
 * Extracted from the team monolith — used across layout and sub-pages
 */

import {
	ArrowPathIcon,
	ClockIcon,
	EllipsisVerticalIcon,
	EnvelopeIcon,
	ExclamationTriangleIcon,
	PencilIcon,
	PlusIcon,
	ShieldCheckIcon,
	TrashIcon,
	UserGroupIcon,
	UserIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useCallback, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Input } from "@/components/input";
import { EmptyState } from "@/components/shared/empty-state";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";
import {
	getAPIErrorMessage,
	useAddMember,
	useCreateOrganizationRole,
	useDeleteOrganizationRole,
	useInviteMember,
	useOrganizationRoles,
	useRemoveMember,
	useUpdateMemberRole,
	useUpdateOrganizationRole,
} from "@/hooks";
import type { types } from "@/lib/brand-client";
import type { OrgResource } from "@/lib/permissions/definitions";
import { ACTION_LABELS, ORG_RESOURCE_LABELS, ORG_STATEMENT } from "@/lib/permissions/definitions";
import { showToast } from "@/lib/toast";

export type Member = types.MemberResponse;

export interface Invitation {
	id: string;
	email: string;
	role: string;
	status: string;
	expiresAt: string;
	createdAt: string;
}

export type MemberRole = "owner" | "admin" | "member";

// =============================================================================
// LOADING SKELETON
// =============================================================================

export function TeamSkeleton() {
	return (
		<div className="space-y-6 pb-20">
			{/* Header */}
			<div>
				<Skeleton width={96} height={28} borderRadius={8} />
				<Skeleton width={224} height={16} borderRadius={6} className="mt-2" />
			</div>

			{/* Stats — matches FinancialStatsGridBordered loading */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Members", value: "" },
					{ name: "Admins", value: "" },
					{ name: "Members", value: "" },
					{ name: "Pending", value: "" },
				]}
				loading
				columns={4}
			/>

			{/* Tab nav */}
			<div className="flex gap-1.5">
				<Skeleton width={80} height={36} borderRadius={999} />
				<Skeleton width={96} height={36} borderRadius={999} />
				<Skeleton width={64} height={36} borderRadius={999} />
			</div>

			{/* Member rows */}
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
					<Skeleton width={80} height={16} borderRadius={6} />
				</div>
				<div className="space-y-px p-3 sm:p-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex items-center gap-3 rounded-lg px-3 py-3">
							<div className="size-9 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
							<div className="flex-1 space-y-1.5">
								<Skeleton width={112} height={14} borderRadius={6} />
								<Skeleton width={160} height={12} borderRadius={6} />
							</div>
							<Skeleton width={56} height={20} borderRadius={999} />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// ROLE BADGE CONFIG
// =============================================================================

export function getRoleBadgeConfig(role: string): {
	label: string;
	color: "amber" | "sky" | "zinc";
} {
	const roleMap: Record<string, { label: string; color: "amber" | "sky" | "zinc" }> = {
		owner: { label: "Owner", color: "amber" },
		admin: { label: "Admin", color: "sky" },
		member: { label: "Member", color: "zinc" },
	};
	return roleMap[role] || { label: role, color: "zinc" };
}

// =============================================================================
// MEMBER ROW
// =============================================================================

export function MemberRow({
	member,
	isCurrentUser,
	canManage,
	onChangeRole,
	onRemove,
}: {
	member: Member;
	isCurrentUser: boolean;
	canManage: boolean;
	onChangeRole: (role: MemberRole) => void;
	onRemove: () => void;
}) {
	const roleConfig = getRoleBadgeConfig(member.role);
	const displayName = member.user?.name || "Member";
	const displayEmail = member.user?.email || `ID: ${member.userId.slice(0, 8)}...`;
	const initials = member.user?.name
		? member.user.name
				.split(" ")
				.map((n: string) => n[0])
				.slice(0, 2)
				.join("")
				.toUpperCase()
		: member.userId.slice(0, 2).toUpperCase();

	return (
		<div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
			<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
				{initials}
			</div>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{displayName}</p>
					{isCurrentUser && <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">you</span>}
				</div>
				<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{displayEmail}</p>
			</div>
			<Badge color={roleConfig.color}>{roleConfig.label}</Badge>
			{canManage && !isCurrentUser && member.role !== "owner" && (
				<Dropdown>
					<DropdownButton plain aria-label="Member options">
						<EllipsisVerticalIcon className="size-5 text-zinc-400" />
					</DropdownButton>
					<DropdownMenu anchor="bottom end">
						<DropdownItem onClick={() => onChangeRole("admin")}>
							<ShieldCheckIcon className="size-4" />
							Make Admin
						</DropdownItem>
						<DropdownItem onClick={() => onChangeRole("member")}>
							<UserIcon className="size-4" />
							Make Member
						</DropdownItem>
						<DropdownItem onClick={onRemove}>
							<TrashIcon className="size-4" />
							Remove
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			)}
		</div>
	);
}

// =============================================================================
// INVITATION ROW
// =============================================================================

export function InvitationRow({
	invitation,
	canManage,
	onCancel,
	isCancelling,
}: {
	invitation: Invitation;
	canManage: boolean;
	onCancel: () => void;
	isCancelling: boolean;
}) {
	const roleConfig = getRoleBadgeConfig(invitation.role);
	const expiresAt = invitation.expiresAt ? new Date(invitation.expiresAt) : null;
	const isExpired = expiresAt && expiresAt < new Date();

	return (
		<div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
			<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
				<EnvelopeIcon className="size-4 text-amber-600 dark:text-amber-400" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{invitation.email}</p>
				<div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
					<ClockIcon className="size-3" />
					<span>
						{isExpired
							? "Expired"
							: expiresAt
								? `Expires ${expiresAt.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`
								: "Pending"}
					</span>
				</div>
			</div>
			<Badge color={roleConfig.color}>{roleConfig.label}</Badge>
			{canManage && (
				<Button plain onClick={onCancel} disabled={isCancelling} className="text-zinc-400 hover:text-red-500">
					{isCancelling ? <ArrowPathIcon className="size-4 animate-spin" /> : <XMarkIcon className="size-5" />}
				</Button>
			)}
		</div>
	);
}

// =============================================================================
// INVITE MEMBER MODAL
// =============================================================================

export function InviteMemberModal({
	isOpen,
	onClose,
	organizationId,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	organizationId: string | undefined;
	onSuccess: () => void;
}) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<MemberRole>("member");
	const [error, setError] = useState<string | null>(null);

	const inviteMember = useInviteMember(organizationId);

	const handleSubmit = useCallback(async () => {
		if (!email.trim()) {
			setError("Email is required");
			return;
		}
		if (!email.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}
		try {
			await inviteMember.mutateAsync({ email: email.trim(), role });
			onSuccess();
			onClose();
			setEmail("");
			setRole("member");
			setError(null);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to send invitation"));
		}
	}, [email, role, inviteMember, onSuccess, onClose]);

	const handleClose = useCallback(() => {
		setEmail("");
		setRole("member");
		setError(null);
		onClose();
	}, [onClose]);

	return (
		<Dialog open={isOpen} onClose={handleClose} size="md">
			<DialogHeader
				icon={EnvelopeIcon}
				iconColor="emerald"
				title="Invite Team Member"
				description="Send an invitation to join your organization"
				onClose={handleClose}
			/>

			<DialogBody>
				<div className="space-y-4">
					{error && (
						<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
							<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
							<span className="text-sm text-red-700 dark:text-red-300">{error}</span>
						</div>
					)}
					<div>
						<label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
							Email Address
						</label>
						<Input
							id="invite-email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="colleague@company.com"
						/>
					</div>
					<div>
						<span id="role-label" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
							Role
						</span>
						{/* biome-ignore lint/a11y/useSemanticElements: styled button group, not a form fieldset */}
						<div role="group" aria-labelledby="role-label" className="grid grid-cols-2 gap-2">
							{(["admin", "member"] as const).map((r) => {
								const config = getRoleBadgeConfig(r);
								return (
									<button
										key={r}
										type="button"
										onClick={() => setRole(r)}
										className={clsx(
											"flex items-center gap-2.5 rounded-xl p-3 text-left ring-1 transition-all",
											role === r
												? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
												: "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700/60"
										)}
									>
										{r === "admin" ? <ShieldCheckIcon className="size-5" /> : <UserIcon className="size-5" />}
										<div>
											<p className="text-sm font-medium">{config.label}</p>
											<p className={clsx("text-xs", role === r ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-500")}>
												{r === "admin" ? "Can manage team" : "Standard access"}
											</p>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={handleClose}>
					Cancel
				</Button>
				<Button color="emerald" onClick={handleSubmit} disabled={inviteMember.isPending || !email.trim()}>
					{inviteMember.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Sending...
						</>
					) : (
						<>
							<EnvelopeIcon className="size-4" />
							Send Invitation
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// CHANGE ROLE DIALOG
// =============================================================================

export function ChangeRoleDialog({
	open,
	onClose,
	member,
	organizationId,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	member: Member | null;
	organizationId: string | undefined;
	onSuccess: () => void;
}) {
	const [selectedRole, setSelectedRole] = useState<MemberRole>("member");
	const updateRole = useUpdateMemberRole(organizationId);

	const handleSubmit = useCallback(async () => {
		if (!member) return;
		try {
			await updateRole.mutateAsync({ memberId: member.id, role: selectedRole });
			onSuccess();
			onClose();
		} catch (err) {
			console.error("Failed to update role:", getAPIErrorMessage(err));
		}
	}, [member, selectedRole, updateRole, onSuccess, onClose]);

	if (!member) return null;

	return (
		<Dialog open={open} onClose={onClose} size="sm">
			<DialogHeader
				icon={ShieldCheckIcon}
				iconColor="sky"
				title="Change Role"
				description={`Update role for ${member.user?.name || "this member"}`}
				onClose={onClose}
			/>
			<DialogBody>
				<div className="space-y-2">
					{(["admin", "member"] as const).map((r) => {
						const config = getRoleBadgeConfig(r);
						return (
							<button
								key={r}
								type="button"
								onClick={() => setSelectedRole(r)}
								className={clsx(
									"flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 transition-all",
									selectedRole === r
										? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
										: "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700/60"
								)}
							>
								{r === "admin" ? <ShieldCheckIcon className="size-5" /> : <UserIcon className="size-5" />}
								<div>
									<p className="font-medium">{config.label}</p>
									<p
										className={clsx(
											"text-sm",
											selectedRole === r ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-500"
										)}
									>
										{r === "admin" ? "Can manage team and settings" : "Standard access to resources"}
									</p>
								</div>
							</button>
						);
					})}
				</div>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="emerald" onClick={handleSubmit} disabled={updateRole.isPending}>
					{updateRole.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// REMOVE MEMBER DIALOG
// =============================================================================

export function RemoveMemberDialog({
	open,
	onClose,
	member,
	organizationId,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	member: Member | null;
	organizationId: string | undefined;
	onSuccess: () => void;
}) {
	const removeMember = useRemoveMember(organizationId);

	const handleRemove = useCallback(async () => {
		if (!member) return;
		try {
			await removeMember.mutateAsync(member.id);
			onSuccess();
			onClose();
		} catch (err) {
			console.error("Failed to remove member:", getAPIErrorMessage(err));
		}
	}, [member, removeMember, onSuccess, onClose]);

	if (!member) return null;

	return (
		<Dialog open={open} onClose={onClose} size="sm">
			<DialogHeader icon={TrashIcon} iconColor="red" title="Remove Team Member" onClose={onClose} />
			<DialogBody>
				<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
					<p className="text-sm text-red-700 dark:text-red-300">
						Are you sure you want to remove <strong>{member.user?.name || "this member"}</strong> from the organization?
						This action cannot be undone.
					</p>
				</div>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="red" onClick={handleRemove} disabled={removeMember.isPending}>
					{removeMember.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Removing...
						</>
					) : (
						<>
							<TrashIcon className="size-4" />
							Remove Member
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// ADD MEMBER DIALOG
// =============================================================================

export function AddMemberDialog({
	isOpen,
	onClose,
	organizationId,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	organizationId: string | undefined;
	onSuccess: () => void;
}) {
	const [userId, setUserId] = useState("");
	const [role, setRole] = useState<"admin" | "member">("member");
	const [error, setError] = useState<string | null>(null);

	const addMember = useAddMember(organizationId);

	const handleSubmit = useCallback(async () => {
		if (!userId.trim()) {
			setError("User ID is required");
			return;
		}
		try {
			await addMember.mutateAsync({ userId: userId.trim(), role });
			onSuccess();
			onClose();
			setUserId("");
			setRole("member");
			setError(null);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to add member"));
		}
	}, [userId, role, addMember, onSuccess, onClose]);

	const handleClose = useCallback(() => {
		setUserId("");
		setRole("member");
		setError(null);
		onClose();
	}, [onClose]);

	return (
		<Dialog open={isOpen} onClose={handleClose} size="sm">
			<DialogHeader
				icon={UserGroupIcon}
				iconColor="violet"
				title="Add Member Directly"
				description="Add an existing user without sending an invitation."
				onClose={handleClose}
			/>
			<DialogBody>
				<div className="space-y-4">
					{error && (
						<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
							<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
							<span className="text-sm text-red-700 dark:text-red-300">{error}</span>
						</div>
					)}
					<div>
						<label
							htmlFor="add-member-user-id"
							className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white"
						>
							User ID
						</label>
						<Input
							id="add-member-user-id"
							value={userId}
							onChange={(e) => setUserId(e.target.value)}
							placeholder="Enter user ID"
						/>
					</div>
					<div>
						<span className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">Role</span>
						<div className="grid grid-cols-2 gap-2">
							{(["admin", "member"] as const).map((r) => {
								const config = getRoleBadgeConfig(r);
								return (
									<button
										key={r}
										type="button"
										onClick={() => setRole(r)}
										className={clsx(
											"flex items-center gap-2.5 rounded-xl p-3 text-left ring-1 transition-all",
											role === r
												? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
												: "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700/60"
										)}
									>
										{r === "admin" ? <ShieldCheckIcon className="size-5" /> : <UserIcon className="size-5" />}
										<div>
											<p className="text-sm font-medium">{config.label}</p>
										</div>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={handleClose}>
					Cancel
				</Button>
				<Button color="emerald" onClick={handleSubmit} disabled={addMember.isPending || !userId.trim()}>
					{addMember.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Adding...
						</>
					) : (
						<>
							<UserGroupIcon className="size-4" />
							Add Member
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// ROLES SECTION
// =============================================================================

export function RolesSection({ organizationId }: { organizationId: string | undefined }) {
	const { data: roles, loading } = useOrganizationRoles(organizationId);
	const createRole = useCreateOrganizationRole(organizationId);
	const deleteRole = useDeleteOrganizationRole(organizationId);
	const updateRole = useUpdateOrganizationRole(organizationId);

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [newRoleName, setNewRoleName] = useState("");
	const [createError, setCreateError] = useState<string | null>(null);
	const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
	const [editingRole, setEditingRole] = useState<{
		id: string;
		role: string;
		permission: { [key: string]: string[] };
	} | null>(null);
	const [editPermissions, setEditPermissions] = useState<Record<string, string[]>>({});

	const handleCreateRole = useCallback(async () => {
		if (!newRoleName.trim()) {
			setCreateError("Role name is required");
			return;
		}
		try {
			await createRole.mutateAsync({ role: newRoleName.trim() });
			setShowCreateDialog(false);
			setNewRoleName("");
			setCreateError(null);
			showToast.success("Role created");
		} catch (err) {
			setCreateError(getAPIErrorMessage(err, "Failed to create role"));
		}
	}, [newRoleName, createRole]);

	const handleEditRole = useCallback((role: { id: string; role: string; permission: { [key: string]: string[] } }) => {
		setEditingRole(role);
		setEditPermissions(role.permission || {});
	}, []);

	const togglePermission = useCallback((resource: string, action: string) => {
		setEditPermissions((prev) => {
			const current = prev[resource] || [];
			const has = current.includes(action);
			const updated = has ? current.filter((a) => a !== action) : [...current, action];
			if (updated.length === 0) {
				const { [resource]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [resource]: updated };
		});
	}, []);

	const toggleAllForResource = useCallback((resource: string, actions: readonly string[]) => {
		setEditPermissions((prev) => {
			const current = prev[resource] || [];
			const allSelected = actions.every((a) => current.includes(a));
			if (allSelected) {
				const { [resource]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [resource]: [...actions] };
		});
	}, []);

	const handleSaveRole = useCallback(async () => {
		if (!editingRole) return;
		try {
			await updateRole.mutateAsync({ roleId: editingRole.id, permission: editPermissions });
			setEditingRole(null);
			showToast.success("Permissions updated");
		} catch (err) {
			showToast.error(err, "Failed to update permissions");
		}
	}, [editingRole, editPermissions, updateRole]);

	const handleDeleteRole = useCallback(
		async (roleId: string) => {
			setDeletingRoleId(roleId);
			try {
				await deleteRole.mutateAsync(roleId);
				showToast.success("Role deleted");
			} catch (err) {
				showToast.error(err, "Failed to delete role");
			} finally {
				setDeletingRoleId(null);
			}
		},
		[deleteRole]
	);

	if (loading) {
		return (
			<div>
				<h3 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Roles</h3>
				<div className="space-y-2">
					{[1, 2].map((i) => (
						<div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
					Roles
					<span className="ml-2 text-xs font-normal text-zinc-500">{roles.length}</span>
				</h3>
				<Button color="dark/zinc" onClick={() => setShowCreateDialog(true)}>
					<PlusIcon className="size-4" />
					Add Role
				</Button>
			</div>
			<div className="p-3 sm:p-4">
				{roles.length === 0 ? (
					<EmptyState
						preset="generic"
						title="No custom roles"
						description="Create custom roles to fine-tune permissions for your team"
						action={{ label: "Create Role", onClick: () => setShowCreateDialog(true) }}
					/>
				) : (
					<div className="space-y-px">
						{roles.map((role) => {
							const permCount = Object.keys(role.permission || {}).length;
							return (
								<div
									key={role.id}
									className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
								>
									<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
										<ShieldCheckIcon className="size-4 text-violet-600 dark:text-violet-400" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium capitalize text-zinc-900 dark:text-white">{role.role}</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											{permCount} permission group{permCount !== 1 ? "s" : ""}
										</p>
									</div>
									<Button plain onClick={() => handleEditRole(role)} className="text-zinc-400 hover:text-zinc-600">
										<PencilIcon className="size-4" />
									</Button>
									<Button
										plain
										onClick={() => handleDeleteRole(role.id)}
										disabled={deletingRoleId === role.id}
										className="text-zinc-400 hover:text-red-500"
									>
										{deletingRoleId === role.id ? (
											<ArrowPathIcon className="size-4 animate-spin" />
										) : (
											<TrashIcon className="size-4" />
										)}
									</Button>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Create Role Dialog */}
			<Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} size="sm">
				<DialogHeader
					icon={PlusIcon}
					iconColor="violet"
					title="Create Role"
					description="Create a new custom role for your organization"
					onClose={() => {
						setShowCreateDialog(false);
						setNewRoleName("");
						setCreateError(null);
					}}
				/>
				<DialogBody>
					<div className="space-y-4">
						{createError && (
							<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
								<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
								<span className="text-sm text-red-700 dark:text-red-300">{createError}</span>
							</div>
						)}
						<div>
							<label htmlFor="role-name" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
								Role Name
							</label>
							<Input
								id="role-name"
								value={newRoleName}
								onChange={(e) => setNewRoleName(e.target.value)}
								placeholder="e.g. editor, viewer, moderator"
							/>
						</div>
					</div>
				</DialogBody>
				<DialogActions>
					<Button
						plain
						onClick={() => {
							setShowCreateDialog(false);
							setNewRoleName("");
							setCreateError(null);
						}}
					>
						Cancel
					</Button>
					<Button color="emerald" onClick={handleCreateRole} disabled={createRole.isPending || !newRoleName.trim()}>
						{createRole.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Creating…
							</>
						) : (
							<>
								<ShieldCheckIcon className="size-4" />
								Create Role
							</>
						)}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Role Dialog */}
			<Dialog open={!!editingRole} onClose={() => setEditingRole(null)} size="2xl">
				<DialogHeader
					icon={ShieldCheckIcon}
					iconColor="violet"
					title={`Edit Role: ${editingRole?.role || ""}`}
					description="Toggle permissions for each resource. Changes are saved when you click Save."
					onClose={() => setEditingRole(null)}
				/>
				<DialogBody>
					<div className="-mx-1 max-h-[60vh] space-y-1 overflow-y-auto px-1">
						{(Object.entries(ORG_STATEMENT) as [OrgResource, readonly string[]][]).map(([resource, actions]) => {
							const currentActions = editPermissions[resource] || [];
							const allSelected = actions.every((a) => currentActions.includes(a));
							const someSelected = currentActions.length > 0 && !allSelected;

							return (
								<div key={resource} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
									<div className="flex items-center gap-3">
										<button
											type="button"
											onClick={() => toggleAllForResource(resource, actions)}
											className={clsx(
												"flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
												allSelected
													? "border-emerald-500 bg-emerald-500 text-white"
													: someSelected
														? "border-emerald-500 bg-emerald-500/20"
														: "border-zinc-300 dark:border-zinc-600"
											)}
										>
											{allSelected && (
												<svg className="size-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
													<path
														d="M2 6l3 3 5-5"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											)}
											{someSelected && <div className="h-0.5 w-2.5 rounded-full bg-emerald-500" />}
										</button>
										<span className="text-sm font-medium text-zinc-900 dark:text-white">
											{ORG_RESOURCE_LABELS[resource]}
										</span>
										{currentActions.length > 0 && (
											<Badge color="emerald" className="ml-auto">
												{currentActions.length}/{actions.length}
											</Badge>
										)}
									</div>
									<div className="mt-2 flex flex-wrap gap-1.5 pl-8">
										{actions.map((action) => {
											const isActive = currentActions.includes(action);
											return (
												<button
													key={action}
													type="button"
													onClick={() => togglePermission(resource, action)}
													className={clsx(
														"rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
														isActive
															? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-800"
															: "bg-white text-zinc-500 ring-1 ring-zinc-200 hover:bg-zinc-100 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
													)}
												>
													{ACTION_LABELS[action] || action}
												</button>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setEditingRole(null)}>
						Cancel
					</Button>
					<Button color="emerald" onClick={handleSaveRole} disabled={updateRole.isPending}>
						{updateRole.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Saving…
							</>
						) : (
							"Save Permissions"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
