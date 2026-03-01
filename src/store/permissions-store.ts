/**
 * Permissions Store - Better Auth RBAC
 *
 * Stores user's org role and provides permission checks using
 * the shared definitions from the backend. No CASL dependency.
 *
 * SECURITY NOTE: All checks are for UI/UX only. Server always enforces.
 */

import { create } from "zustand";
import {
	canPerformAllOrgActions,
	canPerformAnyOrgAction,
	canPerformOrgAction,
	canWriteOrgResource,
	getOrgAllowedActions,
	hasAnyOrgPermission,
	isReadOnlyOrgResource,
	type OrgAction,
	type OrgResource,
	type OrgRole,
} from "@/lib/permissions/access-control-client";

// =============================================================================
// TYPES
// =============================================================================

export type { OrgResource, OrgAction, OrgRole };

export interface PermissionContext {
	userId: string;
	organizationRole?: string;
}

// =============================================================================
// STORE
// =============================================================================

interface PermissionsState {
	context: PermissionContext | null;
	setPermissions: (context: PermissionContext) => void;
	clearPermissions: () => void;
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
	context: null,

	setPermissions: (context) => {
		set({ context });
	},

	clearPermissions: () => set({ context: null }),
}));

// =============================================================================
// HOOKS
// =============================================================================

export function useOrgRole(): string | undefined {
	return usePermissionsStore((state) => state.context?.organizationRole);
}

export function usePermissionContext(): PermissionContext | null {
	return usePermissionsStore((state) => state.context);
}

/**
 * Check if user can perform an action on an org resource.
 *
 * @example
 * const canEdit = useCan("campaign", "update");
 * const canCreate = useCan("listing", "create");
 */
export function useCan<R extends OrgResource>(resource: R, action: OrgAction<R>): boolean {
	const role = useOrgRole();
	// When role hasn't loaded yet, default to true (server enforces)
	if (role === undefined) return true;
	return canPerformOrgAction(role, resource, action);
}

/**
 * Check if user cannot perform an action on an org resource.
 */
export function useCannot<R extends OrgResource>(resource: R, action: OrgAction<R>): boolean {
	return !useCan(resource, action);
}

/**
 * Check if user can perform ANY of the given permissions (OR logic).
 */
export function useCanAny(permissions: Array<{ resource: OrgResource; action: string }>): boolean {
	const role = useOrgRole();
	return canPerformAnyOrgAction(role, permissions);
}

/**
 * Check if user can perform ALL of the given permissions (AND logic).
 */
export function useCanAll(permissions: Array<{ resource: OrgResource; action: string }>): boolean {
	const role = useOrgRole();
	return canPerformAllOrgActions(role, permissions);
}

/**
 * Check if user can write (create/update/delete) to a resource.
 */
export function useCanWrite(resource: OrgResource): boolean {
	const role = useOrgRole();
	return canWriteOrgResource(role, resource);
}

/**
 * Check if user has read-only access to a resource.
 */
export function useIsReadOnly(resource: OrgResource): boolean {
	const role = useOrgRole();
	return isReadOnlyOrgResource(role, resource);
}

/**
 * Check if user has any permission on a resource.
 */
export function useHasAnyPermission(resource: OrgResource): boolean {
	const role = useOrgRole();
	return hasAnyOrgPermission(role, resource);
}

/**
 * Get all allowed actions for the current role on a resource.
 */
export function useAllowedActions<R extends OrgResource>(resource: R): readonly OrgAction<R>[] {
	const role = useOrgRole();
	return getOrgAllowedActions(role, resource);
}
