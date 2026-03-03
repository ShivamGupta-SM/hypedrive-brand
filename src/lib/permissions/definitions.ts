/**
 * =============================================================================
 * PERMISSION DEFINITIONS — Single Source of Truth
 * =============================================================================
 *
 * Organization-scoped permission data for this brand dashboard.
 * Zero dependencies — pure TypeScript data and types.
 *
 * Used by:
 * - use-org-context.ts (builds can() closure from role + custom permissions)
 * - components/shared/can.tsx (useCan hook + Can component)
 */

// =============================================================================
// ORGANIZATION-SCOPED PERMISSION DEFINITIONS
// =============================================================================

export const ORG_STATEMENT = {
	// Better Auth internal — organization management
	organization: ["read", "update", "delete"],
	member: ["create", "read", "update", "delete"],
	invitation: ["create", "read", "cancel", "delete"],
	ac: ["create", "read", "update", "delete"],

	// Business resources
	campaign: ["create", "read", "update", "delete", "submit", "pause", "resume"],
	listing: ["create", "read", "update", "delete"],
	enrollment: ["read", "update", "approve", "reject", "request_changes"],
	wallet: ["read", "deposit", "transfer"],
	withdrawal: ["create", "read", "update", "delete", "approve", "cancel"],
	invoice: ["read", "download"],
	bankAccount: ["create", "read", "update", "delete", "setDefault"],
	settings: ["read", "update"],
	analytics: ["read", "export"],
	task: ["create", "read", "update", "delete"],
} as const;

// =============================================================================
// ORGANIZATION ROLE PERMISSIONS MATRIX
// =============================================================================

