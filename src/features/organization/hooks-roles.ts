/**
 * Organization Roles Hooks — CRUD for custom roles.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import { organizationRolesQueryOptions } from "../team/queries";
import { createOrganizationRoleServer, deleteOrganizationRoleServer, updateOrganizationRoleServer } from "./server";

export function useOrganizationRoles(organizationId: string | undefined) {
	const query = useQuery({
		...organizationRolesQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.roles ?? [],
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCreateOrganizationRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { role: string; description?: string; permission?: Record<string, string[]> }) => {
			return createOrganizationRoleServer({ data: { organizationId: organizationId as string, ...params } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationRoles(organizationId || "") });
		},
	});
}

export function useUpdateOrganizationRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			roleId,
			...params
		}: {
			roleId: string;
			role?: string;
			description?: string;
			permission?: Record<string, string[]>;
		}) => {
			return updateOrganizationRoleServer({
				data: { organizationId: organizationId as string, roleId, ...params },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationRoles(organizationId || "") });
		},
	});
}

export function useDeleteOrganizationRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (roleId: string) => {
			return deleteOrganizationRoleServer({ data: { organizationId: organizationId as string, roleId } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationRoles(organizationId || "") });
		},
	});
}
