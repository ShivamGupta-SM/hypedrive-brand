/**
 * Notification Query Factories — single source of truth for query keys + options.
 * Used by route loaders (ensureQueryData) and hooks (useQuery).
 */

import { queryOptions } from "@tanstack/react-query";
import { CACHE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";

// -- Notifications (In-App) ---------------------------------------------------

export const notificationsQueryOptions = (
	orgId: string,
	params?: { limit?: number; offset?: number; unreadOnly?: boolean }
) =>
	queryOptions({
		queryKey: queryKeys.notifications(orgId, params),
		queryFn: () => getAuthenticatedClient().brand.listNotifications(orgId, params || {}),
		staleTime: CACHE.list,
	});

// -- Unread Count -------------------------------------------------------------

export const unreadCountQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.unreadCount(orgId),
		queryFn: () => getAuthenticatedClient().brand.getUnreadCount(orgId),
		staleTime: CACHE.list,
	});

// -- Notification Preferences -------------------------------------------------

export const notificationPreferencesQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.notificationPreferences(orgId),
		queryFn: () => getAuthenticatedClient().brand.getPreferences(orgId),
		staleTime: CACHE.settings,
	});

// -- Push Notification Tokens -------------------------------------------------

export const pushTokensQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.pushTokens(orgId),
		queryFn: () => getAuthenticatedClient().brand.listTokens(orgId),
		staleTime: CACHE.list,
	});
