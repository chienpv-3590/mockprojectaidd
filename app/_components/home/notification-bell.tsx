"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { markNotificationsRead } from "@/app/_actions/mark-notifications-read";
import type { AppNotification } from "@/lib/data/types";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

type NotificationBellProps = {
  initialNotifications: AppNotification[];
  initialUnreadCount: number;
};

export function NotificationBell({ initialNotifications, initialUnreadCount }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnreadCount);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      // Optimistic — clear badge immediately; persist in background.
      setUnread(0);
      startTransition(() => {
        markNotificationsRead().catch(console.error);
      });
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleToggle}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white/85 transition hover:bg-white/10"
      >
        <BellIcon />
        {unread > 0 && (
          <span
            aria-label={`${unread} unread`}
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 max-h-[420px] w-[340px] overflow-hidden rounded-md border border-white/10 bg-[#0b1a26] shadow-xl"
        >
          <div className="border-b border-white/10 px-4 py-3" style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}>
            <p className="text-sm text-white">Thông báo</p>
          </div>
          <ul className="max-h-[360px] overflow-y-auto">
            {initialNotifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-white/60" style={{ fontFamily: FONT_MONTSERRAT }}>
                Chưa có thông báo nào
              </li>
            ) : (
              initialNotifications.map((n) => (
                <li
                  key={n.id}
                  className="border-b border-white/5 px-4 py-3 last:border-b-0"
                  style={{ fontFamily: FONT_MONTSERRAT }}
                >
                  <p className="text-sm font-semibold text-white">{n.title}</p>
                  {n.body && <p className="mt-1 text-xs text-white/70">{n.body}</p>}
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/40">{formatRelative(n.created_at)}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" strokeLinecap="round" />
    </svg>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
