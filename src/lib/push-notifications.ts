/**
 * Web Push Notification Registration
 *
 * Handles Service Worker registration, push subscription,
 * and token registration with the backend.
 */

import { registerPushTokenServer, removePushTokenServer } from "@/features/notifications/server";
import { API_URL } from "@/lib/config";

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Check if the browser supports push notifications
 */
export function isPushSupported(): boolean {
	return (
		typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
	);
}

/**
 * Register the service worker and return the registration
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
	if (swRegistration) return swRegistration;

	swRegistration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

	// Wait for the SW to be ready
	await navigator.serviceWorker.ready;

	return swRegistration;
}

/**
 * Convert a base64 VAPID key to Uint8Array for PushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

/**
 * Fetch the VAPID public key from the backend
 */
async function getVapidPublicKey(authToken: string): Promise<string> {
	const res = await fetch(`${API_URL}/notifications/vapid-key`, {
		headers: { Authorization: `Bearer ${authToken}` },
	});
	if (!res.ok) throw new Error(`Failed to get VAPID key: ${res.status}`);
	const data = await res.json();
	return data.publicKey;
}

/**
 * Subscribe to web push notifications.
 *
 * 1. Registers the service worker
 * 2. Requests notification permission
 * 3. Subscribes to push via PushManager
 * 4. Sends the subscription to the backend as a device token
 *
 * @returns The push subscription, or null if permission was denied
 */
export async function subscribeToPush(organizationId: string, authToken: string): Promise<PushSubscription | null> {
	if (!isPushSupported()) return null;

	// Request permission
	const permission = await Notification.requestPermission();
	if (permission !== "granted") return null;

	try {
		const registration = await registerServiceWorker();
		const vapidPublicKey = await getVapidPublicKey(authToken);
		const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

		// Check for existing subscription
		let subscription = await registration.pushManager.getSubscription();

		if (subscription) {
			// Validate existing subscription — resubscribe if VAPID key changed
			const existingKey = subscription.options?.applicationServerKey;
			if (existingKey) {
				const existingKeyArray = new Uint8Array(existingKey);
				const keysMatch =
					existingKeyArray.length === applicationServerKey.length &&
					existingKeyArray.every((v, i) => v === applicationServerKey[i]);
				if (!keysMatch) {
					await subscription.unsubscribe();
					subscription = null;
				}
			}
		}

		if (!subscription) {
			subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey,
			});
		}

		// Register the subscription with the backend (retry once on failure)
		const token = JSON.stringify(subscription.toJSON());
		try {
			await registerPushTokenServer({
				data: { organizationId, token, platform: "web" as const },
			});
		} catch {
			// Retry once after a short delay
			await new Promise((r) => setTimeout(r, 2000));
			await registerPushTokenServer({
				data: { organizationId, token, platform: "web" as const },
			});
		}

		return subscription;
	} catch (error) {
		console.error("[push] Failed to subscribe:", error);
		return null;
	}
}

/**
 * Unsubscribe from web push notifications
 */
export async function unsubscribeFromPush(organizationId: string): Promise<void> {
	if (!isPushSupported()) return;

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();

		if (subscription) {
			// Remove from backend first
			await removePushTokenServer({
				data: {
					organizationId,
					token: JSON.stringify(subscription.toJSON()),
				},
			});

			// Then unsubscribe locally
			await subscription.unsubscribe();
		}
	} catch (error) {
		console.error("[push] Failed to unsubscribe:", error);
	}
}

/**
 * Check if the user is already subscribed to push
 */
export async function isPushSubscribed(): Promise<boolean> {
	if (!isPushSupported()) return false;

	try {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.getSubscription();
		return !!subscription;
	} catch {
		return false;
	}
}
