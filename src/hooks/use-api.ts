/**
 * API Hooks for Hypedrive Brand Admin
 * TanStack Query based data fetching with Encore SDK client
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import Client, { Local } from "@/lib/brand-client";
import { getAuthToken, useAuthStore, type AuthState } from "@/store/auth-store";
import { useOrganizationStore } from "@/store/organization-store";
import type { auth, organizations, shared } from "@/lib/brand-client";

// Re-export organization hooks for convenience
export { useCurrentOrganization, useOrganizationId } from "@/store/organization-store";

// =============================================================================
// API CLIENT SETUP
// =============================================================================

const API_URL = import.meta.env.VITE_API_URL || Local;

export const apiClient = new Client(API_URL);

/**
 * Get authenticated client with bearer token
 */
export function getAuthenticatedClient(): Client {
  const token = getAuthToken();
  if (!token) {
    return apiClient;
  }
  return apiClient.with({
    requestInit: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

interface APIError {
  code?: string;
  message?: string;
  status?: number;
}

export function isAPIError(error: unknown): error is APIError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("code" in error || "message" in error || "status" in error)
  );
}

export function getAPIErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isAPIError(error)) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getAPIErrorCode(error: unknown): string | null {
  if (isAPIError(error) && error.code) {
    return error.code;
  }
  return null;
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const queryKeys = {
  // Organization Profile
  organizationProfile: () => ["organizationProfile"] as const,

  // Organization
  organization: (orgId: string) => ["organization", orgId] as const,
  organizationStats: (orgId: string) => ["organization", orgId, "stats"] as const,
  organizationActivity: (orgId: string, params?: Record<string, unknown>) => ["organization", orgId, "activity", params] as const,

  // Dashboard
  dashboard: (orgId: string) => ["dashboard", orgId] as const,

  // Campaigns
  campaigns: (orgId: string, params?: Record<string, unknown>) => ["campaigns", orgId, params] as const,
  campaign: (orgId: string, campaignId: string) => ["campaigns", orgId, campaignId] as const,
  campaignStats: (orgId: string, campaignId: string) => ["campaigns", orgId, campaignId, "stats"] as const,

  // Products
  products: (orgId: string, params?: Record<string, unknown>) => ["products", orgId, params] as const,
  product: (orgId: string, productId: string) => ["products", orgId, productId] as const,

  // Enrollments
  enrollments: (orgId: string, params?: Record<string, unknown>) => ["enrollments", orgId, params] as const,
  enrollment: (orgId: string, enrollmentId: string) => ["enrollments", orgId, enrollmentId] as const,
  enrollmentDetail: (orgId: string, enrollmentId: string) => ["enrollments", orgId, enrollmentId, "detail"] as const,
  campaignEnrollments: (orgId: string, campaignId: string, params?: Record<string, unknown>) => ["enrollments", orgId, "campaign", campaignId, params] as const,

  // Wallet
  wallet: (orgId: string) => ["wallet", orgId] as const,
  walletTransactions: (orgId: string, params?: Record<string, unknown>) => ["wallet", orgId, "transactions", params] as const,
  walletHolds: (orgId: string) => ["wallet", orgId, "holds"] as const,
  withdrawals: (orgId: string, params?: Record<string, unknown>) => ["wallet", orgId, "withdrawals", params] as const,

  // Bank Accounts
  bankAccounts: (orgId: string) => ["bankAccounts", orgId] as const,
  depositAccount: (orgId: string) => ["depositAccount", orgId] as const,

  // Invoices
  invoices: (orgId: string, params?: Record<string, unknown>) => ["invoices", orgId, params] as const,
  invoice: (orgId: string, invoiceId: string) => ["invoices", orgId, invoiceId] as const,

  // GST
  gstDetails: (orgId: string) => ["gst", orgId] as const,
};

// =============================================================================
// ORGANIZATION PROFILE HOOKS
// =============================================================================

/**
 * Fetch user's organizations and sync with organization store
 * This is the single source of truth for organization data
 */
export function useOrganizationProfile() {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const { setOrganizations, setCurrentOrganization, setLoading, currentOrganization } =
    useOrganizationStore();

  const query = useQuery({
    queryKey: queryKeys.organizationProfile(),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.auth.listOrganizations();
    },
    enabled: isAuthenticated,
  });

  // Sync organizations with store when data changes
  useEffect(() => {
    if (query.data?.organizations) {
      const orgs = query.data.organizations;
      setOrganizations(orgs);

      // If no current org and we have orgs, select first one
      if (!currentOrganization && orgs.length > 0) {
        setCurrentOrganization(orgs[0]);
      }
    }
    setLoading(query.isLoading);
  }, [query.data, query.isLoading, setOrganizations, setCurrentOrganization, setLoading, currentOrganization]);

  // Get the first organization if any exist (for backward compatibility)
  const organization = currentOrganization ?? query.data?.organizations?.[0] ?? null;

  return {
    data: query.data ?? null,
    organization,
    organizations: query.data?.organizations ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: auth.CreateOrganizationRequest) => {
      const client = getAuthenticatedClient();
      return client.auth.createOrganization(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
    },
  });
}

