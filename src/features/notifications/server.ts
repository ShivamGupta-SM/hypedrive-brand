/**
 * Notification Server Functions — authenticated API calls proxied through the server.
 * Covers: notifications CRUD, unread count, preferences, push tokens.
 */

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/server/middleware";

// =============================================================================
// QUERIES
// =============================================================================

// -- Notifications (In-App) ---------------------------------------------------

export const listNotificationsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: { orgId: string; params?: { limit?: number; offset?: number; unreadOnly?: boolean } }) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.brand.listNotifications(data.orgId, data.params || {});
	});

// -- Unread Count -------------------------------------------------------------

export const getUnreadCountServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getUnreadCount(data.orgId);
	});

// -- Notification Preferences -------------------------------------------------

export const getNotificationPreferencesServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.getPreferences(data.orgId);
	});

// -- Push Notification Tokens -------------------------------------------------

export const listPushTokensServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.listTokens(data.orgId);
	});

// =============================================================================
// MUTATIONS
// =============================================================================

// -- Update Notification Preferences ------------------------------------------

export const updateNotificationPreferencesServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; params: Record<string, unknown> }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.updatePreferences(data.organizationId, data.params);
	});

// -- Mark Notification Read ---------------------------------------------------

export const markNotificationReadServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; ids: string[] }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.markRead(data.organizationId, { ids: data.ids });
	});

// -- Mark All Notifications Read ----------------------------------------------

export const markAllNotificationsReadServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.markAllRead(data.organizationId);
	});

// -- Archive Notifications ----------------------------------------------------

export const archiveNotificationsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; ids: string[] }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.archiveNotifications(data.organizationId, { ids: data.ids });
	});

// -- Delete Notifications -----------------------------------------------------

export const deleteNotificationsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; ids: string[] }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.deleteNotifications(data.organizationId, { ids: data.ids });
	});

// -- Delete All Notifications -------------------------------------------------

export const deleteAllNotificationsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.deleteAllNotifications(data.organizationId);
	});

// -- Register Push Token ------------------------------------------------------

export const registerPushTokenServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; token: string; platform: "ios" | "android" | "web" }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.registerToken(data.organizationId, {
			token: data.token,
			platform: data.platform,
		});
	});

// -- Remove Push Token --------------------------------------------------------

export const removePushTokenServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; token: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.brand.removeToken(data.organizationId, { token: data.token });
	});
