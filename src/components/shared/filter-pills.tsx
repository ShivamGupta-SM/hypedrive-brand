/**
 * FilterPills — Segmented control for in-view filtering/sorting
 *
 * Visually distinct from TabNav (URL-based navigation pills):
 * - TabNav = prominent rounded-full pills with ring + shadow (page navigation)
 * - FilterPills = compact segmented control inside a bordered container (local state filter)
 *
 * Based on the segmented control pattern: a single bordered group
 * where one option is highlighted, clearly different from navigation tabs.
 */

import clsx from "clsx";
import type { ComponentType, SVGProps } from "react";

export interface FilterPillOption<T extends string = string> {
	value: T;
	label: string;
	icon?: ComponentType<SVGProps<SVGSVGElement>>;
	iconColor?: string;
}

interface FilterPillsProps<T extends string = string> {
	options: FilterPillOption<T>[];
	value: T;
	onChange: (value: T) => void;
	className?: string;
}

export function FilterPills<T extends string = string>({
	options,
	value,
	onChange,
	className,
}: FilterPillsProps<T>) {
	return (
		<div
			className={clsx(
				"inline-flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800",
				className,
			)}
		>
			{options.map((opt) => {
				const isActive = value === opt.value;
				return (
					<button
						type="button"
						key={opt.value}
						onClick={() => onChange(opt.value)}
						className={clsx(
							"inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-all",
							isActive
								? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white"
								: "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200",
						)}
					>
						{opt.icon && (
							<opt.icon
								className={clsx(
									"size-3",
									isActive ? "text-zinc-700 dark:text-zinc-200" : opt.iconColor || "text-zinc-400",
								)}
							/>
						)}
						{opt.label}
					</button>
				);
			})}
		</div>
	);
}
