import { CheckIcon, MinusIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";

interface SelectionCheckboxProps {
	selected: boolean;
	onToggle: (e: React.MouseEvent) => void;
	/**
	 * "overlay" — absolute top-left on a card. Hidden until parent `group` hover.
	 * "inline"  — inline in a flex row. Visible by default.
	 */
	variant?: "overlay" | "inline";
	/** Show a dash instead of a check (partial / indeterminate selection) */
	indeterminate?: boolean;
	/** Extra unselected-state classes (e.g. "opacity-0 group-hover/row:opacity-100") */
	className?: string;
}

const BASE = "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all";
const FILLED = "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white";
const EMPTY = "border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-800";
const ICON = "size-3 text-white dark:text-zinc-900";

export function SelectionCheckbox({ selected, onToggle, variant = "overlay", indeterminate, className }: SelectionCheckboxProps) {
	const isFilled = selected || indeterminate;

	return (
		<button
			type="button"
			onClick={onToggle}
			className={clsx(
				BASE,
				variant === "overlay" && "absolute left-2 top-2 z-10",
				isFilled ? FILLED : [EMPTY, variant === "overlay" && "opacity-0 group-hover:opacity-100 group-hover/card:opacity-100 group-hover/row:opacity-100", className],
			)}
		>
			{selected && <CheckIcon className={ICON} />}
			{!selected && indeterminate && <MinusIcon className={ICON} />}
		</button>
	);
}

export function SelectionCheckboxSpacer() {
	return <div className="size-5 shrink-0" />;
}
