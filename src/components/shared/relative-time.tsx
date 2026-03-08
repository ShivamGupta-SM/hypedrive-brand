import { useEffect, useState } from "react";
import { formatDate } from "@/lib/design-tokens";

/**
 * Compute relative time string from a date.
 * Extracted so it can be used by both this component and notification-popover's timeAgo.
 */
export function computeRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

/**
 * SSR-safe relative time display.
 *
 * Renders a stable absolute date on server (and during hydration),
 * then switches to relative time on the client after mount.
 * Auto-updates every 30 seconds.
 */
export function RelativeTime({ date, className, live = true }: { date: string; className?: string; live?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!live) return;
    const id = setInterval(() => tick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [live]);

  const text = mounted ? computeRelativeTime(date) : formatDate(date);
  // Use deterministic formatDate on server; locale-aware toLocaleString only after mount
  const tooltip = mounted ? new Date(date).toLocaleString() : formatDate(date);

  return (
    <time dateTime={date} className={className} title={tooltip}>
      {text}
    </time>
  );
}
