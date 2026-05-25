"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/_actions/sign-out";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

type UserMenuProps = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
};

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
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

  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 700 }}>{initial}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 min-w-[240px] overflow-hidden rounded-md border border-white/10 bg-[#0b1a26] shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-white">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 700 }}>{initial}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm text-white" style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}>
                {user.name}
              </p>
              <p className="truncate text-xs text-white/60" style={{ fontFamily: FONT_MONTSERRAT }}>
                {user.email}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-white/90 transition hover:bg-white/5"
              style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 500 }}
            >
              Đăng xuất
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
