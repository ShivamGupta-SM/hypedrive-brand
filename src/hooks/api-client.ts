/**
 * API Client Setup & Utilities
 * Shared across all hook modules
 */

import Client from "@/lib/brand-client";
import { API_URL } from "@/lib/config";

// =============================================================================
// API CLIENT SETUP
// =============================================================================

export const apiClient = new Client(API_URL);

/** Read auth token from the public (non-httpOnly) cookie, readable by JS for Bearer headers. */
export function getAuthTokenFromCookie(): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(/(?:^|;\s*)hd_auth_pub=([^;]*)/);
	return match ? decodeURIComponent(match[1]) : null;
}

let cachedToken: string | null = null;
let cachedClient: Client | null = null;

export function getAuthenticatedClient(): Client {
	const token = getAuthTokenFromCookie();
	if (!token) return apiClient;

	// Reuse cached client if token hasn't changed
	if (cachedToken === token && cachedClient) return cachedClient;

	cachedToken = token;
	cachedClient = apiClient.with({
		auth: { authorization: `Bearer ${token}` },
	});
	return cachedClient;
}

/**
 * Clear the in-memory authenticated client cache.
 * Call this on logout so the next request doesn't reuse a stale token.
 */
export function clearAuthCache(): void {
	cachedToken = null;
	cachedClient = null;
}

export function getAssetUrl(path: string | undefined | null): string {
	if (!path) return "";
	if (path.startsWith("http://") || path.startsWith("https://")) return path;
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;
	return `${API_URL}/${cleanPath}`;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

interface APIError {
	code?: string;
	message?: string;
	status?: number;
}

export function isAPIError(error: unknown): error is APIError {
	return typeof error === "object" && error !== null && ("code" in error || "message" in error || "status" in error);
}

export function getAPIErrorMessage(error: unknown, fallback = "Something went wrong"): string {
	if (isAPIError(error)) return error.message || fallback;
	if (error instanceof Error) return error.message;
	return fallback;
}

export function getAPIErrorCode(error: unknown): string | null {
	if (isAPIError(error) && error.code) return error.code;
	return null;
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const queryKeys = {
	organizationProfile: () => ["organizationProfile"] as const,
	organization: (orgId: string) => ["organization", orgId] as const,
	organizationActivity: (orgId: string, params?: Record<string, unknown>) =>
		["organization", orgId, "activity", params] as const,
	dashboard: (orgId: string) => ["dashboard", orgId] as const,
	campaigns: (orgId: string, params?: Record<string, unknown>) => ["campaigns", orgId, params] as const,
	campaign: (orgId: string, campaignId: string) => ["campaigns", orgId, campaignId] as const,
	campaignStats: (orgId: string, campaignId: string) => ["campaigns", orgId, campaignId, "stats"] as const,
	infiniteCampaigns: (orgId: string, params?: Record<string, unknown>) => ["infiniteCampaigns", orgId, params] as const,
	campaignTasks: (orgId: string, campaignId: string) => ["campaignTasks", orgId, campaignId] as const,
	listings: (orgId: string, params?: Record<string, unknown>) => ["listings", orgId, params] as const,
	listing: (orgId: string, listingId: string) => ["listings", orgId, listingId] as const,
	infiniteListings: (orgId: string, params?: Record<string, unknown>) => ["infiniteListings", orgId, params] as const,
	enrollments: (orgId: string, params?: Record<string, unknown>) => ["enrollments", orgId, params] as const,
	enrollment: (orgId: string, enrollmentId: string) => ["enrollments", orgId, enrollmentId] as const,
	infiniteEnrollments: (orgId: string, params?: Record<string, unknown>) =>
		["infiniteEnrollments", orgId, params] as const,
	wallet: (orgId: string) => ["wallet", orgId] as const,
	walletTransactions: (orgId: string, params?: Record<string, unknown>) =>
		["wallet", orgId, "transactions", params] as const,
	walletHolds: (orgId: string) => ["wallet", orgId, "holds"] as const,
	infiniteWalletTransactions: (orgId: string, params?: Record<string, unknown>) =>
		["infiniteWalletTransactions", orgId, params] as const,
	withdrawals: (orgId: string, params?: Record<string, unknown>) => ["wallet", orgId, "withdrawals", params] as const,
	withdrawalStats: (orgId: string) => ["wallet", orgId, "withdrawalStats"] as const,
	deposits: (orgId: string, params?: Record<string, unknown>) => ["wallet", orgId, "deposits", params] as const,
	virtualAccount: (orgId: string) => ["wallet", orgId, "virtualAccount"] as const,
	bankAccount: (orgId: string) => ["bankAccount", orgId] as const,
	invoices: (orgId: string, params?: Record<string, unknown>) => ["invoices", orgId, params] as const,
	invoice: (orgId: string, invoiceId: string) => ["invoices", orgId, invoiceId] as const,
	infiniteInvoices: (orgId: string, params?: Record<string, unknown>) => ["infiniteInvoices", orgId, params] as const,
	gstDetails: (orgId: string) => ["gst", orgId] as const,
	members: (orgId: string) => ["members", orgId] as const,
	invitations: (orgId: string) => ["invitations", orgId] as const,
	search: (orgId: string, params?: Record<string, unknown>) => ["search", orgId, params] as const,
	setupProgress: (orgId: string) => ["setupProgress", orgId] as const,
	activeMember: (orgId: string) => ["activeMember", orgId] as const,
	notificationPreferences: (orgId: string) => ["notificationPreferences", orgId] as const,
	userInfo: () => ["userInfo"] as const,
	fullOrganization: (orgId: string) => ["fullOrganization", orgId] as const,
	deviceSessions: () => ["deviceSessions"] as const,
	passkeys: () => ["passkeys"] as const,
	notifications: (orgId: string, params?: Record<string, unknown>) => ["notifications", orgId, params] as const,
	unreadCount: (orgId: string) => ["notifications", orgId, "unreadCount"] as const,
	files: () => ["files"] as const,
	withdrawal: (orgId: string, withdrawalId: string) => ["wallet", orgId, "withdrawal", withdrawalId] as const,
	organizationRoles: (orgId: string) => ["organizationRoles", orgId] as const,
	enrichment: (params?: Record<string, unknown>) => ["enrichment", params] as const,
	logoPreview: (domain: string) => ["logoPreview", domain] as const,
	linkedAccounts: () => ["linkedAccounts"] as const,
	userInvitations: () => ["userInvitations"] as const,
	organizationRole: (orgId: string, roleId: string) => ["organizationRoles", orgId, roleId] as const,
	platforms: () => ["platforms"] as const,
	taskTemplates: (params?: Record<string, unknown>) => ["taskTemplates", params] as const,
	pushTokens: (orgId: string) => ["pushTokens", orgId] as const,
};

export const DEFAULT_PAGE_SIZE = 20;
