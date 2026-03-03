import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { brand } from "@/lib/brand-client";
import { CACHE, getAuthenticatedClient, queryKeys } from "./api-client";

// =============================================================================
// ORGANIZATION SETTINGS
// =============================================================================

export function useOrganizationSettings(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.organization(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganization(organizationId as string);
		},
		enabled: !!organizationId,
		staleTime: CACHE.settings,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useUpdateOrganizationSettings(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			name?: string;
			description?: string;
			website?: string;
			logo?: string;
			businessType?: "pvt_ltd" | "llp" | "partnership" | "proprietorship" | "public_ltd" | "trust" | "society";
			industryCategory?: string;
			contactPerson?: string;
			email?: string;
			address?: string;
			city?: string;
			state?: string;
			country?: string;
			postalCode?: string;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.updateOrganization(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
		},
	});
}

export function useChangeOrgPhone(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { phoneNumber: string; passkeyResponse: unknown; challengeId: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.changeOrgPhone(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId || "") });
		},
	});
}

// =============================================================================
// BANK ACCOUNT
// =============================================================================

export function useBankAccount(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.bankAccount(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganizationBankAccount(organizationId as string, {});
		},
		enabled: !!organizationId,
		staleTime: CACHE.settings,
	});

	return {
		data: query.data?.bankAccount ?? null,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useVerifyBankAccount(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (params: brand.VerifyBankAccountDetailsRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.verifyBankAccountDetails(organizationId as string, params);
		},
	});
}

export function useAddBankAccount(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.AddBankAccountRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.addBankAccount(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.bankAccount(organizationId || "") });
		},
	});
}

export function useDeleteBankAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ organizationId }: { organizationId: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.deleteBankAccount(organizationId);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.bankAccount(variables.organizationId) });
		},
	});
}

// =============================================================================
// GST
// =============================================================================

export function useGSTDetails(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.gstDetails(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getGSTDetails(organizationId as string);
		},
		enabled: !!organizationId,
		staleTime: CACHE.static,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useVerifyGSTPreview() {
	return useMutation({
		mutationFn: async (params: { gstNumber: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.verifyGSTPreview(params);
		},
	});
}

export function useVerifyGST() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ organizationId, gstNumber }: { organizationId: string; gstNumber: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.verifyGST(organizationId, { gstNumber });
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.gstDetails(variables.organizationId) });
		},
	});
}

/**
 * Enrich a company domain — auto-fill org details (logo, industry, name, etc.)
 * during onboarding or org creation.
 */
export function useEnrichPreview() {
	return useMutation({
		mutationFn: async (params: { domain: string; name?: string }) => {
			const client = getAuthenticatedClient();
			return client.enrichment.enrichPreview(params);
		},
	});
}
