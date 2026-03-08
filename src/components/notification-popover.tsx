import * as Headless from "@headlessui/react";
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
  ArrowDownTrayIcon,
  BanknotesIcon,
  BellAlertIcon,
  BellIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  MegaphoneIcon,
  PauseCircleIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserPlusIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";
import { useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { type Notification, useNotificationStream } from "@/components/notification-stream-provider";
import {
  useArchiveNotifications,
  useDeleteNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/features/notifications/hooks";

// ─── Constants ───────────────────────────────────────────────────────────────

type Tab = "all" | "unread";

type IconCfg = { icon: typeof BellIcon; color: string; bg: string };

// Category groups — used for the tag label and prefix-based icon matching
const CATEGORY_GROUPS: Record<string, { label: string; config: IconCfg }> = {
  campaign: {
    label: "Campaign",
    config: { icon: MegaphoneIcon, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  },
  payment: {
    label: "Payment",
    config: {
      icon: CurrencyDollarIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
  },
  payout: {
    label: "Payment",
    config: {
      icon: BanknotesIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
  },
  withdrawal: {
    label: "Withdrawal",
    config: {
      icon: ArrowDownTrayIcon,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-500/10",
    },
  },
  enrollment: {
    label: "Enrollment",
    config: {
      icon: UserGroupIcon,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-50 dark:bg-violet-500/10",
    },
  },
  kyc: {
    label: "Verification",
    config: { icon: ShieldCheckIcon, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-500/10" },
  },
  verification: {
    label: "Verification",
    config: { icon: ShieldCheckIcon, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-500/10" },
  },
};

// Specific overrides for exact type matches (more specific icon per state)
const ICON_OVERRIDES: Record<string, IconCfg> = {
  // Campaign states
  campaign_approved: {
    icon: CheckBadgeIcon,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  campaign_completed: {
    icon: MegaphoneIcon,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
  },
  campaign_started: {
    icon: RocketLaunchIcon,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-500/10",
  },
  campaign_live: {
    icon: RocketLaunchIcon,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-500/10",
  },
  campaign_paused: {
    icon: PauseCircleIcon,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-500/10",
  },
  campaign_rejected: {
    icon: XCircleIcon,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
  campaign_new: {
    icon: MegaphoneIcon,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  new_campaign: {
    icon: MegaphoneIcon,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  // Payments
  payout_processed: {
    icon: BanknotesIcon,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  payment_received: {
    icon: CurrencyDollarIcon,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  withdrawal_completed: {
    icon: ArrowDownTrayIcon,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-500/10",
  },
  // Enrollments
  enrollment_approved: {
    icon: CheckBadgeIcon,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
  enrollment_submitted: {
    icon: UserGroupIcon,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
  new_enrollment: {
    icon: UserPlusIcon,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-500/10",
  },
  // Verification
  kyc_approved: {
    icon: ShieldCheckIcon,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-500/10",
  },
  verification_complete: {
    icon: ShieldCheckIcon,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-500/10",
  },
  kyc_rejected: {
    icon: ExclamationTriangleIcon,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-500/10",
  },
  // Welcome
  welcome: { icon: BellAlertIcon, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
};

const DEFAULT_ICON: IconCfg = {
  icon: BellIcon,
  color: "text-zinc-500 dark:text-zinc-400",
  bg: "bg-zinc-100 dark:bg-zinc-800",
};

/** Resolve icon config: exact match → prefix match → title heuristic → default */
function getIconConfig(type?: string, title?: string): IconCfg {
  if (type) {
    // 1. Exact match
    if (ICON_OVERRIDES[type]) return ICON_OVERRIDES[type];
    // 2. Prefix match (e.g. "campaign_xyz" → campaign group)
    const prefix = type.split("_")[0];
    if (CATEGORY_GROUPS[prefix]) return CATEGORY_GROUPS[prefix].config;
  }
  // 3. Title-based heuristic for unknown types
  if (title) {
    const lower = title.toLowerCase();
    if (lower.includes("campaign") || lower.includes("live")) {
      if (lower.includes("paused")) return ICON_OVERRIDES.campaign_paused;
      if (lower.includes("live") || lower.includes("started")) return ICON_OVERRIDES.campaign_live;
      if (lower.includes("new") || lower.includes("available")) return ICON_OVERRIDES.campaign_new;
      return CATEGORY_GROUPS.campaign.config;
    }
    if (lower.includes("payment") || lower.includes("payout")) return CATEGORY_GROUPS.payment.config;
    if (lower.includes("withdrawal")) return CATEGORY_GROUPS.withdrawal.config;
    if (lower.includes("enrollment")) return CATEGORY_GROUPS.enrollment.config;
    if (lower.includes("verification") || lower.includes("kyc")) return CATEGORY_GROUPS.verification.config;
    if (lower.includes("welcome")) return ICON_OVERRIDES.welcome;
  }
  return DEFAULT_ICON;
}

/** Resolve category label from type or title */
function getCategoryLabel(type?: string, title?: string): string | undefined {
  if (type) {
    const prefix = type.split("_")[0];
    if (CATEGORY_GROUPS[prefix]) return CATEGORY_GROUPS[prefix].label;
  }
  if (title) {
    const lower = title.toLowerCase();
    if (lower.includes("campaign")) return "Campaign";
    if (lower.includes("payment") || lower.includes("payout")) return "Payment";
    if (lower.includes("withdrawal")) return "Withdrawal";
    if (lower.includes("enrollment")) return "Enrollment";
    if (lower.includes("verification") || lower.includes("kyc")) return "Verification";
  }
  return undefined;
}

// ─── Icon / Avatar ───────────────────────────────────────────────────────────

function NotificationVisual({ type, title, imageUrl }: { type?: string; title?: string; imageUrl?: string | null }) {
  const config = getIconConfig(type, title);
  const Icon = config.icon;

  if (imageUrl) {
    return (
      <div className="relative shrink-0">
        <img
          src={imageUrl}
          alt=""
          className="size-10 rounded-full object-cover ring-1 ring-zinc-950/5 dark:ring-white/10"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
          }}
        />
        <div
          className={clsx(
            "absolute -bottom-0.5 -right-0.5 flex size-4.5 items-center justify-center rounded-full ring-2 ring-white dark:ring-zinc-900",
            config.bg
          )}
        >
          <Icon className={clsx("size-2.5", config.color)} />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex size-10 shrink-0 items-center justify-center rounded-xl", config.bg)}>
      <Icon className={clsx("size-5", config.color)} />
    </div>
  );
}

// ─── Time ────────────────────────────────────────────────────────────────────

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
  // Compare calendar dates (not timestamps) to handle month boundaries correctly
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((todayStart.getTime() - dateStart.getTime()) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
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

// ─── Bell Badge ──────────────────────────────────────────────────────────────

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-600 text-[10px] font-bold tabular-nums text-white ring-2 ring-white dark:ring-zinc-900">
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ─── Notification Item ───────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 80;
const SWIPE_DISMISS_THRESHOLD = 140;

const NotificationItem = memo(function NotificationItem({
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
  const itemRef = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);

  // Swipe — uses direct DOM manipulation during move for 0 re-renders, only setState on end
  const touchRef = useRef<{
    startX: number;
    startY: number;
    swiping: boolean;
    locked: boolean;
    currentX: number;
  }>({ startX: 0, startY: 0, swiping: false, locked: false, currentX: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const archiveBgRef = useRef<HTMLDivElement>(null);
  const readBgRef = useRef<HTMLDivElement>(null);
  const swipedRef = useRef(false);

  const animateOut = useCallback((callback: (id: string) => void, id: string) => {
    setLeaving(true);
    const el = itemRef.current;
    if (el) {
      let called = false;
      const fire = () => {
        if (called) return;
        called = true;
        el.removeEventListener("transitionend", onEnd);
        callback(id);
      };
      const onEnd = (e: TransitionEvent) => {
        if (e.target === el) fire();
      };
      el.addEventListener("transitionend", onEnd);
      setTimeout(fire, 300);
    } else {
      callback(id);
    }
  }, []);

  const handleArchive = useCallback((id: string) => animateOut(onArchive, id), [onArchive, animateOut]);

  const handleDelete = useCallback((id: string) => animateOut(onDelete, id), [onDelete, animateOut]);

  const handleClick = () => {
    if (swipedRef.current) return;
    if (!notification.isRead) onMarkRead(notification.id);
    if (notification.actionUrl) onNavigate(notification.actionUrl);
  };

  // Apply swipe visuals directly to DOM (no re-renders)
  const applySwipeDOM = useCallback(
    (x: number) => {
      const card = cardRef.current;
      const archBg = archiveBgRef.current;
      const readBg = readBgRef.current;
      if (!card) return;

      card.style.transform = x !== 0 ? `translateX(${x}px)` : "";
      card.style.transition = "none";

      if (archBg) {
        const show = x < -20;
        const dismiss = Math.abs(x) > SWIPE_DISMISS_THRESHOLD;
        archBg.style.width = `${Math.max(0, -x)}px`;
        archBg.style.opacity = show ? "1" : "0";
        archBg.className = clsx(
          "absolute inset-y-0 right-0 flex items-center justify-end rounded-xl px-5",
          dismiss ? "bg-amber-500 dark:bg-amber-600" : "bg-amber-100 dark:bg-amber-500/20"
        );
        const icon = archBg.firstElementChild as HTMLElement | null;
        if (icon) {
          icon.className = clsx("size-5", dismiss ? "scale-110 text-white" : "text-amber-600 dark:text-amber-400");
        }
      }

      if (readBg) {
        const show = x > 20 && !notification.isRead;
        const active = x > SWIPE_THRESHOLD;
        readBg.style.width = `${Math.max(0, x)}px`;
        readBg.style.opacity = show ? "1" : "0";
        readBg.className = clsx(
          "absolute inset-y-0 left-0 flex items-center justify-start rounded-xl px-5",
          active ? "bg-blue-500 dark:bg-blue-600" : "bg-blue-100 dark:bg-blue-500/20"
        );
        const icon = readBg.firstElementChild as HTMLElement | null;
        if (icon) {
          icon.className = clsx("size-5", active ? "scale-110 text-white" : "text-blue-600 dark:text-blue-400");
        }
      }
    },
    [notification.isRead]
  );

  // Reset DOM to neutral (with spring-back transition)
  const resetSwipeDOM = useCallback(() => {
    const card = cardRef.current;
    if (card) {
      card.style.transition = "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)";
      card.style.transform = "";
    }
    if (archiveBgRef.current) {
      archiveBgRef.current.style.opacity = "0";
      archiveBgRef.current.style.width = "0";
    }
    if (readBgRef.current) {
      readBgRef.current.style.opacity = "0";
      readBgRef.current.style.width = "0";
    }
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchRef.current = { startX: touch.clientX, startY: touch.clientY, swiping: false, locked: false, currentX: 0 };
    swipedRef.current = false;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const t = touchRef.current;
      const touch = e.touches[0];
      const dx = touch.clientX - t.startX;
      const dy = touch.clientY - t.startY;

      if (!t.locked) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          t.locked = true;
          t.swiping = Math.abs(dx) > Math.abs(dy);
        }
        return;
      }

      if (!t.swiping) return;

      e.preventDefault();
      const clamped = Math.max(-SWIPE_DISMISS_THRESHOLD * 1.2, Math.min(SWIPE_DISMISS_THRESHOLD * 1.2, dx));
      t.currentX = clamped;
      applySwipeDOM(clamped);
    },
    [applySwipeDOM]
  );

  const onTouchEnd = useCallback(() => {
    const t = touchRef.current;
    if (!t.swiping) {
      resetSwipeDOM();
      return;
    }

    const x = t.currentX;

    if (x < -SWIPE_DISMISS_THRESHOLD) {
      // Swipe left → archive with fly-out
      swipedRef.current = true;
      const card = cardRef.current;
      if (card) {
        card.style.transition = "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)";
        card.style.transform = "translateX(-400px)";
      }
      setTimeout(() => handleArchive(notification.id), 200);
    } else if (x > SWIPE_THRESHOLD && !notification.isRead) {
      // Swipe right → mark as read
      swipedRef.current = true;
      resetSwipeDOM();
      onMarkRead(notification.id);
    } else {
      // Snap back
      resetSwipeDOM();
    }

    t.swiping = false;
  }, [notification.id, notification.isRead, handleArchive, onMarkRead, resetSwipeDOM]);

  const category = getCategoryLabel(notification.type, notification.title);
  const config = getIconConfig(notification.type, notification.title);

  return (
    <div
      ref={itemRef}
      className={clsx(
        "transition-[opacity,transform] duration-250 ease-in-out",
        leaving ? "pointer-events-none -translate-x-3 scale-[0.97] opacity-0" : "translate-x-0 scale-100 opacity-100"
      )}
    >
      {/* Swipe action backgrounds */}
      <div className="relative rounded-xl">
        {/* Archive bg (swipe left) */}
        <div
          ref={archiveBgRef}
          className="absolute inset-y-0 right-0 flex items-center justify-end overflow-hidden rounded-xl px-5 bg-amber-100 dark:bg-amber-500/20"
          style={{ width: 0, opacity: 0 }}
        >
          <ArchiveBoxIcon className="size-5 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Mark read bg (swipe right) */}
        <div
          ref={readBgRef}
          className="absolute inset-y-0 left-0 flex items-center justify-start rounded-xl px-5 bg-blue-100 dark:bg-blue-500/20"
          style={{ width: 0, opacity: 0 }}
        >
          <CheckCircleIcon className="size-5 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Main card */}
        {/* biome-ignore lint/a11y/useSemanticElements: div instead of button to avoid nested button violation */}
        <div
          ref={cardRef}
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={clsx(
            "group relative flex w-full items-start gap-3.5 rounded-xl border text-left transition-all duration-150",
            "px-4 py-3.5",
            notification.actionUrl && "cursor-pointer",
            notification.isRead
              ? "border-zinc-200/60 bg-white hover:border-zinc-300/80 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              : "border-zinc-200 bg-white shadow-sm hover:shadow-md dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:hover:border-zinc-600"
          )}
        >
          <NotificationVisual type={notification.type} title={notification.title} imageUrl={notification.imageUrl} />

          <div className="min-w-0 flex-1">
            {/* Title + time */}
            <div className="flex items-start justify-between gap-3">
              <p
                className={clsx(
                  "text-[13px] leading-snug",
                  notification.isRead
                    ? "text-zinc-600 dark:text-zinc-400"
                    : "font-medium text-zinc-900 dark:text-zinc-100"
                )}
              >
                {notification.title || "Notification"}
              </p>
              <span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                {timeAgo(notification.createdAt)}
              </span>
            </div>

            {/* Body */}
            {notification.body && (
              <p
                className={clsx(
                  "mt-1 line-clamp-2 text-xs leading-relaxed",
                  notification.isRead ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {notification.body}
              </p>
            )}

            {/* Category tag */}
            {category && (
              <span
                className={clsx(
                  "mt-2 inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-none",
                  config.bg,
                  config.color
                )}
              >
                {category}
              </span>
            )}
          </div>

          {/* Unread dot */}
          {!notification.isRead && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30" />
          )}

          {/* Quick actions (hover — desktop only) */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: wrapper stops propagation */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: wrapper stops propagation */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-none absolute right-2 top-2 flex items-center gap-px rounded-lg bg-white/95 p-0.5 opacity-0 shadow-lg ring-1 ring-zinc-950/5 backdrop-blur-sm transition-opacity duration-100 group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-zinc-800/95 dark:ring-white/10"
          >
            {!notification.isRead && (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                title="Mark as read"
              >
                <CheckCircleIcon className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => handleArchive(notification.id)}
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
              title="Archive"
            >
              <ArchiveBoxIcon className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(notification.id)}
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              title="Delete"
            >
              <TrashIcon className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Drawer Shell ────────────────────────────────────────────────────────────

function NotificationDrawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: (ready: boolean) => React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setReady(true), 350);
      return () => clearTimeout(t);
    }
    setReady(false);
  }, [open]);

  return (
    <Headless.Dialog open={open} onClose={onClose} className="relative z-50">
      <Headless.DialogBackdrop
        transition
        className="fixed inset-0 bg-zinc-950/25 transition data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in dark:bg-black/50"
      />
      <Headless.DialogPanel
        transition
        className={clsx(
          "fixed transition duration-300 ease-in-out",
          "inset-x-0 bottom-0 top-12 data-closed:translate-y-full",
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:w-full sm:max-w-md sm:p-2 sm:data-closed:translate-x-full sm:data-closed:translate-y-0",
          "lg:max-w-lg"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl sm:ring-1 sm:ring-zinc-950/5 dark:bg-zinc-900 dark:sm:ring-white/10">
          {children(ready)}
        </div>
      </Headless.DialogPanel>
    </Headless.Dialog>
  );
}

// ─── Drawer Content ──────────────────────────────────────────────────────────

function NotificationDrawerContent({
  organizationId,
  notifications,
  unreadCount,
  connected,
  onMarkRead,
  onMarkAllRead,
  onRemove,
  onRestoreSnapshot,
  onClose,
  ready,
}: {
  organizationId: string;
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
  onMarkRead: (ids: string[]) => void;
  onMarkAllRead: () => void;
  onRemove: (ids: string[]) => void;
  onRestoreSnapshot: (snapshot: { items: Notification[]; unreadCount: number }) => void;
  onClose: () => void;
  ready: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useTimeTick();

  const markReadMutation = useMarkNotificationRead(organizationId);
  const markAllReadMutation = useMarkAllNotificationsRead(organizationId);
  const archiveMutation = useArchiveNotifications(organizationId);
  const deleteMutation = useDeleteNotifications(organizationId);

  const snapshotRef = useRef<{ items: Notification[]; unreadCount: number } | null>(null);
  const saveSnapshot = useCallback(() => {
    snapshotRef.current = { items: notifications, unreadCount };
  }, [notifications, unreadCount]);

  const rollback = useCallback(
    (msg: string) => {
      if (snapshotRef.current) {
        onRestoreSnapshot(snapshotRef.current);
        snapshotRef.current = null;
      }
      toast.error(msg);
    },
    [onRestoreSnapshot]
  );

  const handleMarkRead = useCallback(
    (id: string) => {
      saveSnapshot();
      onMarkRead([id]);
      markReadMutation.mutate([id], { onError: () => rollback("Failed to mark as read") });
    },
    [onMarkRead, markReadMutation, saveSnapshot, rollback]
  );

  const handleMarkAllRead = useCallback(() => {
    saveSnapshot();
    onMarkAllRead();
    markAllReadMutation.mutate(undefined, { onError: () => rollback("Failed to mark all as read") });
  }, [onMarkAllRead, markAllReadMutation, saveSnapshot, rollback]);

  const handleArchive = useCallback(
    (id: string) => {
      saveSnapshot();
      onRemove([id]);
      archiveMutation.mutate([id], { onError: () => rollback("Failed to archive notification") });
      toast("Notification archived", { duration: 3000 });
    },
    [onRemove, archiveMutation, saveSnapshot, rollback]
  );

  const handleDelete = useCallback(
    (id: string) => {
      saveSnapshot();
      onRemove([id]);
      deleteMutation.mutate([id], { onError: () => rollback("Failed to delete notification") });
      toast("Notification deleted", { duration: 3000 });
    },
    [onRemove, deleteMutation, saveSnapshot, rollback]
  );

  const handleNavigate = useCallback(
    (url: string) => {
      onClose();
      navigate({ to: url });
    },
    [onClose, navigate]
  );

  const filtered = useMemo(
    () => (activeTab === "unread" ? notifications.filter((n) => !n.isRead) : notifications),
    [activeTab, notifications]
  );
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  let itemIndex = 0;

  return (
    <>
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-100 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-linear-to-br from-rose-500 via-red-500 to-orange-500 text-[10px] font-bold tabular-nums leading-none text-white shadow-sm shadow-red-500/30">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            <span
              className={clsx("size-1.5 rounded-full", connected ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600")}
              title={connected ? "Live" : "Reconnecting..."}
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* Tabs + mark all */}
        <div className="mt-4 flex items-end justify-between">
          <div className="flex gap-1.5">
            {(["all", "unread"] as Tab[]).map((tab) => {
              const isActive = activeTab === tab;
              const label = tab === "all" ? "All" : "Unread";
              const count = tab === "unread" && unreadCount > 0 ? (unreadCount > 99 ? "99+" : unreadCount) : undefined;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium shadow-sm ring-1 transition-all duration-200 ease-out active:scale-[0.97]",
                    isActive
                      ? "bg-zinc-900 text-white ring-zinc-900 shadow-md dark:bg-white dark:text-zinc-900 dark:ring-white"
                      : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:hover:bg-zinc-800"
                  )}
                >
                  {label}
                  {count !== undefined && (
                    <span
                      className={clsx(
                        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                        isActive
                          ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
                          : "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className={clsx(
                "mb-0.5 flex items-center gap-1 text-xs font-medium transition-colors",
                markAllReadMutation.isPending
                  ? "cursor-not-allowed text-zinc-300 dark:text-zinc-600"
                  : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
              )}
            >
              <CheckIcon className="size-3.5" />
              {markAllReadMutation.isPending ? "Marking..." : "Mark all read"}
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-8 pt-24 pb-8 text-center animate-scale-in">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/60">
              {activeTab === "unread" ? (
                <BellSlashIcon className="size-7 text-zinc-300 dark:text-zinc-600" />
              ) : (
                <InboxIcon className="size-7 text-zinc-300 dark:text-zinc-600" />
              )}
            </div>
            <p className="mt-5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {activeTab === "unread" ? "All caught up!" : "No notifications yet"}
            </p>
            <p className="mt-1.5 max-w-52 text-[13px] leading-relaxed text-zinc-400 dark:text-zinc-500">
              {activeTab === "unread"
                ? "You've read all your notifications."
                : "When something important happens, you'll see it here."}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {grouped.map((group) => (
              <div key={group.label}>
                {/* Date group header */}
                <div className="sticky top-0 z-10 flex items-center gap-3 bg-white/95 px-5 py-2.5 backdrop-blur-md sm:px-6 dark:bg-zinc-900/95">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {group.label}
                  </span>
                  <div className="h-px flex-1 bg-zinc-950/5 dark:bg-white/5" />
                  <span className="text-[10px] tabular-nums text-zinc-300 dark:text-zinc-600">
                    {group.items.length}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2 px-2.5 sm:px-3">
                  {group.items.map((notification) => {
                    const delay = Math.min(itemIndex * 30, 300);
                    itemIndex++;
                    return (
                      <div
                        key={notification.id}
                        className={clsx(
                          "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          ready ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
                        )}
                        style={{ transitionDelay: ready ? `${delay}ms` : "0ms" }}
                      >
                        <NotificationItem
                          notification={notification}
                          onMarkRead={handleMarkRead}
                          onArchive={handleArchive}
                          onDelete={handleDelete}
                          onNavigate={handleNavigate}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="shrink-0 border-t border-zinc-100 px-5 py-3 sm:px-6 dark:border-zinc-800">
          <p className="text-center text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            {unreadCount > 0 && <> · {unreadCount} unread</>}
          </p>
        </div>
      )}
    </>
  );
}

// ─── Bell Triggers ───────────────────────────────────────────────────────────

function BellButton({ organizationId, className }: { organizationId: string; className?: string }) {
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
        className={clsx(
          "relative flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
          ring && "animate-bell-ring",
          className
        )}
      >
        {stream.unreadCount > 0 ? <BellAlertIcon className="size-5" /> : <BellIcon className="size-5" />}
        <UnreadBadge count={stream.unreadCount} />
      </button>

      <NotificationDrawer open={open} onClose={() => setOpen(false)}>
        {(ready) => (
          <NotificationDrawerContent
            organizationId={organizationId}
            notifications={stream.items}
            unreadCount={stream.unreadCount}
            connected={stream.connected}
            onMarkRead={stream.markRead}
            onMarkAllRead={stream.markAllRead}
            onRemove={stream.removeItems}
            onRestoreSnapshot={stream.restoreSnapshot}
            onClose={() => setOpen(false)}
            ready={ready}
          />
        )}
      </NotificationDrawer>
    </>
  );
}

export function NotificationBell({ organizationId }: { organizationId: string }) {
  return <BellButton organizationId={organizationId} />;
}

export function NotificationPopoverNavbar({ organizationId }: { organizationId: string }) {
  return <BellButton organizationId={organizationId} />;
}