// =============================================================================
// ORGANIZATION HOOKS
// =============================================================================

export function useOrganizationStats(organizationId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.organizationStats(organizationId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getOrganizationStats(organizationId!);
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useOrganizationActivity(
  organizationId: string | undefined,
  params?: { limit?: number; cursor?: string }
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.organizationActivity(organizationId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getOrganizationActivity(organizationId!, { cursor: params?.cursor, limit: params?.limit });
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// DASHBOARD HOOKS
// =============================================================================

export function useDashboard(organizationId: string | undefined, params?: { days?: number }) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.dashboard(organizationId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getDashboardOverview(organizationId!, params || {});
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// CAMPAIGN HOOKS
// =============================================================================

export function useCampaigns(
  organizationId: string | undefined,
  params?: {
    status?: shared.CampaignStatus;
    productId?: string;
    skip?: number;
    take?: number;
  }
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.campaigns(organizationId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.listCampaigns(organizationId!, params || {});
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCampaign(organizationId: string | undefined, campaignId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.campaign(organizationId || "", campaignId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getCampaign(organizationId!, campaignId!);
    },
    enabled: isAuthenticated && !!organizationId && !!campaignId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCampaignStats(organizationId: string | undefined, campaignId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.campaignStats(organizationId || "", campaignId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getCampaignStats(organizationId!, campaignId!);
    },
    enabled: isAuthenticated && !!organizationId && !!campaignId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateCampaign(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: organizations.CreateCampaignRequest) => {
      const client = getAuthenticatedClient();
      return client.organizations.createCampaign(organizationId!, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", organizationId] });
    },
  });
}

export function useUpdateCampaign(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, ...params }: { campaignId: string } & organizations.CreateCampaignRequest) => {
      const client = getAuthenticatedClient();
      return client.organizations.updateCampaign(organizationId!, campaignId, params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign(organizationId!, variables.campaignId) });
      queryClient.invalidateQueries({ queryKey: ["campaigns", organizationId] });
    },
  });
}

// =============================================================================
// PRODUCT HOOKS
// =============================================================================

export function useProducts(
  organizationId: string | undefined,
  params?: {
    categoryId?: string;
    platformId?: string;
    search?: string;
    skip?: number;
    take?: number;
  }
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.products(organizationId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.listOrganizationProducts(organizationId!, params || {});
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useProduct(organizationId: string | undefined, productId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.product(organizationId || "", productId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getOrganizationProduct(organizationId!, productId!);
    },
    enabled: isAuthenticated && !!organizationId && !!productId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateProduct(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: organizations.CreateProductRequest) => {
      const client = getAuthenticatedClient();
      return client.organizations.createProduct(organizationId!, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", organizationId] });
    },
  });
}

export function useUpdateProduct(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, ...params }: { productId: string } & organizations.UpdateProductRequest) => {
      const client = getAuthenticatedClient();
      return client.organizations.updateProduct(organizationId!, productId, params);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.product(organizationId!, variables.productId) });
      queryClient.invalidateQueries({ queryKey: ["products", organizationId] });
    },
  });
}

