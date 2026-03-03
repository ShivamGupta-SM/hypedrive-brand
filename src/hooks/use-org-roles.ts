import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CACHE, getAuthenticatedClient, queryKeys } from "./api-client";

// =============================================================================
// ORGANIZATION ROLES
// =============================================================================

export function useOrganizationRoles(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.organizationRoles(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listOrganizationRoles(organizationId as string);
		},
		enabled: !!organizationId,
		staleTime: CACHE.settings,
	});

	return {
		data: query.data?.roles ?? [],
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCreateOrganizationRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { role: string; permission?: { [key: string]: string[] } }) => {
			const client = getAuthenticatedClient();
			return client.auth.createOrganizationRole(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.organizationRoles(organizationId || ""),
			});
		},
	});
}

export function useDeleteOrganizationRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (roleId: string) => {
			const client = getAuthenticatedClient();
			return client.auth.deleteOrganizationRole(organizationId as string, roleId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.organizationRoles(organizationId || ""),
			});
		},
	});
}
