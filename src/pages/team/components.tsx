/**
 * Team shared sub-components
 * Extracted from the team monolith — used across layout and sub-pages
 */

import {
	ArrowPathIcon,
	EllipsisVerticalIcon,
	EnvelopeIcon,
	ExclamationTriangleIcon,
	PencilIcon,
	PlusIcon,
	ShieldCheckIcon,
	TrashIcon,
	UserIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Input } from "@/components/input";
import { EmptyState } from "@/components/shared/empty-state";
import { SelectionCheckbox, SelectionCheckboxSpacer } from "@/components/shared/selection-checkbox";
import { Skeleton } from "@/components/skeleton";
import {
	useCreateOrganizationRole,
	useDeleteOrganizationRole,
	useOrganizationRoles,
	useUpdateOrganizationRole,
} from "@/features/organization/hooks-roles";
import { useUserSearch } from "@/features/team/hooks";
import { useInviteMember, useRemoveMember, useUpdateMemberRole } from "@/features/team/mutations";
import { getAPIErrorMessage } from "@/hooks/api-client";
import type { types } from "@/lib/brand-client";
import type { OrgResource } from "@/lib/permissions/definitions";
import {
	ACTION_LABELS,
	ORG_RESOURCE_LABELS,
	ORG_ROLE_DESCRIPTIONS,
	ORG_ROLE_LABELS,
	ORG_ROLES,
	ORG_STATEMENT,
} from "@/lib/permissions/definitions";
import { showToast } from "@/lib/toast";

export type Member = types.MemberResponse;

export interface Invitation {
	id: string;
	email: string;
	role: string;
	status: string;
	expiresAt: string;
	createdAt: string;
}

// =============================================================================
// ROLE OPTION — unified shape used by role pickers
// =============================================================================

interface RoleOption {
	/** Role slug sent to the API */
	value: string;
	/** Human-readable label */
	label: string;
	/** Short description shown under the label */
	description: string;
	/** Whether this is a built-in role (owner/admin/…) vs custom */
	builtIn: boolean;
}

/**
 * Merge built-in roles (from definitions.ts) with custom org roles (from API).
 * Excludes "owner" by default since it requires passkey escalation.
 */
function useAvailableRoles(organizationId: string | undefined, { excludeOwner = true } = {}) {
	const { data: customRoles, loading } = useOrganizationRoles(organizationId);

	const roles = useMemo<RoleOption[]>(() => {
		// Built-in roles from the permission matrix
		const builtIn: RoleOption[] = ORG_ROLES.filter((r) => (excludeOwner ? r !== "owner" : true)).map((r) => ({
			value: r,
			label: ORG_ROLE_LABELS[r],
			description: ORG_ROLE_DESCRIPTIONS[r],
			builtIn: true,
		}));

		// Custom roles from the API
		const custom: RoleOption[] = customRoles.map((r) => {
			const permCount = Object.values(r.permission || {}).reduce((sum, actions) => sum + (actions?.length || 0), 0);
			return {
				value: r.role,
				label: formatRoleName(r.role),
				description:
					permCount > 0 ? `${permCount} custom permission${permCount !== 1 ? "s" : ""}` : "No permissions configured",
				builtIn: false,
			};
		});

		return [...builtIn, ...custom];
	}, [customRoles, excludeOwner]);

	return { roles, loading };
}

// =============================================================================
// LOADING SKELETON — matches standard layout pattern (campaigns/enrollments)
// =============================================================================