export function useDeleteProduct(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const client = getAuthenticatedClient();
      return client.organizations.deleteProduct(organizationId!, productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", organizationId] });
    },
  });
}

// =============================================================================
// ENROLLMENT HOOKS
// =============================================================================

export function useEnrollments(
  organizationId: string | undefined,
  params?: {
    status?: shared.EnrollmentStatus;
    campaignId?: string;
    skip?: number;
    take?: number;
  }
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.enrollments(organizationId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.listOrganizationEnrollments(organizationId!, params || {});
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEnrollment(
  organizationId: string | undefined,
  campaignId: string | undefined,
  enrollmentId: string | undefined
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.enrollment(organizationId || "", enrollmentId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getEnrollmentForBrand(organizationId!, campaignId!, enrollmentId!);
    },
    enabled: isAuthenticated && !!organizationId && !!campaignId && !!enrollmentId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useEnrollmentDetail(
  organizationId: string | undefined,
  campaignId: string | undefined,
  enrollmentId: string | undefined
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.enrollmentDetail(organizationId || "", enrollmentId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getEnrollmentDetailForBrand(organizationId!, campaignId!, enrollmentId!);
    },
    enabled: isAuthenticated && !!organizationId && !!campaignId && !!enrollmentId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCampaignEnrollments(
  organizationId: string | undefined,
  campaignId: string | undefined,
  params?: {
    status?: shared.EnrollmentStatus;
    skip?: number;
    take?: number;
  }
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.campaignEnrollments(organizationId || "", campaignId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.listCampaignEnrollments(organizationId!, campaignId!, params || {});
    },
    enabled: isAuthenticated && !!organizationId && !!campaignId,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useApproveEnrollment(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, enrollmentId, remarks }: { campaignId: string; enrollmentId: string; remarks?: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.approveEnrollment(organizationId!, campaignId, enrollmentId, { remarks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organizationId] });
    },
  });
}

export function useRejectEnrollment(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, enrollmentId, reason }: { campaignId: string; enrollmentId: string; reason: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.rejectEnrollment(organizationId!, campaignId, enrollmentId, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organizationId] });
    },
  });
}

export function useBulkApproveEnrollments(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enrollmentIds, remarks }: { enrollmentIds: string[]; remarks?: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.bulkApproveEnrollments(organizationId!, { enrollmentIds, remarks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organizationId] });
    },
  });
}

export function useBulkRejectEnrollments(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enrollmentIds, reason }: { enrollmentIds: string[]; reason: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.bulkRejectEnrollments(organizationId!, { enrollmentIds, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", organizationId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", organizationId] });
    },
  });
}

// =============================================================================
// WALLET HOOKS
// =============================================================================

export function useWallet(organizationId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.wallet(organizationId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getOrganizationWallet(organizationId!);
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useWalletTransactions(
  organizationId: string | undefined,
  params?: {
    type?: "credit" | "debit";
    skip?: number;
    take?: number;
  }
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.walletTransactions(organizationId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getOrganizationWalletTransactions(organizationId!, params || {});
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useWalletHolds(organizationId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.walletHolds(organizationId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getWalletHolds(organizationId!);
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data?.holds ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useFundWallet(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; reason: string; reference: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.fundOrganizationWallet(organizationId!, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet(organizationId!) });
      queryClient.invalidateQueries({ queryKey: ["walletTransactions", organizationId] });
    },
  });
}

export function useWithdrawals(
  organizationId: string | undefined,
  params?: {
    status?: shared.WithdrawalStatus;
    skip?: number;
    take?: number;
  }
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.withdrawals(organizationId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.listOrganizationWithdrawals(organizationId!, params || {});
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreateWithdrawal(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { amount: number; notes?: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.createOrganizationWithdrawal(organizationId!, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet(organizationId!) });
      queryClient.invalidateQueries({ queryKey: ["withdrawals", organizationId] });
    },
  });
}

// =============================================================================
// BANK ACCOUNT HOOKS
// =============================================================================

export function useBankAccounts(organizationId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.bankAccounts(organizationId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.listBankAccounts(organizationId!, {});
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data?.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAddBankAccount(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: organizations.AddBankAccountRequest) => {
      const client = getAuthenticatedClient();
      return client.organizations.addBankAccount(organizationId!, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts(organizationId!) });
    },
  });
}

