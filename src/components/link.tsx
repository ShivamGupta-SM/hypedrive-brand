import * as Headless from "@headlessui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import { forwardRef } from "react";

// Extend LinkProps to accept both `href` (Next.js style) and `to` (TanStack Router style)
// Using loose typing to support dynamic route paths
type LinkProps = {
	href?: string;
	to?: string;
	className?: string;
	children?: React.ReactNode;
	target?: string;
	rel?: string;
	onClick?: (e: React.MouseEvent) => void;
} & Omit<React.ComponentPropsWithoutRef<"a">, "href">;

export const Link = forwardRef(function Link(
	{ href, to, ...props }: LinkProps,
	ref: React.ForwardedRef<HTMLAnchorElement>
) {
	// Use `to` if provided, otherwise fall back to `href`
	const destination = to ?? href ?? "/";

	return (
		<Headless.DataInteractive>
			{/* biome-ignore lint/suspicious/noExplicitAny: Dynamic paths need loose typing for wrapper component */}
			<RouterLink {...props} to={destination as any} ref={ref} />
		</Headless.DataInteractive>
	);
});

// Re-export LinkProps for other components
export type { LinkProps };
