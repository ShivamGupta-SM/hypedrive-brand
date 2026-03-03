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
	params?: { status?: db.EnrollmentStatus; campaignId?: string }
) =>
	infiniteQueryOptions({
		queryKey: queryKeys.infiniteEnrollments(orgId, params),
		queryFn: ({ pageParam = 0 }) =>
			listEnrollmentsServer({
				data: { orgId, params: { ...params, skip: pageParam, take: DEFAULT_PAGE_SIZE } },
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.hasMore) return undefined;
			return allPages.reduce((acc, page) => acc + (page.data?.length ?? 0), 0);
		},
		staleTime: CACHE.list,
	});
