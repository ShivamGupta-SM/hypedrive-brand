/**
 * Team Server Functions — authenticated API calls proxied through the server.
 */

import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/server/middleware";

// -- Queries ------------------------------------------------------------------

export const listMembersServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.listMembersAuth(data.orgId);
	});

export const listInvitationsServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.listInvitations(data.orgId);
	});

export const listOrgRolesServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.listOrganizationRoles(data.orgId);
	});

export const searchUsersForInviteServer = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; q: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.searchUsersForInvite(data.orgId, { q: data.q });
	});

// -- Mutations ----------------------------------------------------------------

export const inviteMemberServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; email: string; role: string; idempotencyKey?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.inviteMemberAuth(data.orgId, {
			email: data.email,
			role: data.role as "owner" | "admin" | "member",
			idempotencyKey: data.idempotencyKey,
		});
	});

export const cancelInvitationServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; invitationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.cancelInvitation(data.orgId, data.invitationId);
	});

export const updateMemberRoleServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; memberId: string; role: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.updateMemberRole(data.orgId, data.memberId, {
			role: data.role as "owner" | "admin" | "member",
		});
	});

export const removeMemberServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; memberIdOrEmail: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.removeMember(data.orgId, data.memberIdOrEmail, {});
	});

export const addMemberServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; userId: string; role: string; idempotencyKey?: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.addMember(data.orgId, {
			userId: data.userId,
			role: data.role as "owner" | "admin" | "member",
			idempotencyKey: data.idempotencyKey,
		});
	});

// -- Batch Member Operations --------------------------------------------------

export const batchMembersServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; action: "remove"; memberIds: string[] }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.batchMembers(data.orgId, {
			action: data.action,
			memberIds: data.memberIds,
		});
	});
