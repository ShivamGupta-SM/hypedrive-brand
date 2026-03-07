import {
	CheckCircleIcon,
	ClipboardDocumentListIcon,
	PaperAirplaneIcon,
	PauseCircleIcon,
	PlayCircleIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import clsx from "clsx";
import type { brand } from "@/lib/brand-client";

export function CampaignTimeline({ campaign }: { campaign: brand.CampaignWithStats }) {
	const formatDateTime = (dateStr?: string) => {
		if (!dateStr) return "";
		return new Date(dateStr).toLocaleDateString("en-IN", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const events: Array<{
		label: string;
		date: string;
		icon: typeof CheckCircleIcon;
		iconBg: string;
		description?: string;
	}> = [];

	events.push({
		label: "Created",
		date: campaign.createdAt,
		icon: ClipboardDocumentListIcon,
		iconBg: "bg-zinc-400 dark:bg-zinc-500",
	});

	if (
		campaign.status === "pending_approval" ||
		campaign.status === "approved" ||
		campaign.status === "active" ||
		campaign.status === "paused" ||
		campaign.status === "ended"
	) {
		events.push({
			label: "Submitted",
			date: campaign.updatedAt,
			icon: PaperAirplaneIcon,
			iconBg: "bg-sky-500",
		});
	}

	if (campaign.status === "rejected" && campaign.rejectionReason) {
		events.push({
			label: "Rejected",
			date: campaign.updatedAt,
			icon: XCircleIcon,
			iconBg: "bg-red-500",
			description: campaign.rejectionReason,
		});
	}

	if (campaign.status === "active" || campaign.status === "paused" || campaign.status === "ended") {
		const startDate = new Date(campaign.startDate);
		if (startDate <= new Date()) {
			events.push({
				label: "Started",
				date: campaign.startDate,
				icon: PlayCircleIcon,
				iconBg: "bg-emerald-500",
			});
		}
	}

	if (campaign.status === "paused") {
		events.push({
			label: "Paused",
			date: campaign.updatedAt,
			icon: PauseCircleIcon,
			iconBg: "bg-amber-500",
		});
	}

	if (campaign.status === "ended") {
		events.push({
			label: "Ended",
			date: campaign.endDate,
			icon: CheckCircleIcon,
			iconBg: "bg-zinc-500",
		});
	}

	events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return (
		<div className="relative">
			{events.map((event, index) => {
				const isLast = index === events.length - 1;
				const Icon = event.icon;
				return (
					<div key={`${event.label}-${event.date}`} className="relative flex gap-3 pb-4 last:pb-0">
						{!isLast && (
							<div className="absolute left-[11px] top-6 h-[calc(100%-8px)] w-px bg-zinc-200 dark:bg-zinc-700" />
						)}
						<div
							className={clsx(
								"relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
								event.iconBg
							)}
						>
							<Icon className="size-3 text-white" />
						</div>
						<div className="min-w-0 flex-1 pt-0.5">
							<p className="text-sm font-medium text-zinc-900 dark:text-white">{event.label}</p>
							{event.description && <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{event.description}</p>}
							<p className="mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">{formatDateTime(event.date)}</p>
						</div>
					</div>
				);
			})}
		</div>
	);
}
