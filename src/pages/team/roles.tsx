import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { useOrgContext } from "@/hooks/use-org-context";
import { RolesSection } from "./components";

export function TeamRoles() {
	const { organizationId } = useOrgContext();
	const canManageMembers = useCan("member", "update");

	if (!canManageMembers) {
		return (
			<div className="overflow-hidden rounded-xl bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="p-6">
					<EmptyState preset="generic" title="No access" description="You don't have permission to manage roles." />
				</div>
			</div>
		);
	}

	return <RolesSection organizationId={organizationId} />;
}