export function useDepositAccount(organizationId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.depositAccount(organizationId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getDepositAccount(organizationId!);
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// INVOICE HOOKS
// =============================================================================

export function useInvoices(
  organizationId: string | undefined,
  params?: {
    status?: shared.InvoiceStatus;
    skip?: number;
    take?: number;
  }
) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.invoices(organizationId || "", params),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.listInvoices(organizationId!, params || {});
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    hasMore: query.data?.hasMore ?? false,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInvoice(organizationId: string | undefined, invoiceId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.invoice(organizationId || "", invoiceId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getInvoice(organizationId!, invoiceId!);
    },
    enabled: isAuthenticated && !!organizationId && !!invoiceId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// GST HOOKS
// =============================================================================

export function useGSTDetails(organizationId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: queryKeys.gstDetails(organizationId || ""),
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.organizations.getGSTDetails(organizationId!);
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// AUTH MUTATION HOOKS
// =============================================================================

export function useChangePassword() {
  return useMutation({
    mutationFn: async (params: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => {
      const client = getAuthenticatedClient();
      return client.auth.changePassword(params);
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, ...params }: { organizationId: string; name?: string; slug?: string; logo?: string }) => {
      const client = getAuthenticatedClient();
      return client.auth.updateOrganizationAuth(organizationId, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
    },
  });
}

// =============================================================================
// NOTIFICATION PREFERENCES HOOKS
// =============================================================================

export function useNotificationPreferences() {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: ["notificationPreferences"] as const,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.notifications.getNotificationPreferences();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { workflowId?: string; channels: { email?: boolean; sms?: boolean; inApp?: boolean; push?: boolean; chat?: boolean } }) => {
      const client = getAuthenticatedClient();
      return client.notifications.updateNotificationPreferences(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notificationPreferences"] });
    },
  });
}

// =============================================================================
// EMAIL CHANGE HOOKS
// =============================================================================

export function useChangeEmail() {
  return useMutation({
    mutationFn: async (params: { newEmail: string; callbackURL?: string }) => {
      const client = getAuthenticatedClient();
      return client.auth.changeEmail(params);
    },
  });
}

// =============================================================================
// SESSION MANAGEMENT HOOKS
// =============================================================================

export function useDeviceSessions() {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: ["deviceSessions"] as const,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.auth.listDeviceSessions();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data?.sessions ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionToken: string) => {
      const client = getAuthenticatedClient();
      return client.auth.revokeDeviceSession({ sessionToken });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceSessions"] });
    },
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const client = getAuthenticatedClient();
      return client.auth.revokeOtherSessions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deviceSessions"] });
    },
  });
}

// =============================================================================
// TWO-FACTOR AUTHENTICATION HOOKS
// =============================================================================

export function useTwoFactorEnable() {
  return useMutation({
    mutationFn: async (params: { password: string; issuer?: string }) => {
      const client = getAuthenticatedClient();
      return client.auth.twoFactorEnable(params);
    },
  });
}

export function useTwoFactorDisable() {
  return useMutation({
    mutationFn: async (password: string) => {
      const client = getAuthenticatedClient();
      return client.auth.twoFactorDisable({ password });
    },
  });
}

export function useTwoFactorGetTotpUri() {
  return useMutation({
    mutationFn: async (password: string) => {
      const client = getAuthenticatedClient();
      return client.auth.twoFactorGetTotpUri({ password });
    },
  });
}

