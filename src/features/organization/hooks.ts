/**
 * Organization Hooks — activity, setup, full org, search, active member, dashboard.
 */

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import Client, { type internal, type StreamIn } from "@/lib/brand-client";
import { API_URL } from "@/lib/config";
import { getStreamTokenServer } from "@/server/auth-queries";
import {
	activeMemberQueryOptions,
	dashboardQueryOptions,
	organizationActivityQueryOptions,
	setupProgressQueryOptions,
	unifiedSearchQueryOptions,
} from "./queries";

// -- Dashboard ----------------------------------------------------------------

export function useDashboard(organizationId: string | undefined, params?: { days?: number }) {
	const query = useQuery({
		...dashboardQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

// -- Activity -----------------------------------------------------------------

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
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

// -- Setup Progress -----------------------------------------------------------

export function useSetupProgress(organizationId: string | undefined) {
	const query = useQuery({
		...setupProgressQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useSetupProgressStream(organizationId: string | undefined) {
	const [updates, setUpdates] = useState<internal.SetupProgressUpdate[]>([]);
	const [latestUpdate, setLatestUpdate] = useState<internal.SetupProgressUpdate | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const streamRef = useRef<StreamIn<internal.SetupProgressUpdate> | null>(null);
	const abortRef = useRef(false);

	const setIsConnectedRef = useRef(setIsConnected);
	setIsConnectedRef.current = setIsConnected;

	const disconnect = useCallback(() => {
		abortRef.current = true;
		if (streamRef.current) {
			streamRef.current.close();
			streamRef.current = null;
		}
		setIsConnectedRef.current(false);
	}, []);

	const connect = useCallback(async () => {
		if (!organizationId) return;

		abortRef.current = true;
		streamRef.current?.close();
		streamRef.current = null;

		abortRef.current = false;
		setError(null);
		setUpdates([]);
		setIsComplete(false);

		try {
			const { token } = await getStreamTokenServer();
			const client = new Client(API_URL, { auth: { authorization: `Bearer ${token}` } });
			const stream = await client.brand.streamSetupProgress(organizationId);
			streamRef.current = stream;
			setIsConnectedRef.current(true);

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

// -- Search -------------------------------------------------------------------

export function useUnifiedSearch(
	organizationId: string | undefined,
	params: { q: string; cursor?: string; limit?: number }
) {
	const query = useQuery({
		...unifiedSearchQueryOptions(organizationId || "", params),
		enabled: !!organizationId && params.q.length >= 2,
		placeholderData: (prev) => prev,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		isFetching: query.isFetching,
		error: query.error,
		refetch: query.refetch,
	};
}

// -- Active Member ------------------------------------------------------------

export function useActiveMember(organizationId: string | undefined) {
	const query = useQuery({
		...activeMemberQueryOptions(organizationId || ""),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.member ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}
