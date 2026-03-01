import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { brand, internal, StreamIn } from "@/lib/brand-client";
import { useOrganizationStore } from "@/store/organization-store";
import { getAuthenticatedClient, queryKeys } from "./api-client";

// Re-export for convenience
export { useCurrentOrganization, useOrganizationId } from "@/store/organization-store";

// =============================================================================
// ORGANIZATION PROFILE (reads from Zustand store, populated by $orgSlug route)
// =============================================================================

/**
 * Reads current organization and organizations list from the Zustand store.
 * The store is populated server-side by the $orgSlug route's beforeLoad + useEffect sync.
 * No client-side fetching — single source of truth is the route context → store sync.
 */
export function useOrganizationProfile() {
	const { currentOrganization, organizations, isLoading } = useOrganizationStore();

	return {
		organization: currentOrganization,
		organizations,
		loading: isLoading,
	};
}

export function useCreateOrganization() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			name: string;
			slug?: string;
			logo?: string;
			gstNumber: string;
			gstLegalName: string;
			gstTradeName?: string;
			description?: string;
			website?: string;
			businessType?: string;
			industryCategory?: string;
			contactPerson?: string;
			phoneNumber?: string;
			address?: string;
			city?: string;
			state?: string;
			country?: string;
			postalCode?: string;
		}) => {
			const client = getAuthenticatedClient();
			return client.auth.createOrganization(params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
		},
	});
}

// =============================================================================
// ORGANIZATION ACTIVITY
// =============================================================================

export function useOrganizationActivity(
	organizationId: string | undefined,
	params?: {
		cursor?: string;
		limit?: number;
		entityType?: "campaign" | "enrollment" | "invoice" | "listing" | "organization" | "withdrawal";
	}
) {
	const query = useQuery({
		queryKey: queryKeys.organizationActivity(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganizationActivity(organizationId as string, {
				cursor: params?.cursor,
				limit: params?.limit,
				entityType: params?.entityType,
			});
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

// =============================================================================
// ORGANIZATION SETTINGS
// =============================================================================

export function useOrganizationSettings(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.organization(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganization(organizationId as string);
		},
		enabled: !!organizationId,
		staleTime: 10 * 60 * 1000, // 10 min — org settings rarely change
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useUpdateOrganizationSettings(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: {
			name?: string;
			description?: string;
			website?: string;
			logo?: string;
			businessType?: "pvt_ltd" | "llp" | "partnership" | "proprietorship" | "public_ltd" | "trust" | "society";
			industryCategory?: string;
			contactPerson?: string;
			email?: string;
			address?: string;
			city?: string;
			state?: string;
			country?: string;
			postalCode?: string;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.updateOrganization(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.organizationProfile() });
		},
	});
}

export function useChangeOrgPhone(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { phoneNumber: string; passkeyResponse: unknown; challengeId: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.changeOrgPhone(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.organization(organizationId || "") });
		},
	});
}

// =============================================================================
// BANK ACCOUNT
// =============================================================================

export function useBankAccount(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.bankAccount(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getOrganizationBankAccount(organizationId as string, {});
		},
		enabled: !!organizationId,
		staleTime: 10 * 60 * 1000, // 10 min — bank account rarely changes
	});

	return {
		data: query.data?.bankAccount ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useVerifyBankAccount(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (params: brand.VerifyBankAccountDetailsRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.verifyBankAccountDetails(organizationId as string, params);
		},
	});
}

export function useAddBankAccount(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: brand.AddBankAccountRequest) => {
			const client = getAuthenticatedClient();
			return client.brand.addBankAccount(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.bankAccount(organizationId || "") });
		},
	});
}

export function useDeleteBankAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ organizationId }: { organizationId: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.deleteBankAccount(organizationId);
		},
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.bankAccount(variables.organizationId) });
		},
	});
}

// =============================================================================
// GST
// =============================================================================

