/**
 * Storage Server Functions — authenticated API calls proxied through the server.
 */

import { createServerFn } from "@tanstack/react-start";
import type { storage } from "@/lib/brand-client";
import { authMiddleware } from "@/server/middleware";

// -- Queries ------------------------------------------------------------------

export const listFilesServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.storage.listFiles();
	});

export const logoPreviewServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { domain: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.storage.previewLogoByDomain({ domain: data.domain });
	});

// -- Mutations ----------------------------------------------------------------

export const requestUploadUrlServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: storage.UploadUrlRequest) => input)
	.handler(async ({ context, data }) => {
		return context.client.storage.requestUploadUrl(data);
	});

export const requestDownloadUrlServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: storage.DownloadUrlRequest) => input)
	.handler(async ({ context, data }) => {
		return context.client.storage.requestDownloadUrl(data);
	});

export const deleteFileServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { key: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.storage.deleteFile(data.key);
	});
