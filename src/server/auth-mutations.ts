/**
 * Auth Mutation Server Functions — login, register, logout, etc.
 *
 * All auth operations execute on the server and manage the auth cookie
 * atomically. No token is exposed to client code for these operations.
 */

import { createServerFn } from "@tanstack/react-start";
import Client from "@/lib/brand-client";
import { API_URL } from "@/lib/config";
import { clearAuthCookies, readAuthCookie, setAuthCookies } from "@/server/auth-helpers.server";

// =============================================================================
// LOGIN
// =============================================================================

export const loginAction = createServerFn({ method: "POST" })
	.inputValidator((input: { email: string; password: string; rememberMe?: boolean }) => input)
	.handler(async ({ data }) => {
		try {
			const client = new Client(API_URL);
			const response = await client.auth.signInEmail({
				email: data.email,
				password: data.password,
			});

			if (response.token && response.user) {
				setAuthCookies(response.token, data.rememberMe);
				return {
					success: true as const,
					user: response.user,
					redirectTo: "/",
					twoFactorRedirect: false,
				};
			}

			// 2FA required
			if (response.twoFactorRedirect && response.twoFactorToken) {
				return {
					success: false as const,
					error: {
						name: "TwoFactorRequired",
						message: "Two-factor authentication required",
						code: "TWO_FACTOR_REQUIRED",
					},
					twoFactorRedirect: true,
					twoFactorToken: response.twoFactorToken,
				};
			}

			return {
				success: false as const,
				error: { name: "LoginError", message: "Invalid email or password" },
			};
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Login failed";
			const code = (error as { code?: string })?.code;
			return {
				success: false as const,
				error: { name: "LoginError", message, code },
			};
		}
	});

// =============================================================================
// REGISTER
// =============================================================================

export const registerAction = createServerFn({ method: "POST" })
	.inputValidator((input: { email: string; password: string; name: string }) => input)
	.handler(async ({ data }) => {
		try {
			const client = new Client(API_URL);
			const response = await client.auth.signUpEmail({
				email: data.email,
				password: data.password,
				name: data.name,
			});

			if (response.token && response.user) {
				setAuthCookies(response.token);
				return {
					success: true as const,
					user: response.user,
					redirectTo: "/onboarding",
				};
			}

			if (response.user) {
				// User created but no token (email verification required)
				return {
					success: true as const,
					user: response.user,
					redirectTo: null,
				};
			}

			return {
				success: false as const,
				error: { name: "RegisterError", message: "Registration failed" },
			};
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Registration failed";
			const code = (error as { code?: string })?.code;
			return {
				success: false as const,
				error: { name: "RegisterError", message, code },
			};
		}
	});

// =============================================================================
// LOGOUT
// =============================================================================

export const logoutAction = createServerFn({ method: "POST" }).handler(async () => {
	const token = readAuthCookie();
	if (token) {
		try {
			const client = new Client(API_URL, {
				requestInit: {
					headers: { Authorization: `Bearer ${token}` },
				},
			});
			await client.auth.signOut();
		} catch {
			// Ignore errors on sign out — we clear the cookie regardless
		}
	}
	clearAuthCookies();
	return { success: true, redirectTo: "/login" };
});

// =============================================================================
// FORGOT PASSWORD
// =============================================================================

export const forgotPasswordAction = createServerFn({ method: "POST" })
	.inputValidator((input: { email: string; origin: string }) => input)
	.handler(async ({ data }) => {
		try {
			const client = new Client(API_URL);
			const response = await client.auth.forgotPassword({
				email: data.email,
				redirectTo: `${data.origin}/reset-password`,
			});

			return { success: response.success };
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Failed to send reset email";
			const code = (error as { code?: string })?.code;
			return {
				success: false,
				error: { name: "ForgotPasswordError", message, code },
			};
		}
	});

// =============================================================================
// RESET PASSWORD
// =============================================================================

export const resetPasswordAction = createServerFn({ method: "POST" })
	.inputValidator((input: { token: string; newPassword: string }) => input)
	.handler(async ({ data }) => {
		try {
			const client = new Client(API_URL);
			const response = await client.auth.resetPassword({
				token: data.token,
				newPassword: data.newPassword,
			});

			return { success: response.success, redirectTo: "/login" };
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Failed to reset password";
			const code = (error as { code?: string })?.code;
			return {
				success: false,
				error: { name: "ResetPasswordError", message, code },
			};
		}
	});

// =============================================================================
// SOCIAL LOGIN
// =============================================================================

export const socialLoginAction = createServerFn({ method: "POST" })
	.inputValidator((input: { provider: string; origin: string }) => input)
	.handler(async ({ data }) => {
		try {
			const client = new Client(API_URL);
			const response = await client.auth.signInSocial({
				provider: data.provider,
				callbackURL: `${data.origin}/`,
				newUserCallbackURL: `${data.origin}/onboarding`,
				errorCallbackURL: `${data.origin}/login?error=social_auth_failed`,
			});

			// OAuth redirect flow
			if (response.url) {
				return { success: true as const, redirectUrl: response.url };
			}

			// Direct token response (e.g., from ID token)
			if (response.token && response.user) {
				setAuthCookies(response.token);
				return { success: true as const, redirectUrl: "/" };
			}

			return {
				success: false as const,
				error: { name: "SocialLoginError", message: "Social login failed" },
			};
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Social login failed";
			const code = (error as { code?: string })?.code;
			return {
				success: false as const,
				error: { name: "SocialLoginError", message, code },
			};
		}
	});
