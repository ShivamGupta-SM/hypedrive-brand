/**
 * API Client Setup & Utilities
 * Shared across all hook modules
 */

import { API_URL } from "@/lib/config";

// =============================================================================
// ASSET URLS
// =============================================================================

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
	if (isAPIError(error)) {
		// Check for structured error code in details (new pattern)
		const details = (error as any).details;
		if (details?.code) return details.code;
		// Fallback to top-level code
		if (error.code) return error.code;
	}
	return null;
}

/**
 * Get structured error details from APIError (for financial errors etc.)
 */
export function getAPIErrorDetails(error: unknown): Record<string, unknown> | null {
	if (isAPIError(error)) {
		return (error as any).details ?? null;
	}
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
	walletHolds: (orgId: string, params?: Record<string, unknown>) => ["wallet", orgId, "holds", params] as const,
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
	deviceSessions: () => ["deviceSessions"] as const,
	passkeys: () => ["passkeys"] as const,
	notifications: (orgId: string, params?: Record<string, unknown>) => ["notifications", orgId, params] as const,
	files: () => ["files"] as const,
	walletTransaction: (orgId: string, transactionId: string) => ["wallet", orgId, "transaction", transactionId] as const,
	withdrawal: (orgId: string, withdrawalId: string) => ["wallet", orgId, "withdrawal", withdrawalId] as const,
	organizationRoles: (orgId: string) => ["organizationRoles", orgId] as const,
	logoPreview: (domain: string) => ["logoPreview", domain] as const,
	linkedAccounts: () => ["linkedAccounts"] as const,
	userInvitations: () => ["userInvitations"] as const,
	organizationRole: (orgId: string, roleId: string) => ["organizationRoles", orgId, roleId] as const,
	platforms: () => ["platforms"] as const,
	taskTemplates: (params?: Record<string, unknown>) => ["taskTemplates", params] as const,
	pushTokens: (orgId: string) => ["pushTokens", orgId] as const,
	notificationUnreadCount: (orgId: string) => ["notificationUnreadCount", orgId] as const,
};

export const DEFAULT_PAGE_SIZE = 20;

// =============================================================================
// ERROR CODE → USER-FRIENDLY MESSAGES
// =============================================================================

const ERROR_CODE_MESSAGES: Record<string, string> = {
	INSUFFICIENT_BALANCE: "Insufficient wallet balance for this operation.",
	WALLET_FROZEN: "Your wallet is currently frozen. Contact support for assistance.",
	WALLET_NOT_FOUND: "Wallet not found. Please complete your organization setup.",
	BANK_ACCOUNT_NOT_FOUND: "No bank account linked. Please add a bank account first.",
	BANK_ACCOUNT_NOT_VERIFIED: "Your bank account is not yet verified.",
	ORG_NOT_FOUND: "Organization not found.",
	SETUP_INCOMPLETE: "Please complete your organization setup first.",
	INVALID_STATUS_TRANSITION: "This action is not available for the current status.",
	DUPLICATE_WITHDRAWAL: "A similar withdrawal was already submitted. Please wait before trying again.",
	RATE_LIMITED: "Too many requests. Please wait a moment and try again.",
	ENROLLMENT_EXPIRED: "This enrollment has expired and can no longer be processed.",
	CAMPAIGN_FULL: "This campaign has reached its maximum enrollment limit.",
};

/**
 * Get a user-friendly message from an API error, checking structured error codes first.
 */
export function getFriendlyErrorMessage(error: unknown, fallback: string): string {
	const code = getAPIErrorCode(error);
	if (code && ERROR_CODE_MESSAGES[code]) {
		return ERROR_CODE_MESSAGES[code];
	}
	return getAPIErrorMessage(error, fallback);
}

// =============================================================================
// CACHE TIME CONSTANTS (centralized — single source of truth)
// =============================================================================

export const CACHE = {
	/** 30s — frequently changing lists (campaigns, enrollments, transactions) */
	list: 30_000,
	/** 30s — detail views that change on user action */
	detail: 30_000,
	/** 1 min — activity feeds, search results */
	activity: 60_000,
	/** 2 min — expensive aggregations (dashboard, setup progress) */
	dashboard: 2 * 60_000,
	/** 2 min — invitations (change when members accept) */
	invitations: 2 * 60_000,
	/** 5 min — auth session + organizations, member list */
	auth: 5 * 60_000,
	/** 5 min — campaign lookup tables, task templates */
	lookup: 5 * 60_000,
	/** 10 min — org settings, bank account, roles (slow-changing) */
	settings: 10 * 60_000,
	/** 15 min — GST details (almost never change) */
	static: 15 * 60_000,
} as const;
