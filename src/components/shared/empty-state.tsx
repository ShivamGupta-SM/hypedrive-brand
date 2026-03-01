/**
 * EmptyState Component
 * Animated empty state with card collage pattern from shopper app
 */

import {
	CalendarIcon,
	ChartBarIcon,
	CreditCardIcon,
	CubeIcon,
	CurrencyRupeeIcon,
	DocumentTextIcon,
	InboxIcon,
	MegaphoneIcon,
	ShoppingCartIcon,
	TagIcon,
	TicketIcon,
	UserGroupIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";

import { Button } from "@/components/button";

// Preset card configurations - meaningful icons with cohesive colors
const cardPresets = {
	campaigns: {
		cards: [
			{ icon: MegaphoneIcon, iconColor: "text-sky-500" },
			{ icon: TicketIcon, iconColor: "text-rose-500" },
			{ icon: CalendarIcon, iconColor: "text-amber-500" },
		],
	},
	orders: {
		cards: [
			{ icon: ShoppingCartIcon, iconColor: "text-zinc-500" },
			{ icon: CreditCardIcon, iconColor: "text-emerald-500" },
			{ icon: CurrencyRupeeIcon, iconColor: "text-amber-500" },
		],
	},
	events: {
		cards: [
			{ icon: CalendarIcon, iconColor: "text-sky-500" },
			{ icon: TicketIcon, iconColor: "text-rose-500" },
			{ icon: UserGroupIcon, iconColor: "text-zinc-500" },
		],
	},
	enrollments: {
		cards: [
			{ icon: UserGroupIcon, iconColor: "text-zinc-500" },
			{ icon: DocumentTextIcon, iconColor: "text-sky-500" },
			{ icon: ChartBarIcon, iconColor: "text-emerald-500" },
		],
	},
	listings: {
		cards: [
			{ icon: CubeIcon, iconColor: "text-sky-500" },
			{ icon: TagIcon, iconColor: "text-emerald-500" },
			{ icon: ShoppingCartIcon, iconColor: "text-amber-500" },
		],
	},
	generic: {
		cards: [
			{ icon: InboxIcon, iconColor: "text-zinc-400" },
			{ icon: ChartBarIcon, iconColor: "text-zinc-500" },
			{ icon: DocumentTextIcon, iconColor: "text-zinc-400" },
		],
	},
};

type PresetType = keyof typeof cardPresets;

interface EmptyStateProps {
	preset?: PresetType;
	title: string;
	description: string;
	action?: {
		label: string;
		href?: string;
		onClick?: () => void;
	};
	secondaryAction?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

function CollageCards({ preset = "generic" }: { preset?: PresetType }) {
	const { cards } = cardPresets[preset];
	const LeftIcon = cards[0].icon;
	const CenterIcon = cards[1].icon;
	const RightIcon = cards[2].icon;

	return (
		<div className="group isolate flex justify-center">
			{/* Left card */}
			<div
				className={clsx(
					"relative left-3 top-2 grid size-12 place-items-center rounded-xl",
					"bg-white shadow-sm ring-1 ring-zinc-200",
					"-rotate-12 transition-all duration-500 ease-out",
					"group-hover:-translate-x-5 group-hover:-translate-y-1 group-hover:-rotate-[20deg]",
					"dark:bg-zinc-800/80 dark:ring-zinc-700/50"
				)}
			>
				<LeftIcon
					className={clsx("size-5 transition-transform duration-500 group-hover:scale-110", cards[0].iconColor)}
				/>
			</div>

			{/* Center card */}
			<div
				className={clsx(
					"relative z-10 grid size-14 place-items-center rounded-xl",
					"bg-white shadow-md ring-1 ring-zinc-200",
					"transition-all duration-500 ease-out",
					"group-hover:-translate-y-3 group-hover:scale-105 group-hover:shadow-lg",
					"dark:bg-zinc-800/80 dark:ring-zinc-700/50"
				)}
			>
				<CenterIcon
					className={clsx("size-6 transition-transform duration-500 group-hover:scale-110", cards[1].iconColor)}
				/>
			</div>

			{/* Right card */}
			<div
				className={clsx(
					"relative right-3 top-2 grid size-12 place-items-center rounded-xl",
					"bg-white shadow-sm ring-1 ring-zinc-200",
					"rotate-12 transition-all duration-500 ease-out",
					"group-hover:translate-x-5 group-hover:-translate-y-1 group-hover:rotate-[20deg]",
					"dark:bg-zinc-800/80 dark:ring-zinc-700/50"
				)}
			>
				<RightIcon
					className={clsx("size-5 transition-transform duration-500 group-hover:scale-110", cards[2].iconColor)}
				/>
			</div>
		</div>
	);
}

/**
 * EmptyState - Clean empty state with animated card collage
 */
export function EmptyState({
	preset = "generic",
	title,
	description,
	action,
	secondaryAction,
	className,
}: EmptyStateProps) {
	return (
		<div className={clsx("group w-full px-4 py-10", className)}>
			{/* Collage cards */}
			<CollageCards preset={preset} />

			{/* Text content */}
			<div className="mt-6 text-center">
				<h3 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
				<p className="mx-auto mt-1.5 max-w-64 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
					{description}
				</p>
			</div>

			{/* Action buttons */}
			{(action || secondaryAction) && (
				<div className="mt-5 flex items-center justify-center gap-2.5">
					{action && (
						<Button outline href={action.href} onClick={action.onClick}>
							{action.label}
						</Button>
					)}
					{secondaryAction && (
						<Button plain onClick={secondaryAction.onClick}>
							{secondaryAction.label}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

/**
 * InlineEmptyState - Compact version for cards/sections
 */
export function InlineEmptyState({
	preset = "generic",
	title,
	description,
	action,
	className,
}: Omit<EmptyStateProps, "secondaryAction">) {
	const { cards } = cardPresets[preset];
	const CenterIcon = cards[1].icon;

	return (
		<div className={clsx("flex flex-col items-center justify-center py-8 text-center", className)}>
			{/* Single icon card */}
			<div className="grid size-12 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800/80 dark:ring-zinc-700">
				<CenterIcon className={clsx("size-5", cards[1].iconColor)} />
			</div>

			<p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white">{title}</p>
			<p className="mt-1 max-w-48 text-xs text-zinc-500 dark:text-zinc-400">{description}</p>

			{action && (
				<Button outline href={action.href} onClick={action.onClick} className="mt-4">
					{action.label}
				</Button>
			)}
		</div>
	);
}
