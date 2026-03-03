/**
 * Organization Mutations — create, update, leave, check slug.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import { checkSlugServer, createOrganizationServer, leaveOrganizationServer, updateOrganizationServer } from "./server";

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
			return createOrganizationServer({ data: params });
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
			return updateOrganizationServer({ data: { organizationId, ...params } });
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
			return leaveOrganizationServer({ data: { organizationId } });
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
			return checkSlugServer({ data: { slug } });
		},
	});
}
