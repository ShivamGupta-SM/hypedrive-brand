import {
	ArchiveBoxIcon,
	BellSlashIcon,
	CheckCircleIcon,
	CheckIcon,
	InboxIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import {
	BellAlertIcon,
	BellIcon,
	CurrencyDollarIcon,
	ExclamationTriangleIcon,
	MegaphoneIcon,
	ShieldCheckIcon,
	UserGroupIcon,
} from "@heroicons/react/20/solid";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Notification, useNotificationStream } from "@/components/notification-stream-provider";
import {
	useArchiveNotifications,
	useDeleteNotifications,
	useMarkAllNotificationsRead,
	useMarkNotificationRead,
} from "@/features/notifications/hooks";

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

type Tab = "all" | "unread";
const CLOSE_MS = 280;

const CATEGORY_LABELS: Record<string, string> = {
	campaign_approved: "Campaign",
	campaign_completed: "Campaign",
	campaign_started: "Campaign",
	campaign_rejected: "Campaign",
	payout_processed: "Payment",
	payment_received: "Payment",
	withdrawal_completed: "Withdrawal",
	enrollment_approved: "Enrollment",
	enrollment_submitted: "Enrollment",
	new_enrollment: "Enrollment",
	kyc_approved: "Verification",
	verification_complete: "Verification",
	kyc_rejected: "Verification",
};

// =============================================================================
// ICON CONFIG
// =============================================================================

const ICON_CONFIG: Record<string, { icon: typeof BellIcon; color: string; bg: string }> = {
	campaign_approved:    { icon: MegaphoneIcon,           color: "text-white", bg: "bg-blue-500 dark:bg-blue-600" },
	campaign_completed:   { icon: MegaphoneIcon,           color: "text-white", bg: "bg-blue-500 dark:bg-blue-600" },
	campaign_started:     { icon: MegaphoneIcon,           color: "text-white", bg: "bg-blue-500 dark:bg-blue-600" },
	campaign_rejected:    { icon: ExclamationTriangleIcon,  color: "text-white", bg: "bg-amber-500 dark:bg-amber-600" },
	payout_processed:     { icon: CurrencyDollarIcon,      color: "text-white", bg: "bg-emerald-500 dark:bg-emerald-600" },
	payment_received:     { icon: CurrencyDollarIcon,      color: "text-white", bg: "bg-emerald-500 dark:bg-emerald-600" },
	withdrawal_completed: { icon: CurrencyDollarIcon,      color: "text-white", bg: "bg-emerald-500 dark:bg-emerald-600" },
	enrollment_approved:  { icon: UserGroupIcon,           color: "text-white", bg: "bg-violet-500 dark:bg-violet-600" },
	enrollment_submitted: { icon: UserGroupIcon,           color: "text-white", bg: "bg-violet-500 dark:bg-violet-600" },
	new_enrollment:       { icon: UserGroupIcon,           color: "text-white", bg: "bg-violet-500 dark:bg-violet-600" },
	kyc_approved:         { icon: ShieldCheckIcon,         color: "text-white", bg: "bg-teal-500 dark:bg-teal-600" },
	verification_complete:{ icon: ShieldCheckIcon,         color: "text-white", bg: "bg-teal-500 dark:bg-teal-600" },
	kyc_rejected:         { icon: ExclamationTriangleIcon, color: "text-white", bg: "bg-red-500 dark:bg-red-600" },
};

const DEFAULT_ICON = {
	icon: BellIcon,
	color: "text-white",
	bg: "bg-zinc-500 dark:bg-zinc-600",
};

// =============================================================================
// NOTIFICATION VISUAL (icon or avatar)
// =============================================================================

