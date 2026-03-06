/**
 * Notification Query Factories — single source of truth for query keys + options.
 * Used by route loaders (ensureQueryData) and hooks (useQuery).
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, queryKeys } from "@/hooks/api-client";
import { getNotificationPreferencesServer, getUnreadCountServer, listNotificationsServer, listPushTokensServer } from "./server";

// -- Notifications (In-App) ---------------------------------------------------

export const notificationsQueryOptions = (
	orgId: string,
	params?: { limit?: number; offset?: number; unreadOnly?: boolean }
) =>
	queryOptions({
		queryKey: queryKeys.notifications(orgId, params),
		queryFn: () => listNotificationsServer({ data: { orgId, params } }),
		staleTime: CACHE.list,
	});

// -- Unread Count -------------------------------------------------------------

export const notificationUnreadCountQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.notificationUnreadCount(orgId),
		queryFn: () => getUnreadCountServer({ data: { orgId } }),
		staleTime: CACHE.detail,
	});

// -- Notification Preferences -------------------------------------------------

export const notificationPreferencesQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.notificationPreferences(orgId),
		queryFn: () => getNotificationPreferencesServer({ data: { orgId } }),
		staleTime: CACHE.settings,
	});

// -- Push Notification Tokens -------------------------------------------------

export const pushTokensQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.pushTokens(orgId),
		queryFn: () => listPushTokensServer({ data: { orgId } }),
		staleTime: CACHE.list,
	});
