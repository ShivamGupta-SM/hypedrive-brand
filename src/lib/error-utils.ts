/**
 * Unified error handling utilities
 * Centralizes all error extraction and message formatting
 */

// =============================================================================
// ERROR CODE MAPPINGS
// =============================================================================

export const ERROR_MESSAGES: Record<string, string> = {
	// Auth errors
	invalid_credentials: "Invalid email or password. Please check and try again.",
	email_already_exists: "This email is already registered.",
	weak_password: "Password is too weak. Use at least 8 characters with letters and numbers.",
	invalid_token: "Invalid or expired token.",
	session_expired: "Your session has expired. Please login again.",
	account_locked: "Your account has been suspended. Please contact support.",
	email_not_verified: "Please verify your email before signing in.",

	// Withdrawal errors
	insufficient_balance: "Insufficient balance for this withdrawal.",
	minimum_withdrawal_not_met: "Amount is below minimum withdrawal limit.",
	maximum_withdrawal_exceeded: "Amount exceeds maximum withdrawal limit.",
	withdrawal_method_not_verified: "This payment method is not verified.",
	withdrawal_method_not_found: "Payment method not found.",
	daily_withdrawal_limit_exceeded: "Daily withdrawal limit exceeded.",
	withdrawal_already_processing: "You already have a withdrawal in progress.",

	// Enrollment errors
	already_enrolled: "You are already enrolled in this campaign.",
	campaign_not_active: "This campaign is no longer active.",
	campaign_full: "This campaign has reached its enrollment limit.",
	invalid_order: "Order details could not be verified.",
	order_already_used: "This order has already been used for enrollment.",
	scan_expired: "Scan has expired, please upload again.",

	// General errors
	not_found: "Resource not found.",
	permission_denied: "You don't have permission to perform this action.",
	rate_limited: "Too many requests. Please wait a moment and try again.",
	validation_error: "Invalid input data.",
	network_error: "Network error. Please check your connection and try again.",
};

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface APIError {
	code: string;
	message: string;
	details?: Record<string, unknown>;
}

// =============================================================================
// ERROR EXTRACTION
// =============================================================================

/**
 * Safely extract error message from any error type
 */
export function extractErrorMessage(error: unknown): string {
	if (!error) return "";

	// Standard Error object
	if (error instanceof Error) {
		return error.message;
	}

	// API error with message property
	if (typeof error === "object" && error !== null && "message" in error) {
		const message = (error as { message: unknown }).message;
		return typeof message === "string" ? message : String(message);
	}

	// Plain string
	if (typeof error === "string") {
		return error;
	}

	return "";
}

/**
 * Extract error code from API error
 */
export function extractErrorCode(error: unknown): string | null {
	if (typeof error === "object" && error !== null && "code" in error) {
		const code = (error as { code: unknown }).code;
		return typeof code === "string" ? code : null;
	}
	return null;
}

/**
 * Check if error is an API error with code
 */
export function isAPIError(error: unknown): error is APIError {
	return typeof error === "object" && error !== null && "code" in error && "message" in error;
}

// =============================================================================
// ERROR MESSAGE FORMATTING
// =============================================================================

/**
 * Get user-friendly error message from any error
 * Checks error code first, then message patterns, then fallback
 */