export function useGSTDetails(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.gstDetails(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getGSTDetails(organizationId as string);
		},
		enabled: !!organizationId,
		staleTime: 15 * 60 * 1000, // 15 min — GST details almost never change
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useVerifyGSTPreview() {
	return useMutation({
		mutationFn: async (params: { gstNumber: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.verifyGSTPreview(params);
		},
	});
}

/**
 * Enrich a company domain — auto-fill org details (logo, industry, name, etc.)
 * during onboarding or org creation.
 */
export function useEnrichPreview() {
	return useMutation({
		mutationFn: async (params: { domain: string; name?: string }) => {
			const client = getAuthenticatedClient();
			return client.enrichment.enrichPreview(params);
		},
	});
}

// =============================================================================
// SETUP PROGRESS
// =============================================================================

export function useSetupProgress(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.setupProgress(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getSetupProgress(organizationId as string);
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

/**
 * Real-time setup progress streaming via WebSocket.
 * Connects to the backend SSE stream and receives updates as setup jobs complete.
 *
 * @example
 * const { updates, isConnected, isComplete, connect, disconnect } = useSetupProgressStream(orgId);
 */
export function useSetupProgressStream(organizationId: string | undefined) {
	const [updates, setUpdates] = useState<internal.SetupProgressUpdate[]>([]);
	const [latestUpdate, setLatestUpdate] = useState<internal.SetupProgressUpdate | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const streamRef = useRef<StreamIn<internal.SetupProgressUpdate> | null>(null);
	const abortRef = useRef(false);

	// Stable refs for state setters — never change, so disconnect/connect have no deps
	const setIsConnectedRef = useRef(setIsConnected);
	setIsConnectedRef.current = setIsConnected;

	// disconnect is stable (no deps) — closing is purely ref-based
	const disconnect = useCallback(() => {
		abortRef.current = true;
		if (streamRef.current) {
			streamRef.current.close();
			streamRef.current = null;
		}
		setIsConnectedRef.current(false);
	}, []);

	// connect only re-creates when organizationId changes
	const connect = useCallback(async () => {
		if (!organizationId) return;

		// Clean up any existing connection inline (avoid calling disconnect to keep deps minimal)
		abortRef.current = true;
		streamRef.current?.close();
		streamRef.current = null;

		abortRef.current = false;
		setError(null);
		setUpdates([]);
		setIsComplete(false);

		try {
			const client = getAuthenticatedClient();
			const stream = await client.brand.streamSetupProgress(organizationId);
			streamRef.current = stream;
			setIsConnectedRef.current(true);

			// Consume stream
			for await (const update of stream) {
				if (abortRef.current) break;

				setUpdates((prev) => [...prev, update]);
				setLatestUpdate(update);

				if (update.isComplete) {
					setIsComplete(true);
					break;
				}
			}
		} catch (err) {
			if (!abortRef.current) {
				setError(err instanceof Error ? err.message : "Stream connection failed");
			}
		} finally {
			setIsConnectedRef.current(false);
			streamRef.current = null;
		}
	}, [organizationId]);

	// Auto-disconnect on unmount
	useEffect(() => {
		return () => {
			abortRef.current = true;
			streamRef.current?.close();
		};
	}, []);

	return {
		updates,
		latestUpdate,
		isConnected,
		isComplete,
		error,
		connect,
		disconnect,
	};
}

// =============================================================================
// UNIFIED SEARCH
// =============================================================================

export function useUnifiedSearch(
	organizationId: string | undefined,
	params: { q: string; cursor?: string; limit?: number }
) {
	const query = useQuery({
		queryKey: queryKeys.search(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.unifiedSearch(organizationId as string, params);
		},
		enabled: !!organizationId && params.q.length >= 2,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

// =============================================================================
// NOTIFICATION PREFERENCES
// =============================================================================

export function useNotificationPreferences(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.notificationPreferences(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			await client.brand.getPreferences(organizationId as string);
			return null;
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useUpdateNotificationPreferences(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: Record<string, unknown>) => {
			const client = getAuthenticatedClient();
			return client.brand.updatePreferences(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.notificationPreferences(organizationId || ""),
			});
		},
	});
}

// =============================================================================
// NOTIFICATIONS (In-App)
// =============================================================================

/**
 * Note: listNotifications returns void from the API currently.
 * We call it anyway so the request fires; when the API is updated
 * to return data, this hook will start working automatically.
 */
export function useNotifications(
	organizationId: string | undefined,
	params?: { limit?: number; offset?: number; unreadOnly?: boolean }
) {
	const query = useQuery({
		queryKey: queryKeys.notifications(organizationId || "", params),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			await client.brand.listNotifications(organizationId as string, params || {});
			return null;
		},
		enabled: !!organizationId,
	});

	return { data: query.data, loading: query.isLoading, error: query.error, refetch: query.refetch };
}

export function useUnreadCount(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.unreadCount(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			await client.brand.getUnreadCount(organizationId as string);
			return null;
		},
		enabled: !!organizationId,
		refetchInterval: 30000, // Poll every 30s for unread count
	});

	return { data: query.data, loading: query.isLoading, error: query.error, refetch: query.refetch };
}

export function useMarkNotificationRead(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			const client = getAuthenticatedClient();
			return client.brand.markRead(organizationId as string, { ids });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

export function useMarkAllNotificationsRead(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.markAllRead(organizationId as string);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

export function useArchiveNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			const client = getAuthenticatedClient();
			return client.brand.archiveNotifications(organizationId as string, { ids });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

export function useDeleteNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (ids: string[]) => {
			const client = getAuthenticatedClient();
			return client.brand.deleteNotifications(organizationId as string, { ids });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

export function useDeleteAllNotifications(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.deleteAllNotifications(organizationId as string);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.notifications(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.unreadCount(organizationId || "") });
		},
	});
}

// =============================================================================
// ACTIVE MEMBER
// =============================================================================

export function useActiveMember(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.activeMember(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.getActiveMember(organizationId as string);
		},
		enabled: !!organizationId,
	});

	return {
		data: query.data?.member ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

// =============================================================================
// PUSH NOTIFICATION TOKENS
// =============================================================================

export function useRegisterPushToken(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (params: { token: string; platform: "ios" | "android" | "web" }) => {
			const client = getAuthenticatedClient();
			return client.brand.registerToken(organizationId as string, params);
		},
	});
}

