import { useQuery } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "./api-client";

export function useDashboard(organizationId: string | undefined, params?: { days?: number }) {
	const query = useQuery({
		queryKey: [...queryKeys.dashboard(organizationId || ""), params?.days] as const,
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getDashboardOverview(organizationId as string, { days: params?.days });
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}
