/**
 * Centralized toast helpers
 *
 * Wraps Sonner's `toast` with consistent defaults and typed helpers so
 * call sites are clean, uniform, and easy to change globally.
 *
 * Usage:
 *   import { showToast } from "@/lib/toast";
 *   showToast.success("Campaign created");
 *   showToast.error(err, "Failed to create campaign");
 *   showToast.copy("Address");
 *   showToast.exported();        // API-triggered export
 *   showToast.exportedLocally(); // CSV fallback
 */

import { toast } from "sonner";
import { getAPIErrorMessage } from "@/hooks/api-client";

// =============================================================================
// CORE HELPERS
// =============================================================================

function success(message: string, description?: string) {
	toast.success(message, description ? { description } : undefined);
}

function error(err: unknown, fallback = "Something went wrong") {
	toast.error(getAPIErrorMessage(err, fallback));
}

function info(message: string, description?: string) {
	toast.info(message, description ? { description } : undefined);
}

function warning(message: string, description?: string) {
	toast.warning(message, description ? { description } : undefined);
}

function loading(message: string) {
	return toast.loading(message);
}

function dismiss(id?: string | number) {
	toast.dismiss(id);
}

// =============================================================================
// DOMAIN HELPERS — consistent phrasing across the app
// =============================================================================

/** User copied something to clipboard */
function copy(label?: string) {
	toast.success(label ? `${label} copied` : "Copied to clipboard");
}

/** Async export started via API (download URL opened) */
function exported() {
	toast.success("Export started", { description: "Your download will begin shortly." });
}

/** Fallback CSV export (API unavailable or no URL returned) */
function exportedLocally() {
	toast.info("Exported as CSV");
}

/** File generated and opened */
function fileGenerated(label = "File") {
	toast.success(`${label} generated`);
}

// =============================================================================
// PROMISE HELPER
// Wraps toast.promise with typed success/error messages
// =============================================================================

function promise<T>(
	p: Promise<T>,
	messages: {
		loading: string;
		success: string | ((data: T) => string);
		error?: string | ((err: unknown) => string);
	}
) {
	return toast.promise(p, {
		loading: messages.loading,
		success: messages.success,
		error: messages.error ?? ((err) => getAPIErrorMessage(err, "Something went wrong")),
	});
}

// =============================================================================
// EXPORT
// =============================================================================

export const showToast = {
	success,
	error,
	info,
	warning,
	loading,
	dismiss,
	// Domain helpers
	copy,
	exported,
	exportedLocally,
	fileGenerated,
	promise,
} as const;
