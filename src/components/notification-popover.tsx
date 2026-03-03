import { ArchiveBoxIcon, BellSlashIcon, CheckIcon, InboxIcon, TrashIcon } from "@heroicons/react/16/solid";
import {
	BellAlertIcon,
	BellIcon,
	CurrencyDollarIcon,
	ExclamationTriangleIcon,
	MegaphoneIcon,
	ShieldCheckIcon,
	UserGroupIcon,
} from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import { useNotificationStream } from "@/components/notification-stream-provider";
import {
	useArchiveNotifications,
	useDeleteNotifications,
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
} from "@/features/notifications/hooks";

// =============================================================================
// TYPES
// =============================================================================

type Notification = {
	id: string;
	type?: string;
	title?: string;
	body?: string | null;
	actionUrl?: string | null;
	imageUrl?: string | null;
	isRead?: boolean;
	createdAt?: string;
};

// =============================================================================
// NOTIFICATION ICON BY TYPE
// =============================================================================

function NotificationIcon({ type }: { type?: string }) {
	const iconClass = "size-4";

	switch (type) {
		case "campaign_approved":
		case "campaign_completed":
		case "campaign_started":
			return <MegaphoneIcon className={`${iconClass} text-blue-500`} />;
		case "payout_processed":
		case "payment_received":
		case "withdrawal_completed":
			return <CurrencyDollarIcon className={`${iconClass} text-emerald-500`} />;
		case "enrollment_approved":
		case "enrollment_submitted":
		case "new_enrollment":
			return <UserGroupIcon className={`${iconClass} text-violet-500`} />;
		case "kyc_approved":
		case "verification_complete":
			return <ShieldCheckIcon className={`${iconClass} text-emerald-500`} />;
		case "kyc_rejected":
		case "campaign_rejected":
			return <ExclamationTriangleIcon className={`${iconClass} text-amber-500`} />;
		default:
			return <BellIcon className={`${iconClass} text-zinc-400 dark:text-zinc-500`} />;
	}
}

// =============================================================================
// TIME AGO
// =============================================================================

function timeAgo(dateStr?: string): string {
	if (!dateStr) return "";
	const now = Date.now();
	const then = new Date(dateStr).getTime();
	const diff = Math.max(0, now - then);
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return new Date(dateStr).toLocaleDateString();
}

// =============================================================================
// UNREAD BADGE
// =============================================================================

function UnreadBadge({ count }: { count: number }) {
	if (count <= 0) return null;
	return (
		<span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900">
			{count > 9 ? "9+" : count}
		</span>
	);
}

// =============================================================================
// NOTIFICATION ITEM
// =============================================================================

