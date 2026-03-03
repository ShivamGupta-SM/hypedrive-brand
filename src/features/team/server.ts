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

// -- Mutations ----------------------------------------------------------------

export const inviteMemberServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; email: string; role: "owner" | "admin" | "member" }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.inviteMemberAuth(data.orgId, { email: data.email, role: data.role });
	});

export const cancelInvitationServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; invitationId: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.cancelInvitation(data.orgId, data.invitationId);
	});

export const updateMemberRoleServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; memberId: string; role: "owner" | "admin" | "member" }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.updateMemberRole(data.orgId, data.memberId, { role: data.role });
	});

export const removeMemberServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; memberIdOrEmail: string }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.removeMember(data.orgId, data.memberIdOrEmail, {});
	});

export const addMemberServer = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.inputValidator((input: { orgId: string; userId: string; role: "owner" | "admin" | "member" }) => input)
	.handler(async ({ context, data }) => {
		return context.client.auth.addMember(data.orgId, { userId: data.userId, role: data.role });
	});
