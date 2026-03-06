/**
 * Auth Feature — Server Functions
 *
 * Server-only wrappers for every authenticated auth API call.
 * Queries use GET, mutations use POST.
 */

import { createServerFn } from "@tanstack/react-start";
import Client from "@/lib/brand-client";
import { API_URL } from "@/lib/config";
import { authMiddleware } from "@/server/middleware";

// =============================================================================
// QUERIES (GET)
// =============================================================================

// -- User Session -------------------------------------------------------------

export const getSessionServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.getSession();
	});

export const meServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.me();
	});

export const getAccountInfoServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.getAccountInfo();
	});

// -- Passkeys -----------------------------------------------------------------

export const passkeyListServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.passkeyList();
	});

// -- Sessions -----------------------------------------------------------------

export const listSessionsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.listSessions();
	});

export const listDeviceSessionsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.listDeviceSessions();
	});

// -- Social / Linked Accounts -------------------------------------------------

export const listAccountsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.listAccounts();
	});

// -- User Invitations ---------------------------------------------------------

export const listUserInvitationsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.listUserInvitations();
	});

// =============================================================================
// MUTATIONS (POST) — Two-Factor Authentication
// =============================================================================

export const twoFactorEnableServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { password: string; issuer?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorEnable(data);
	});

export const twoFactorDisableServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { password: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorDisable(data);
	});

export const twoFactorGetTotpUriServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { password: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorGetTotpUri(data);
	});

export const twoFactorVerifyTotpServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { twoFactorToken: string; code: string; trustDevice?: boolean }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorVerifyTotp(data);
	});

export const twoFactorGenerateBackupCodesServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { password: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorGenerateBackupCodes(data);
	});

export const twoFactorSendOtpServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { twoFactorToken: string; trustDevice?: boolean }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorSendOtp(data);
	});

export const twoFactorVerifyOtpServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { twoFactorToken: string; otp: string; trustDevice?: boolean }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorVerifyOtp(data);
	});

export const twoFactorViewBackupCodesServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { password: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorViewBackupCodes(data);
	});

export const twoFactorVerifyBackupCodeServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { twoFactorToken: string; code: string; trustDevice?: boolean }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.twoFactorVerifyBackupCode(data);
	});

// =============================================================================
// MUTATIONS (POST) — Account Management
// =============================================================================

export const changePasswordServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.changePassword(data);
	});

export const setPasswordServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { newPassword: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.setPassword(data);
	});

export const changeEmailServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { newEmail: string; callbackURL?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.changeEmail(data);
	});

export const verifyEmailServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { token: string; callbackURL?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.verifyEmail(data);
	});

export const sendVerificationEmailServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { email: string; callbackURL?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.sendVerificationEmail(data);
	});

export const deleteUserServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { password?: string; callbackURL?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.deleteUser(data);
	});

// =============================================================================
// MUTATIONS (POST) — User Invitations
// =============================================================================

export const getInvitationServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { invitationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.getInvitation({ invitationId: data.invitationId });
	});

export const acceptInvitationServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; invitationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.acceptInvitation(data.organizationId, data.invitationId);
	});

export const rejectInvitationServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { organizationId: string; invitationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.rejectInvitation(data.organizationId, data.invitationId);
	});

// =============================================================================
// MUTATIONS (POST) — Passkeys
// =============================================================================

export const passkeyRegisterOptionsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { name?: string; authenticatorAttachment?: "platform" | "cross-platform" }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.passkeyRegisterOptions(data);
	});

export const passkeyRegisterServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { response: unknown; name?: string; challengeCookie: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.passkeyRegister(data);
	});

export const passkeyDeleteServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { id: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.passkeyDelete({ id: data.id });
	});

export const passkeyUpdateNameServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { id: string; name: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.passkeyUpdateName(data);
	});

export const passkeyReauthOptionsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.passkeyReauthOptions();
	});

export const passkeyAuthenticateOptionsServer = createServerFn({ method: "POST" })
	.handler(async () => {
		const client = new Client(API_URL);
		return client.auth.passkeyAuthenticateOptions();
	});

export const passkeyAuthenticateServer = createServerFn({ method: "POST" })
	.inputValidator((input: { response: unknown; challengeCookie: string }) => input)
	.handler(async ({ data }) => {
		const client = new Client(API_URL);
		return client.auth.passkeyAuthenticate(data);
	});

// =============================================================================
// MUTATIONS (POST) — Session Management
// =============================================================================

export const revokeSessionServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { token: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.revokeSession({ token: data.token });
	});

export const revokeOtherSessionsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.revokeOtherSessions();
	});

export const revokeSessionsServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		return context.client.auth.revokeSessions();
	});

export const setActiveSessionServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { sessionToken: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.setActiveSession({ sessionToken: data.sessionToken });
	});

export const revokeDeviceSessionServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { sessionToken: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.revokeDeviceSession({ sessionToken: data.sessionToken });
	});

// =============================================================================
// MUTATIONS (POST) — Social / Linked Accounts
// =============================================================================

export const linkSocialServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator(
		(input: { provider: string; callbackURL?: string; errorCallbackURL?: string; scopes?: string[] }) => input
	)
	.handler(async ({ context, data }) => {
		return context.client.auth.linkSocial(data);
	});

export const unlinkAccountServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { providerId: string; accountId?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.unlinkAccount(data);
	});

// =============================================================================
// PROFILE UPDATE
// =============================================================================

export const updateUserServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { name?: string; image?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.updateUser(data);
	});

// =============================================================================
// SPECIAL — Current Session Identification
// =============================================================================

export const getCurrentSessionIdServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }) => {
		await context.client.auth.getSession();
		return { sessionToken: context.token };
	});
