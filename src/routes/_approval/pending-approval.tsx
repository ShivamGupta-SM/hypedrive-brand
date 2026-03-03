import { createFileRoute } from "@tanstack/react-router";

import { PendingApproval } from "@/pages/approval";

export const Route = createFileRoute("/_approval/pending-approval")({
	head: () => ({
		meta: [{ title: "Pending Approval | Hypedrive" }],
	}),
	component: PendingApprovalWrapper,
});

function PendingApprovalWrapper() {
	const { approvalOrganization } = Route.useRouteContext();
	return <PendingApproval organization={approvalOrganization} />;
}
