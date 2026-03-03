/**
 * Wallet Mutations — withdrawals, cancellations.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import type { brand } from "@/lib/brand-client";

export function useCreateWithdrawal(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateOrgWithdrawalRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.createWithdrawalRequest(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.wallet(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals(organizationId || "") });
		},
	});
}

export function useCancelWithdrawal(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { withdrawalId: string; reason?: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.cancelWithdrawalRequest(organizationId as string, params.withdrawalId, {
				reason: params.reason,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.wallet(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals(organizationId || "") });
		},
	});
}