export function TeamSkeleton() {
	return (
		<div className="space-y-5">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Skeleton width={96} height={28} borderRadius={8} />
					<Skeleton width={320} height={16} borderRadius={6} className="mt-2" />
				</div>
				<Skeleton width={120} height={40} borderRadius={8} />
			</div>

			{/* Hero card */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="p-4 sm:p-5">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<Skeleton width={100} height={12} borderRadius={4} />
							<Skeleton width={160} height={32} borderRadius={6} className="mt-1" />
						</div>
						<div className="sm:max-w-xs flex-1">
							<Skeleton height={8} borderRadius={999} />
							<div className="mt-1.5 flex gap-3">
								<Skeleton width={60} height={10} borderRadius={4} />
								<Skeleton width={60} height={10} borderRadius={4} />
								<Skeleton width={60} height={10} borderRadius={4} />
							</div>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-3 gap-px border-t border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-700">
					{[1, 2, 3].map((i) => (
						<div key={i} className="bg-white px-4 py-3 sm:px-5 dark:bg-zinc-900">
							<Skeleton width={70} height={10} borderRadius={4} />
							<Skeleton width={30} height={16} borderRadius={4} className="mt-1" />
						</div>
					))}
				</div>
			</div>

			{/* Search + Tabs */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Skeleton height={40} width={256} borderRadius={8} containerClassName="w-full sm:w-64 shrink-0" />
				<div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
					{[90, 110, 70].map((w, i) => (
						<Skeleton key={i} width={w} height={36} borderRadius={999} />
					))}
				</div>
			</div>

			{/* Member card grid */}
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div
						key={i}
						className="overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
					>
						<div className="flex items-start gap-3.5 p-4 sm:p-5">
							<div className="size-12 shrink-0 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
							<div className="flex-1">
								<Skeleton width={80 + i * 8} height={14} borderRadius={6} />
								<Skeleton width={120 + i * 6} height={12} borderRadius={6} className="mt-1.5" />
							</div>
						</div>
						<div className="grid grid-cols-2 divide-x divide-zinc-200 border-t border-zinc-200 bg-zinc-50/50 dark:divide-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/30">
							<div className="flex items-center justify-center py-2.5">
								<Skeleton width={60} height={20} borderRadius={999} />
							</div>
							<div className="flex flex-col items-center justify-center gap-0.5 py-2.5">
								<Skeleton width={30} height={10} borderRadius={4} />
								<Skeleton width={50} height={14} borderRadius={4} />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// ROLE BADGE CONFIG
// =============================================================================

const ROLE_CONFIG: Record<
	string,
	{ label: string; color: "amber" | "sky" | "zinc" | "violet" | "lime" | "cyan" | "rose" }
> = {
	owner: { label: "Owner", color: "amber" },
	admin: { label: "Admin", color: "sky" },
	campaignManager: { label: "Campaign Manager", color: "violet" },
	financeManager: { label: "Finance Manager", color: "lime" },
	listingManager: { label: "Listing Manager", color: "cyan" },
	member: { label: "Member", color: "zinc" },
};

export function getRoleBadgeConfig(role: string): {
	label: string;
	color: "amber" | "sky" | "zinc" | "violet" | "lime" | "cyan" | "rose";
} {
	return ROLE_CONFIG[role] || { label: formatRoleName(role), color: "violet" };
}

/** Format a raw role slug into human-readable label: "content_manager" → "Content Manager" */
export function formatRoleName(name: string): string {
	return name.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// =============================================================================
// ROLE PICKER OPTION — shared between invite modal & change role dialog
// =============================================================================

function RolePickerOption({
	role,
	selected,
	current,
	onSelect,
}: {
	role: RoleOption;
	selected: boolean;
	/** Show a "current" indicator (used in change-role dialog) */
	current?: boolean;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onSelect}
			className={clsx(
				"flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 transition-all",
				selected
					? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
					: "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:bg-zinc-700/60"
			)}
		>
			{/* Role icon */}
			<div
				className={clsx(
					"flex size-9 shrink-0 items-center justify-center rounded-lg",
					selected
						? "bg-white/15 dark:bg-zinc-900/15"
						: role.builtIn
							? "bg-zinc-100 dark:bg-zinc-700"
							: "bg-violet-50 dark:bg-violet-900/30"
				)}
			>
				{role.builtIn ? (
					<ShieldCheckIcon className={clsx("size-4", selected ? "" : "text-zinc-500 dark:text-zinc-400")} />
				) : (
					<ShieldCheckIcon className={clsx("size-4", selected ? "" : "text-violet-500 dark:text-violet-400")} />
				)}
			</div>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="text-sm font-medium">{role.label}</p>
					{!role.builtIn && (
						<span
							className={clsx(
								"rounded px-1.5 py-px text-[10px] font-semibold",
								selected
									? "bg-white/15 text-white/80 dark:bg-zinc-900/15 dark:text-zinc-900/80"
									: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
							)}
						>
							custom
						</span>
					)}
					{current && (
						<span
							className={clsx(
								"rounded px-1.5 py-px text-[10px] font-semibold",
								selected
									? "bg-white/15 text-white/80 dark:bg-zinc-900/15 dark:text-zinc-900/80"
									: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
							)}
						>
							current
						</span>
					)}
				</div>
				<p
					className={clsx(
						"text-xs",
						selected ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
					)}
				>
					{role.description}
				</p>
			</div>

			{/* Check indicator */}
			<div
				className={clsx(
					"flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
					selected
						? "border-white bg-white text-zinc-900 dark:border-zinc-900 dark:bg-zinc-900 dark:text-white"
						: "border-zinc-300 dark:border-zinc-600"
				)}
			>
				{selected && (
					<svg className="size-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
						<path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				)}
			</div>
		</button>
	);
}

// =============================================================================
// AVATAR — deterministic color from userId
// =============================================================================

const AVATAR_COLORS = [
	"from-sky-400 to-sky-600",
	"from-violet-400 to-violet-600",
	"from-emerald-400 to-emerald-600",
	"from-amber-400 to-amber-600",
	"from-rose-400 to-rose-600",
	"from-indigo-400 to-indigo-600",
	"from-teal-400 to-teal-600",
	"from-fuchsia-400 to-fuchsia-600",
];

function hashToIndex(str: string, len: number): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return Math.abs(hash) % len;
}

export function MemberAvatar({
	name,
	userId,
	image,
	size = "md",
}: {
	name?: string;
	userId: string;
	image?: string | null;
	size?: "sm" | "md" | "lg";
}) {
	const initials = name
		? name
				.split(" ")
				.map((n: string) => n[0])
				.slice(0, 2)
				.join("")
				.toUpperCase()
		: userId.slice(0, 2).toUpperCase();

	const colorIdx = hashToIndex(userId, AVATAR_COLORS.length);

	const sizeClasses = {
		sm: "size-8 text-[10px]",
		md: "size-10 text-xs",
		lg: "size-12 text-sm",
	};

	if (image) {
		return (
			<img
				src={image}
				alt={name || "Member"}
				className={clsx("shrink-0 rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700", sizeClasses[size])}
			/>
		);
	}

	return (
		<div
			className={clsx(
				"flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-bold text-white shadow-sm",
				sizeClasses[size],
				AVATAR_COLORS[colorIdx]
			)}
		>
			{initials}
		</div>
	);
}

// =============================================================================
// MEMBER ROW
// =============================================================================

export function formatJoinedAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	if (days === 0) return "Today";
	if (days === 1) return "Yesterday";
	if (days < 30) return `${days}d ago`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo ago`;
	const years = Math.floor(months / 12);
	return `${years}y ago`;
}

export function MemberRow({
	member,
	isCurrentUser,
	canManage,
	onChangeRole,
	onRemove,
	showCheckbox = false,
	checkable = false,
	selected = false,
	onToggleSelect,
}: {
	member: Member;
	isCurrentUser: boolean;
	canManage: boolean;
	onChangeRole: () => void;
	onRemove: () => void;
	/** Whether to reserve space for the checkbox column (alignment) */
	showCheckbox?: boolean;
	/** Whether this specific row can be checked */
	checkable?: boolean;
	selected?: boolean;
	onToggleSelect?: () => void;
}) {
	const roleConfig = getRoleBadgeConfig(member.role);
	const displayName = member.user?.name || "Member";
	const displayEmail = member.user?.email || `ID: ${member.userId.slice(0, 8)}...`;

	const joinedAgo = member.createdAt ? formatJoinedAgo(member.createdAt) : null;
	const joinedFull = member.createdAt
		? new Date(member.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
		: null;

	return (
		<div className="group/row flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 sm:py-3.5 dark:hover:bg-zinc-800/40">
			{/* Checkbox column — always reserve space when list is in selection mode */}
			{showCheckbox &&
				(checkable ? (
					<SelectionCheckbox
						variant="inline"
						selected={selected}
						onToggle={() => onToggleSelect?.()}
						className="opacity-0 group-hover/row:opacity-100"
					/>
				) : (
					<SelectionCheckboxSpacer />
				))}

			{/* Avatar with role indicator ring */}
			<div className="relative">
				<MemberAvatar name={member.user?.name} userId={member.userId} image={member.user?.image} />
				{member.role === "owner" && (
					<span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 ring-2 ring-white dark:ring-zinc-900">
						<ShieldCheckIcon className="size-2.5 text-white" />
					</span>
				)}
			</div>

			{/* Info */}
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{displayName}</p>
					{isCurrentUser && (
						<span className="shrink-0 rounded bg-sky-50 px-1.5 py-px text-[10px] font-semibold text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
							you
						</span>
					)}
				</div>
				<div className="flex items-center gap-1.5">
					<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{displayEmail}</p>
					{joinedAgo && (
						<span className="hidden shrink-0 items-center gap-1.5 sm:flex">
							<span className="text-zinc-300 dark:text-zinc-600">&middot;</span>
							<span className="text-xs text-zinc-500 dark:text-zinc-400" title={joinedFull || undefined}>
								{joinedAgo}
							</span>
						</span>
					)}
				</div>
			</div>

			{/* Role badge */}
			<Badge color={roleConfig.color}>{roleConfig.label}</Badge>

			{/* Actions — always reserve space when canManage for alignment */}
			{canManage &&
				(!isCurrentUser && member.role !== "owner" ? (
					<Dropdown>
						<DropdownButton plain aria-label="Member options">
							<EllipsisVerticalIcon className="size-5 text-zinc-400" />
						</DropdownButton>
						<DropdownMenu anchor="bottom end">
							<DropdownItem onClick={onChangeRole}>
								<ShieldCheckIcon className="size-4" />
								Change Role
							</DropdownItem>
							<DropdownItem onClick={onRemove}>
								<TrashIcon className="size-4 text-red-500" />
								Remove Member
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
				) : (
					<div className="w-9 shrink-0" />
				))}
		</div>
	);
}

// =============================================================================
// INVITATION ROW
// =============================================================================

function formatTimeRemaining(expiresAt: Date): string {
	const diff = expiresAt.getTime() - Date.now();
	if (diff <= 0) return "Expired";
	const hours = Math.floor(diff / (1000 * 60 * 60));
	if (hours < 24) return `${hours}h left`;
	const days = Math.floor(hours / 24);
	return `${days}d left`;
}

export function InvitationRow({
	invitation,
	canManage,
	onCancel,
	isCancelling,
}: {
	invitation: Invitation;
	canManage: boolean;
	onCancel: () => void;
	isCancelling: boolean;
}) {
	const roleConfig = getRoleBadgeConfig(invitation.role);
	const expiresAt = invitation.expiresAt ? new Date(invitation.expiresAt) : null;
	const isExpired = expiresAt ? expiresAt < new Date() : false;
	const timeLeft = expiresAt && !isExpired ? formatTimeRemaining(expiresAt) : null;
	const sentDate = invitation.createdAt
		? new Date(invitation.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
		: null;

	return (
		<div
			className={clsx(
				"group flex items-center gap-3 px-4 py-3 transition-colors sm:py-3.5",
				isExpired ? "bg-zinc-50/50 dark:bg-zinc-800/20" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
			)}
		>
			{/* Avatar circle */}
			<div
				className={clsx(
					"flex size-10 shrink-0 items-center justify-center rounded-full",
					isExpired ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"
				)}
			>
				<EnvelopeIcon
					className={clsx(
						"size-4",
						isExpired ? "text-red-500 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
					)}
				/>
			</div>

			{/* Info */}
			<div className="min-w-0 flex-1">
				<p
					className={clsx(
						"truncate text-sm font-medium",
						isExpired ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-900 dark:text-white"
					)}
				>
					{invitation.email}
				</p>
				<div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
					{sentDate && <span>Sent {sentDate}</span>}
					{timeLeft && (
						<>
							<span className="text-zinc-300 dark:text-zinc-600">&middot;</span>
							<span className="text-amber-600 dark:text-amber-400">{timeLeft}</span>
						</>
					)}
					{isExpired && (
						<>
							{sentDate && <span className="text-zinc-300 dark:text-zinc-600">&middot;</span>}
							<span className="font-medium text-red-500 dark:text-red-400">Expired</span>
						</>
					)}
				</div>
			</div>

			{/* Role badge */}
			<Badge color={isExpired ? "red" : roleConfig.color}>{isExpired ? "Expired" : roleConfig.label}</Badge>

			{/* Cancel action */}
			{canManage && (
				<Dropdown>
					<DropdownButton plain aria-label="Invitation options">
						<EllipsisVerticalIcon className="size-5 text-zinc-400" />
					</DropdownButton>
					<DropdownMenu anchor="bottom end">
						<DropdownItem onClick={onCancel} disabled={isCancelling}>
							{isCancelling ? (
								<ArrowPathIcon className="size-4 animate-spin" />
							) : (
								<XMarkIcon className="size-4 text-red-500" />
							)}
							Revoke Invitation
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			)}
		</div>
	);
}

// =============================================================================
// INVITE MEMBER MODAL
// =============================================================================

export function InviteMemberModal({
	isOpen,
	onClose,
	organizationId,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	organizationId: string | undefined;
	onSuccess: () => void;
}) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");
	const [error, setError] = useState<string | null>(null);
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const { roles: availableRoles, loading: rolesLoading } = useAvailableRoles(organizationId);
	const inviteMember = useInviteMember(organizationId);
	const { users: suggestedUsers, isLoading: isSearching } = useUserSearch(organizationId, debouncedQuery);

	// Debounce email input for search
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedQuery(email), 300);
		return () => clearTimeout(timer);
	}, [email]);

	// Show suggestions when we have results
	useEffect(() => {
		setShowSuggestions(suggestedUsers.length > 0 && email.length >= 2);
	}, [suggestedUsers, email]);

	const handleSubmit = useCallback(async () => {
		if (!email.trim()) {
			setError("Email is required");
			return;
		}
		if (!email.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}
		try {
			await inviteMember.mutateAsync({ email: email.trim(), role });
			onSuccess();
			onClose();
			setEmail("");
			setRole("member");
			setError(null);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to send invitation"));
		}
	}, [email, role, inviteMember, onSuccess, onClose]);

	const handleClose = useCallback(() => {
		setEmail("");
		setRole("member");
		setError(null);
		setShowSuggestions(false);
		setDebouncedQuery("");
		onClose();
	}, [onClose]);

	const selectedRoleOption = availableRoles.find((r) => r.value === role);
	const matchedUser = suggestedUsers.find((u) => u.email === email.trim());

	return (
		<Dialog open={isOpen} onClose={handleClose} size="lg">
			<DialogHeader
				icon={EnvelopeIcon}
				iconColor="emerald"
				title="Invite Team Member"
				description="Send an invitation to join your organization"
				onClose={handleClose}
			/>

			<DialogBody>
				<div className="space-y-5">
					{error && (
						<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
							<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
							<span className="text-sm text-red-700 dark:text-red-300">{error}</span>
						</div>
					)}

					{/* Preview card — shows who you're inviting */}
					<div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
						{matchedUser?.image ? (
							<img src={matchedUser.image} alt="" className="size-10 shrink-0 rounded-full object-cover" />
						) : (
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
								{email.includes("@") ? (
									<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
										{email.charAt(0).toUpperCase()}
									</span>
								) : (
									<UserIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
								)}
							</div>
						)}
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
								{matchedUser?.name || email.trim() || "New team member"}
							</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								{matchedUser ? matchedUser.email : selectedRoleOption ? `Invited as ${selectedRoleOption.label}` : "Select a role below"}
							</p>
						</div>
						{selectedRoleOption && <Badge color={getRoleBadgeConfig(role).color}>{selectedRoleOption.label}</Badge>}
					</div>

					{/* Email field with autocomplete */}
					<div className="relative">
						<label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
							Email Address
						</label>
						<Input
							id="invite-email"
							type="email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setError(null);
							}}
							onFocus={() => {
								if (suggestedUsers.length > 0 && email.length >= 2) setShowSuggestions(true);
							}}
							onBlur={() => {
								// Delay to allow click on suggestion
								setTimeout(() => setShowSuggestions(false), 200);
							}}
							placeholder="colleague@company.com"
							autoComplete="off"
						/>

						{/* User suggestions dropdown */}
						{showSuggestions && (
							<div
								className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
							>
								{isSearching && (
									<div className="px-3 py-2 text-xs text-zinc-400">Searching...</div>
								)}
								{suggestedUsers.map((user) => (
									<button
										key={user.id}
										type="button"
										className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
										onMouseDown={(e) => {
											// Prevent input blur
											e.preventDefault();
											setEmail(user.email);
											setShowSuggestions(false);
										}}
									>
										{user.image ? (
											<img
												src={user.image}
												alt=""
												className="size-8 rounded-full object-cover"
											/>
										) : (
											<div className="flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
												<span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
													{user.name.charAt(0).toUpperCase()}
												</span>
											</div>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
												{user.name}
											</p>
											<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
												{user.email}
											</p>
										</div>
										{user.isMember && (
											<Badge color="zinc">Member</Badge>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Role picker */}
					<div>
						<span id="role-label" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
							Role
						</span>
						{rolesLoading ? (
							<div className="space-y-2">
								{[1, 2].map((i) => (
									<div
										key={i}
										className="h-15 animate-pulse rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800"
									/>
								))}
							</div>
						) : (
							/* biome-ignore lint/a11y/useSemanticElements: styled button group, not a form fieldset */
							<div role="group" aria-labelledby="role-label" className="-m-1 max-h-80 space-y-2 overflow-y-auto p-1">
								{availableRoles.map((r) => (
									<RolePickerOption
										key={r.value}
										role={r}
										selected={role === r.value}
										onSelect={() => setRole(r.value)}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</DialogBody>

			<DialogActions>
				<Button plain onClick={handleClose}>
					Cancel
				</Button>
				<Button color="emerald" onClick={handleSubmit} disabled={inviteMember.isPending || !email.trim()}>
					{inviteMember.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Sending...
						</>
					) : (
						<>
							<EnvelopeIcon className="size-4" />
							Send Invitation
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// CHANGE ROLE DIALOG
// =============================================================================

export function ChangeRoleDialog({
	open,
	onClose,
	member,
	organizationId,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	member: Member | null;
	organizationId: string | undefined;
	onSuccess: () => void;
}) {
	const [selectedRole, setSelectedRole] = useState("member");
	const { roles: availableRoles, loading: rolesLoading } = useAvailableRoles(organizationId);
	const updateRole = useUpdateMemberRole(organizationId);

	// Sync selected role with current member role when dialog opens
	const memberRole = member?.role;
	const prevMemberRef = useState<string | null>(null);
	if (memberRole && prevMemberRef[0] !== memberRole) {
		prevMemberRef[1](memberRole);
		setSelectedRole(memberRole);
	}

	const handleSubmit = useCallback(async () => {
		if (!member) return;
		try {
			await updateRole.mutateAsync({ memberId: member.id, role: selectedRole });
			onSuccess();
			onClose();
		} catch (err) {
			console.error("Failed to update role:", getAPIErrorMessage(err));
		}
	}, [member, selectedRole, updateRole, onSuccess, onClose]);

	if (!member) return null;

	const isSameRole = selectedRole === member.role;
	const currentRoleConfig = getRoleBadgeConfig(member.role);
	const newRoleConfig = getRoleBadgeConfig(selectedRole);

	return (
		<Dialog open={open} onClose={onClose} size="lg">
			<DialogHeader
				icon={ShieldCheckIcon}
				iconColor="sky"
				title="Change Role"
				description="Select a new role for this team member"
				onClose={onClose}
			/>
			<DialogBody>
				<div className="space-y-5">
					{/* Member identity card */}
					<div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
						<MemberAvatar name={member.user?.name} userId={member.userId} image={member.user?.image} size="md" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
								{member.user?.name || "Team Member"}
							</p>
							<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{member.user?.email || member.userId}</p>
						</div>
						{/* Role transition indicator */}
						<div className="flex shrink-0 items-center gap-1.5">
							<Badge color={currentRoleConfig.color}>{currentRoleConfig.label}</Badge>
							{!isSameRole && (
								<>
									<svg
										className="size-3.5 text-zinc-400"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={2}
										stroke="currentColor"
										aria-hidden="true"
									>
										<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
									</svg>
									<Badge color={newRoleConfig.color}>{newRoleConfig.label}</Badge>
								</>
							)}
						</div>
					</div>

					{/* Role picker */}
					{rolesLoading ? (
						<div className="space-y-2">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-15 animate-pulse rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
							))}
						</div>
					) : (
						<div className="-m-1 max-h-80 space-y-2 overflow-y-auto p-1">
							{availableRoles.map((r) => (
								<RolePickerOption
									key={r.value}
									role={r}
									selected={selectedRole === r.value}
									current={r.value === member.role}
									onSelect={() => setSelectedRole(r.value)}
								/>
							))}
						</div>
					)}
				</div>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="emerald" onClick={handleSubmit} disabled={updateRole.isPending || isSameRole}>
					{updateRole.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Saving...
						</>
					) : (
						"Save Changes"
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// REMOVE MEMBER DIALOG
// =============================================================================

export function RemoveMemberDialog({
	open,
	onClose,
	member,
	organizationId,
	onSuccess,
}: {
	open: boolean;
	onClose: () => void;
	member: Member | null;
	organizationId: string | undefined;
	onSuccess: () => void;
}) {
	const removeMember = useRemoveMember(organizationId);

	const handleRemove = useCallback(async () => {
		if (!member) return;
		try {
			await removeMember.mutateAsync(member.id);
			onSuccess();
			onClose();
		} catch (err) {
			console.error("Failed to remove member:", getAPIErrorMessage(err));
		}
	}, [member, removeMember, onSuccess, onClose]);

	if (!member) return null;

	const roleConfig = getRoleBadgeConfig(member.role);

	return (
		<Dialog open={open} onClose={onClose} size="md">
			<DialogHeader icon={TrashIcon} iconColor="red" title="Remove Team Member" onClose={onClose} />
			<DialogBody>
				<div className="space-y-4">
					{/* Member being removed */}
					<div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
						<MemberAvatar name={member.user?.name} userId={member.userId} image={member.user?.image} size="md" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
								{member.user?.name || "Team Member"}
							</p>
							<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{member.user?.email || member.userId}</p>
						</div>
						<Badge color={roleConfig.color}>{roleConfig.label}</Badge>
					</div>

					{/* Warning */}
					<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
						<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
						<div className="text-sm text-red-700 dark:text-red-300">
							<p className="font-medium">This action cannot be undone</p>
							<p className="mt-0.5">
								This member will lose access to the organization immediately. They will need a new invitation to rejoin.
							</p>
						</div>
					</div>
				</div>
			</DialogBody>
			<DialogActions>
				<Button plain onClick={onClose}>
					Cancel
				</Button>
				<Button color="red" onClick={handleRemove} disabled={removeMember.isPending}>
					{removeMember.isPending ? (
						<>
							<ArrowPathIcon className="size-4 animate-spin" />
							Removing...
						</>
					) : (
						<>
							<TrashIcon className="size-4" />
							Remove Member
						</>
					)}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// =============================================================================
// ROLES SECTION
// =============================================================================

export function RolesSection({ organizationId }: { organizationId: string | undefined }) {
	const { data: roles, loading } = useOrganizationRoles(organizationId);
	const createRole = useCreateOrganizationRole(organizationId);
	const deleteRole = useDeleteOrganizationRole(organizationId);
	const updateRole = useUpdateOrganizationRole(organizationId);

	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [newRoleName, setNewRoleName] = useState("");
	const [createError, setCreateError] = useState<string | null>(null);
	const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
	const [editingRole, setEditingRole] = useState<{
		id: string;
		role: string;
		permission: { [key: string]: string[] };
	} | null>(null);
	const [editPermissions, setEditPermissions] = useState<Record<string, string[]>>({});

	const handleCreateRole = useCallback(async () => {
		if (!newRoleName.trim()) {
			setCreateError("Role name is required");
			return;
		}
		try {
			await createRole.mutateAsync({ role: newRoleName.trim() });
			setShowCreateDialog(false);
			setNewRoleName("");
			setCreateError(null);
			showToast.success("Role created");
		} catch (err) {
			setCreateError(getAPIErrorMessage(err, "Failed to create role"));
		}
	}, [newRoleName, createRole]);

	const handleEditRole = useCallback((role: { id: string; role: string; permission: { [key: string]: string[] } }) => {
		setEditingRole(role);
		setEditPermissions(role.permission || {});
	}, []);

	const togglePermission = useCallback((resource: string, action: string) => {
		setEditPermissions((prev) => {
			const current = prev[resource] || [];
			const has = current.includes(action);
			const updated = has ? current.filter((a) => a !== action) : [...current, action];
			if (updated.length === 0) {
				const { [resource]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [resource]: updated };
		});
	}, []);

	const toggleAllForResource = useCallback((resource: string, actions: readonly string[]) => {
		setEditPermissions((prev) => {
			const current = prev[resource] || [];
			const allSelected = actions.every((a) => current.includes(a));
			if (allSelected) {
				const { [resource]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [resource]: [...actions] };
		});
	}, []);

	const handleSaveRole = useCallback(async () => {
		if (!editingRole) return;
		try {
			await updateRole.mutateAsync({ roleId: editingRole.id, permission: editPermissions });
			setEditingRole(null);
			showToast.success("Permissions updated");
		} catch (err) {
			showToast.error(err, "Failed to update permissions");
		}
	}, [editingRole, editPermissions, updateRole]);

	const handleDeleteRole = useCallback(
		async (roleId: string) => {
			setDeletingRoleId(roleId);
			try {
				await deleteRole.mutateAsync(roleId);
				showToast.success("Role deleted");
			} catch (err) {
				showToast.error(err, "Failed to delete role");
			} finally {
				setDeletingRoleId(null);
			}
		},
		[deleteRole]
	);

	if (loading) {
		return (
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
					<div className="h-5 w-24 animate-pulse rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
					<div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
				</div>
				<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
					{[1, 2].map((i) => (
						<div key={i} className="flex items-center gap-3 px-4 py-3.5">
							<div className="size-10 animate-pulse rounded-full bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
							<div className="flex-1 space-y-1.5">
								<div className="h-4 w-24 animate-pulse rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-700" />
								<div className="h-3 w-44 animate-pulse rounded bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
			<div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
					Custom Roles
					{roles.length > 0 && (
						<span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">{roles.length}</span>
					)}
				</h3>
				<Button color="dark/zinc" onClick={() => setShowCreateDialog(true)}>
					<PlusIcon className="size-4" />
					Add Role
				</Button>
			</div>
			<div>
				{roles.length === 0 ? (
					<div className="p-6">
						<EmptyState
							preset="generic"
							title="No custom roles"
							description="Create custom roles to fine-tune permissions for your team members."
							action={{ label: "Create Role", onClick: () => setShowCreateDialog(true) }}
						/>
					</div>
				) : (
					<div className="divide-y divide-zinc-200 dark:divide-zinc-800">
						{roles.map((role) => {
							const permCount = Object.keys(role.permission || {}).length;
							const totalActions = Object.values(role.permission || {}).reduce(
								(sum, actions) => sum + (actions?.length || 0),
								0
							);
							return (
								<div
									key={role.id}
									className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
								>
									<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
										<ShieldCheckIcon className="size-4 text-violet-600 dark:text-violet-400" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-zinc-900 dark:text-white">{formatRoleName(role.role)}</p>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											{permCount > 0
												? `${totalActions} permission${totalActions !== 1 ? "s" : ""} across ${permCount} resource${permCount !== 1 ? "s" : ""}`
												: "No permissions configured"}
										</p>
									</div>
									<Dropdown>
										<DropdownButton plain aria-label="Role options">
											<EllipsisVerticalIcon className="size-5 text-zinc-400" />
										</DropdownButton>
										<DropdownMenu anchor="bottom end">
											<DropdownItem onClick={() => handleEditRole(role)}>
												<PencilIcon className="size-4" />
												Edit Permissions
											</DropdownItem>
											<DropdownItem onClick={() => handleDeleteRole(role.id)} disabled={deletingRoleId === role.id}>
												<TrashIcon className="size-4 text-red-500" />
												Delete Role
											</DropdownItem>
										</DropdownMenu>
									</Dropdown>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Create Role Dialog */}
			<Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} size="sm">
				<DialogHeader
					icon={PlusIcon}
					iconColor="violet"
					title="Create Role"
					description="Create a new custom role for your organization"
					onClose={() => {
						setShowCreateDialog(false);
						setNewRoleName("");
						setCreateError(null);
					}}
				/>
				<DialogBody>
					<div className="space-y-4">
						{createError && (
							<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
								<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
								<span className="text-sm text-red-700 dark:text-red-300">{createError}</span>
							</div>
						)}
						<div>
							<label htmlFor="role-name" className="mb-1.5 block text-sm font-medium text-zinc-900 dark:text-white">
								Role Name
							</label>
							<Input
								id="role-name"
								value={newRoleName}
								onChange={(e) => setNewRoleName(e.target.value)}
								placeholder="e.g. editor, viewer, moderator"
							/>
						</div>
					</div>
				</DialogBody>
				<DialogActions>
					<Button
						plain
						onClick={() => {
							setShowCreateDialog(false);
							setNewRoleName("");
							setCreateError(null);
						}}
					>
						Cancel
					</Button>
					<Button color="emerald" onClick={handleCreateRole} disabled={createRole.isPending || !newRoleName.trim()}>
						{createRole.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Creating...
							</>
						) : (
							<>
								<ShieldCheckIcon className="size-4" />
								Create Role
							</>
						)}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit Role Dialog */}
			<Dialog open={!!editingRole} onClose={() => setEditingRole(null)} size="2xl">
				<DialogHeader
					icon={ShieldCheckIcon}
					iconColor="violet"
					title={`Edit Role: ${editingRole ? formatRoleName(editingRole.role) : ""}`}
					description="Toggle permissions for each resource. Changes are saved when you click Save."
					onClose={() => setEditingRole(null)}
				/>
				<DialogBody>
					<div className="-mx-1 max-h-[60vh] space-y-1 overflow-y-auto px-1">
						{(Object.entries(ORG_STATEMENT) as [OrgResource, readonly string[]][]).map(([resource, actions]) => {
							const currentActions = editPermissions[resource] || [];
							const allSelected = actions.every((a) => currentActions.includes(a));
							const someSelected = currentActions.length > 0 && !allSelected;

							return (
								<div key={resource} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
									<div className="flex items-center gap-3">
										<button
											type="button"
											onClick={() => toggleAllForResource(resource, actions)}
											className={clsx(
												"flex size-5 shrink-0 items-center justify-center rounded border transition-colors",
												allSelected
													? "border-emerald-500 bg-emerald-500 text-white"
													: someSelected
														? "border-emerald-500 bg-emerald-500/20"
														: "border-zinc-300 dark:border-zinc-600"
											)}
										>
											{allSelected && (
												<svg className="size-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
													<path
														d="M2 6l3 3 5-5"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											)}
											{someSelected && <div className="h-0.5 w-2.5 rounded-full bg-emerald-500" />}
										</button>
										<span className="text-sm font-medium text-zinc-900 dark:text-white">
											{ORG_RESOURCE_LABELS[resource]}
										</span>
										{currentActions.length > 0 && (
											<Badge color="emerald" className="ml-auto">
												{currentActions.length}/{actions.length}
											</Badge>
										)}
									</div>
									<div className="mt-2 flex flex-wrap gap-1.5 pl-8">
										{actions.map((action) => {
											const isActive = currentActions.includes(action);
											return (
												<button
													key={action}
													type="button"
													onClick={() => togglePermission(resource, action)}
													className={clsx(
														"rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
														isActive
															? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-800"
															: "bg-white text-zinc-500 ring-1 ring-zinc-200 hover:bg-zinc-100 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
													)}
												>
													{ACTION_LABELS[action] || action}
												</button>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				</DialogBody>
				<DialogActions>
					<Button plain onClick={() => setEditingRole(null)}>
						Cancel
					</Button>
					<Button color="emerald" onClick={handleSaveRole} disabled={updateRole.isPending}>
						{updateRole.isPending ? (
							<>
								<ArrowPathIcon className="size-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save Permissions"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