export function getErrorMessage(
	error: unknown,
	fallback = "Something went wrong. Please try again."
): string {
	if (!error) return fallback;

	// Check error code mapping first
	const code = extractErrorCode(error);
	if (code && ERROR_MESSAGES[code]) {
		return ERROR_MESSAGES[code];
	}

	// Extract raw message
	const message = extractErrorMessage(error);
	if (!message) return fallback;

	// Check for known patterns
	const lowerMessage = message.toLowerCase();

	// Auth patterns
	if (
		lowerMessage.includes("invalid") &&
		(lowerMessage.includes("credentials") ||
			lowerMessage.includes("password") ||
			lowerMessage.includes("email"))
	) {
		return "Invalid email or password. Please check and try again.";
	}
	if (lowerMessage.includes("not found") || lowerMessage.includes("no user")) {
		return "No account found with this email. Please sign up first.";
	}
	if (
		lowerMessage.includes("locked") ||
		lowerMessage.includes("disabled") ||
		lowerMessage.includes("suspended")
	) {
		return "Your account has been suspended. Please contact support.";
	}
	if (lowerMessage.includes("verify") || lowerMessage.includes("unverified")) {
		return "Please verify your email before signing in.";
	}
	if (
		lowerMessage.includes("email") &&
		(lowerMessage.includes("exist") ||
			lowerMessage.includes("taken") ||
			lowerMessage.includes("already"))
	) {
		return "This email is already registered.";
	}

	// Password patterns
	if (
		lowerMessage.includes("password") &&
		(lowerMessage.includes("weak") || lowerMessage.includes("short"))
	) {
		return "Password must be at least 8 characters with letters and numbers.";
	}

	// Rate limiting
	if (
		lowerMessage.includes("rate") ||
		lowerMessage.includes("limit") ||
		lowerMessage.includes("too many")
	) {
		return "Too many attempts. Please wait a moment and try again.";
	}

	// Network
	if (
		lowerMessage.includes("network") ||
		lowerMessage.includes("connection") ||
		lowerMessage.includes("fetch")
	) {
		return "Network error. Please check your connection and try again.";
	}

	// Return original message if reasonable length
	if (message.length > 0 && message.length < 200) {
		return message;
	}

	return fallback;
}

// =============================================================================
// SPECIALIZED ERROR CHECKERS
// =============================================================================

/**
 * Check if error indicates user already exists
 */
export function isUserExistsError(error: unknown): boolean {
	const code = extractErrorCode(error);
	if (code === "email_already_exists") return true;

	const message = extractErrorMessage(error).toLowerCase();
	return (
		message.includes("email") &&
		(message.includes("exist") || message.includes("taken") || message.includes("already"))
	);
}

/**
 * Check if error indicates invalid credentials
 */
export function isInvalidCredentialsError(error: unknown): boolean {
	const code = extractErrorCode(error);
	if (code === "invalid_credentials") return true;

	const message = extractErrorMessage(error).toLowerCase();
	return (
		message.includes("invalid") && (message.includes("credentials") || message.includes("password"))
	);
}

/**
 * Check if error indicates session expired
 */
export function isSessionExpiredError(error: unknown): boolean {
	const code = extractErrorCode(error);
	if (code === "session_expired" || code === "invalid_token") return true;

	const message = extractErrorMessage(error).toLowerCase();
	return message.includes("session") && message.includes("expired");
}

/**
 * Check if error is a network/connection error
 */
export function isNetworkError(error: unknown): boolean {
	const code = extractErrorCode(error);
	if (code === "network_error") return true;

	const message = extractErrorMessage(error).toLowerCase();
	return (
		message.includes("network") ||
		message.includes("connection") ||
		message.includes("fetch failed")
	);
}

/**
 * Check if error is rate limiting
 */
export function isRateLimitError(error: unknown): boolean {
	const code = extractErrorCode(error);
	if (code === "rate_limited") return true;

	const message = extractErrorMessage(error).toLowerCase();
	return message.includes("rate") || message.includes("too many");
}

// =============================================================================
// CONTEXT-SPECIFIC ERROR MESSAGES
// =============================================================================

/**
 * Get login-specific error message
 */
export function getLoginErrorMessage(error: unknown): string {
	return getErrorMessage(error, "Login failed. Please try again.");
}

/**
 * Get registration-specific error message
 */
export function getRegisterErrorMessage(error: unknown): string {
	return getErrorMessage(error, "Registration failed. Please try again.");
}

/**
 * Get withdrawal-specific error message
 */
export function getWithdrawalErrorMessage(error: unknown): string {
	return getErrorMessage(error, "Withdrawal failed. Please try again.");
}

/**
 * Get enrollment-specific error message
 */
export function getEnrollmentErrorMessage(error: unknown): string {
	return getErrorMessage(error, "Enrollment failed. Please try again.");
}
