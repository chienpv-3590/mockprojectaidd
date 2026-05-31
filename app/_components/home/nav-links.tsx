"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useI18n } from "@/lib/i18n/locale-context";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const ACTIVE_YELLOW = "#FFEA9E";

const NAV_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 600 as const,
  fontSize: "14px",
  letterSpacing: "0.3px",
};

// Shared nav config — also consumed by the footer so labels stay in sync.
// `labelKey` indexes into dict.nav so labels follow the active locale.
export const NAV_LINKS = [
  { labelKey: "about", href: "/" },
  { labelKey: "awardsInfo", href: "/he-thong-giai" },
  { labelKey: "kudos", href: "/sun-kudos" },
] as const;

export function normalizePath(p: string | null): string {
  if (!p) return "/";
  return p.length > 1 ? p.replace(/\/$/, "") : p;
}

/**
 * Click handler factory: when the user clicks a nav link that already
 * matches the current pathname, prevent default and smooth-scroll to top
 * (per design A1.2 — "Nếu đang selected, click vào button thì scroll lên
 * đầu trang"). Otherwise let Next.js navigate normally.
 */
export function makeNavClickHandler(active: boolean) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (!active) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
}

// Per design Button-IC hover state: bg rgba(255,234,158,0.1) + 16px padding
// + 4px gap + 56px height. Padding is applied always (so the layout doesn't
// shift on hover); only the background fades in on hover.
const BUTTON_IC_CLASS =
  "inline-flex h-14 items-center gap-1 px-4 transition hover:bg-[rgba(255,234,158,0.1)]";

export function NavLinks() {
  const pathname = normalizePath(usePathname());
  const { dict } = useI18n();
  return (
    <nav aria-label="Main" className="hidden lg:flex items-center gap-2">
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.labelKey}
            href={link.href}
            aria-current={active ? "page" : undefined}
            onClick={makeNavClickHandler(active)}
            style={{ ...NAV_STYLE, color: active ? ACTIVE_YELLOW : "#FFFFFF" }}
            className={
              active
                ? `${BUTTON_IC_CLASS} border-b-2 border-[#FFEA9E]`
                : BUTTON_IC_CLASS
            }
          >
            {dict.nav[link.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}