function NotificationItem({
	notification,
	onMarkRead,
	onArchive,
	onDelete,
}: {
	notification: Notification;
	onMarkRead: (id: string) => void;
	onArchive: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	return (
		<div
			className={`group relative flex gap-3 rounded-lg px-3 py-2.5 transition-colors ${
				notification.isRead
					? "hover:bg-zinc-50 dark:hover:bg-white/5"
					: "bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
			}`}
		>
			{/* Icon */}
			<div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700/50">
				<NotificationIcon type={notification.type} />
			</div>

			{/* Content */}
			<div className="min-w-0 flex-1">
				<p
					className={`text-sm leading-snug ${
						notification.isRead ? "text-zinc-600 dark:text-zinc-400" : "font-medium text-zinc-900 dark:text-white"
					}`}
				>
					{notification.title || "Notification"}
				</p>
				{notification.body && (
					<p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-500">{notification.body}</p>
				)}
				<p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-600">{timeAgo(notification.createdAt)}</p>
			</div>

			{/* Unread dot */}
			{!notification.isRead && <div className="mt-2 size-2 shrink-0 rounded-full bg-blue-500" />}

			{/* Hover actions */}
			<div className="absolute right-2 top-2 hidden items-center gap-0.5 rounded-lg bg-white p-0.5 shadow-sm ring-1 ring-zinc-200/80 group-hover:flex dark:bg-zinc-700 dark:ring-zinc-600/50">
				{!notification.isRead && (
					<button
						type="button"
						onClick={() => onMarkRead(notification.id)}
						className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-white"
						title="Mark as read"
					>
						<CheckIcon className="size-3.5" />
					</button>
				)}
				<button
					type="button"
					onClick={() => onArchive(notification.id)}
					className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-white"
					title="Archive"
				>
					<ArchiveBoxIcon className="size-3.5" />
				</button>
				<button
					type="button"
					onClick={() => onDelete(notification.id)}
					className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:text-zinc-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
					title="Delete"
				>
					<TrashIcon className="size-3.5" />
				</button>
			</div>
		</div>
	);
}

// =============================================================================
// SHARED POPOVER HOOK (click-outside to close)
// =============================================================================

function usePopover() {
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

	return { open, setOpen, ref };
}

// =============================================================================
// NOTIFICATION POPOVER (Mobile Navbar)
// =============================================================================

export function NotificationPopoverNavbar({ organizationId }: { organizationId: string }) {
	const { open, setOpen, ref } = usePopover();
	const stream = useNotificationStream();

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				aria-label="Notifications"
				onClick={() => setOpen((v) => !v)}
				className="relative flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-950/5 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
			>
				<BellAlertIcon className="size-5" />
				<UnreadBadge count={stream.unreadCount} />
			</button>
			{open && (
				<div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:ring-white/10">
					<NotificationPanelContent
						organizationId={organizationId}
						notifications={stream.items}
						unreadCount={stream.unreadCount}
						onMarkRead={stream.markRead}
						onMarkAllRead={stream.markAllRead}
						onRemove={stream.removeItems}
						onClose={() => setOpen(false)}
					/>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// NOTIFICATION BELL (Desktop Content Header)
// =============================================================================

export function NotificationBell({ organizationId }: { organizationId: string }) {
	const { open, setOpen, ref } = usePopover();
	const stream = useNotificationStream();

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				aria-label="Notifications"
				onClick={() => setOpen((v) => !v)}
				className="relative flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-950/5 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-300"
			>
				<BellAlertIcon className="size-5" />
				<UnreadBadge count={stream.unreadCount} />
			</button>
			{open && (
				<div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:ring-white/10">
					<NotificationPanelContent
						organizationId={organizationId}
						notifications={stream.items}
						unreadCount={stream.unreadCount}
						onMarkRead={stream.markRead}
						onMarkAllRead={stream.markAllRead}
						onRemove={stream.removeItems}
						onClose={() => setOpen(false)}
					/>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// SHARED PANEL CONTENT
// =============================================================================

function NotificationPanelContent({
	organizationId,
	notifications,
	unreadCount,
	onMarkRead,
	onMarkAllRead,
	onRemove,
	onClose: _onClose,
}: {
	organizationId: string;
	notifications: Notification[];
	unreadCount: number;
	onMarkRead: (ids: string[]) => void;
	onMarkAllRead: () => void;
	onRemove: (ids: string[]) => void;
	onClose: () => void;
}) {
	const markReadMutation = useMarkNotificationRead(organizationId);
	const markAllReadMutation = useMarkAllNotificationsRead(organizationId);
	const archiveMutation = useArchiveNotifications(organizationId);
	const deleteMutation = useDeleteNotifications(organizationId);

	const handleMarkRead = (id: string) => {
		onMarkRead([id]);
		markReadMutation.mutate([id]);
	};

	const handleMarkAllRead = () => {
		onMarkAllRead();
		markAllReadMutation.mutate();
	};

	const handleArchive = (id: string) => {
		onRemove([id]);
		archiveMutation.mutate([id]);
	};

	const handleDelete = (id: string) => {
		onRemove([id]);
		deleteMutation.mutate([id]);
	};

	return (
		<div className="p-1">
			{/* Header */}
			<div className="flex items-center justify-between px-3 py-2.5">
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Notifications</h3>
					{unreadCount > 0 && (
						<span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
							{unreadCount}
						</span>
					)}
				</div>
				{unreadCount > 0 && (
					<button
						type="button"
						onClick={handleMarkAllRead}
						className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
					>
						Mark all read
					</button>
				)}
			</div>

			{/* Divider */}
			<div className="mx-3 border-t border-zinc-200/80 dark:border-zinc-700/80" />

			{notifications.length === 0 ? (
				/* Empty state */
				<div className="flex flex-col items-center px-4 py-10 text-center">
					<div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-700/50">
						<InboxIcon className="size-5 text-zinc-400 dark:text-zinc-500" />
					</div>
					<p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">All caught up</p>
					<p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">No new notifications right now</p>
				</div>
			) : (
				/* Notification list */
				<div className="max-h-80 overflow-y-auto py-1">
					{notifications.map((notification) => (
						<NotificationItem
							key={notification.id}
							notification={notification}
							onMarkRead={handleMarkRead}
							onArchive={handleArchive}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}

			{/* Footer */}
			{notifications.length > 0 && (
				<>
					<div className="mx-3 border-t border-zinc-200/80 dark:border-zinc-700/80" />
					<div className="flex items-center justify-center px-3 py-2">
						<button
							type="button"
							onClick={handleMarkAllRead}
							disabled={unreadCount === 0}
							className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-white"
						>
							<BellSlashIcon className="mr-1 inline size-3.5" />
							Clear all unread
						</button>
					</div>
				</>
			)}
		</div>
	);
}
