/**
 * Organization Store - Multi-tenancy state management
 *
 * Clean architecture:
 * - Stores current organization (tenant) selection
 * - Persists selection in localStorage for session continuity
 * - Syncs with organization profile from API
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Approval status type - matches API response
export type ApprovalStatus = "draft" | "pending" | "approved" | "rejected" | "banned";

// Organization type matching listOrganizations API response
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: string;
  approvalStatus?: string; // API returns optional string
}

export interface OrganizationState {
  // Current selected organization
  currentOrganization: Organization | null;

  // All organizations user has access to
  organizations: Organization[];

  // Loading state
  isLoading: boolean;

  // Actions
  setCurrentOrganization: (org: Organization) => void;
  setOrganizations: (orgs: Organization[]) => void;
  switchOrganization: (orgId: string) => void;
  clearOrganization: () => void;
  setLoading: (loading: boolean) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      currentOrganization: null,
      organizations: [],
      isLoading: false,

      setCurrentOrganization: (org) => {
        set({ currentOrganization: org });
      },

      setOrganizations: (orgs) => {
        const { currentOrganization } = get();
        set({ organizations: orgs });

        // Auto-select first org if no current selection or current is invalid
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
        set({
          currentOrganization: null,
          organizations: [],
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "brand-organization-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist the current org ID, not full objects
        // Full data will be fetched from API on reload
        currentOrganizationId: state.currentOrganization?.id ?? null,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, mark loading as true until org profile is fetched
        if (state) {
          state.isLoading = true;
        }
      },
      // Merge rehydrated state properly
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { currentOrganizationId?: string | null };
        return {
          ...currentState,
          // Store the persisted org ID temporarily - will be resolved after API call
          _persistedOrgId: persisted?.currentOrganizationId ?? null,
        } as OrganizationState;
      },
    }
  )
);

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

// Approval status hooks - clean and straightforward
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

// Removed: API doesn't return rejectionReason in listOrganizations

// Get first approved organization (for auto-selection)
export function useFirstApprovedOrganization(): Organization | undefined {
  return useOrganizationStore((state) =>
    state.organizations.find((org) => org.approvalStatus === "approved")
  );
}

// Get approved organizations only
export function useApprovedOrganizations(): Organization[] {
  return useOrganizationStore((state) =>
    state.organizations.filter((org) => org.approvalStatus === "approved")
  );
}

// Get organization ID outside React components
export function getCurrentOrganizationId(): string | undefined {
  return useOrganizationStore.getState().currentOrganization?.id;
}

// Get approval status outside React components
export function getCurrentApprovalStatus(): string | undefined {
  return useOrganizationStore.getState().currentOrganization?.approvalStatus;
}
