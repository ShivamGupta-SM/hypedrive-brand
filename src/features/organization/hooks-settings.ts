/**
 * Organization Settings Hooks — profile, bank account, GST, enrichment.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import type { brand } from "@/lib/brand-client";
import { bankAccountQueryOptions, gstDetailsQueryOptions, organizationSettingsQueryOptions } from "./queries";
import {
	addBankAccountServer,
	changeOrgPhoneServer,
	deleteBankAccountServer,
	enrichPreviewServer,
	updateOrganizationSettingsServer,
	verifyBankAccountServer,
	verifyGSTPreviewServer,
	verifyGSTServer,
} from "./server";

// -- Organization Settings ----------------------------------------------------

export function useOrganizationSettings(organizationId: string | undefined) {
	const query = useQuery({
		...organizationSettingsQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
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
			return updateOrganizationSettingsServer({ data: { organizationId: organizationId as string, ...params } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
			queryClient.invalidateQueries({ queryKey: ["auth", "session-with-orgs"] });
		},
	});
}

export function useChangeOrgPhone(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { phoneNumber: string; passkeyResponse: unknown; challengeId: string }) => {
			return changeOrgPhoneServer({ data: { organizationId: organizationId as string, ...params } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId || "") });
		},
	});
}

// -- Bank Account -------------------------------------------------------------

export function useBankAccount(organizationId: string | undefined) {
	const query = useQuery({
		...bankAccountQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.bankAccount ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useVerifyBankAccount(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (params: brand.VerifyBankAccountDetailsRequest) => {
			return verifyBankAccountServer({ data: { organizationId: organizationId as string, ...params } });
		},
	});
}

export function useAddBankAccount(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.AddBankAccountRequest) => {
			return addBankAccountServer({ data: { organizationId: organizationId as string, ...params } });
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
			return deleteBankAccountServer({ data: { organizationId } });
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.bankAccount(variables.organizationId) });
		},
	});
}

// -- GST ----------------------------------------------------------------------

export function useGSTDetails(organizationId: string | undefined) {
	const query = useQuery({
		...gstDetailsQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useVerifyGSTPreview() {
	return useMutation({
		mutationFn: async (params: { gstNumber: string }) => {
			return verifyGSTPreviewServer({ data: params });
		},
	});
}

export function useVerifyGST() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({ organizationId, gstNumber }: { organizationId: string; gstNumber: string }) => {
			return verifyGSTServer({ data: { organizationId, gstNumber } });
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.gstDetails(variables.organizationId) });
		},
	});
}

// -- Enrichment ---------------------------------------------------------------

export function useEnrichPreview() {
	return useMutation({
		mutationFn: async (params: { domain: string; name?: string }) => {
			return enrichPreviewServer({ data: params });
		},
	});
}
