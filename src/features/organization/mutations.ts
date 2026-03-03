/**
 * Organization Mutations — create, update, leave, check slug.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

export function useCreateOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			name: string;
			slug?: string;
			logo?: string;
			gstNumber: string;
			gstLegalName: string;
			gstTradeName?: string;
			description?: string;
			website?: string;
			businessType?: string;
			industryCategory?: string;
			contactPerson?: string;
			phoneNumber?: string;
			address?: string;
			city?: string;
			state?: string;
			country?: string;
			postalCode?: string;
		}) => {
			const client = getAuthenticatedClient();
			return client.auth.createOrganization(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
			queryClient.invalidateQueries({ queryKey: ["auth", "session-with-orgs"] });
		},
	});
}

export function useUpdateOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ organizationId, ...params }: { organizationId: string; name?: string; logo?: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.updateOrganization(organizationId, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
			queryClient.invalidateQueries({ queryKey: ["auth", "session-with-orgs"] });
		},
	});
}

export function useLeaveOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (organizationId: string) => {
			const client = getAuthenticatedClient();
			return client.auth.leaveOrganization(organizationId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
			queryClient.invalidateQueries({ queryKey: ["auth", "session-with-orgs"] });
		},
	});
}

export function useCheckSlug() {
	return useMutation({
		mutationFn: async (slug: string) => {
			const client = getAuthenticatedClient();
			return client.auth.checkSlug({ slug });
		},
	});
}
