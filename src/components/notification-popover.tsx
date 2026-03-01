import { InboxIcon } from "@heroicons/react/16/solid";
import { BellAlertIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";

// =============================================================================
// NOTIFICATION POPOVER (Mobile Navbar)
// =============================================================================

export function NotificationPopoverNavbar() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				aria-label="Notifications"
				onClick={() => setOpen((v) => !v)}
				className="relative flex items-center rounded-lg p-2 text-zinc-500 hover:bg-zinc-950/5 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white"
			>
				<BellAlertIcon className="size-5" />
			</button>
			{open && (
				<div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:ring-white/10">
					<NotificationPanelContent onClose={() => setOpen(false)} />
				</div>
			)}
		</div>
	);
}

// =============================================================================
// NOTIFICATION BELL (Desktop Content Header)
// =============================================================================

export function NotificationBell() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open]);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				aria-label="Notifications"
				onClick={() => setOpen((v) => !v)}
				className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-950/5 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-300"
			>
				<BellAlertIcon className="size-5" />
			</button>
			{open && (
				<div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:ring-white/10">
					<NotificationPanelContent onClose={() => setOpen(false)} />
				</div>
			)}
		</div>
	);
}

// =============================================================================
// SHARED PANEL CONTENT
// =============================================================================

function NotificationPanelContent({ onClose: _onClose }: { onClose: () => void }) {
	return (
		<div className="p-1">
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2.5">
				<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Notifications</h3>
				<button
					type="button"
					className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
				>
					Mark all read
				</button>
			</div>

			{/* Divider */}
			<div className="mx-3 border-t border-zinc-200/80 dark:border-zinc-700/80" />

			{/* Empty state */}
			<div className="flex flex-col items-center px-4 py-10 text-center">
				<div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-700/50">
					<InboxIcon className="size-5 text-zinc-400 dark:text-zinc-500" />
				</div>
				<p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">All caught up</p>
				<p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">No new notifications right now</p>
			</div>
		</div>
	);
}
