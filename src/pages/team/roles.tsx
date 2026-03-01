import { EmptyState } from "@/components/shared/empty-state";
import { useCurrentOrganization } from "@/hooks";
import { useCan } from "@/store/permissions-store";
import { RolesSection } from "./components";

export function TeamRoles() {
	const organization = useCurrentOrganization();
	const organizationId = organization?.id;
	const canManageMembers = useCan("member", "update");

	if (!canManageMembers) {
		return <EmptyState preset="generic" title="No access" description="You don't have permission to manage roles." />;
	}

	return <RolesSection organizationId={organizationId} />;
}
