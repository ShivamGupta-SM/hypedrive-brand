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
	gradientClass: string;
} {
	const statusMap: Record<string, { label: string; icon: typeof CheckCircleIcon; color: StatusColor; gradientClass: string }> = {
		active: { label: "Active", icon: PlayCircleIcon, color: "lime", gradientClass: "from-lime-500/20 via-lime-500/5 to-transparent dark:from-lime-500/15 dark:via-lime-500/5" },
		draft: { label: "Draft", icon: ClockIcon, color: "zinc", gradientClass: "from-zinc-500/15 via-zinc-500/5 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5" },
		pending_approval: { label: "Pending", icon: ClockIcon, color: "amber", gradientClass: "from-amber-500/20 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5" },
		approved: { label: "Approved", icon: CheckCircleIcon, color: "sky", gradientClass: "from-sky-500/20 via-sky-500/5 to-transparent dark:from-sky-500/15 dark:via-sky-500/5" },
		paused: { label: "Paused", icon: PauseCircleIcon, color: "amber", gradientClass: "from-amber-500/20 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5" },
		ended: { label: "Ended", icon: CheckCircleIcon, color: "zinc", gradientClass: "from-zinc-500/15 via-zinc-500/5 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5" },
		completed: { label: "Completed", icon: CheckCircleIcon, color: "emerald", gradientClass: "from-emerald-500/20 via-emerald-500/5 to-transparent dark:from-emerald-500/15 dark:via-emerald-500/5" },
		cancelled: { label: "Cancelled", icon: XCircleIcon, color: "red", gradientClass: "from-red-500/20 via-red-500/5 to-transparent dark:from-red-500/15 dark:via-red-500/5" },
		rejected: { label: "Rejected", icon: XCircleIcon, color: "red", gradientClass: "from-red-500/20 via-red-500/5 to-transparent dark:from-red-500/15 dark:via-red-500/5" },
		expired: { label: "Expired", icon: ClockIcon, color: "zinc", gradientClass: "from-zinc-500/15 via-zinc-500/5 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5" },
		archived: { label: "Archived", icon: ClockIcon, color: "zinc", gradientClass: "from-zinc-500/15 via-zinc-500/5 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5" },
	};
	return statusMap[status] || { label: status, icon: ClockIcon, color: "zinc", gradientClass: "from-zinc-500/15 via-zinc-500/5 to-transparent dark:from-zinc-500/10 dark:via-zinc-500/5" };
}