export function useRemovePushToken(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (token: string) => {
			const client = getAuthenticatedClient();
			return client.brand.removeToken(organizationId as string, { token });
		},
	});
}

export function useListPushTokens(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: ["pushTokens", organizationId] as const,
		queryFn: async () => {
			const client = getAuthenticatedClient();
			await client.brand.listTokens(organizationId as string);
			return null;
		},
		enabled: !!organizationId,
	});

	return { data: query.data, loading: query.isLoading, error: query.error, refetch: query.refetch };
}

// =============================================================================
// ORGANIZATION ROLES
// =============================================================================

export function useOrganizationRoles(organizationId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.organizationRoles(organizationId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.auth.listOrganizationRoles(organizationId as string);
		},
		enabled: !!organizationId,
		staleTime: 10 * 60 * 1000, // 10 min — roles rarely change
	});

	return {
		data: query.data?.roles ?? [],
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCreateOrganizationRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { role: string; permission?: { [key: string]: string[] } }) => {
			const client = getAuthenticatedClient();
			return client.auth.createOrganizationRole(organizationId as string, params);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.organizationRoles(organizationId || ""),
			});
		},
	});
}

export function useDeleteOrganizationRole(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (roleId: string) => {
			const client = getAuthenticatedClient();
			return client.auth.deleteOrganizationRole(organizationId as string, roleId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.organizationRoles(organizationId || ""),
			});
		},
	});
}

// =============================================================================
// WITHDRAWAL DETAIL / CANCEL
// =============================================================================

export function useWithdrawalDetail(organizationId: string | undefined, withdrawalId: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.withdrawal(organizationId || "", withdrawalId || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.getWithdrawalRequest(organizationId as string, withdrawalId as string);
		},
		enabled: !!organizationId && !!withdrawalId,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCancelWithdrawal(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: { withdrawalId: string; reason?: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.cancelWithdrawalRequest(organizationId as string, params.withdrawalId, {
				reason: params.reason,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.wallet(organizationId || "") });
			queryClient.invalidateQueries({ queryKey: queryKeys.withdrawals(organizationId || "") });
		},
	});
}
