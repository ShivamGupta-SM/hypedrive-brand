/**
 * =============================================================================
 * PERMISSION DEFINITIONS — Single Source of Truth
 * =============================================================================
 *
 * All permission data for admin (platform) and organization contexts.
 * Zero dependencies — pure TypeScript data and types.
 *
 * Used by:
 * - Server: auth/config/access-control.ts (creates better-auth role objects)
 * - Client: auth/types/access-control-client.ts (UI permission checks)
 * - Frontend: copy this file to your React/Next.js project
 *
 * @version 1.1.0
 * @lastUpdated 2026-02-14
 */

// =============================================================================
// PLATFORM-WIDE (ADMIN) PERMISSION DEFINITIONS
// =============================================================================

export const ADMIN_STATEMENT = {
	// Better Auth internal — user & session management
	// (explicitly listed instead of spreading adminDefaultStatements)
	user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"],
	session: ["list", "revoke", "delete"],

	// Platform business resources
	organization: ["read", "update", "suspend", "activate", "delete"],
	campaign: ["read", "approve", "reject", "feature"],
	creator: ["read", "update", "suspend"],
	withdrawal: ["read", "approve", "reject", "process"],
	kyc: ["read", "approve", "reject"],
	platform: ["read", "update"],
	analytics: ["read", "export"],
	coupon: ["create", "read", "update", "delete"],
	invoice: ["read", "create", "update", "delete"],
	payout: ["read", "process", "retry"],

	// Extended admin resources
	notification: ["read", "create", "update", "delete", "send"],
	listing: ["read", "create", "update", "delete", "approve", "reject"],
	wallet: ["read", "create", "update", "credit", "debit", "freeze", "unfreeze"],
	"platform-settings": ["read", "update"],
	storage: ["read", "create", "update", "delete"],
	system: ["read", "update", "manage"],
	system_config: ["read", "create", "update", "delete"],
	"task-template": ["read", "create", "update", "delete"],
	"withdrawal-method": ["read", "create", "update", "delete"],
} as const;

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
// ADMIN ROLE PERMISSIONS MATRIX
// =============================================================================

