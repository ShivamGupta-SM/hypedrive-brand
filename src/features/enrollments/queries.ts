/**
 * Enrollment Query Factories.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, queryKeys } from "@/hooks/api-client";
import type { db } from "@/lib/brand-client";
import { getEnrollmentServer, listEnrollmentsServer } from "./server";

// -- Enrollment Detail --------------------------------------------------------

export const enrollmentQueryOptions = (orgId: string, enrollmentId: string) =>
	queryOptions({
		queryKey: queryKeys.enrollment(orgId, enrollmentId),
		queryFn: () => getEnrollmentServer({ data: { orgId, enrollmentId } }),
		staleTime: CACHE.detail,
	});

// -- Enrollment Lists (paginated) --------------------------------------------

export const enrollmentsQueryOptions = (
	orgId: string,
	params?: {
		status?: db.EnrollmentStatus;
		campaignId?: string;
		skip?: number;
		take?: number;
		sortBy?: "createdAt" | "status" | "expiresAt" | "orderValue" | "submittedAt";
		sortOrder?: "asc" | "desc";
	}
) =>
	queryOptions({
		queryKey: queryKeys.enrollments(orgId, params),
		queryFn: () => listEnrollmentsServer({ data: { orgId, params: params || {} } }),
		staleTime: CACHE.list,
	});

// -- Campaign Enrollments (paginated) ----------------------------------------

export const campaignEnrollmentsQueryOptions = (
	orgId: string,
	campaignId: string,
	params?: { status?: db.EnrollmentStatus; skip?: number; take?: number }
) =>
	queryOptions({
		queryKey: queryKeys.enrollments(orgId, { campaignId, ...params }),
		queryFn: () => listEnrollmentsServer({ data: { orgId, params: { campaignId, ...params } } }),
		staleTime: CACHE.list,
	});

// -- Enrollment Lists (infinite) ---------------------------------------------

export const infiniteEnrollmentsQueryOptions = (
	orgId: string,
	params?: {
		status?: db.EnrollmentStatus;
		campaignId?: string;
		q?: string;
		createdFrom?: string;
		createdTo?: string;
		orderValueMin?: number;
		orderValueMax?: number;
		sortBy?: "createdAt" | "orderValue" | "status" | "submittedAt" | "expiresAt";
		sortOrder?: "asc" | "desc";
	}
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteEnrollments(orgId, params),
		queryFn: ({ pageParam }) =>
			listEnrollmentsServer({
				data: { orgId, params: { ...params, cursor: pageParam, limit: DEFAULT_PAGE_SIZE } },
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
		staleTime: CACHE.list,
	});
