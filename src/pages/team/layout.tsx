import { Outlet } from "@tanstack/react-router";
import { Heading } from "@/components/heading";
import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { TabNav, type TabNavItem } from "@/components/shared/tab-nav";
import { Text } from "@/components/text";
import { useInvitations, useMembers } from "@/hooks";
import { useOrgPath } from "@/hooks/use-org-slug";
import { useCurrentOrganization } from "@/store/organization-store";
import { TeamSkeleton } from "./components";

export function TeamLayout() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const orgPath = useOrgPath();

	// Both hooks used for stats row counts
	// Sub-pages call the same hooks — TanStack Query deduplicates
	const { data: members, loading: membersLoading } = useMembers(organizationId);
	const { data: invitations, loading: invitationsLoading } = useInvitations(organizationId);

	if (membersLoading || invitationsLoading) return <TeamSkeleton />;

	const totalMembers = members.length;
	const adminCount = members.filter((m) => m.role === "admin" || m.role === "owner").length;
	const memberCount = members.filter((m) => m.role === "member").length;
	const pendingInvitations = invitations.length;

	const tabs: TabNavItem[] = [
		{ label: "Members", to: orgPath("/team"), exact: true, count: totalMembers },
		{ label: "Invitations", to: orgPath("/team/invitations"), count: pendingInvitations },
		{ label: "Roles", to: orgPath("/team/roles") },
	];

	return (
		<div className="space-y-6 pb-20">
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<Heading>Team</Heading>
					<Text className="mt-1">Manage your organization's team members</Text>
				</div>
			</div>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Members", value: totalMembers },
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
