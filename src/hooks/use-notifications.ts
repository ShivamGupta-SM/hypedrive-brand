import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "./api-client";

// =============================================================================
// NOTIFICATION PREFERENCES
// =============================================================================

export function useUpdateNotificationPreferences(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: Record<string, unknown>) => {
			const client = getAuthenticatedClient();
			return client.brand.updatePreferences(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificationPreferences(organizationId || ""),
			});
		},
	});
}

// =============================================================================
// NOTIFICATIONS (In-App)
// =============================================================================

/**
 * Note: listNotifications returns void from the API currently.
 * We call it anyway so the request fires; when the API is updated
 * to return data, this hook will start working automatically.
 */
export function useNotifications(
	organizationId: string | undefined,
	params?: { limit?: number; offset?: number; unreadOnly?: boolean }
) {
	const query = useQuery({
		queryKey: queryKeys.notifications(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.listNotifications(organizationId as string, params || {});
		},
		enabled: !!organizationId,
	});

	return { data: query.data, loading: query.isPending, error: query.error, refetch: query.refetch };
}

export function useUnreadCount(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.unreadCount(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getUnreadCount(organizationId as string);
		},
		enabled: !!organizationId,
		refetchInterval: 60000, // Poll every 60s for unread count
	});

	return { data: query.data, loading: query.isPending, error: query.error, refetch: query.refetch };
}

export function useMarkNotificationRead(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			const client = getAuthenticatedClient();
			return client.brand.markRead(organizationId as string, { ids });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

export function useMarkAllNotificationsRead(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.markAllRead(organizationId as string);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

export function useArchiveNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			const client = getAuthenticatedClient();
			return client.brand.archiveNotifications(organizationId as string, { ids });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

export function useDeleteNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			const client = getAuthenticatedClient();
			return client.brand.deleteNotifications(organizationId as string, { ids });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

export function useDeleteAllNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.deleteAllNotifications(organizationId as string);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

// =============================================================================
// PUSH NOTIFICATION TOKENS
// =============================================================================

export function useRegisterPushToken(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (params: { token: string; platform: "ios" | "android" | "web" }) => {
			const client = getAuthenticatedClient();
			return client.brand.registerToken(organizationId as string, params);
		},
	});
}

export function useRemovePushToken(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (token: string) => {
			const client = getAuthenticatedClient();
			return client.brand.removeToken(organizationId as string, { token });
		},
	});
}

export function useListPushTokens(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.pushTokens(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.listTokens(organizationId as string);
		},
		enabled: !!organizationId,
	});

	return { data: query.data, loading: query.isPending, error: query.error, refetch: query.refetch };
}
