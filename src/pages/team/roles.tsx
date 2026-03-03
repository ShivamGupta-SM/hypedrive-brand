import { useCan } from "@/components/shared/can";
import { EmptyState } from "@/components/shared/empty-state";
import { useOrgContext } from "@/hooks/use-org-context";
import { RolesSection } from "./components";

export function TeamRoles() {
	const { organizationId } = useOrgContext();
	const canManageMembers = useCan("member", "update");

	if (!canManageMembers) {
		return <EmptyState preset="generic" title="No access" description="You don't have permission to manage roles." />;
	}

	return <RolesSection organizationId={organizationId} />;
}
