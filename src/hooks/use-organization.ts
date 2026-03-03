import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { internal, StreamIn } from "@/lib/brand-client";
import { useOrganizationStore } from "@/store/organization-store";
import { CACHE, getAuthenticatedClient, organizationActivityQueryOptions, queryKeys, setupProgressQueryOptions } from "./api-client";

// Re-export for components ABOVE the $orgSlug route tree (NotificationPopover,
// SearchDialog, approval pages). Pages inside $orgSlug should use useOrgContext().
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
		...organizationActivityQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

// =============================================================================
// SETUP PROGRESS
// =============================================================================

export function useSetupProgress(organizationId: string | undefined) {
	const query = useQuery({
		...setupProgressQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending,
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
		placeholderData: (prev) => prev,
		staleTime: CACHE.activity,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
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
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
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
		loading: query.isPending,
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
