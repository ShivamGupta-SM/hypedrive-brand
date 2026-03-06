import { XMarkIcon } from "@heroicons/react/16/solid";

interface BulkActionsBarProps {
	selectedCount: number;
	onClear: () => void;
	children: React.ReactNode;
}

export function BulkActionsBar({ selectedCount, onClear, children }: BulkActionsBarProps) {
	if (selectedCount === 0) return null;

	return (
		<div className="fixed inset-x-0 bottom-6 z-30 lg:left-60">
			{/* Bar is always dark — force dark theme so child Buttons (outline, plain) render for dark bg */}
			<div
				data-theme="dark"
				className="mx-auto flex w-max items-center gap-3 rounded-xl bg-zinc-900 px-4 py-2.5 text-white shadow-2xl ring-1 ring-white/10"
			>
				<span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold tabular-nums">
					{selectedCount}
				</span>
				<span className="text-sm font-medium">{selectedCount} selected</span>
				<div className="mx-1 h-5 w-px bg-white/20" />
				<div className="flex items-center gap-1.5">{children}</div>
				<button
					type="button"
					onClick={onClear}
					className="rounded-full p-1 hover:bg-white/10"
					aria-label="Clear selection"
				>
					<XMarkIcon className="size-4" />
				</button>
			</div>
		</div>
	);
}
