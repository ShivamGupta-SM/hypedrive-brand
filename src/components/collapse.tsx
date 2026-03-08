/**
 * Collapse — Smooth expand/collapse animation using CSS grid-rows trick.
 * No JS height measurement needed. Works with dynamic content.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <button onClick={() => setOpen(!open)}>Toggle</button>
 * <Collapse open={open}>
 *   <p>Content that smoothly appears/disappears</p>
 * </Collapse>
 */

import clsx from "clsx";
import type { ReactNode } from "react";

interface CollapseProps {
	open: boolean;
	children: ReactNode;
	className?: string;
	/** Duration in ms. Default 200. */
	duration?: number;
}

export function Collapse({ open, children, className, duration = 200 }: CollapseProps) {
	return (
		<div
			className={clsx("grid transition-[grid-template-rows,opacity] ease-out", className)}
			style={{
				gridTemplateRows: open ? "1fr" : "0fr",
				opacity: open ? 1 : 0,
				transitionDuration: `${duration}ms`,
			}}
		>
			<div className="overflow-hidden">{children}</div>
		</div>
	);
}
