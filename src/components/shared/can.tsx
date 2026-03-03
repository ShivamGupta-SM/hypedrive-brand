/**
 * Declarative permission check component + hook.
 *
 * Reads the `can()` closure from useOrgContext (router context).
 * No Zustand, no module-level mutables, no useEffect sync.
 *
 * SECURITY NOTE: All checks are for UI/UX only. Server always enforces.
 */

import type { ReactNode } from "react";
import { useOrgContext } from "@/hooks/use-org-context";
import type { OrgAction, OrgResource } from "@/lib/permissions/definitions";

// =============================================================================
// HOOK
// =============================================================================

/**
 * Check if user can perform an action on an org resource.
 *
 * @example
 * const canEdit = useCan("campaign", "update");
 * const canCreate = useCan("listing", "create");
 */
export function useCan<R extends OrgResource>(resource: R, action: OrgAction<R>): boolean {
	const { can } = useOrgContext();
	return can(resource, action);
}

// =============================================================================
// COMPONENT
// =============================================================================

interface CanProps<R extends OrgResource> {
	resource: R;
	action: OrgAction<R>;
	children: ReactNode | ((allowed: boolean) => ReactNode);
	passThrough?: boolean;
	not?: boolean;
}

/**
 * Declarative permission check component.
 *
 * @example
 * <Can resource="wallet" action="read">
 *   <WalletBalance />
 * </Can>
 *
 * <Can resource="campaign" action="delete" passThrough>
 *   {(allowed) => <Button disabled={!allowed}>Delete</Button>}
 * </Can>
 */
export function Can<R extends OrgResource>({ resource, action, children, passThrough, not }: CanProps<R>) {
	const { can } = useOrgContext();
	const canDo = can(resource, action);
	const allowed = not ? !canDo : canDo;

	if (passThrough || typeof children === "function") {
		return typeof children === "function" ? children(allowed) : children;
	}

	return allowed ? children : null;
}
