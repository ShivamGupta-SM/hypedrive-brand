/**
 * Singleton Notification SSE Stream Provider.
 *
 * Mounted once at the $orgSlug layout level so ALL notification UI
 * (NotificationBell, NotificationPopoverNavbar) shares a single SSE
 * connection instead of each component creating its own.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Client from "@/lib/brand-client";
import { API_URL } from "@/lib/config";
import { isPushSupported, subscribeToPush } from "@/lib/push-notifications";
import { getStreamTokenServer } from "@/server/auth-queries";

// =============================================================================
// TYPES
// =============================================================================

export type Notification = {
	id: string;
	type?: string;
	title?: string;
	body?: string | null;
	actionUrl?: string | null;
	imageUrl?: string | null;
	isRead?: boolean;
	createdAt?: string;
};

interface NotificationStreamValue {
	items: Notification[];
	unreadCount: number;
	connected: boolean;
	markRead: (ids: string[]) => void;
	markAllRead: () => void;
	removeItems: (ids: string[]) => void;
	restoreSnapshot: (snapshot: { items: Notification[]; unreadCount: number }) => void;
}

const NotificationStreamContext = createContext<NotificationStreamValue | null>(null);

// =============================================================================
// HOOK
// =============================================================================

export function useNotificationStream(): NotificationStreamValue {
	const ctx = useContext(NotificationStreamContext);
	if (!ctx) {
		// Fallback for components rendered outside the provider (shouldn't happen)
		return {
			items: [],
			unreadCount: 0,
			connected: false,
			markRead: () => {},
			markAllRead: () => {},
			removeItems: () => {},
			restoreSnapshot: () => {},
		};
	}
	return ctx;
}

// =============================================================================
// PROVIDER
// =============================================================================

export function NotificationStreamProvider({
	organizationId,
	children,
}: {
	organizationId: string;
	children: React.ReactNode;
}) {
	const [items, setItems] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [connected, setConnected] = useState(false);
	const streamRef = useRef<{ close: () => void } | null>(null);
	const itemsRef = useRef(items);
	itemsRef.current = items;

	useEffect(() => {
		if (!organizationId) return;

		let cancelled = false;
		let retryAttempt = 0;
		let retryTimer: ReturnType<typeof setTimeout>;

		async function connect() {
			try {
				let token: string;
				try {
					const result = await getStreamTokenServer();
					token = result.token;
				} catch {
					// Token fetch failed — schedule reconnect instead of silently dying
					if (!cancelled) scheduleReconnect();
					return;
				}
				if (cancelled) return;

				const client = new Client(API_URL, { auth: { authorization: `Bearer ${token}` } });

				// 1. Seed the list from REST API (read + unread, full history)
				try {
					const res = await fetch(`${API_URL}/organizations/${organizationId}/notifications?limit=50`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					if (res.ok && !cancelled) {
						const text = await res.text();
						if (!text) throw new Error("Empty response body");
						const data = JSON.parse(text);
						const list = data?.notifications ?? data?.items ?? (Array.isArray(data) ? data : []);
						if (list.length > 0) {
							const mapped = list.map((n: Notification & { notificationType?: string }) => ({
								id: n.id,
								type: n.type || n.notificationType,
								title: n.title,
								body: n.body,
								actionUrl: n.actionUrl,
								imageUrl: n.imageUrl,
								isRead: n.isRead,
								createdAt: n.createdAt,
							}));
							setItems(mapped);
							// Seed unread count from REST data before SSE connects
							const seedUnread =
								typeof data?.unreadCount === "number"
									? data.unreadCount
									: mapped.filter((n: Notification) => !n.isRead).length;
							setUnreadCount(seedUnread);
						}
					}
				} catch (err) {
					if (!cancelled) console.warn("[notifications] Initial fetch error:", err);
				}
				if (cancelled) return;

				// 2. Connect stream — only delivers NEW notifications + unread count updates
				const stream = await client.notifications.stream({});
				if (cancelled) {
					stream.close();
					return;
				}
				streamRef.current = stream;
				setConnected(true);
				retryAttempt = 0; // Reset on successful connection

				for await (const event of stream) {
					if (cancelled) break;

					if (event.type === "notification" && event.id) {
						const notification: Notification = {
							id: event.id,
							type: event.notificationType,
							title: event.title,
							body: event.body,
							actionUrl: event.actionUrl,
							imageUrl: event.imageUrl,
							isRead: event.isRead,
							createdAt: event.createdAt,
						};
						setItems((prev) => {
							if (prev.some((n) => n.id === notification.id)) {
								return prev.map((n) => (n.id === notification.id ? notification : n));
							}
							return [notification, ...prev];
						});
					} else if (event.type === "unread_count") {
						if (typeof event.unreadCount === "number") {
							setUnreadCount(event.unreadCount);
						}
					}
				}

				// Stream ended cleanly (server closed) — reconnect
				if (!cancelled) {
					scheduleReconnect();
				}
			} catch {
				setConnected(false);
				if (!cancelled) {
					scheduleReconnect();
				}
			}
		}

		function scheduleReconnect() {
			setConnected(false);
			streamRef.current = null;
			// Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
			const delay = Math.min(1000 * 2 ** retryAttempt, 30_000);
			retryAttempt++;
			retryTimer = setTimeout(connect, delay);
		}

		connect();

		return () => {
			cancelled = true;
			clearTimeout(retryTimer);
			streamRef.current?.close();
			streamRef.current = null;
			setConnected(false);
		};
	}, [organizationId]);

	// Auto-register web push subscription when permission is already granted
	useEffect(() => {
		if (!organizationId || !isPushSupported()) return;
		if (typeof window === "undefined") return;
		if (Notification.permission !== "granted") return;

		// Get auth token and subscribe (fire-and-forget)
		getStreamTokenServer()
			.then(({ token }) => subscribeToPush(organizationId, token))
			.catch(() => {});
	}, [organizationId]);

	const markRead = useCallback((ids: string[]) => {
		setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)));
		setUnreadCount((prev) => Math.max(0, prev - ids.length));
	}, []);

	const markAllRead = useCallback(() => {
		setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
		setUnreadCount(0);
	}, []);

	const removeItems = useCallback((ids: string[]) => {
		setItems((prev) => prev.filter((n) => !ids.includes(n.id)));
		setUnreadCount((prev) => {
			const unreadRemoved = ids.filter((id) => itemsRef.current.some((n) => n.id === id && !n.isRead)).length;
			return Math.max(0, prev - unreadRemoved);
		});
	}, []);

	const restoreSnapshot = useCallback((snapshot: { items: Notification[]; unreadCount: number }) => {
		setItems(snapshot.items);
		setUnreadCount(snapshot.unreadCount);
	}, []);

	return (
		<NotificationStreamContext.Provider
			value={{ items, unreadCount, connected, markRead, markAllRead, removeItems, restoreSnapshot }}
		>
			{children}
		</NotificationStreamContext.Provider>
	);
}
