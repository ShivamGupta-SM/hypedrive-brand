import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { db } from "@/lib/brand-client";
import { CACHE, enrollmentQueryOptions, getAuthenticatedClient, infiniteEnrollmentsQueryOptions, queryKeys } from "./api-client";

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
		queryKey: queryKeys.enrollments(organizationId || "", params),
		queryFn: () => getAuthenticatedClient().brand.listOrganizationEnrollments(organizationId as string, params || {}),
		enabled: !!organizationId,
		staleTime: CACHE.list,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isPending,
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
		loading: query.isPending,
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
		loading: query.isPending,
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
		queryKey: queryKeys.enrollments(organizationId || "", { campaignId, ...params }),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.brand.listOrganizationEnrollments(organizationId as string, {
				campaignId,
				...params,
			});
		},
		enabled: !!organizationId && !!campaignId,
	});

	return {
		data: query.data?.data ?? [],
		total: query.data?.total ?? 0,
		hasMore: query.data?.hasMore ?? false,
		loading: query.isPending,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useApproveEnrollment(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ enrollmentId, remarks }: { enrollmentId: string; remarks?: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.updateEnrollmentReview(organizationId as string, enrollmentId, {
				action: "approve",
				remarks,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(organizationId || "") });
			queryClient.invalidateQueries({
				queryKey: queryKeys.infiniteEnrollments(organizationId || ""),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(organizationId || "") });
		},
	});
}

export function useRejectEnrollment(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ enrollmentId, reason }: { enrollmentId: string; reason: string }) => {
			const client = getAuthenticatedClient();
			return client.brand.updateEnrollmentReview(organizationId as string, enrollmentId, {
				action: "reject",
				reason,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(organizationId || "") });
			queryClient.invalidateQueries({
				queryKey: queryKeys.infiniteEnrollments(organizationId || ""),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(organizationId || "") });
		},
	});
}

export function useRequestChangesEnrollment(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			enrollmentId,
			reason,
			taskFeedback,
		}: {
			enrollmentId: string;
			reason: string;
			taskFeedback?: { submissionId: string; feedback: string }[];
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.updateEnrollmentReview(organizationId as string, enrollmentId, {
				action: "request_changes",
				reason,
				taskFeedback,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(organizationId || "") });
			queryClient.invalidateQueries({
				queryKey: queryKeys.infiniteEnrollments(organizationId || ""),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(organizationId || "") });
		},
	});
}

export function useBatchEnrollments(organizationId: string | undefined) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			action,
			ids,
			reason,
			remarks,
		}: {
			action: "approve" | "reject" | "request_changes";
			ids: string[];
			reason?: string;
			remarks?: string;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.batchEnrollments(organizationId as string, {
				action,
				ids,
				reason,
				remarks,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.enrollments(organizationId || "") });
			queryClient.invalidateQueries({
				queryKey: queryKeys.infiniteEnrollments(organizationId || ""),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(organizationId || "") });
		},
	});
}

export function useBulkApproveEnrollments(organizationId: string | undefined) {
	const batch = useBatchEnrollments(organizationId);
	return {
		...batch,
		mutate: ({ enrollmentIds, remarks }: { enrollmentIds: string[]; remarks?: string }) =>
			batch.mutate({ action: "approve", ids: enrollmentIds, remarks }),
		mutateAsync: ({ enrollmentIds, remarks }: { enrollmentIds: string[]; remarks?: string }) =>
			batch.mutateAsync({ action: "approve", ids: enrollmentIds, remarks }),
	};
}

export function useBulkRejectEnrollments(organizationId: string | undefined) {
	const batch = useBatchEnrollments(organizationId);
	return {
		...batch,
		mutate: ({ enrollmentIds, reason }: { enrollmentIds: string[]; reason: string }) =>
			batch.mutate({ action: "reject", ids: enrollmentIds, reason }),
		mutateAsync: ({ enrollmentIds, reason }: { enrollmentIds: string[]; reason: string }) =>
			batch.mutateAsync({ action: "reject", ids: enrollmentIds, reason }),
	};
}

export function useExportEnrollments(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async ({ campaignId, status }: { campaignId: string; status?: db.EnrollmentStatus }) => {
			const client = getAuthenticatedClient();
			return client.brand.exportEnrollments(organizationId as string, campaignId, { status });
		},
	});
}

export function useExportOrganizationEnrollments(organizationId: string | undefined) {
	return useMutation({
		mutationFn: async (params: {
			status?: db.EnrollmentStatus;
			campaignId?: string;
			createdFrom?: string;
			createdTo?: string;
		}) => {
			const client = getAuthenticatedClient();
			return client.brand.exportOrganizationEnrollments(organizationId as string, params);
		},
	});
}
