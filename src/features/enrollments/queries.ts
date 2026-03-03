/**
 * Enrollment Query Factories.
 */

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { CACHE, DEFAULT_PAGE_SIZE, getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import type { db } from "@/lib/brand-client";

// -- Enrollment Detail --------------------------------------------------------

export const enrollmentQueryOptions = (orgId: string, enrollmentId: string) =>
	queryOptions({
		queryKey: queryKeys.enrollment(orgId, enrollmentId),
		queryFn: () => getAuthenticatedClient().brand.getEnrollment(orgId, enrollmentId),
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
		queryFn: () => getAuthenticatedClient().brand.listOrganizationEnrollments(orgId, params || {}),
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
		queryFn: () =>
			getAuthenticatedClient().brand.listOrganizationEnrollments(orgId, {
				campaignId,
				...params,
			}),
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
