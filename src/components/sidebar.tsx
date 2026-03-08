import * as Headless from "@headlessui/react";
import { Bars3BottomLeftIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import type React from "react";
import { forwardRef, useContext } from "react";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapse";
import { TouchTarget } from "./button";
import { Link } from "./link";
import { SidebarCollapsedContext } from "./sidebar-layout";

export function Sidebar({ className, ...props }: React.ComponentPropsWithoutRef<"nav">) {
	return <nav {...props} className={clsx(className, "flex h-full min-h-0 flex-col")} />;
}

export function SidebarHeader({ className, children, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const collapsed = useContext(SidebarCollapsedContext);
	return (
		<div className="flex flex-col">
			<div
				{...props}
				className={clsx(
					className,
					"flex flex-col justify-center gap-4 pt-2.5",
					"h-14.5",
					collapsed ? "items-center px-2" : "px-4"
				)}
			>
				{children}
			</div>
			<hr className={clsx("border-t border-zinc-300 dark:border-zinc-700", collapsed ? "mx-2" : "mx-4")} />
		</div>
	);
}

export function SidebarBody({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const collapsed = useContext(SidebarCollapsedContext);
	return (
		<div
			{...props}
			className={clsx(
				className,
				"flex flex-1 flex-col overflow-y-auto scrollbar-hide [&>[data-slot=section]+[data-slot=section]]:mt-2.5",
				collapsed ? "items-center p-2" : "p-4"
			)}
		/>
	);
}

export function SidebarFooter({ className, children, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const collapsed = useContext(SidebarCollapsedContext);
	return (
		<div className="flex flex-col">
			<hr className={clsx("border-t border-zinc-300 dark:border-zinc-700", collapsed ? "mx-2" : "mx-4")} />
			<div
				{...props}
				className={clsx(
					className,
					"flex flex-col [&>[data-slot=section]+[data-slot=section]]:mt-2.5",
					collapsed ? "items-center p-2" : "p-4"
				)}
			>
				{children}
			</div>
		</div>
	);
}

export function SidebarSection({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	const collapsed = useContext(SidebarCollapsedContext);
	return (
		<div
			{...props}
			data-slot="section"
			className={clsx(className, "flex w-full flex-col gap-0.5", collapsed && "items-center")}
		/>
	);
}

export function SidebarDivider({ className, ...props }: React.ComponentPropsWithoutRef<"hr">) {
	return <hr {...props} className={clsx(className, "my-3 w-full border-t border-zinc-300 dark:border-zinc-700")} />;
}

export function SidebarSpacer({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	return <div aria-hidden="true" {...props} className={clsx(className, "mt-4 flex-1")} />;
}

export function SidebarHeading({ className, children, ...props }: React.ComponentPropsWithoutRef<"h3">) {
	const collapsed = useContext(SidebarCollapsedContext);
	if (collapsed) return null;
	return (
		<h3 {...props} className={clsx(className, "mb-1 px-2 text-xs/6 font-semibold text-zinc-500 dark:text-zinc-400")}>
			{children}
		</h3>
	);
}

export const SidebarItem = forwardRef(function SidebarItem(
	{
		current,
		className,
		children,
		tooltip,
		...props
	}: { current?: boolean; className?: string; children: React.ReactNode; tooltip?: string } & (
		| ({ href?: never } & Omit<Headless.ButtonProps, "as" | "className">)
		| ({ href: string } & Omit<Headless.ButtonProps<typeof Link>, "as" | "className">)
	),
	ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
) {
	const collapsed = useContext(SidebarCollapsedContext);

	const classes = clsx(
		// Base
		"flex items-center rounded-lg text-left text-base/6 font-semibold text-zinc-700 transition-colors duration-150 sm:text-sm/5",
		collapsed ? "size-10 justify-center" : "w-full gap-3 px-2 py-2 sm:py-1.5",
		// Leading icon/icon-only
		"*:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:fill-zinc-500 sm:*:data-[slot=icon]:size-5",
		// Trailing icon (down chevron or similar)
		!collapsed && "*:last:data-[slot=icon]:ml-auto *:last:data-[slot=icon]:size-5 sm:*:last:data-[slot=icon]:size-4",
		// Avatar
		"*:data-[slot=avatar]:-m-0.5 *:data-[slot=avatar]:size-7 sm:*:data-[slot=avatar]:size-6",
		// Hover
		"data-hover:bg-zinc-950/5 data-hover:text-zinc-950 data-hover:*:data-[slot=icon]:fill-zinc-700",
		// Active
		"data-active:bg-zinc-950/5 data-active:*:data-[slot=icon]:fill-zinc-950",
		// Current
		"data-current:bg-zinc-950/6 data-current:text-zinc-950 data-current:font-bold data-current:*:data-[slot=icon]:fill-zinc-950",
		// Dark mode
		"dark:text-zinc-300 dark:*:data-[slot=icon]:fill-zinc-400",
		"dark:data-hover:bg-white/5 dark:data-hover:text-white dark:data-hover:*:data-[slot=icon]:fill-zinc-200",
		"dark:data-active:bg-white/5 dark:data-active:*:data-[slot=icon]:fill-white",
		"dark:data-current:bg-white/6 dark:data-current:text-white dark:data-current:font-bold dark:data-current:*:data-[slot=icon]:fill-white"
	);

	const titleProp = collapsed && tooltip ? { title: tooltip } : {};

	return (
		<span className={clsx(className, "relative")} {...titleProp}>
			{current && !collapsed && (
				<span className="absolute inset-y-1.5 -left-4 w-0.75 rounded-full bg-zinc-950 dark:bg-white" />
			)}
			{typeof props.href === "string" ? (
				<Headless.CloseButton
					as={Link}
					{...props}
					className={classes}
					data-current={current ? "true" : undefined}
					ref={ref}
				>
					<TouchTarget>{children}</TouchTarget>
				</Headless.CloseButton>
			) : (
				<Headless.Button
					{...props}
					className={clsx("cursor-default", classes)}
					data-current={current ? "true" : undefined}
					ref={ref}
				>
					<TouchTarget>{children}</TouchTarget>
				</Headless.Button>
			)}
		</span>
	);
});

export function SidebarLabel({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
	const collapsed = useContext(SidebarCollapsedContext);
	if (collapsed) return null;
	return <span {...props} className={clsx(className, "truncate")} />;
}

export function SidebarCollapseButton() {
	const { toggle } = useSidebarCollapsed();

	return (
		<button
			type="button"
			onClick={toggle}
			title="Toggle sidebar (Ctrl+B)"
			aria-label="Toggle sidebar"
			className="flex size-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-950/5 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-300"
		>
			<Bars3BottomLeftIcon className="size-4" />
		</button>
	);
}
