import {
	EnvelopeIcon,
	MagnifyingGlassIcon,
	ShieldCheckIcon,
	UserPlusIcon,
	UsersIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/button";
import { Input, InputGroup } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { useCan } from "@/components/shared/can";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { IconButton } from "@/components/shared/icon-button";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";
import { useInvitations, useMembers } from "@/features/team/hooks";
import { useOrgContext } from "@/hooks/use-org-context";
import { useOrgPath } from "@/hooks/use-org-slug";
import { Route } from "@/routes/_app/$orgSlug/team";
import { InviteMemberModal, TeamSkeleton } from "./components";

export function TeamLayout() {
	const { organizationId } = useOrgContext();
	const orgPath = useOrgPath();
	const navigate = Route.useNavigate();
	const { q } = Route.useSearch();
	const canInviteMembers = useCan("member", "create");

	const { data: members, loading: membersLoading } = useMembers(organizationId);
	const { data: invitations, loading: invitationsLoading } = useInvitations(organizationId);

	const [showInviteModal, setShowInviteModal] = useState(false);

	const totalMembers = members.length;
	const adminCount = members.filter((m) => m.role === "owner" || m.role === "admin").length;
	const memberCount = totalMembers - adminCount;
	const pendingInvitations = invitations.length;

	if (membersLoading || invitationsLoading) return <TeamSkeleton />;

	const tabs: TabNavItem[] = [
		{
			label: "Members",
			to: orgPath("/team"),
			exact: true,
			count: totalMembers,
			icon: UsersIcon,
			iconColor: "text-sky-500",
		},
		{
			label: "Invitations",
			to: orgPath("/team/invitations"),
			count: pendingInvitations,
			icon: EnvelopeIcon,
			iconColor: "text-amber-500",
		},
		{
			label: "Roles",
			to: orgPath("/team/roles"),
			icon: ShieldCheckIcon,
			iconColor: "text-violet-500",
		},
	];

	const setSearchQuery = (value: string) => {
		navigate({ search: (prev) => ({ ...prev, q: value || undefined }) });
	};

	return (
		<div className="space-y-5">
			{/* Header */}
			<PageHeader
				title="Team"
				description="Manage your organization's team members, invitations, and roles"
				actions={
					canInviteMembers ? (
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2 sm:hidden">
								<IconButton color="zinc" onClick={() => setShowInviteModal(true)}>
									<UserPlusIcon className="size-5" />
								</IconButton>
							</div>
							<div className="hidden items-center gap-2 sm:flex">
								<Button color="dark/zinc" onClick={() => setShowInviteModal(true)}>
									<UserPlusIcon className="size-4" />
									Invite Member
								</Button>
							</div>
						</div>
					) : undefined
				}
			/>

			{/* Stats */}
			<FinancialStatsGridBordered
				columns={4}
				stats={[
					{ name: "Total Members", value: totalMembers },
					{ name: "Admins", value: adminCount },
					{ name: "Members", value: memberCount },
					{ name: "Pending Invites", value: pendingInvitations },
				]}
			/>

			{/* Search + Tabs */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div className="w-full sm:w-64 sm:shrink-0">
					<InputGroup>
						<MagnifyingGlassIcon data-slot="icon" />
						<Input
							type="search"
							value={q ?? ""}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search members..."
							aria-label="Search team"
						/>
						{q && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<XMarkIcon className="size-4" />
							</button>
						)}
					</InputGroup>
				</div>
				<TabNav tabs={tabs} />
			</div>

			{/* Child route */}
			<Outlet />

			{/* Shared invite modal */}
			<InviteMemberModal
				isOpen={showInviteModal}
				onClose={() => setShowInviteModal(false)}
				organizationId={organizationId}
				onSuccess={() => setShowInviteModal(false)}
			/>
		</div>
	);
}
