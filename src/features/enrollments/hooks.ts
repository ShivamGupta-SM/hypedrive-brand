/**
 * Enrollment Query Hooks.
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { db } from "@/lib/brand-client";
import {
	campaignEnrollmentsQueryOptions,
	enrollmentQueryOptions,
	enrollmentsQueryOptions,
	infiniteEnrollmentsQueryOptions,
} from "./queries";

export function useEnrollments(
	organizationId: string | undefined,
	params?: {
		status?: db.EnrollmentStatus;
		campaignId?: string;
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "status" | "expiresAt" | "orderValue" | "submittedAt";
		sortOrder?: "asc" | "desc";
	}
) {
	const query = useQuery({
		...enrollmentsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useInfiniteEnrollments(
	organizationId: string | undefined,
	params?: { status?: db.EnrollmentStatus; campaignId?: string }
) {
	const query = useInfiniteQuery({
		...infiniteEnrollmentsQueryOptions(organizationId || "", params),
		enabled: !!organizationId,
	});

	const data = query.data?.pages.flatMap((page) => page.data) ?? [];
	const total = query.data?.pages[0]?.total ?? 0;

	return {
		data,
		total,
		hasMore: query.hasNextPage ?? false,
		loading: query.isPending && !query.data,
		isFetchingNextPage: query.isFetchingNextPage,
		error: query.error,
		refetch: query.refetch,
		fetchNextPage: query.fetchNextPage,
	};
}

export function useEnrollment(
	organizationId: string | undefined,
	_campaignId: string | undefined,
	enrollmentId: string | undefined
) {
	const query = useQuery({
		...enrollmentQueryOptions(organizationId || "", enrollmentId || ""),
		enabled: !!organizationId && !!enrollmentId,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useCampaignEnrollments(
	organizationId: string | undefined,
	campaignId: string | undefined,
	params?: { status?: db.EnrollmentStatus; skip?: number; take?: number }
) {
	const query = useQuery({
		...campaignEnrollmentsQueryOptions(organizationId || "", campaignId || "", params),
		enabled: !!organizationId && !!campaignId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}
