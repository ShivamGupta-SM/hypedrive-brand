/**
 * Enrollment Mutations — approve, reject, request changes, batch, export.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import type { db } from "@/lib/brand-client";

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
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteEnrollments(organizationId || "") });
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
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteEnrollments(organizationId || "") });
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
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteEnrollments(organizationId || "") });
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
			queryClient.invalidateQueries({ queryKey: queryKeys.infiniteEnrollments(organizationId || "") });
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
