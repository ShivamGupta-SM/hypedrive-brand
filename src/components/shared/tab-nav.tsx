/**
 * TabNav — URL-based pill-style tab navigation
 * Uses Link + useRouterState for active detection (not onClick state)
 */

import { Link, useRouterState } from "@tanstack/react-router";
import clsx from "clsx";
import type { ComponentType, SVGProps } from "react";

export interface TabNavItem {
	label: string;
	/** Full path string e.g. "/acme/wallet/transactions" */
	to: string;
	/** If true, only mark active on exact path match (use for index/overview tabs) */
	exact?: boolean;
	count?: number;
	icon?: ComponentType<SVGProps<SVGSVGElement>>;
	/** Tailwind color class for the icon in inactive state (e.g. "text-emerald-500") */
	iconColor?: string;
}

export interface TabNavProps {
	tabs: TabNavItem[];
	className?: string;
}

export function TabNav({ tabs, className }: TabNavProps) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	return (
		<div className={clsx("-mx-1 overflow-x-auto px-1 py-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:py-0", className)}>
			<div className="flex min-w-max gap-1.5 sm:min-w-0 sm:flex-wrap">
				{tabs.map((tab) => {
					const isActive = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);

					return (
						<Link
							key={tab.to}
							to={tab.to}
							className={clsx(
								"inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ring-1 transition-all duration-200 active:scale-95",
								isActive
									? "bg-zinc-900 text-white ring-zinc-900 dark:bg-white dark:text-zinc-900 dark:ring-white"
									: "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800"
							)}
						>
							{tab.icon && (
								<tab.icon
									className={clsx(
										"size-3.5",
										isActive
											? "text-white dark:text-zinc-900"
											: tab.iconColor || "text-zinc-400"
									)}
								/>
							)}
							{tab.label}
							{tab.count !== undefined && (
								<span
									className={clsx(
										"inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
										isActive
											? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
											: "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
									)}
								>
									{tab.count}
								</span>
							)}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
