import * as Headless from "@headlessui/react";
import { forwardRef } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router";

// Extend LinkProps to accept both `href` (Next.js style) and `to` (React Router style)
type LinkProps = Omit<RouterLinkProps, "to"> & {
	href?: string;
	to?: string;
} & React.ComponentPropsWithoutRef<"a">;

export const Link = forwardRef(function Link(
	{ href, to, ...props }: LinkProps,
	ref: React.ForwardedRef<HTMLAnchorElement>
) {
	// Use `to` if provided, otherwise fall back to `href`
	const destination = to ?? href ?? "";

	return (
		<Headless.DataInteractive>
			<RouterLink {...props} to={destination} ref={ref} />
		</Headless.DataInteractive>
	);
});

// Re-export LinkProps for other components
export type { LinkProps };