function NotificationVisual({ type, imageUrl, isRead }: { type?: string; imageUrl?: string | null; isRead?: boolean }) {
	const config = (type && ICON_CONFIG[type]) || DEFAULT_ICON;
	const Icon = config.icon;

	if (imageUrl) {
		return (
			<div className="relative shrink-0">
				<img
					src={imageUrl}
					alt=""
					className="size-9 object-cover"
					style={{ borderRadius: "22%" }}
					onError={(e) => {
						(e.target as HTMLImageElement).style.display = "none";
						(e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
					}}
				/>
				{/* Type badge overlay */}
				<div className={`absolute -bottom-0.5 -right-0.5 flex size-4.5 items-center justify-center ${config.bg} ring-[1.5px] ring-white dark:ring-zinc-900`} style={{ borderRadius: "22%" }}>
					<Icon className={`size-2.5 ${config.color}`} />
				</div>
			</div>
		);
	}

	return (
		<div className={`flex size-9 shrink-0 items-center justify-center ${config.bg} ${isRead ? "opacity-75" : ""}`} style={{ borderRadius: "22%" }}>
			<Icon className={`size-4.5 ${config.color}`} />
		</div>
	);
}

// =============================================================================
// TIME UTILS
// =============================================================================

function timeAgo(dateStr?: string): string {
	if (!dateStr) return "";
	const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
	const min = Math.floor(diff / 60000);
	if (min < 1) return "now";
	if (min < 60) return `${min}m`;
	const hrs = Math.floor(min / 60);
	if (hrs < 24) return `${hrs}h`;
	const days = Math.floor(hrs / 24);
	if (days < 7) return `${days}d`;
	return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function useTimeTick() {
	const [, setTick] = useState(0);
	useEffect(() => {
		const id = setInterval(() => setTick((t) => t + 1), 30_000);
		return () => clearInterval(id);
	}, []);
}

function getDateGroup(dateStr?: string): string {
	if (!dateStr) return "Older";
	const now = new Date();
	const date = new Date(dateStr);
	const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
	if (diffDays === 0 && now.getDate() === date.getDate()) return "Today";
	if (diffDays <= 1 && now.getDate() - date.getDate() === 1) return "Yesterday";
	if (diffDays < 7) return "This Week";
	return "Older";
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
	const groups: Record<string, Notification[]> = {};
	const order = ["Today", "Yesterday", "This Week", "Older"];
	for (const n of notifications) {
		const g = getDateGroup(n.createdAt);
		if (!groups[g]) groups[g] = [];
		groups[g].push(n);
	}
	return order.filter((l) => groups[l]?.length).map((l) => ({ label: l, items: groups[l] }));
}

// =============================================================================
// UNREAD BADGE
// =============================================================================

function UnreadBadge({ count }: { count: number }) {
	if (count <= 0) return null;
	return (
		<span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 text-[10px] font-bold tabular-nums text-white ring-2 ring-white dark:ring-zinc-900">
			{count > 99 ? "99+" : count}
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
	onNavigate,
}: {
	notification: Notification;
	onMarkRead: (id: string) => void;
	onArchive: (id: string) => void;
	onDelete: (id: string) => void;
	onNavigate: (url: string) => void;
}) {
	const [dismissed, setDismissed] = useState(false);

	const handleArchive = useCallback(
		(id: string) => {
			setDismissed(true);
			setTimeout(() => onArchive(id), 250);
		},
		[onArchive],
	);

	const handleDelete = useCallback(
		(id: string) => {
			setDismissed(true);
			setTimeout(() => onDelete(id), 250);
		},
		[onDelete],
	);

	const handleClick = () => {
		if (!notification.isRead) onMarkRead(notification.id);
		if (notification.actionUrl) onNavigate(notification.actionUrl);
	};

	const category = notification.type ? CATEGORY_LABELS[notification.type] : undefined;

	return (
		<div
			className={`transition-all duration-250 ease-out ${dismissed ? "max-h-0 overflow-hidden opacity-0" : "max-h-52"}`}
		>
			<button
				type="button"
				onClick={handleClick}
				className={`group relative flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left shadow-sm transition-all duration-150 ${
					notification.actionUrl ? "cursor-pointer" : ""
				} ${
					notification.isRead
						? "border-zinc-200/60 bg-white shadow-zinc-950/3 hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800/40 dark:shadow-black/10 dark:hover:shadow-lg"
						: "border-zinc-200 bg-white shadow-zinc-950/5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:shadow-black/20 dark:hover:shadow-lg"
				}`}
			>
				{/* Icon/Avatar */}
				<NotificationVisual type={notification.type} imageUrl={notification.imageUrl} isRead={notification.isRead} />

				{/* Content */}
				<div className="min-w-0 flex-1">
					{/* Title + time + unread dot */}
					<div className="flex items-start justify-between gap-2">
						<div className="flex items-center gap-1.5">
							{!notification.isRead && (
								<span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-blue-500" />
							)}
							<p
								className={`text-[13px] leading-snug ${
									notification.isRead
										? "text-zinc-700 dark:text-zinc-200"
										: "font-semibold text-zinc-900 dark:text-white"
								}`}
							>
								{notification.title || "Notification"}
							</p>
						</div>
						<span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400">
							{timeAgo(notification.createdAt)}
						</span>
					</div>

					{/* Body */}
					{notification.body && (
						<p className={`mt-0.5 line-clamp-2 text-xs leading-relaxed ${
							notification.isRead
								? "text-zinc-500 dark:text-zinc-400"
								: "text-zinc-600 dark:text-zinc-300"
						}`}>
							{notification.body}
						</p>
					)}

					{/* Category tag */}
					{category && (
						<span className={`mt-1.5 inline-block text-[10px] font-semibold uppercase tracking-wider ${
							notification.isRead
								? "text-zinc-400 dark:text-zinc-500"
								: "text-zinc-500 dark:text-zinc-400"
						}`}>
							{category}
						</span>
					)}
				</div>

				{/* Hover action buttons — pinned top-right */}
				{/* biome-ignore lint/a11y/useKeyWithClickEvents: non-interactive wrapper stops click propagation */}
				{/* biome-ignore lint/a11y/noStaticElementInteractions: non-interactive wrapper stops click propagation */}
				<div
					onClick={(e) => e.stopPropagation()}
					className="pointer-events-none absolute right-1.5 top-1.5 flex items-center gap-px rounded-lg border border-zinc-200/80 bg-white p-0.5 opacity-0 shadow-sm transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 dark:border-zinc-600/60 dark:bg-zinc-800"
				>
					{!notification.isRead && (
						<button
							type="button"
							onClick={() => onMarkRead(notification.id)}
							className="rounded-md p-1 text-zinc-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
							title="Mark as read"
						>
							<CheckCircleIcon className="size-3.5" />
						</button>
					)}
					<button
						type="button"
						onClick={() => handleArchive(notification.id)}
						className="rounded-md p-1 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white"
						title="Archive"
					>
						<ArchiveBoxIcon className="size-3.5" />
					</button>
					<button
						type="button"
						onClick={() => handleDelete(notification.id)}
						className="rounded-md p-1 text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
						title="Delete"
					>
						<TrashIcon className="size-3.5" />
					</button>
				</div>
			</button>
		</div>
	);
}

// =============================================================================
// DRAWER SHELL
// =============================================================================

function NotificationDrawer({
	open,
	onClose,
	children,
}: {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) {
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (open) {
			setMounted(true);
			const t = setTimeout(() => setVisible(true), 20);
			return () => clearTimeout(t);
		} else {
			setVisible(false);
			const t = setTimeout(() => setMounted(false), CLOSE_MS);
			return () => clearTimeout(t);
		}
	}, [open]);

	// Scroll lock
	useEffect(() => {
		if (mounted) {
			const prev = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = prev;
			};
		}
	}, [mounted]);

	// Focus trap + Escape
	useEffect(() => {
		if (!visible || !panelRef.current) return;
		closeRef.current?.focus();

		const panel = panelRef.current;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}
			if (e.key !== "Tab") return;
			const els = panel.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			if (!els.length) return;
			const first = els[0];
			const last = els[els.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [visible, onClose]);

	if (!mounted) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Notifications">
			{/* Backdrop */}
			<button
				type="button"
				className={`absolute inset-0 transition-all ${
					visible
						? "bg-black/20 backdrop-blur-sm dark:bg-black/40"
						: "bg-transparent backdrop-blur-0"
				}`}
				style={{ transitionDuration: `${CLOSE_MS}ms` }}
				onClick={onClose}
				tabIndex={-1}
				aria-label="Close notifications"
			/>

			{/* Panel — sidebar-inspired: inset with rounded container */}
			<div
				ref={panelRef}
				className={`absolute inset-y-0 right-0 flex w-full max-w-105 p-2 transition-transform ${
					visible ? "translate-x-0" : "translate-x-full"
				}`}
				style={{
					transitionDuration: `${CLOSE_MS}ms`,
					transitionTimingFunction: visible
						? "cubic-bezier(0.16, 1, 0.3, 1)"
						: "cubic-bezier(0.4, 0, 0.2, 1)",
				}}
			>
				<div className="flex h-full flex-col rounded-2xl bg-white shadow-xl ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
					<button ref={closeRef} type="button" className="sr-only" onClick={onClose} tabIndex={0}>
						Close notifications
					</button>
					{children}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// DRAWER CONTENT
// =============================================================================

function NotificationDrawerContent({
	organizationId,
	notifications,
	unreadCount,
	connected,
	onMarkRead,
	onMarkAllRead,
	onRemove,
	onClose,
}: {
	organizationId: string;
	notifications: Notification[];
	unreadCount: number;
	connected: boolean;
	onMarkRead: (ids: string[]) => void;
	onMarkAllRead: () => void;
	onRemove: (ids: string[]) => void;
	onClose: () => void;
}) {
	const [activeTab, setActiveTab] = useState<Tab>("all");
	const scrollRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useTimeTick();

	const markReadMutation = useMarkNotificationRead(organizationId);
	const markAllReadMutation = useMarkAllNotificationsRead(organizationId);
	const archiveMutation = useArchiveNotifications(organizationId);
	const deleteMutation = useDeleteNotifications(organizationId);

	const handleMarkRead = useCallback(
		(id: string) => {
			onMarkRead([id]);
			markReadMutation.mutate([id]);
		},
		[onMarkRead, markReadMutation],
	);

	const handleMarkAllRead = useCallback(() => {
		onMarkAllRead();
		markAllReadMutation.mutate();
	}, [onMarkAllRead, markAllReadMutation]);

	const handleArchive = useCallback(
		(id: string) => {
			onRemove([id]);
			archiveMutation.mutate([id]);
		},
		[onRemove, archiveMutation],
	);

	const handleDelete = useCallback(
		(id: string) => {
			onRemove([id]);
			deleteMutation.mutate([id]);
		},
		[onRemove, deleteMutation],
	);

	const handleNavigate = useCallback(
		(url: string) => {
			onClose();
			navigate({ to: url });
		},
		[onClose, navigate],
	);

	const filtered = useMemo(
		() => (activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications),
		[activeTab, notifications],
	);
	const grouped = useMemo(() => groupByDate(filtered), [filtered]);

	return (
		<>
			{/* ── Header ── */}
			<div className="shrink-0 border-b border-zinc-200 dark:border-zinc-700/80">
				{/* Title row */}
				<div className="flex items-center justify-between px-5 pt-5 pb-4">
					<div className="flex items-center gap-2.5">
						<div className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
							<BellAlertIcon className="size-4 text-white dark:text-zinc-900" />
						</div>
						<div className="flex items-center gap-2">
							<h2 className="text-[15px] font-semibold text-zinc-900 dark:text-white">
								Notifications
							</h2>
							<span
								className={`size-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-zinc-400 dark:bg-zinc-500"}`}
								title={connected ? "Live" : "Reconnecting..."}
							/>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex size-8 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
					>
						<XMarkIcon className="size-4.5" />
					</button>
				</div>

				{/* Tab bar */}
				<div className="flex items-center gap-1 px-5 pb-0">
					<div className="flex gap-0.5">
						{(["all", "unread"] as Tab[]).map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setActiveTab(tab)}
								className={`relative flex items-center gap-1.5 rounded-t-md px-3 pb-2.5 pt-1 text-[13px] font-medium transition-colors ${
									activeTab === tab
										? "text-zinc-900 dark:text-white"
										: "text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
								}`}
							>
								{tab === "all" ? "All" : "Unread"}
								{tab === "unread" && unreadCount > 0 && (
									<span className="inline-flex min-w-4.5 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 px-1 py-px text-[10px] font-bold tabular-nums text-white">
										{unreadCount > 99 ? "99+" : unreadCount}
									</span>
								)}
								{activeTab === tab && (
									<span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-zinc-900 dark:bg-white" />
								)}
							</button>
						))}
					</div>

					{/* Mark all read */}
					{unreadCount > 0 && (
						<button
							type="button"
							onClick={handleMarkAllRead}
							className="ml-auto mb-1.5 flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
						>
							<CheckIcon className="size-3" />
							Mark all read
						</button>
					)}
				</div>
			</div>

			{/* ── Notification List ── */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
				{filtered.length === 0 ? (
					<div className="flex flex-col items-center px-6 pt-16 pb-6 text-center">
						<div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-200 dark:bg-zinc-800/60 dark:ring-zinc-700">
							{activeTab === "unread" ? (
								<BellSlashIcon className="size-7 text-zinc-400 dark:text-zinc-500" />
							) : (
								<InboxIcon className="size-7 text-zinc-400 dark:text-zinc-500" />
							)}
						</div>
						<p className="mt-5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
							{activeTab === "unread" ? "All caught up!" : "No notifications yet"}
						</p>
						<p className="mt-1.5 max-w-52 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
							{activeTab === "unread"
								? "You've read all your notifications."
								: "When something important happens, you'll see it here."}
						</p>
					</div>
				) : (
					<div className="px-2 py-1.5">
						{grouped.map((group) => (
							<div key={group.label}>
								{/* Date group header */}
								<div className="sticky top-0 z-10 flex items-center gap-3 bg-white/90 px-3 py-2 backdrop-blur-md dark:bg-zinc-900/90">
									<span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
										{group.label}
									</span>
									<div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700/80" />
									<span className="text-[10px] tabular-nums text-zinc-500 dark:text-zinc-500">
										{group.items.length}
									</span>
								</div>

								{/* Items */}
								<div className="space-y-1.5">
									{group.items.map((notification) => (
										<NotificationItem
											key={notification.id}
											notification={notification}
											onMarkRead={handleMarkRead}
											onArchive={handleArchive}
											onDelete={handleDelete}
											onNavigate={handleNavigate}
										/>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* ── Footer ── */}
			{notifications.length > 0 && (
				<div className="shrink-0 border-t border-zinc-200 dark:border-zinc-700/80">
					<div className="flex items-center justify-between px-5 py-2.5">
						<span className="text-[11px] tabular-nums text-zinc-600 dark:text-zinc-400">
							{notifications.length} notification{notifications.length !== 1 ? "s" : ""}
							{unreadCount > 0 && (
								<span className="ml-1 text-blue-600 dark:text-blue-400">
									({unreadCount} unread)
								</span>
							)}
						</span>
						{unreadCount > 0 && (
							<button
								type="button"
								onClick={handleMarkAllRead}
								className="rounded-md px-2 py-1 text-[11px] font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
							>
								Read all
							</button>
						)}
					</div>
				</div>
			)}
		</>
	);
}

// =============================================================================
// NOTIFICATION BELL (Desktop — Content Header)
// =============================================================================

export function NotificationBell({ organizationId }: { organizationId: string }) {
	const [open, setOpen] = useState(false);
	const stream = useNotificationStream();
	const prevCount = useRef(stream.unreadCount);
	const [ring, setRing] = useState(false);

	useEffect(() => {
		if (stream.unreadCount > prevCount.current) {
			setRing(true);
			const t = setTimeout(() => setRing(false), 600);
			prevCount.current = stream.unreadCount;
			return () => clearTimeout(t);
		}
		prevCount.current = stream.unreadCount;
	}, [stream.unreadCount]);

	return (
		<>
			<button
				type="button"
				aria-label="Notifications"
				onClick={() => setOpen(true)}
				className={`relative flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-zinc-950/5 hover:text-zinc-600 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-300 ${
					ring ? "animate-bell-ring" : ""
				}`}
			>
				{stream.unreadCount > 0 ? (
					<BellAlertIcon className="size-5" />
				) : (
					<BellIcon className="size-5" />
				)}
				<UnreadBadge count={stream.unreadCount} />
			</button>

			<NotificationDrawer open={open} onClose={() => setOpen(false)}>
				<NotificationDrawerContent
					organizationId={organizationId}
					notifications={stream.items}
					unreadCount={stream.unreadCount}
					connected={stream.connected}
					onMarkRead={stream.markRead}
					onMarkAllRead={stream.markAllRead}
					onRemove={stream.removeItems}
					onClose={() => setOpen(false)}
				/>
			</NotificationDrawer>
		</>
	);
}

// =============================================================================
// NOTIFICATION POPOVER (Mobile Navbar)
// =============================================================================

export function NotificationPopoverNavbar({ organizationId }: { organizationId: string }) {
	const [open, setOpen] = useState(false);
	const stream = useNotificationStream();

	return (
		<>
			<button
				type="button"
				aria-label="Notifications"
				onClick={() => setOpen(true)}
				className="relative flex size-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-950/5 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
			>
				{stream.unreadCount > 0 ? (
					<BellAlertIcon className="size-5" />
				) : (
					<BellIcon className="size-5" />
				)}
				<UnreadBadge count={stream.unreadCount} />
			</button>

			<NotificationDrawer open={open} onClose={() => setOpen(false)}>
				<NotificationDrawerContent
					organizationId={organizationId}
					notifications={stream.items}
					unreadCount={stream.unreadCount}
					connected={stream.connected}
					onMarkRead={stream.markRead}
					onMarkAllRead={stream.markAllRead}
					onRemove={stream.removeItems}
					onClose={() => setOpen(false)}
				/>
			</NotificationDrawer>
		</>
	);
}
