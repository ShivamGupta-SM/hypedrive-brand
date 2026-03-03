/**
 * Singleton Notification SSE Stream Provider.
 *
 * Mounted once at the $orgSlug layout level so ALL notification UI
 * (NotificationBell, NotificationPopoverNavbar) shares a single SSE
 * connection instead of each component creating its own.
 */

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Client, { type notifications } from "@/lib/brand-client";
import { API_URL } from "@/lib/config";
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
				const { token } = await getStreamTokenServer();
				if (cancelled) return;

				const client = new Client(API_URL, { auth: { authorization: `Bearer ${token}` } });
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

						// Browser notification when tab is hidden
						if (
							typeof window !== "undefined" &&
							"Notification" in window &&
							Notification.permission === "granted" &&
							!notification.isRead &&
							document.hidden
						) {
							new Notification(notification.title || "Hypedrive", {
								body: notification.body || undefined,
								icon: "/favicon.ico",
								tag: notification.id,
							});
						}
					} else if (event.type === "unread_count") {
						const count = (event as notifications.NotificationUpdate & { count?: number }).count;
						if (typeof count === "number") {
							setUnreadCount(count);
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

	return (
		<NotificationStreamContext.Provider value={{ items, unreadCount, connected, markRead, markAllRead, removeItems }}>
			{children}
		</NotificationStreamContext.Provider>
	);
}
