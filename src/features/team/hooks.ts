/**
 * Team Query Hooks — members, invitations, user search.
 */

import { useQuery } from "@tanstack/react-query";
import { invitationsQueryOptions, membersQueryOptions } from "./queries";
import { searchUsersForInviteServer } from "./server";

export function useMembers(organizationId: string | undefined) {
	const query = useQuery({
		...membersQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.members ?? [],
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useUserSearch(organizationId: string | undefined, query: string) {
	const q = query.trim();
	const result = useQuery({
		queryKey: ["userSearch", organizationId, q],
		queryFn: () => searchUsersForInviteServer({ data: { orgId: organizationId as string, q } }),
		enabled: !!organizationId && (q.length >= 3 || (q.length >= 2 && q.includes("@"))),
		staleTime: 30_000,
	});

	return {
		users: result.data?.users ?? [],
		isLoading: result.isFetching,
	};
}

export function useInvitations(organizationId: string | undefined) {
	const query = useQuery({
		...invitationsQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.invitations ?? [],
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}
