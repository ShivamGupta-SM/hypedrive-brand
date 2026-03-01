/**
 * =============================================================================
 * CLIENT-SIDE ACCESS CONTROL FOR FRONTEND APPLICATIONS
 * =============================================================================
 *
 * Permission helper functions for frontend use.
 * All permission data is imported from the shared definitions file.
 *
 * For frontend projects, copy both:
 * - auth/permissions/definitions.ts (data + types, zero deps)
 * - auth/types/access-control-client.ts (this file — helper functions)
 *
 * SECURITY NOTE:
 * These checks are for UI/UX purposes ONLY (show/hide elements, disable buttons).
 * The server ALWAYS enforces permissions — never trust client-side checks for security.
 *
 * @version 2.0.0
 * @lastUpdated 2026-02-14
 */

// =============================================================================
// RE-EXPORT ALL DATA & TYPES FROM SINGLE SOURCE OF TRUTH
// =============================================================================

export {
	ACTION_LABELS,
	ADMIN_RESOURCE_LABELS,
	ADMIN_ROLE_DESCRIPTIONS,
	ADMIN_ROLE_LABELS,
	// Role permission matrices
	ADMIN_ROLE_PERMISSIONS,
	ADMIN_ROLES,
	// Statement definitions
	ADMIN_STATEMENT,
	type AdminAction,
	// Types
	type AdminResource,
	type AdminRole,
	type AnyAdminAction,
	type AnyOrgAction,
	ORG_RESOURCE_LABELS,
	ORG_ROLE_DESCRIPTIONS,
	// Labels
	ORG_ROLE_LABELS,
	ORG_ROLE_PERMISSIONS,
	// Role lists
	ORG_ROLES,
	ORG_STATEMENT,
	type OrgAction,
	type OrgResource,
	type OrgRole,
} from "./definitions";

import {
	ADMIN_ROLE_PERMISSIONS,
	type AdminAction,
	type AdminResource,
	type AdminRole,
	ORG_ROLE_PERMISSIONS,
	type OrgAction,
	type OrgResource,
	type OrgRole,
} from "./definitions";

// For backward compatibility — re-export ORG_STATEMENT as ORG_PERMISSIONS
export {
	ADMIN_STATEMENT as ADMIN_PERMISSIONS,
	ORG_STATEMENT as ORG_PERMISSIONS,
} from "./definitions";

// =============================================================================
// CORE PERMISSION CHECK FUNCTIONS
// =============================================================================

/**
 * Check if an organization role can perform an action on a resource.
 *
 * @example
 * ```tsx
 * if (canPerformOrgAction('campaignManager', 'campaign', 'create')) {
 *   return <Button>Create Campaign</Button>;
 * }
 * ```
 */
export function canPerformOrgAction<R extends OrgResource>(
	role: string | undefined | null,
	resource: R,
	action: OrgAction<R>
): boolean {
	if (!role) return false;
	const rolePerms = ORG_ROLE_PERMISSIONS[role as OrgRole];
	if (!rolePerms) return false;

	const resourcePerms = rolePerms[resource] as readonly string[];
	return resourcePerms?.includes(action as string) ?? false;
}

/**
 * Check if a platform/admin role can perform an action on a resource.
 *
 * @example
 * ```tsx
 * if (canPerformAdminAction('manager', 'campaign', 'approve')) {
 *   return <Button>Approve</Button>;
 * }
 * ```
 */
export function canPerformAdminAction<R extends AdminResource>(
	role: string | undefined | null,
	resource: R,
	action: AdminAction<R>
): boolean {
	if (!role) return false;
	const rolePerms = ADMIN_ROLE_PERMISSIONS[role as AdminRole];
	if (!rolePerms) return false;

	const resourcePerms = rolePerms[resource] as readonly string[];
	return resourcePerms?.includes(action as string) ?? false;
}

/**
 * Check multiple permissions at once (AND logic - all must pass).
 */
export function canPerformAllOrgActions(
	role: string | undefined | null,
	permissions: Array<{ resource: OrgResource; action: string }>
): boolean {
	return permissions.every((p) =>
		canPerformOrgAction(role, p.resource, p.action as OrgAction<typeof p.resource>)
	);
}

/**
 * Check multiple permissions at once (OR logic - any must pass).
 */
