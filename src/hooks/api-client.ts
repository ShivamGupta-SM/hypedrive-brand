/**
 * API Client Setup & Utilities
 * Shared across all hook modules
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import Client from "@/lib/brand-client";
import type { db } from "@/lib/brand-client";
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

// =============================================================================
// QUERY OPTIONS FACTORIES
// Shared between route loaders (ensureQueryData) and hooks (useQuery/useSuspenseQuery).
// Single source of truth for queryKey + queryFn + staleTime per entity.
// =============================================================================

// -- Dashboard ----------------------------------------------------------------

export const dashboardQueryOptions = (orgId: string, params?: { days?: number }) =>
	queryOptions({
		queryKey: [...queryKeys.dashboard(orgId), params?.days] as const,
		queryFn: () => getAuthenticatedClient().brand.getDashboardOverview(orgId, { days: params?.days }),
		staleTime: CACHE.dashboard,
	});

export const organizationActivityQueryOptions = (
	orgId: string,
	params?: { cursor?: string; limit?: number; entityType?: string }
) =>
	queryOptions({
		queryKey: queryKeys.organizationActivity(orgId, params),
		queryFn: () => getAuthenticatedClient().brand.getOrganizationActivity(orgId, params || {}),
		staleTime: CACHE.activity,
	});

export const setupProgressQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.setupProgress(orgId),
		queryFn: () => getAuthenticatedClient().brand.getSetupProgress(orgId),
		staleTime: CACHE.dashboard,
	});

// -- Campaigns ----------------------------------------------------------------

export const campaignQueryOptions = (orgId: string, campaignId: string) =>
	queryOptions({
		queryKey: queryKeys.campaign(orgId, campaignId),
		queryFn: () => getAuthenticatedClient().brand.getCampaign(orgId, campaignId),
		staleTime: CACHE.detail,
	});

export const campaignStatsQueryOptions = (orgId: string, campaignId: string) =>
	queryOptions({
		queryKey: queryKeys.campaignStats(orgId, campaignId),
		queryFn: () => getAuthenticatedClient().brand.getCampaignStats(orgId, campaignId, {}),
		staleTime: CACHE.detail,
	});

export const infiniteCampaignsQueryOptions = (
	orgId: string,
	params?: { status?: string; listingId?: string; search?: string }
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteCampaigns(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			getAuthenticatedClient().brand.listCampaigns(orgId, { ...params, skip: pageParam, take: DEFAULT_PAGE_SIZE }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});

// -- Enrollments --------------------------------------------------------------

export const enrollmentQueryOptions = (orgId: string, enrollmentId: string) =>
	queryOptions({
		queryKey: queryKeys.enrollment(orgId, enrollmentId),
		queryFn: () => getAuthenticatedClient().brand.getEnrollment(orgId, enrollmentId),
		staleTime: CACHE.detail,
	});

export const infiniteEnrollmentsQueryOptions = (
	orgId: string,
	params?: { status?: db.EnrollmentStatus; campaignId?: string }
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteEnrollments(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			getAuthenticatedClient().brand.listOrganizationEnrollments(orgId, {
				...params,
				skip: pageParam,
				take: DEFAULT_PAGE_SIZE,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});

// -- Listings -----------------------------------------------------------------

export const listingQueryOptions = (orgId: string, listingId: string) =>
	queryOptions({
		queryKey: queryKeys.listing(orgId, listingId),
		queryFn: () => getAuthenticatedClient().brand.getOrganizationListing(orgId, listingId),
		staleTime: CACHE.detail,
	});

export const infiniteListingsQueryOptions = (
	orgId: string,
	params?: { categoryId?: string; platformId?: string; search?: string }
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteListings(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			getAuthenticatedClient().brand.listOrganizationListings(orgId, {
				...params,
				skip: pageParam,
				take: DEFAULT_PAGE_SIZE,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});

// -- Invoices -----------------------------------------------------------------

export const infiniteInvoicesQueryOptions = (orgId: string, params?: { status?: db.InvoiceStatus }) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteInvoices(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			getAuthenticatedClient().brand.listInvoices(orgId, { ...params, skip: pageParam, take: DEFAULT_PAGE_SIZE }),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});

// -- Wallet -------------------------------------------------------------------

export const walletQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.wallet(orgId),
		queryFn: () => getAuthenticatedClient().brand.getOrganizationWallet(orgId),
		staleTime: CACHE.list,
	});

export const infiniteWalletTransactionsQueryOptions = (
	orgId: string,
	params?: { type?: "credit" | "debit"; category?: string }
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteWalletTransactions(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			getAuthenticatedClient().brand.getOrganizationWalletTransactions(orgId, {
				...params,
				skip: pageParam,
				take: DEFAULT_PAGE_SIZE,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});

// -- Team ---------------------------------------------------------------------

export const membersQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.members(orgId),
		queryFn: () => getAuthenticatedClient().auth.listMembersAuth(orgId),
		staleTime: CACHE.auth,
	});

export const invitationsQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.invitations(orgId),
		queryFn: () => getAuthenticatedClient().auth.listInvitations(orgId),
		staleTime: CACHE.invitations,
	});

// -- Campaigns lookup (used in enrollments list for name mapping) -------------

export const campaignsLookupQueryOptions = (orgId: string) =>
	queryOptions({
		queryKey: queryKeys.campaigns(orgId, { take: 100 }),
		queryFn: () => getAuthenticatedClient().brand.listCampaigns(orgId, { take: 100 }),
		staleTime: CACHE.lookup,
	});
