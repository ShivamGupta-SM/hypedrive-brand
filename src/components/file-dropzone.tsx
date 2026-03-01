/**
 * FileDropzone - Themed wrapper for react-dropzone
 * Provides drag-and-drop file upload with Catalyst theme integration
 */

import { ArrowUpTrayIcon, DocumentIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useCallback } from "react";
import { type DropzoneOptions, type FileRejection, useDropzone } from "react-dropzone";
import { Text } from "@/components/text";

// =============================================================================
// TYPES
// =============================================================================

export interface FileWithPreview extends File {
	preview?: string;
}

export interface FileDropzoneProps extends Omit<DropzoneOptions, "onDrop"> {
	/** Container class name */
	className?: string;
	/** Files already uploaded */
	files?: FileWithPreview[];
	/** File change handler */
	onFilesChange?: (files: FileWithPreview[]) => void;
	/** Error message */
	error?: string;
	/** Show file previews */
	showPreviews?: boolean;
	/** Custom label */
	label?: string;
	/** Custom description */
	description?: string;
	/** Variant style */
	variant?: "default" | "compact" | "minimal";
}

// =============================================================================
// FILE DROPZONE
// =============================================================================

export function FileDropzone({
	className,
	files = [],
	onFilesChange,
	error,
	showPreviews = true,
	label = "Upload files",
	description,
	variant = "default",
	accept,
	maxFiles = 10,
	maxSize = 10 * 1024 * 1024, // 10MB
	multiple = true,
	disabled,
	...props
}: FileDropzoneProps) {
	const onDrop = useCallback(
		(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
			const newFiles = acceptedFiles.map((file) =>
				Object.assign(file, {
					preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
				})
			);

			if (rejectedFiles.length > 0) {
				console.warn("Rejected files:", rejectedFiles);
			}

			onFilesChange?.(multiple ? [...files, ...newFiles] : newFiles);
		},
		[files, multiple, onFilesChange]
	);

	const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
		onDrop,
		accept,
		maxFiles,
		maxSize,
		multiple,
		disabled,
		...props,
	});

	const removeFile = (index: number) => {
		const newFiles = [...files];
		const removed = newFiles.splice(index, 1)[0];
		if (removed.preview) {
			URL.revokeObjectURL(removed.preview);
		}
		onFilesChange?.(newFiles);
	};

	const acceptedTypesText = accept ? Object.values(accept).flat().join(", ") : "All files";

	const defaultDescription =
		description ||
		`Drag and drop or click to upload. ${acceptedTypesText}. Max ${formatFileSize(maxSize)}.`;

	return (
		<div className={clsx("space-y-3", className)}>
			{/* Dropzone */}
			<div
				{...getRootProps()}
				className={clsx(
					"relative cursor-pointer rounded-xl border-2 border-dashed transition-all",
					variant === "compact" ? "p-4" : variant === "minimal" ? "p-3" : "p-8",
					disabled && "cursor-not-allowed opacity-50",
					isDragReject
						? "border-red-400 bg-red-50 dark:border-red-500/50 dark:bg-red-500/10"
						: isDragActive
							? "border-blue-400 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-500/10"
							: error
								? "border-red-300 bg-red-50/50 hover:border-red-400 dark:border-red-500/30 dark:bg-red-500/5"
								: "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 hover:bg-zinc-100/50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
				)}
			>
				<input {...getInputProps()} />
				<div
					className={clsx(
						"flex flex-col items-center justify-center text-center",
						variant === "minimal" && "flex-row gap-3"
					)}
				>
					<div
						className={clsx(
							"rounded-full bg-zinc-100 dark:bg-zinc-800",
							variant === "compact" || variant === "minimal" ? "p-2" : "mb-4 p-4"
						)}
					>
						{isDragActive ? (
							<ArrowUpTrayIcon
								className={clsx("text-blue-500", variant === "minimal" ? "size-5" : "size-8")}
							/>
						) : (
							<ArrowUpTrayIcon
								className={clsx(
									"text-zinc-400 dark:text-zinc-500",
									variant === "minimal" ? "size-5" : "size-8"
								)}
							/>
						)}
					</div>
					<div className={variant === "minimal" ? "text-left" : ""}>
						<Text
							className={clsx(
								"font-medium text-zinc-700 dark:text-zinc-300",
								variant === "minimal" && "text-sm"
							)}
						>
							{isDragActive ? "Drop files here" : isDragReject ? "Invalid file type" : label}
						</Text>
						{variant !== "minimal" && (
							<Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
								{defaultDescription}
							</Text>
						)}
					</div>
				</div>
			</div>

			{/* Error */}
			{error && <Text className="text-sm text-red-500 dark:text-red-400">{error}</Text>}

			{/* File previews */}
			{showPreviews && files.length > 0 && (
				<div className="space-y-2">
					{files.map((file, index) => (
						<div
							key={`${file.name}-${index}`}
							className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
						>
							{/* Preview */}
							{file.preview ? (
								<img
									src={file.preview}
									alt={file.name}
									className="size-10 rounded-lg object-cover"
								/>
							) : (
								<div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
									{file.type.startsWith("image/") ? (
										<PhotoIcon className="size-5 text-zinc-400" />
									) : (
										<DocumentIcon className="size-5 text-zinc-400" />
									)}
								</div>
							)}

							{/* Info */}
							<div className="min-w-0 flex-1">
								<Text className="truncate text-sm font-medium text-zinc-900 dark:text-white">
									{file.name}
								</Text>
								<Text className="text-xs text-zinc-500 dark:text-zinc-400">
									{formatFileSize(file.size)}
								</Text>
							</div>

							{/* Remove */}
							<button
								type="button"
								onClick={() => removeFile(index)}
								className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-5" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// IMAGE DROPZONE
// =============================================================================

export interface ImageDropzoneProps extends Omit<FileDropzoneProps, "accept" | "showPreviews"> {
	/** Accepted image types */
	acceptedTypes?: string[];
}

export function ImageDropzone({
	acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
	label = "Upload images",
	...props
}: ImageDropzoneProps) {
	return (
		<FileDropzone
			accept={acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})}
			showPreviews
			label={label}
			{...props}
		/>
	);
}

// =============================================================================
// AVATAR UPLOAD
// =============================================================================

export interface AvatarUploadProps {
	/** Current avatar URL */
	src?: string;
	/** File change handler */
	onFileChange?: (file: File | null) => void;
	/** Size in pixels */
	size?: number;
	/** Error state */
	error?: boolean;
	/** Disabled state */
	disabled?: boolean;
	/** Class name */
	className?: string;
}

export function AvatarUpload({
	src,
	onFileChange,
	size = 96,
	error,
	disabled,
	className,
}: AvatarUploadProps) {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles[0]) {
				onFileChange?.(acceptedFiles[0]);
			}
		},
		[onFileChange]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: { "image/*": [] },
		maxFiles: 1,
		disabled,
	});

	return (
		<div
			{...getRootProps()}
			style={{ width: size, height: size }}
			className={clsx(
				"group relative cursor-pointer overflow-hidden rounded-full border-2 border-dashed transition-all",
				disabled && "cursor-not-allowed opacity-50",
				isDragActive
					? "border-blue-400 bg-blue-50 dark:border-blue-500/50"
					: error
						? "border-red-400"
						: "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600",
				className
			)}
		>
			<input {...getInputProps()} />
			{src ? (
				<>
					<img src={src} alt="Avatar" className="size-full object-cover" />
					<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
						<ArrowUpTrayIcon className="size-6 text-white" />
					</div>
				</>
			) : (
				<div className="flex size-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
					<ArrowUpTrayIcon
						className={clsx("transition-colors", isDragActive ? "text-blue-500" : "text-zinc-400")}
						style={{ width: size * 0.3, height: size * 0.3 }}
					/>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// UTILS
// =============================================================================

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
