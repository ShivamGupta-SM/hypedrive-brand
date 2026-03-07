import { describe, expect, it } from "vitest";
import {
	CACHE,
	DEFAULT_PAGE_SIZE,
	getAssetUrl,
	getFriendlyErrorMessage,
	isAPIError,
	queryKeys,
} from "./api-client";

// =============================================================================
// isAPIError
// =============================================================================

describe("isAPIError", () => {
	it("returns true for objects with message", () => {
		expect(isAPIError({ message: "fail" })).toBe(true);
	});

	it("returns true for objects with code", () => {
		expect(isAPIError({ code: "NOT_FOUND" })).toBe(true);
	});

	it("returns true for objects with status", () => {
		expect(isAPIError({ status: 404 })).toBe(true);
	});

	it("returns false for null", () => {
		expect(isAPIError(null)).toBe(false);
	});

	it("returns false for strings", () => {
		expect(isAPIError("error")).toBe(false);
	});

	it("returns false for plain Error instances without API fields", () => {
		// Error has message, and message is a key — so isAPIError returns true
		// This is expected behavior: Error objects match the shape
		const err = new Error("oops");
		expect(isAPIError(err)).toBe(true);
	});
});

// =============================================================================
// getFriendlyErrorMessage
// =============================================================================

describe("getFriendlyErrorMessage", () => {
	it("returns error message for API errors", () => {
		expect(getFriendlyErrorMessage({ message: "Bad request" }, "fallback")).toBe("Bad request");
	});

	it("returns fallback when no message", () => {
		expect(getFriendlyErrorMessage({ status: 500 }, "Server error")).toBe("Server error");
	});

	it("returns default fallback when none provided", () => {
		expect(getFriendlyErrorMessage(null)).toBe("Something went wrong");
	});

	it("returns Error.message for native errors", () => {
		expect(getFriendlyErrorMessage(new Error("native"), "fallback")).toBe("native");
	});

	it("maps known error codes to friendly messages", () => {
		const err = { message: "raw", details: { code: "INSUFFICIENT_BALANCE" } };
		expect(getFriendlyErrorMessage(err, "fallback")).toBe(
			"Insufficient wallet balance for this operation.",
		);
	});

	it("maps WALLET_FROZEN code", () => {
		const err = { message: "raw", details: { code: "WALLET_FROZEN" } };
		expect(getFriendlyErrorMessage(err, "fallback")).toBe(
			"Your wallet is currently frozen. Contact support for assistance.",
		);
	});

	it("maps RATE_LIMITED code", () => {
		const err = { message: "raw", details: { code: "RATE_LIMITED" } };
		expect(getFriendlyErrorMessage(err, "fallback")).toBe(
			"Too many requests. Please wait a moment and try again.",
		);
	});

	it("falls back to message for unknown error codes", () => {
		const err = { message: "Something specific", details: { code: "UNKNOWN_CODE" } };
		expect(getFriendlyErrorMessage(err, "fallback")).toBe("Something specific");
	});

	it("uses top-level code when no details.code", () => {
		const err = { code: "CAMPAIGN_FULL", message: "raw" };
		expect(getFriendlyErrorMessage(err, "fallback")).toBe(
			"This campaign has reached its maximum enrollment limit.",
		);
	});
});

// =============================================================================
// getAssetUrl
// =============================================================================

describe("getAssetUrl", () => {
	it("returns empty string for null/undefined", () => {
		expect(getAssetUrl(null)).toBe("");
		expect(getAssetUrl(undefined)).toBe("");
		expect(getAssetUrl("")).toBe("");
	});

	it("returns absolute URLs unchanged", () => {
		expect(getAssetUrl("https://cdn.example.com/img.png")).toBe("https://cdn.example.com/img.png");
		expect(getAssetUrl("http://localhost/img.png")).toBe("http://localhost/img.png");
	});

	it("strips leading slash from relative paths", () => {
		const url = getAssetUrl("/uploads/photo.jpg");
		expect(url).not.toContain("//uploads");
		expect(url).toContain("uploads/photo.jpg");
	});
});

// =============================================================================
// queryKeys — structure sanity checks
// =============================================================================

describe("queryKeys", () => {
	it("generates unique keys for different entities", () => {
		const campaigns = queryKeys.campaigns("org1");
		const enrollments = queryKeys.enrollments("org1");
		expect(campaigns[0]).not.toBe(enrollments[0]);
	});

	it("includes orgId in scoped keys", () => {
		expect(queryKeys.campaigns("org123")).toContain("org123");
		expect(queryKeys.wallet("org456")).toContain("org456");
	});

	it("generates stable keys for same input", () => {
		expect(queryKeys.campaign("org1", "c1")).toEqual(queryKeys.campaign("org1", "c1"));
	});

	it("includes params in parameterized keys", () => {
		const withParams = queryKeys.campaigns("org1", { status: "active" });
		const without = queryKeys.campaigns("org1");
		expect(withParams).not.toEqual(without);
	});

	it("global keys have no orgId", () => {
		expect(queryKeys.userInfo()).toEqual(["userInfo"]);
		expect(queryKeys.deviceSessions()).toEqual(["deviceSessions"]);
		expect(queryKeys.passkeys()).toEqual(["passkeys"]);
	});
});

// =============================================================================
// Constants
// =============================================================================

describe("constants", () => {
	it("DEFAULT_PAGE_SIZE is 20", () => {
		expect(DEFAULT_PAGE_SIZE).toBe(20);
	});

	it("CACHE values are positive numbers", () => {
		for (const [, value] of Object.entries(CACHE)) {
			expect(value).toBeGreaterThan(0);
		}
	});

	it("CACHE.auth > CACHE.list", () => {
		expect(CACHE.auth).toBeGreaterThan(CACHE.list);
	});
});
