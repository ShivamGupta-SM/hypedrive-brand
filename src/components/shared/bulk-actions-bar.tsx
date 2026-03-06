import { XMarkIcon } from "@heroicons/react/16/solid";
import { useEffect, useRef, useState } from "react";

interface BulkActionsBarProps {
	selectedCount: number;
	onClear: () => void;
	children: React.ReactNode;
}

export function BulkActionsBar({ selectedCount, onClear, children }: BulkActionsBarProps) {
	const [animate, setAnimate] = useState(false);
	const prevCount = useRef(selectedCount);

	useEffect(() => {
		if (selectedCount > 0 && prevCount.current === 0) setAnimate(true);
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

	if (selectedCount === 0) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-4 sm:px-6 sm:pb-6 lg:left-(--sidebar-width,15rem)">
			<div
				data-theme="dark"
				className={animate ? "animate-[slideUp_0.2s_ease-out]" : ""}
				onAnimationEnd={() => setAnimate(false)}
			>
				<div className="flex items-center gap-1 rounded-2xl bg-zinc-900 p-1.5 text-white shadow-[0_8px_30px_rgba(0,0,0,0.4)] ring-1 ring-white/10 sm:gap-1.5 sm:p-2">
					{/* Count */}
					<div className="flex shrink-0 items-center rounded-xl bg-white/10 px-2.5 py-1.5 sm:gap-2 sm:pr-3">
						<span className="flex size-5 items-center justify-center rounded-md bg-white text-[11px] font-bold tabular-nums text-zinc-900 sm:size-6 sm:rounded-lg sm:text-xs">
							{selectedCount}
						</span>
						<span className="hidden text-[13px] font-medium text-white/80 sm:block">selected</span>
					</div>

					{/* Actions */}
					<div data-bulk-actions className="flex items-center gap-1 sm:gap-1.5">
						{children}
					</div>

					{/* Dismiss */}
					<button
						type="button"
						onClick={onClear}
						className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-white/10 hover:text-white"
						aria-label="Clear selection"
					>
						<XMarkIcon className="size-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
