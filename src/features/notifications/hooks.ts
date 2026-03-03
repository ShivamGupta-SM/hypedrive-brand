/**
 * Notification Hooks — queries + mutations for in-app notifications and push tokens.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import { notificationsQueryOptions, pushTokensQueryOptions, unreadCountQueryOptions } from "./queries";

// -- Notification Preferences -------------------------------------------------

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

// -- Notifications (In-App) ---------------------------------------------------

export function useNotifications(
	organizationId: string | undefined,
	params?: { limit?: number; offset?: number; unreadOnly?: boolean }
) {
	const query = useQuery({
		...notificationsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	return { data: query.data, loading: query.isPending && !query.data, error: query.error, refetch: query.refetch };
}

export function useUnreadCount(organizationId: string | undefined) {
	const query = useQuery({
		...unreadCountQueryOptions(organizationId || ""),
		enabled: !!organizationId,
		refetchInterval: 60000,
	});

	return { data: query.data, loading: query.isPending && !query.data, error: query.error, refetch: query.refetch };
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

// -- Push Notification Tokens -------------------------------------------------

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
		...pushTokensQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return { data: query.data, loading: query.isPending && !query.data, error: query.error, refetch: query.refetch };
}