export function canPerformAnyOrgAction(
	role: string | undefined | null,
	permissions: Array<{ resource: OrgResource; action: string }>
): boolean {
	return permissions.some((p) =>
		canPerformOrgAction(role, p.resource, p.action as OrgAction<typeof p.resource>)
	);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all allowed actions for a role on a resource (organization context).
 */
export function getOrgAllowedActions<R extends OrgResource>(
	role: string | undefined | null,
	resource: R
): readonly OrgAction<R>[] {
	if (!role) return [];
	const rolePerms = ORG_ROLE_PERMISSIONS[role as OrgRole];
	if (!rolePerms) return [];

	return (rolePerms[resource] ?? []) as readonly OrgAction<R>[];
}

/**
 * Get all allowed actions for a role on a resource (admin context).
 */
export function getAdminAllowedActions<R extends AdminResource>(
	role: string | undefined | null,
	resource: R
): readonly AdminAction<R>[] {
	if (!role) return [];
	const rolePerms = ADMIN_ROLE_PERMISSIONS[role as AdminRole];
	if (!rolePerms) return [];

	return (rolePerms[resource] ?? []) as readonly AdminAction<R>[];
}

/**
 * Check if a role has any permission on a resource.
 * Useful for showing/hiding entire sections.
 */
export function hasAnyOrgPermission(
	role: string | undefined | null,
	resource: OrgResource
): boolean {
	const actions = getOrgAllowedActions(role, resource);
	return actions.length > 0;
}

/**
 * Check if a role has any admin permission on a resource.
 */
export function hasAnyAdminPermission(
	role: string | undefined | null,
	resource: AdminResource
): boolean {
	const actions = getAdminAllowedActions(role, resource);
	return actions.length > 0;
}

/**
 * Check if user can write (create/update/delete) to a resource.
 */
export function canWriteOrgResource(
	role: string | undefined | null,
	resource: OrgResource
): boolean {
	const writeActions = ["create", "update", "delete"];
	const allowedActions = getOrgAllowedActions(role, resource);
	return allowedActions.some((action) => writeActions.includes(action as string));
}

/**
 * Check if user can only read a resource (no write permissions).
 */
export function isReadOnlyOrgResource(
	role: string | undefined | null,
	resource: OrgResource
): boolean {
	const allowedActions = getOrgAllowedActions(role, resource);
	return allowedActions.length > 0 && !canWriteOrgResource(role, resource);
}

/**
 * Check if role is a valid organization role.
 */
export function isValidOrgRole(role: string | undefined | null): role is OrgRole {
	if (!role) return false;
	return role in ORG_ROLE_PERMISSIONS;
}

/**
 * Check if role is a valid admin role.
 */
export function isValidAdminRole(role: string | undefined | null): role is AdminRole {
	if (!role) return false;
	return role in ADMIN_ROLE_PERMISSIONS;
}

// =============================================================================
// REACT HOOKS (Optional - for React projects)
// =============================================================================
// Uncomment if using React. These hooks work with any auth context.

/*
import { useMemo } from 'react';

interface UseOrgPermissionsOptions {
  role: string | undefined | null;
}

export function useOrgPermissions({ role }: UseOrgPermissionsOptions) {
  return useMemo(() => ({
    can: <R extends OrgResource>(resource: R, action: OrgAction<R>) =>
      canPerformOrgAction(role, resource, action),
    canAny: (permissions: Array<{ resource: OrgResource; action: string }>) =>
      canPerformAnyOrgAction(role, permissions),
    canAll: (permissions: Array<{ resource: OrgResource; action: string }>) =>
      canPerformAllOrgActions(role, permissions),
    canWrite: (resource: OrgResource) => canWriteOrgResource(role, resource),
    isReadOnly: (resource: OrgResource) => isReadOnlyOrgResource(role, resource),
    hasAny: (resource: OrgResource) => hasAnyOrgPermission(role, resource),
    getAllowedActions: <R extends OrgResource>(resource: R) =>
      getOrgAllowedActions(role, resource),
    role,
    roleLabel: role ? ORG_ROLE_LABELS[role as OrgRole] : undefined,
  }), [role]);
}

interface UseAdminPermissionsOptions {
  role: string | undefined | null;
}

export function useAdminPermissions({ role }: UseAdminPermissionsOptions) {
  return useMemo(() => ({
    can: <R extends AdminResource>(resource: R, action: AdminAction<R>) =>
      canPerformAdminAction(role, resource, action),
    hasAny: (resource: AdminResource) => hasAnyAdminPermission(role, resource),
    getAllowedActions: <R extends AdminResource>(resource: R) =>
      getAdminAllowedActions(role, resource),
    role,
    roleLabel: role ? ADMIN_ROLE_LABELS[role as AdminRole] : undefined,
  }), [role]);
}
*/

// =============================================================================
// PERMISSION MATRIX GENERATOR (for debugging/documentation)
// =============================================================================

export function generateOrgPermissionMatrix(): Record<string, Record<string, string[]>> {
	const matrix: Record<string, Record<string, string[]>> = {};
	for (const [role, permissions] of Object.entries(ORG_ROLE_PERMISSIONS)) {
		matrix[role] = {};
		for (const [resource, actions] of Object.entries(permissions)) {
			matrix[role][resource] = [...(actions as string[])];
		}
	}
	return matrix;
}

export function generateAdminPermissionMatrix(): Record<string, Record<string, string[]>> {
	const matrix: Record<string, Record<string, string[]>> = {};
	for (const [role, permissions] of Object.entries(ADMIN_ROLE_PERMISSIONS)) {
		matrix[role] = {};
		for (const [resource, actions] of Object.entries(permissions)) {
			matrix[role][resource] = [...(actions as string[])];
		}
	}
	return matrix;
}
