import { useQuery } from "@tanstack/react-query";
import { dashboardQueryOptions } from "./api-client";

export function useDashboard(organizationId: string | undefined, params?: { days?: number }) {
	const query = useQuery({
		...dashboardQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}
