/**
 * Notification Hooks — queries + mutations for in-app notifications and push tokens.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/hooks/api-client";
import { notificationsQueryOptions, notificationUnreadCountQueryOptions, pushTokensQueryOptions } from "./queries";
import {
	archiveNotificationsServer,
	deleteAllNotificationsServer,
	deleteNotificationsServer,
	markAllNotificationsReadServer,
	markNotificationReadServer,
	registerPushTokenServer,
	removePushTokenServer,
	updateNotificationPreferencesServer,
} from "./server";

// -- Notification Preferences -------------------------------------------------

export function useUpdateNotificationPreferences(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: Record<string, unknown>) => {
			return updateNotificationPreferencesServer({ data: { organizationId: organizationId as string, params } });
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

export function useNotificationUnreadCount(organizationId: string | undefined) {
	const query = useQuery({
		...notificationUnreadCountQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return { data: query.data, loading: query.isPending && !query.data, error: query.error, refetch: query.refetch };
}

export function useMarkNotificationRead(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			return markNotificationReadServer({ data: { organizationId: organizationId as string, ids } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount(organizationId || "") });
		},
	});
}

export function useMarkAllNotificationsRead(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			return markAllNotificationsReadServer({ data: { organizationId: organizationId as string } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount(organizationId || "") });
		},
	});
}

export function useArchiveNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			return archiveNotificationsServer({ data: { organizationId: organizationId as string, ids } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
		},
	});
}

export function useDeleteNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			return deleteNotificationsServer({ data: { organizationId: organizationId as string, ids } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount(organizationId || "") });
		},
	});
}

export function useDeleteAllNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			return deleteAllNotificationsServer({ data: { organizationId: organizationId as string } });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.notificationUnreadCount(organizationId || "") });
		},
	});
}

// -- Push Notification Tokens -------------------------------------------------

export function useRegisterPushToken(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (params: { token: string; platform: "ios" | "android" | "web" }) => {
			return registerPushTokenServer({ data: { organizationId: organizationId as string, ...params } });
		},
	});
}

export function useRemovePushToken(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (token: string) => {
			return removePushTokenServer({ data: { organizationId: organizationId as string, token } });
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
