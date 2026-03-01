import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { storage } from "@/lib/brand-client";
import { getAuthenticatedClient, queryKeys } from "./api-client";

// =============================================================================
// FILE UPLOADS / DOWNLOADS
// =============================================================================

export function useRequestUploadUrl() {
	return useMutation({
		mutationFn: async (params: storage.UploadUrlRequest) => {
			const client = getAuthenticatedClient();
			return client.storage.requestUploadUrl(params);
		},
	});
}

export function useRequestDownloadUrl() {
	return useMutation({
		mutationFn: async (params: storage.DownloadUrlRequest) => {
			const client = getAuthenticatedClient();
			return client.storage.requestDownloadUrl(params);
		},
	});
}

export function useListFiles() {
	const query = useQuery({
		queryKey: queryKeys.files(),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.storage.listFiles();
		},
	});

	return {
		data: query.data?.files ?? [],
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useDeleteFile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (key: string) => {
			const client = getAuthenticatedClient();
			return client.storage.deleteFile(key);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.files() });
		},
	});
}

export function usePreviewLogoByDomain(domain: string | undefined) {
	const query = useQuery({
		queryKey: queryKeys.logoPreview(domain || ""),
		queryFn: async () => {
			const client = getAuthenticatedClient();
			return client.storage.previewLogoByDomain({ domain: domain as string });
		},
		enabled: !!domain && domain.length >= 3,
	});

	return {
		data: query.data ?? null,
		loading: query.isLoading,
		error: query.error,
		refetch: query.refetch,
	};
}

// =============================================================================
// FILE UPLOAD HELPER
// =============================================================================

/**
 * Full upload flow: request signed URL → upload file to S3 → return file URL
 */
export function useFileUpload() {
	const requestUploadUrl = useRequestUploadUrl();

	return useMutation({
		mutationFn: async (params: { file: File; folder: storage.StorageFolder; resourceId?: string }) => {
			// Step 1: Get signed upload URL
			const { uploadUrl, fileUrl, key } = await requestUploadUrl.mutateAsync({
				filename: params.file.name,
				contentType: params.file.type,
				folder: params.folder,
				resourceId: params.resourceId,
			});

			// Step 2: Upload file directly to S3
			await fetch(uploadUrl, {
				method: "PUT",
				body: params.file,
				headers: { "Content-Type": params.file.type },
			});

			return { fileUrl, key };
		},
	});
}
