import {
	CheckCircleIcon,
	ClockIcon,
	PauseCircleIcon,
	PlayCircleIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import type { db } from "@/lib/brand-client";

type CampaignStatus = db.CampaignStatus;

export type StatusColor = "lime" | "sky" | "amber" | "zinc" | "emerald" | "red";

export function getStatusConfig(status: CampaignStatus): {
	label: string;
	icon: typeof CheckCircleIcon;
	color: StatusColor;
} {
	const statusMap: Record<string, { label: string; icon: typeof CheckCircleIcon; color: StatusColor }> = {
		active: { label: "Active", icon: PlayCircleIcon, color: "lime" },
		draft: { label: "Draft", icon: ClockIcon, color: "zinc" },
		pending_approval: { label: "Pending", icon: ClockIcon, color: "amber" },
		approved: { label: "Approved", icon: CheckCircleIcon, color: "sky" },
		paused: { label: "Paused", icon: PauseCircleIcon, color: "amber" },
		ended: { label: "Ended", icon: CheckCircleIcon, color: "zinc" },
		completed: { label: "Completed", icon: CheckCircleIcon, color: "emerald" },
		cancelled: { label: "Cancelled", icon: XCircleIcon, color: "red" },
		rejected: { label: "Rejected", icon: XCircleIcon, color: "red" },
		expired: { label: "Expired", icon: ClockIcon, color: "zinc" },
		archived: { label: "Archived", icon: ClockIcon, color: "zinc" },
	};
	return statusMap[status] || { label: status, icon: ClockIcon, color: "zinc" };
}
