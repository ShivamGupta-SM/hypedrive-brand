/**
 * Storage Hooks — file uploads, downloads, logo preview.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthenticatedClient, queryKeys } from "@/hooks/api-client";
import type { storage } from "@/lib/brand-client";
import { listFilesQueryOptions, logoPreviewQueryOptions } from "./queries";

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
		...listFilesQueryOptions(),
	});

	return {
		data: query.data?.files ?? [],
		loading: query.isPending && !query.data,
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
		...logoPreviewQueryOptions(domain || ""),
		enabled: !!domain && domain.length >= 3,
	});

	return {
		data: query.data ?? null,
		loading: query.isPending && !query.data,
		error: query.error,
		refetch: query.refetch,
	};
}

/**
 * Full upload flow: request signed URL → upload file to S3 → return file URL
 */
export function useFileUpload() {
	const requestUploadUrl = useRequestUploadUrl();

	return useMutation({
		mutationFn: async (params: { file: File; folder: storage.StorageFolder; resourceId?: string }) => {
			const { uploadUrl, fileUrl, key } = await requestUploadUrl.mutateAsync({
				filename: params.file.name,
				contentType: params.file.type,
				folder: params.folder,
				resourceId: params.resourceId,
			});

			await fetch(uploadUrl, {
				method: "PUT",
				body: params.file,
				headers: { "Content-Type": params.file.type },
			});

			return { fileUrl, key };
		},
	});
}