export const ORG_ROLE_PERMISSIONS = {
	owner: {
		organization: ["read", "update", "delete"],
		member: ["create", "read", "update", "delete"],
		invitation: ["create", "read", "cancel", "delete"],
		ac: ["create", "read", "update", "delete"],
		campaign: ["create", "read", "update", "delete", "submit", "pause", "resume"],
		listing: ["create", "read", "update", "delete"],
		enrollment: ["read", "update", "approve", "reject", "request_changes"],
		wallet: ["read", "deposit", "transfer"],
		withdrawal: ["create", "read", "update", "delete", "approve", "cancel"],
		invoice: ["read", "download"],
		bankAccount: ["create", "read", "update", "delete", "setDefault"],
		settings: ["read", "update"],
		analytics: ["read", "export"],
		task: ["create", "read", "update", "delete"],
	},

	admin: {
		organization: ["read", "update"],
		member: ["create", "read", "update", "delete"],
		invitation: ["create", "read", "cancel", "delete"],
		ac: ["create", "read", "update", "delete"],
		campaign: ["create", "read", "update", "delete", "submit", "pause", "resume"],
		listing: ["create", "read", "update", "delete"],
		enrollment: ["read", "update", "approve", "reject", "request_changes"],
		wallet: ["read", "deposit", "transfer"],
		withdrawal: ["create", "read", "update", "delete", "approve", "cancel"],
		invoice: ["read", "download"],
		bankAccount: ["create", "read", "update", "delete", "setDefault"],
		settings: ["read", "update"],
		analytics: ["read", "export"],
		task: ["create", "read", "update", "delete"],
	},

	campaignManager: {
		organization: ["read"],
		member: ["read"],
		invitation: ["read"],
		ac: ["read"],
		campaign: ["create", "read", "update", "submit", "pause", "resume"],
		listing: ["create", "read", "update"],
		enrollment: ["read", "update", "approve", "reject", "request_changes"],
		wallet: ["read"],
		withdrawal: ["read"],
		invoice: ["read"],
		bankAccount: ["read"],
		settings: ["read"],
		analytics: ["read"],
		task: ["create", "read", "update", "delete"],
	},

	financeManager: {
		organization: ["read"],
		member: ["read"],
		invitation: ["read"],
		ac: ["read"],
		campaign: ["read"],
		listing: ["read"],
		enrollment: ["read"],
		wallet: ["read", "deposit", "transfer"],
		withdrawal: ["create", "read", "update", "delete", "approve", "cancel"],
		invoice: ["read", "download"],
		bankAccount: ["create", "read", "update", "delete", "setDefault"],
		settings: ["read"],
		analytics: ["read", "export"],
		task: ["read"],
	},

	listingManager: {
		organization: ["read"],
		member: ["read"],
		invitation: ["read"],
		ac: ["read"],
		campaign: ["read"],
		listing: ["create", "read", "update", "delete"],
		enrollment: ["read"],
		wallet: ["read"],
		withdrawal: ["read"],
		invoice: ["read"],
		bankAccount: ["read"],
		settings: ["read"],
		analytics: ["read"],
		task: ["read"],
	},

	member: {
		organization: ["read"],
		member: ["read"],
		invitation: ["read"],
		ac: ["read"],
		campaign: ["read"],
		listing: ["read"],
		enrollment: ["read"],
		wallet: ["read"],
		withdrawal: ["read"],
		invoice: ["read"],
		bankAccount: ["read"],
		settings: ["read"],
		analytics: ["read"],
		task: ["read"],
	},
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type OrgResource = keyof typeof ORG_STATEMENT;
export type OrgAction<R extends OrgResource> = (typeof ORG_STATEMENT)[R][number];
export type OrgRole = keyof typeof ORG_ROLE_PERMISSIONS;
export type AnyOrgAction = OrgAction<OrgResource>;

// =============================================================================
// HUMAN-READABLE LABELS
// =============================================================================

export const ORG_ROLE_LABELS: Record<OrgRole, string> = {
	owner: "Owner",
	admin: "Admin",
	campaignManager: "Campaign Manager",
	financeManager: "Finance Manager",
	listingManager: "Listing Manager",
	member: "Member",
};

export const ORG_RESOURCE_LABELS: Record<OrgResource, string> = {
	organization: "Organization",
	member: "Team Members",
	invitation: "Invitations",
	ac: "Roles & Permissions",
	campaign: "Campaigns",
	listing: "Listings",
	enrollment: "Enrollments",
	wallet: "Wallet",
	withdrawal: "Withdrawals",
	invoice: "Invoices",
	bankAccount: "Bank Accounts",
	settings: "Settings",
	analytics: "Analytics",
	task: "Tasks",
};

export const ORG_ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
	owner: "Full control including deleting the organization and managing roles",
	admin: "Full access except deleting the organization",
	campaignManager: "Manage campaigns, listings, enrollments, and tasks",
	financeManager: "Manage wallet, withdrawals, invoices, and bank accounts",
	listingManager: "Full control over listings only",
	member: "Read-only access to all resources",
};

export const ACTION_LABELS: Record<string, string> = {
	// Common CRUD
	create: "Create",
	read: "View",
	update: "Edit",
	delete: "Delete",
	list: "List",
	get: "Get",

	// Campaign specific
	submit: "Submit for Review",
	pause: "Pause",
	resume: "Resume",
	approve: "Approve",
	reject: "Reject",
	feature: "Feature",

	// Enrollment specific
	request_changes: "Request Changes",

	// Wallet/Finance specific
	deposit: "Deposit",
	transfer: "Transfer",
	credit: "Credit",
	debit: "Debit",
	freeze: "Freeze",
	unfreeze: "Unfreeze",
	cancel: "Cancel",
	process: "Process",
	retry: "Retry",
	download: "Download",
	export: "Export",

	// Bank account specific
	setDefault: "Set as Default",

	// User management
	"set-role": "Change Role",
	ban: "Ban User",
	impersonate: "Impersonate",
	"set-password": "Reset Password",
	revoke: "Revoke",

	// Organization specific
	suspend: "Suspend",
	activate: "Activate",

	// System/Notification specific
	send: "Send",
	manage: "Manage",
};

// =============================================================================
// ROLE LISTS (for dropdowns, selects, etc.)
// =============================================================================

export const ORG_ROLES = Object.keys(ORG_ROLE_PERMISSIONS) as OrgRole[];
