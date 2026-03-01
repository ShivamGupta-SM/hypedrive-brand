import {
	BugAntIcon,
	RocketLaunchIcon,
	SparklesIcon,
	WrenchScrewdriverIcon,
} from "@heroicons/react/16/solid";
import { Badge } from "@/components/badge";
import { Heading } from "@/components/heading";
import { Text } from "@/components/text";
import { useOrgSlug } from "@/hooks/use-org-slug";

// =============================================================================
// CHANGELOG DATA
// =============================================================================

type ChangeType = "feature" | "improvement" | "fix" | "new";

interface ChangelogEntry {
	version: string;
	date: string;
	changes: Array<{
		type: ChangeType;
		title: string;
		description?: string;
	}>;
}

const changelog: ChangelogEntry[] = [
	{
		version: "1.0.0",
		date: "January 2026",
		changes: [
			{
				type: "new",
				title: "Initial Release",
				description:
					"Launch of Hypedrive Brand Portal with campaign management, enrollments, and wallet features.",
			},
			{
				type: "feature",
				title: "Campaign Management",
				description:
					"Create and manage influencer marketing campaigns with detailed targeting options.",
			},
			{
				type: "feature",
				title: "Enrollment System",
				description: "Review and approve influencer applications for your campaigns.",
			},
			{
				type: "feature",
				title: "Digital Wallet",
				description: "Manage funds, view transactions, and track campaign spending.",
			},
			{
				type: "feature",
				title: "Listing Catalog",
				description: "Add and manage listings for your campaigns.",
			},
		],
	},
	{
		version: "0.9.0",
		date: "December 2025",
		changes: [
			{
				type: "improvement",
				title: "Dashboard Redesign",
				description: "New dashboard with better analytics and quick action cards.",
			},
			{
				type: "improvement",
				title: "Dark Mode Support",
				description: "Full dark mode support across all pages and components.",
			},
			{
				type: "fix",
				title: "Wallet Balance Display",
				description: "Fixed incorrect balance display after transactions.",
			},
		],
	},
	{
		version: "0.8.0",
		date: "November 2025",
		changes: [
			{
				type: "feature",
				title: "Organization Settings",
				description: "Manage organization profile and billing information.",
			},
			{
				type: "improvement",
				title: "Mobile Responsiveness",
				description: "Improved mobile experience across all pages.",
			},
			{
				type: "fix",
				title: "Campaign Date Picker",
				description: "Fixed date picker timezone issues.",
			},
			{
				type: "fix",
				title: "Image Upload",
				description: "Fixed listing image upload failures.",
			},
		],
	},
];

// =============================================================================
// CHANGE TYPE CONFIG
// =============================================================================

const changeTypeConfig: Record<
	ChangeType,
	{
		icon: typeof SparklesIcon;
		color: "emerald" | "sky" | "amber" | "red";
		label: string;
		bgClass: string;
		darkBgClass: string;
		textClass: string;
		darkTextClass: string;
	}
> = {
	new: {
		icon: RocketLaunchIcon,
		color: "emerald",
		label: "New",
		bgClass: "bg-emerald-50",
		darkBgClass: "dark:bg-emerald-950/30",
		textClass: "text-emerald-600",
		darkTextClass: "dark:text-emerald-400",
	},
	feature: {
		icon: SparklesIcon,
		color: "sky",
		label: "Feature",
		bgClass: "bg-sky-50",
		darkBgClass: "dark:bg-sky-950/30",
		textClass: "text-sky-600",
		darkTextClass: "dark:text-sky-400",
	},
	improvement: {
		icon: WrenchScrewdriverIcon,
		color: "amber",
		label: "Improvement",
		bgClass: "bg-amber-50",
		darkBgClass: "dark:bg-amber-950/30",
		textClass: "text-amber-600",
		darkTextClass: "dark:text-amber-400",
	},
	fix: {
		icon: BugAntIcon,
		color: "red",
		label: "Fix",
		bgClass: "bg-red-50",
		darkBgClass: "dark:bg-red-950/30",
		textClass: "text-red-600",
		darkTextClass: "dark:text-red-400",
	},
};

// =============================================================================
// CHANGELOG ENTRY COMPONENT
// =============================================================================

function ChangelogEntryCard({ entry }: { entry: ChangelogEntry }) {
	return (
		<div className="relative pl-8">
			{/* Timeline dot */}
			<div className="absolute left-0 top-1.5 flex size-4 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
				<div className="size-2 rounded-full bg-zinc-500 dark:bg-zinc-400" />
			</div>

			{/* Version header */}
			<div className="mb-4">
				<div className="flex items-center gap-3">
					<h3 className="text-lg font-bold text-zinc-900 dark:text-white">v{entry.version}</h3>
					<span className="text-sm text-zinc-500 dark:text-zinc-400">{entry.date}</span>
				</div>
			</div>

			{/* Changes */}
			<div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				{entry.changes.map((change, index) => {
					const config = changeTypeConfig[change.type];
					const Icon = config.icon;

					return (
						<div key={index} className="flex gap-3">
							<div
								className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${config.bgClass} ${config.darkBgClass}`}
							>
								<Icon className={`size-4 ${config.textClass} ${config.darkTextClass}`} />
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-zinc-900 dark:text-white">
										{change.title}
									</span>
									<Badge color={config.color as "emerald" | "sky" | "amber" | "red"}>
										{config.label}
									</Badge>
								</div>
								{change.description && (
									<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
										{change.description}
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

// =============================================================================
// MAIN CHANGELOG PAGE
// =============================================================================

export function Changelog() {
	const orgSlug = useOrgSlug();

	return (
		<div className="mx-auto max-w-2xl space-y-6 pb-20">
			{/* Header */}
			<div>
				<Heading>Changelog</Heading>
				<Text className="mt-1">See what's new and improved in Hypedrive Brand Portal</Text>
			</div>

			{/* Latest badge */}
			<div className="flex items-center gap-2">
				<Badge color="emerald">Latest</Badge>
				<span className="text-sm text-zinc-500 dark:text-zinc-400">
					v{changelog[0].version} • {changelog[0].date}
				</span>
			</div>

			{/* Timeline */}
			<div className="relative space-y-8">
				{/* Timeline line */}
				<div className="absolute bottom-0 left-[7px] top-0 w-px bg-zinc-200 dark:bg-zinc-800" />

				{/* Entries */}
				{changelog.map((entry) => (
					<ChangelogEntryCard key={entry.version} entry={entry} />
				))}
			</div>

			{/* Footer */}
			<div className="pt-8 text-center">
				<p className="text-sm text-zinc-500 dark:text-zinc-400">
					Want to see something specific?{" "}
					<a
						href={`/${orgSlug}/support`}
						className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-white dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
					>
						Let us know
					</a>
				</p>
			</div>
		</div>
	);
}
