/**
 * Wallet Mutations — withdrawals, cancellations.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import type { brand } from "@/lib/brand-client";
import { cancelWithdrawalServer, createWithdrawalServer } from "./server";

export function useCreateWithdrawal(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.CreateOrgWithdrawalRequest) => {
			return createWithdrawalServer({ data: { orgId: organizationId as string, params } });
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
			return cancelWithdrawalServer({
				data: { orgId: organizationId as string, withdrawalId: params.withdrawalId, reason: params.reason },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.wallet(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals(organizationId || "") });
		},
	});
}