export function useTwoFactorVerifyTotp() {
  return useMutation({
    mutationFn: async (params: { code: string; trustDevice?: boolean }) => {
      const client = getAuthenticatedClient();
      // Need twoFactorToken from login response
      return client.auth.twoFactorVerifyTotp({ ...params, twoFactorToken: "" });
    },
  });
}

export function useTwoFactorGenerateBackupCodes() {
  return useMutation({
    mutationFn: async (password: string) => {
      const client = getAuthenticatedClient();
      return client.auth.twoFactorGenerateBackupCodes({ password });
    },
  });
}

// =============================================================================
// FULL ORGANIZATION DETAILS HOOKS
// =============================================================================

export function useFullOrganization(organizationId: string | undefined) {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: ["fullOrganization", organizationId] as const,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.auth.getFullOrganization(organizationId!, { membersLimit: 10 });
    },
    enabled: isAuthenticated && !!organizationId,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, bankAccountId }: { organizationId: string; bankAccountId: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.deleteBankAccount(organizationId, bankAccountId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts(variables.organizationId) });
    },
  });
}

export function useSetDefaultBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, bankAccountId }: { organizationId: string; bankAccountId: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.setDefaultBankAccount(organizationId, bankAccountId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts(variables.organizationId) });
    },
  });
}

// =============================================================================
// CAMPAIGN MANAGEMENT HOOKS
// =============================================================================

export function usePauseCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, campaignId, reason }: { organizationId: string; campaignId: string; reason?: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.pauseCampaign(organizationId, campaignId, { reason });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign(variables.organizationId, variables.campaignId) });
    },
  });
}

export function useResumeCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, campaignId }: { organizationId: string; campaignId: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.resumeCampaign(organizationId, campaignId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign(variables.organizationId, variables.campaignId) });
    },
  });
}

export function useEndCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, campaignId, reason }: { organizationId: string; campaignId: string; reason?: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.endCampaign(organizationId, campaignId, { reason });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaign(variables.organizationId, variables.campaignId) });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, campaignId }: { organizationId: string; campaignId: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.deleteCampaign(organizationId, campaignId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", variables.organizationId] });
    },
  });
}

export function useDuplicateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, campaignId, newTitle }: { organizationId: string; campaignId: string; newTitle?: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.duplicateCampaign(organizationId, campaignId, { newTitle });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", variables.organizationId] });
    },
  });
}

export function useArchiveCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, campaignId }: { organizationId: string; campaignId: string }) => {
      const client = getAuthenticatedClient();
      return client.organizations.archiveCampaign(organizationId, campaignId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns", variables.organizationId] });
    },
  });
}

// =============================================================================
// USER INFO HOOKS
// =============================================================================

export function useUserInfo() {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  const query = useQuery({
    queryKey: ["userInfo"] as const,
    queryFn: async () => {
      const client = getAuthenticatedClient();
      return client.auth.me();
    },
    enabled: isAuthenticated,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// =============================================================================
// INVALIDATION HELPERS
// =============================================================================

export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateDashboard: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(orgId) }),
    invalidateCampaigns: (orgId: string) => queryClient.invalidateQueries({ queryKey: ["campaigns", orgId] }),
    invalidateProducts: (orgId: string) => queryClient.invalidateQueries({ queryKey: ["products", orgId] }),
    invalidateEnrollments: (orgId: string) => queryClient.invalidateQueries({ queryKey: ["enrollments", orgId] }),
    invalidateWallet: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.wallet(orgId) }),
    invalidateInvoices: (orgId: string) => queryClient.invalidateQueries({ queryKey: ["invoices", orgId] }),
    invalidateBankAccounts: (orgId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.bankAccounts(orgId) }),
    invalidateSessions: () => queryClient.invalidateQueries({ queryKey: ["deviceSessions"] }),
    invalidateUserInfo: () => queryClient.invalidateQueries({ queryKey: ["userInfo"] }),
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}
