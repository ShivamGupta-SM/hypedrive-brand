/**
 * Service Worker for Web Push Notifications
 *
 * Handles push events from the server and shows native browser notifications.
 * Also handles notification click events for navigation.
 */

// ─── Push Event ──────────────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
	if (!event.data) return;

	let payload;
	try {
		payload = event.data.json();
	} catch {
		payload = { title: "Hypedrive", body: event.data.text() };
	}

	const { title = "Hypedrive", body, icon, badge, data, tag } = payload;

	const options = {
		body: body || undefined,
		icon: icon || "/favicon.svg",
		badge: badge || "/favicon.svg",
		tag: tag || undefined,
		data: data || {},
		renotify: false, // Don't re-alert for same tag (silently replace)
		requireInteraction: false,
		silent: false,
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification Click ──────────────────────────────────────────────────────

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	const actionUrl = event.notification.data?.actionUrl;
	const targetUrl = actionUrl || "/";

	event.waitUntil(
		clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
			// Try to focus an existing window
			for (const client of windowClients) {
				if (client.url.includes(self.location.origin)) {
					client.focus();
					if (actionUrl) {
						client.navigate(targetUrl);
					}
					return;
				}
			}
			// No existing window — open new one
			return clients.openWindow(targetUrl);
		})
	);
});

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});
