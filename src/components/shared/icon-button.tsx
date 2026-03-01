import clsx from "clsx";
import { forwardRef } from "react";
import { Link } from "@/components/link";

const colorStyles = {
	zinc: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
	emerald: "bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400",
	amber: "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400",
	red: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400",
	sky: "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400",
} as const;

type Color = keyof typeof colorStyles;

interface IconButtonBaseProps {
	color?: Color;
	className?: string;
	children: React.ReactNode;
}

interface IconButtonAsButton
	extends IconButtonBaseProps,
		Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof IconButtonBaseProps> {
	href?: never;
}

interface IconButtonAsLink
	extends IconButtonBaseProps,
		Omit<React.ComponentPropsWithoutRef<typeof Link>, keyof IconButtonBaseProps> {
	href: string;
}

type IconButtonProps = IconButtonAsButton | IconButtonAsLink;

export const IconButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, IconButtonProps>(function IconButton(
	{ color = "zinc", className, children, ...props },
	ref
) {
	const classes = clsx(
		"inline-flex h-10 w-10 shrink-0 self-start items-center justify-center rounded-full shadow-sm transition-all hover:shadow-md disabled:opacity-50",
		colorStyles[color],
		className
	);

	if ("href" in props && props.href) {
		return (
			<Link
				ref={ref as React.Ref<HTMLAnchorElement>}
				className={classes}
				{...(props as React.ComponentPropsWithoutRef<typeof Link>)}
			>
				{children}
			</Link>
		);
	}

	return (
		<button
			ref={ref as React.Ref<HTMLButtonElement>}
			type="button"
			className={classes}
			{...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
		>
			{children}
		</button>
	);
});
