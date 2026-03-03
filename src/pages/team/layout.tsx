import { EnvelopeIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/16/solid";
import { Outlet } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";
import { useInvitations, useMembers, useOrgContext } from "@/hooks";
import { useOrgPath } from "@/hooks/use-org-slug";
import { TeamSkeleton } from "./components";

export function TeamLayout() {
	const { organizationId } = useOrgContext();
	const orgPath = useOrgPath();

	// Both hooks used for stats row counts
	// Sub-pages call the same hooks — TanStack Query deduplicates
	const { data: members, loading: membersLoading } = useMembers(organizationId);
	const { data: invitations, loading: invitationsLoading } = useInvitations(organizationId);

	// Only show skeleton on initial load (no cached data), not on background refetch
	if (membersLoading || invitationsLoading) return <TeamSkeleton />;

	const totalMembers = members.length;
	const adminCount = members.filter((m) => m.role === "admin" || m.role === "owner").length;
	const memberCount = members.filter((m) => m.role === "member").length;
	const pendingInvitations = invitations.length;

	const tabs: TabNavItem[] = [
		{ label: "Members", to: orgPath("/team"), exact: true, count: totalMembers, icon: UsersIcon, iconColor: "text-sky-500" },
		{ label: "Invitations", to: orgPath("/team/invitations"), count: pendingInvitations, icon: EnvelopeIcon, iconColor: "text-amber-500" },
		{ label: "Roles", to: orgPath("/team/roles"), icon: ShieldCheckIcon, iconColor: "text-violet-500" },
	];

	return (
		<div className="space-y-6 pb-20">
			{/* Header */}
			<PageHeader title="Team" description="Manage your organization's team members" />

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Total", value: totalMembers },
					{ name: "Admins", value: adminCount },
					{ name: "Members", value: memberCount },
					{
						name: "Pending",
						value: pendingInvitations,
						change: pendingInvitations > 0 ? "needs attention" : undefined,
						changeType: pendingInvitations > 0 ? "negative" : undefined,
					},
				]}
				columns={4}
			/>

			{/* URL-based tab navigation */}
			<TabNav tabs={tabs} />

			{/* Child route renders here */}
			<Outlet />
		</div>
	);
}
