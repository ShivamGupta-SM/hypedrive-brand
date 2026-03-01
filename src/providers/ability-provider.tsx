/**
 * AbilityProvider - Better Auth RBAC Integration
 *
 * Provides permission context to the entire app.
 * Permissions are determined by org role from the organization store.
 *
 * Usage:
 * ```tsx
 * <Can resource="campaign" action="read">
 *   <CampaignSection />
 * </Can>
 *
 * const canEdit = useCan("campaign", "update");
 * ```
 */

import type { ReactNode } from "react";

import {
	canPerformOrgAction,
	type OrgAction,
	type OrgResource,
} from "@/lib/permissions/access-control-client";
import { useOrgRole } from "@/store/permissions-store";

// =============================================================================
// PROVIDER
// =============================================================================

interface AbilityProviderProps {
	children: ReactNode;
}

/**
 * AbilityProvider - Provides permission context to the app.
 * Permissions are synced to the store by the $orgSlug route's beforeLoad + useEffect.
 * This provider simply renders children — the Can component and hooks read from the store.
 */
export function AbilityProvider({ children }: AbilityProviderProps) {
	return <>{children}</>;
}

// =============================================================================
// CAN COMPONENT
// =============================================================================

interface CanProps<R extends OrgResource> {
	resource: R;
	action: OrgAction<R>;
	children: ReactNode | ((allowed: boolean) => ReactNode);
	passThrough?: boolean;
	not?: boolean;
}

/**
 * Can component - Declarative permission checking
 *
 * Usage:
 * ```tsx
 * <Can resource="wallet" action="read">
 *   <WalletBalance />
 * </Can>
 *
 * <Can resource="campaign" action="delete" passThrough>
 *   {(allowed) => <Button disabled={!allowed}>Delete</Button>}
 * </Can>
 * ```
 */
export function Can<R extends OrgResource>({
	resource,
	action,
	children,
	passThrough,
	not,
}: CanProps<R>) {
	const role = useOrgRole();

	// When role hasn't loaded yet, default to showing content.
	// Server always enforces permissions — hiding nav items while loading makes the app unusable.
	const canDo = role === undefined ? true : canPerformOrgAction(role, resource, action);
	const allowed = not ? !canDo : canDo;

	if (passThrough || typeof children === "function") {
		return typeof children === "function" ? children(allowed) : children;
	}

	return allowed ? children : null;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

export {
	type OrgAction,
	type OrgResource,
	type OrgRole,
	type PermissionContext,
	useAllowedActions,
	useCan,
	useCanAll,
	useCanAny,
	useCannot,
	useCanWrite,
	useHasAnyPermission,
	useIsReadOnly,
	useOrgRole,
} from "@/store/permissions-store";
