import {
	ArrowPathIcon,
	EllipsisVerticalIcon,
	ExclamationTriangleIcon,
	PencilIcon,
	PlusIcon,
	ShieldCheckIcon,
	TrashIcon,
	UserIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useCallback, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Input } from "@/components/input";
import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import {
	useCreateOrganizationRole,
	useDeleteOrganizationRole,
	useOrganizationRoles,
	useUpdateOrganizationRole,
} from "@/features/organization/hooks-roles";
import { getAPIErrorMessage } from "@/hooks/api-client";
import { useOrgContext } from "@/hooks/use-org-context";
import type { OrgResource } from "@/lib/permissions/definitions";
import { ACTION_LABELS, ORG_RESOURCE_LABELS, ORG_STATEMENT } from "@/lib/permissions/definitions";
import { showToast } from "@/lib/toast";
import { formatRoleName } from "./components";

// Built-in role definitions for visual display
const BUILTIN_ROLES = [
	{
		role: "owner",
		description: "Full control over the organization",
		color: "bg-amber-100 dark:bg-amber-900/30",
		iconColor: "text-amber-600 dark:text-amber-400",
		badgeColor: "amber" as const,
	},
	{
		role: "admin",
		description: "Manage team, campaigns, and settings",
		color: "bg-sky-100 dark:bg-sky-900/30",
		iconColor: "text-sky-600 dark:text-sky-400",
		badgeColor: "sky" as const,
	},
	{
		role: "member",
		description: "Standard access to organization resources",
		color: "bg-zinc-100 dark:bg-zinc-800",
		iconColor: "text-zinc-600 dark:text-zinc-400",
		badgeColor: "zinc" as const,
	},
];

export function TeamRoles() {
	const { organizationId } = useOrgContext();
	const canManageMembers = useCan("member", "update");

	if (!canManageMembers) {
		return (
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="p-6">
					<EmptyState preset="generic" title="No access" description="You don't have permission to manage roles." />
				</div>
			</div>
		);
	}

	return <RolesContent organizationId={organizationId} />;
}

function RolesContent({ organizationId }: { organizationId: string | undefined }) {
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
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<div className="flex items-start gap-3.5 p-4 sm:p-5">
							<div className="size-12 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
							<div className="flex-1">
								<div className="h-4 w-20 animate-pulse rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
								<div className="mt-1.5 h-3 w-36 animate-pulse rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
							</div>
						</div>
						<div className="flex items-center justify-center border-t border-zinc-200 bg-zinc-50/50 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/30">
							<div className="h-5 w-20 animate-pulse rounded-full bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-5">
			{/* Built-in roles */}
			<div>
				<p className="mb-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">Built-in Roles</p>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
					{BUILTIN_ROLES.map((builtIn) => (
						<div
							key={builtIn.role}
							className="flex flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
						>
							<div className="flex items-start gap-3.5 p-4 sm:p-5">
								<div className={clsx("flex size-12 shrink-0 items-center justify-center rounded-full", builtIn.color)}>
									{builtIn.role === "member" ? (
										<UserIcon className={clsx("size-5", builtIn.iconColor)} />
									) : (
										<ShieldCheckIcon className={clsx("size-5", builtIn.iconColor)} />
									)}
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">
										{formatRoleName(builtIn.role)}
									</p>
									<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{builtIn.description}</p>
								</div>
							</div>
							<div className="mt-auto flex items-center justify-center border-t border-zinc-200 bg-zinc-50/50 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/30">
								<Badge color={builtIn.badgeColor}>System Role</Badge>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Custom roles */}
			<div>
				<div className="mb-2.5 flex items-center justify-between">
					<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
						Custom Roles{roles.length > 0 ? ` (${roles.length})` : ""}
					</p>
					<Button color="dark/zinc" onClick={() => setShowCreateDialog(true)}>
						<PlusIcon className="size-4" />
						Add Role
					</Button>
				</div>

				{roles.length === 0 ? (
					<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
						<div className="p-6">
							<EmptyState
								preset="generic"
								title="No custom roles"
								description="Create custom roles to fine-tune permissions for your team members."
								action={{ label: "Create Role", onClick: () => setShowCreateDialog(true) }}
							/>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{roles.map((role) => {
							const permCount = Object.keys(role.permission || {}).length;
							const totalActions = Object.values(role.permission || {}).reduce(
								(sum, actions) => sum + (actions?.length || 0),
								0
							);

							return (
								<div
									key={role.id}
									className="group/card flex flex-col overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 transition-all hover:shadow-sm hover:ring-zinc-300 dark:bg-zinc-900 dark:ring-zinc-800 dark:hover:ring-zinc-700"
								>
									<div className="flex items-start gap-3.5 p-4 sm:p-5">
										{/* Icon */}
										<div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
											<ShieldCheckIcon className="size-5 text-violet-600 dark:text-violet-400" />
										</div>

										{/* Info */}
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-zinc-900 dark:text-white">
												{formatRoleName(role.role)}
											</p>
											<p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
												{permCount > 0
													? `${totalActions} permission${totalActions !== 1 ? "s" : ""} across ${permCount} resource${permCount !== 1 ? "s" : ""}`
													: "No permissions configured"}
											</p>
										</div>

										{/* Actions */}
										<Dropdown>
											<DropdownButton
												plain
												aria-label="Role options"
												className="size-7 shrink-0 rounded-lg opacity-0 group-hover/card:opacity-100"
											>
												<EllipsisVerticalIcon className="size-4 text-zinc-400" />
											</DropdownButton>
											<DropdownMenu anchor="bottom end">
												<DropdownItem onClick={() => handleEditRole(role)}>
													<PencilIcon className="size-4" />
													Edit Permissions
												</DropdownItem>
												<DropdownItem onClick={() => handleDeleteRole(role.id)} disabled={deletingRoleId === role.id}>
													<TrashIcon className="size-4 text-red-500" />
													Delete Role
												</DropdownItem>
											</DropdownMenu>
										</Dropdown>
									</div>

									{/* Footer: permission chips */}
									<div className="mt-auto border-t border-zinc-200 bg-zinc-50/50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/30">
										{permCount > 0 ? (
											<div className="flex flex-wrap items-center justify-center gap-1">
												{Object.keys(role.permission || {})
													.slice(0, 3)
													.map((resource) => (
														<span
															key={resource}
															className="rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
														>
															{ORG_RESOURCE_LABELS[resource as OrgResource] || resource}
														</span>
													))}
												{permCount > 3 && (
													<span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
														+{permCount - 3} more
													</span>
												)}
											</div>
										) : (
											<p className="text-center text-[11px] text-zinc-400 dark:text-zinc-500">
												No permissions configured
											</p>
										)}
									</div>
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
								Creating...
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
					title={`Edit Role: ${editingRole ? formatRoleName(editingRole.role) : ""}`}
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
								Saving...
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