export const ADMIN_ROLE_PERMISSIONS = {
	super_admin: {
		user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password"],
		session: ["list", "revoke", "delete"],
		organization: ["read", "update", "suspend", "activate", "delete"],
		campaign: ["read", "approve", "reject", "feature"],
		creator: ["read", "update", "suspend"],
		withdrawal: ["read", "approve", "reject", "process"],
		kyc: ["read", "approve", "reject"],
		platform: ["read", "update"],
		analytics: ["read", "export"],
		coupon: ["create", "read", "update", "delete"],
		invoice: ["read", "create", "update", "delete"],
		payout: ["read", "process", "retry"],
		notification: ["read", "create", "update", "delete", "send"],
		listing: ["read", "create", "update", "delete", "approve", "reject"],
		wallet: ["read", "create", "update", "credit", "debit", "freeze", "unfreeze"],
		"platform-settings": ["read", "update"],
		storage: ["read", "create", "update", "delete"],
		system: ["read", "update", "manage"],
		system_config: ["read", "create", "update", "delete"],
		"task-template": ["read", "create", "update", "delete"],
		"withdrawal-method": ["read", "create", "update", "delete"],
	},

	admin: {
		user: ["create", "list", "set-role", "ban", "impersonate", "delete"],
		session: ["list", "revoke", "delete"],
		organization: ["read", "update", "suspend", "activate"],
		campaign: ["read", "approve", "reject", "feature"],
		creator: ["read", "update", "suspend"],
		withdrawal: ["read", "approve", "reject", "process"],
		kyc: ["read", "approve", "reject"],
		platform: ["read"],
		analytics: ["read", "export"],
		coupon: ["create", "read", "update", "delete"],
		invoice: ["read", "create", "update"],
		payout: ["read", "process", "retry"],
		notification: ["read", "create", "update", "delete", "send"],
		listing: ["read", "create", "update", "delete", "approve", "reject"],
		wallet: ["read", "create", "update", "credit", "debit", "freeze", "unfreeze"],
		"platform-settings": ["read", "update"],
		storage: ["read", "create", "update", "delete"],
		system: ["read", "update"],
		system_config: ["read", "create", "update"],
		"task-template": ["read", "create", "update", "delete"],
		"withdrawal-method": ["read", "create", "update", "delete"],
	},

	manager: {
		user: ["list"],
		session: ["list"],
		organization: ["read", "update"],
		campaign: ["read", "approve", "reject"],
		creator: ["read", "update"],
		withdrawal: ["read", "approve", "reject"],
		kyc: ["read", "approve", "reject"],
		platform: ["read"],
		analytics: ["read"],
		coupon: ["read"],
		invoice: ["read"],
		payout: ["read"],
		notification: ["read", "create", "send"],
		listing: ["read", "approve", "reject"],
		wallet: ["read"],
		"platform-settings": ["read"],
		storage: ["read"],
		system: ["read"],
		system_config: ["read"],
		"task-template": ["read", "create", "update"],
		"withdrawal-method": ["read"],
	},

	analyst: {
		user: ["list"],
		session: [],
		organization: ["read"],
		campaign: ["read"],
		creator: ["read"],
		withdrawal: ["read"],
		kyc: ["read"],
		platform: ["read"],
		analytics: ["read", "export"],
		coupon: ["read"],
		invoice: ["read"],
		payout: ["read"],
		notification: ["read"],
		listing: ["read"],
		wallet: ["read"],
		"platform-settings": ["read"],
		storage: ["read"],
		system: ["read"],
		system_config: ["read"],
		"task-template": ["read"],
		"withdrawal-method": ["read"],
	},

	support: {
		user: ["list"],
		session: ["list"],
		organization: ["read"],
		campaign: ["read"],
		creator: ["read", "update"],
		withdrawal: ["read"],
		kyc: ["read"],
		platform: [],
		analytics: [],
		coupon: ["read"],
		invoice: ["read"],
		payout: ["read"],
		notification: ["read", "create", "send"],
		listing: ["read"],
		wallet: ["read"],
		"platform-settings": [],
		storage: ["read"],
		system: [],
		system_config: [],
		"task-template": ["read"],
		"withdrawal-method": ["read"],
	},

	content_moderator: {
		user: ["list"],
		session: [],
		organization: ["read"],
		campaign: ["read", "approve", "reject"],
		creator: ["read"],
		withdrawal: [],
		kyc: [],
		platform: [],
		analytics: [],
		coupon: [],
		invoice: [],
		payout: [],
		notification: [],
		listing: ["read"],
		wallet: [],
		"platform-settings": [],
		storage: [],
		system: [],
		system_config: [],
		"task-template": [],
		"withdrawal-method": [],
	},

	user: {
		user: [],
		session: [],
		organization: [],
		campaign: [],
		creator: [],
		withdrawal: [],
		kyc: [],
		platform: [],
		analytics: [],
		coupon: [],
		invoice: [],
		payout: [],
		notification: [],
		listing: [],
		wallet: [],
		"platform-settings": [],
		storage: [],
		system: [],
		system_config: [],
		"task-template": [],
		"withdrawal-method": [],
	},

	guest: {
		user: [],
		session: [],
		organization: [],
		campaign: [],
		creator: [],
		withdrawal: [],
		kyc: [],
		platform: [],
		analytics: [],
		coupon: [],
		invoice: [],
		payout: [],
		notification: [],
		listing: [],
		wallet: [],
		"platform-settings": [],
		storage: [],
		system: [],
		system_config: [],
		"task-template": [],
		"withdrawal-method": [],
	},
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

export type AdminResource = keyof typeof ADMIN_STATEMENT;
export type AdminAction<R extends AdminResource> = (typeof ADMIN_STATEMENT)[R][number];
export type AdminRole = keyof typeof ADMIN_ROLE_PERMISSIONS;

export type OrgResource = keyof typeof ORG_STATEMENT;
export type OrgAction<R extends OrgResource> = (typeof ORG_STATEMENT)[R][number];
export type OrgRole = keyof typeof ORG_ROLE_PERMISSIONS;

export type AnyAdminAction = AdminAction<AdminResource>;
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

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
	super_admin: "Super Admin",
	admin: "Admin",
	manager: "Manager",
	analyst: "Analyst",
	support: "Support",
	content_moderator: "Content Moderator",
	user: "User",
	guest: "Guest",
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

export const ADMIN_RESOURCE_LABELS: Record<AdminResource, string> = {
	user: "Users",
	session: "Sessions",
	organization: "Organizations",
	campaign: "Campaigns",
	creator: "Creators",
	withdrawal: "Withdrawals",
	kyc: "KYC Verification",
	platform: "Platform Config",
	analytics: "Analytics",
	coupon: "Coupons",
	invoice: "Invoices",
	payout: "Payouts",
	notification: "Notifications",
	listing: "Listings",
	wallet: "Wallets",
	"platform-settings": "Platform Settings",
	storage: "Storage",
	system: "System",
	system_config: "System Config",
	"task-template": "Task Templates",
	"withdrawal-method": "Withdrawal Methods",
};

export const ORG_ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
	owner: "Full control including deleting the organization and managing roles",
	admin: "Full access except deleting the organization",
	campaignManager: "Manage campaigns, listings, enrollments, and tasks",
	financeManager: "Manage wallet, withdrawals, invoices, and bank accounts",
	listingManager: "Full control over listings only",
	member: "Read-only access to all resources",
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
	super_admin: "Full platform control including dangerous operations",
	admin: "Platform admin without password reset and org delete",
	manager: "Operations management with approval workflows",
	analyst: "Read-only access with export capabilities",
	support: "User and creator support with limited write access",
	content_moderator: "Campaign review and moderation only",
	user: "Regular platform user with no admin features",
	guest: "Unauthenticated user with no permissions",
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
export const ADMIN_ROLES = Object.keys(ADMIN_ROLE_PERMISSIONS) as AdminRole[];
