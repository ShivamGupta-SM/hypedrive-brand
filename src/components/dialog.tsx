import * as Headless from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import type React from "react";
import { Text } from "./text";

const sizes = {
	xs: "sm:max-w-xs",
	sm: "sm:max-w-sm",
	md: "sm:max-w-md",
	lg: "sm:max-w-lg",
	xl: "sm:max-w-xl",
	"2xl": "sm:max-w-2xl",
	"3xl": "sm:max-w-3xl",
	"4xl": "sm:max-w-4xl",
	"5xl": "sm:max-w-5xl",
};

export function Dialog({
	size = "lg",
	className,
	children,
	...props
}: { size?: keyof typeof sizes; className?: string; children: React.ReactNode } & Omit<
	Headless.DialogProps,
	"as" | "className"
>) {
	return (
		<Headless.Dialog {...props}>
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 z-50 flex w-screen justify-center overflow-y-auto bg-zinc-950/30 px-2 py-2 backdrop-blur-[3px] transition duration-300 focus:outline-0 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in sm:px-6 sm:py-8 lg:px-8 lg:py-16 dark:bg-zinc-950/60"
			/>

			<div className="fixed inset-0 z-50 w-screen overflow-y-auto pt-6 sm:pt-0">
				<div className="grid min-h-full grid-rows-[1fr_auto] justify-items-center sm:grid-rows-[1fr_auto_3fr] sm:p-4">
					<Headless.DialogPanel
						transition
						className={clsx(
							className,
							sizes[size],
							"row-start-2 w-full min-w-0 rounded-t-3xl bg-white p-(--gutter) shadow-2xl ring-1 ring-zinc-950/10 [--gutter:--spacing(7)] sm:mb-auto sm:rounded-2xl sm:[--gutter:--spacing(8)] dark:bg-zinc-900 dark:ring-white/10 forced-colors:outline",
							"transition duration-300 will-change-transform data-closed:translate-y-12 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in sm:data-closed:translate-y-0 sm:data-closed:data-enter:scale-95"
						)}
					>
						{children}
					</Headless.DialogPanel>
				</div>
			</div>
		</Headless.Dialog>
	);
}

export function DialogTitle({
	className,
	...props
}: { className?: string } & Omit<Headless.DialogTitleProps, "as" | "className">) {
	return (
		<Headless.DialogTitle
			{...props}
			className={clsx(className, "text-lg/6 font-semibold text-balance text-zinc-950 sm:text-base/6 dark:text-white")}
		/>
	);
}

export function DialogDescription({
	className,
	...props
}: { className?: string } & Omit<Headless.DescriptionProps<typeof Text>, "as" | "className">) {
	return <Headless.Description as={Text} {...props} className={clsx(className, "mt-2 text-pretty")} />;
}

export function DialogBody({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	return <div {...props} className={clsx(className, "mt-6")} />;
}

export function DialogActions({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div
			{...props}
			className={clsx(
				className,
				"-mx-(--gutter) -mb-(--gutter) mt-8 flex items-center justify-end gap-3 border-t border-zinc-950/5 bg-zinc-50/80 px-(--gutter) py-4 sm:rounded-b-2xl dark:border-white/5 dark:bg-zinc-950/30"
			)}
		/>
	);
}

/**
 * Standardized dialog header — full-width accent band with icon, title, description, and close button.
 * Bleeds to panel edges for a bold, polished look.
 */
export function DialogHeader({
	icon: Icon,
	iconColor = "zinc",
	title,
	description,
	onClose,
	className,
}: {
	icon: React.ComponentType<{ className?: string }>;
	iconColor?: "emerald" | "red" | "amber" | "sky" | "violet" | "zinc" | "blue";
	title: string;
	description?: string;
	onClose?: () => void;
	className?: string;
}) {
	const colorMap: Record<string, { band: string; iconBg: string; iconText: string }> = {
		emerald: {
			band: "bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20 dark:to-transparent",
			iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
			iconText: "text-emerald-600 dark:text-emerald-400",
		},
		red: {
			band: "bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/20 dark:to-transparent",
			iconBg: "bg-red-100 dark:bg-red-900/40",
			iconText: "text-red-600 dark:text-red-400",
		},
		amber: {
			band: "bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent",
			iconBg: "bg-amber-100 dark:bg-amber-900/40",
			iconText: "text-amber-600 dark:text-amber-400",
		},
		sky: {
			band: "bg-gradient-to-b from-sky-50/50 to-transparent dark:from-sky-950/20 dark:to-transparent",
			iconBg: "bg-sky-100 dark:bg-sky-900/40",
			iconText: "text-sky-600 dark:text-sky-400",
		},
		violet: {
			band: "bg-gradient-to-b from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent",
			iconBg: "bg-violet-100 dark:bg-violet-900/40",
			iconText: "text-violet-600 dark:text-violet-400",
		},
		zinc: {
			band: "bg-gradient-to-b from-zinc-100/40 to-transparent dark:from-zinc-800/30 dark:to-transparent",
			iconBg: "bg-zinc-100 dark:bg-zinc-800",
			iconText: "text-zinc-500 dark:text-zinc-400",
		},
		blue: {
			band: "bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent",
			iconBg: "bg-blue-100 dark:bg-blue-900/40",
			iconText: "text-blue-600 dark:text-blue-400",
		},
	};
	const { band, iconBg, iconText } = colorMap[iconColor] ?? colorMap.zinc;

	return (
		<div
			className={clsx(
				"-mx-(--gutter) -mt-(--gutter) rounded-t-3xl px-(--gutter) pb-4 pt-(--gutter) sm:rounded-t-2xl",
				band,
				className
			)}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3.5">
					<div className={clsx("flex size-11 shrink-0 items-center justify-center rounded-xl", iconBg)}>
						<Icon className={clsx("size-5", iconText)} />
					</div>
					<div className="min-w-0">
						<DialogTitle>{title}</DialogTitle>
						{description && <p className="mt-0.5 text-[13px]/5 text-zinc-500 dark:text-zinc-400">{description}</p>}
					</div>
				</div>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950/5 text-zinc-500 transition-colors hover:bg-zinc-950/10 hover:text-zinc-700 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-200"
					>
						<XMarkIcon className="size-4.5" />
					</button>
				)}
			</div>
		</div>
	);
}
