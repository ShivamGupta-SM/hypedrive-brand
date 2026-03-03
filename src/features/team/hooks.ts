/**
 * Team Query Hooks — members, invitations.
 */

import { useQuery } from "@tanstack/react-query";
import { invitationsQueryOptions, membersQueryOptions } from "./queries";

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
