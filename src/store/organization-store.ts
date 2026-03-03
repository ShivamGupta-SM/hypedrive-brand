/**
 * Organization Store — Ephemeral client-side cache for multi-tenancy.
 *
 * NOT the source of truth — organizations are resolved server-side
 * in route guards (beforeLoad). This store is populated by the
 * $orgSlug route's OrgLayoutWrapper useEffect.
 *
 * Only for components ABOVE the $orgSlug route tree that cannot access
 * router context (OrganizationSwitcher, NotificationPopover, SearchDialog,
 * approval pages). All pages INSIDE $orgSlug should use useOrgContext() instead.
 *
 * No localStorage persistence — state comes from server on every page load.
 */

import { create } from "zustand";

// Approval status type - matches API response
export type ApprovalStatus = "draft" | "pending" | "approved" | "rejected" | "banned";

// Organization type matching listOrganizations API response
export interface Organization {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	createdAt: string;
	approvalStatus?: string;
}

export interface OrganizationState {
	currentOrganization: Organization | null;
	organizations: Organization[];
	isLoading: boolean;

	setCurrentOrganization: (org: Organization) => void;
	setOrganizations: (orgs: Organization[]) => void;
	switchOrganization: (orgId: string) => void;
	clearOrganization: () => void;
	setLoading: (loading: boolean) => void;
}

export const useOrganizationStore = create<OrganizationState>()((set, get) => ({
	currentOrganization: null,
	organizations: [],
	isLoading: false,

	setCurrentOrganization: (org) => {
		set({ currentOrganization: org });
	},

	setOrganizations: (orgs) => {
		const { currentOrganization } = get();
		set({ organizations: orgs });

		// Auto-select first org if no current selection
		if (!currentOrganization && orgs.length > 0) {
			set({ currentOrganization: orgs[0] });
		} else if (currentOrganization) {
			// Validate current org still exists in list
			const stillValid = orgs.some((o) => o.id === currentOrganization.id);
			if (!stillValid && orgs.length > 0) {
				set({ currentOrganization: orgs[0] });
			}
		}
	},

	switchOrganization: (orgId) => {
		const { organizations } = get();
		const org = organizations.find((o) => o.id === orgId);
		if (org) {
			set({ currentOrganization: org });
		}
	},

	clearOrganization: () => {
		set({ currentOrganization: null, organizations: [] });
	},

	setLoading: (loading) => {
		set({ isLoading: loading });
	},
}));

// Convenience hooks
export function useCurrentOrganization() {
	return useOrganizationStore((state) => state.currentOrganization);
}

export function useOrganizationId(): string | undefined {
	return useOrganizationStore((state) => state.currentOrganization?.id);
}

export function useOrganizations() {
	return useOrganizationStore((state) => state.organizations);
}

export function useOrganizationLoading() {
	return useOrganizationStore((state) => state.isLoading);
}

// Approval status hooks
export function useApprovalStatus(): string | undefined {
	return useOrganizationStore((state) => state.currentOrganization?.approvalStatus);
}

export function useIsApproved(): boolean {
	return useOrganizationStore((state) => state.currentOrganization?.approvalStatus === "approved");
}

export function useIsPendingApproval(): boolean {
	return useOrganizationStore((state) => state.currentOrganization?.approvalStatus === "pending");
}

export function useIsRejected(): boolean {
	return useOrganizationStore((state) => state.currentOrganization?.approvalStatus === "rejected");
}

export function useFirstApprovedOrganization(): Organization | undefined {
	return useOrganizationStore((state) => state.organizations.find((org) => org.approvalStatus === "approved"));
}

export function useApprovedOrganizations(): Organization[] {
	return useOrganizationStore((state) => state.organizations.filter((org) => org.approvalStatus === "approved"));
}

// Get organization ID outside React components
export function getCurrentOrganizationId(): string | undefined {
	return useOrganizationStore.getState().currentOrganization?.id;
}

// Get approval status outside React components
export function getCurrentApprovalStatus(): string | undefined {
	return useOrganizationStore.getState().currentOrganization?.approvalStatus;
}
