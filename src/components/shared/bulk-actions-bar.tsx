import { CheckIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface BulkActionsBarProps {
	selectedCount: number;
	onClear: () => void;
	children: React.ReactNode;
}

export function BulkActionsBar({ selectedCount, onClear, children }: BulkActionsBarProps) {
	const [visible, setVisible] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [displayCount, setDisplayCount] = useState(selectedCount);
	const prevCount = useRef(selectedCount);
	const [countBump, setCountBump] = useState(false);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (selectedCount > 0) {
			setVisible(true);
			// Trigger bump animation when count changes (but not on first appear)
			if (prevCount.current > 0 && selectedCount !== prevCount.current) {
				setCountBump(true);
			}
			setDisplayCount(selectedCount);
		}
		prevCount.current = selectedCount;
	}, [selectedCount]);

	useEffect(() => {
		if (selectedCount === 0) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClear();
		};
		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [selectedCount, onClear]);

	const handleAnimationEnd = () => {
		if (selectedCount === 0) setVisible(false);
	};

	if (!mounted || !visible) return null;

	const isOpen = selectedCount > 0;

	return createPortal(
		<div
			role="toolbar"
			aria-label={`${selectedCount} items selected`}
			data-bulk-bar
			data-state={isOpen ? "open" : "closed"}
			className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-4 sm:px-6 sm:pb-6 lg:left-(--sidebar-width,15rem)"
			onAnimationEnd={handleAnimationEnd}
		>
			<div style={{ borderRadius: 9999 }} className="flex items-stretch gap-1 border border-zinc-950/8 bg-white/90 p-1 shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-zinc-950/5 backdrop-blur-2xl backdrop-saturate-[1.8] sm:gap-1.5 sm:p-1.5 dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] dark:ring-white/5">
				{/* Count pill — indigo accent */}
				<div style={{ borderRadius: 9999 }} className="flex shrink-0 items-center gap-1.5 bg-indigo-600 px-2.5 text-xs/none font-semibold sm:px-3 dark:bg-indigo-500">
					<CheckIcon className="hidden size-3 text-indigo-200 sm:block dark:text-indigo-200" />
					<span
						className="tabular-nums text-white"
						data-bulk-count
						data-bump={countBump || undefined}
						onAnimationEnd={() => setCountBump(false)}
					>
						{displayCount}
					</span>
					<span className="hidden text-indigo-200 sm:block dark:text-indigo-200">
						selected
					</span>
				</div>

				{/* Separator */}
				<div className="my-1.5 w-px bg-zinc-950/8 dark:bg-white/10" />

				{/* Action buttons */}
				<div data-bulk-actions className="flex items-center gap-1 sm:gap-1.5">
					{children}
				</div>

				{/* Dismiss */}
				<button
					type="button"
					onClick={onClear}
					className="flex shrink-0 items-center justify-center self-center size-6 rounded-full bg-zinc-100 text-zinc-500 transition-all duration-150 hover:bg-zinc-200 hover:text-zinc-700 active:scale-90 dark:bg-white/10 dark:text-zinc-400 dark:hover:bg-white/15 dark:hover:text-zinc-300"
					aria-label="Clear selection"
				>
					<XMarkIcon className="size-3" />
				</button>
			</div>
		</div>,
		document.body,
	);
}
