import {
	EnvelopeIcon,
	ShieldCheckIcon,
	UserGroupIcon,
} from "@heroicons/react/16/solid";
import { Outlet } from "@tanstack/react-router";
import { Heading } from "@/components/heading";
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
	const pendingInvitations = invitations.length;

	const tabs: TabNavItem[] = [
		{ label: "Members", to: orgPath("/team"), exact: true, count: totalMembers },
		{ label: "Invitations", to: orgPath("/team/invitations"), count: pendingInvitations },
		{ label: "Roles", to: orgPath("/team/roles") },
	];

	return (
		<div className="space-y-6 pb-20">
			{/* Header */}
			<div>
				<Heading>Team</Heading>
				<Text className="mt-1">Manage your organization's team members</Text>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-4">
				<div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/30">
							<UserGroupIcon className="size-5 text-sky-600 dark:text-sky-400" />
						</div>
						<div>
							<p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalMembers}</p>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">Members</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
							<ShieldCheckIcon className="size-5 text-amber-600 dark:text-amber-400" />
						</div>
						<div>
							<p className="text-2xl font-bold text-zinc-900 dark:text-white">{adminCount}</p>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">Admins</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
							<EnvelopeIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
						</div>
						<div>
							<p className="text-2xl font-bold text-zinc-900 dark:text-white">{pendingInvitations}</p>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">Pending</p>
						</div>
					</div>
				</div>
			</div>

			{/* URL-based tab navigation */}
			<TabNav tabs={tabs} />

			{/* Child route renders here */}
			<Outlet />
		</div>
	);
}
