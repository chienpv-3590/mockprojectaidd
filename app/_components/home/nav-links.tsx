"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const ACTIVE_YELLOW = "#FFEA9E";

const NAV_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 600 as const,
  fontSize: "14px",
  letterSpacing: "0.3px",
};

// Centralized nav config. `#` entries are intentional placeholders for routes
// not yet implemented (About SAA 2025); real routes use exact pathname match.
const NAV_LINKS = [
  { label: "About SAA 2025", href: "#" },
  { label: "Awards Information", href: "/he-thong-giai" },
  { label: "Sun* Kudos", href: "/sun-kudos" },
];

function normalizePath(p: string | null): string {
  if (!p) return "/";
  // Strip trailing slash except for root.
  return p.length > 1 ? p.replace(/\/$/, "") : p;
}

export function NavLinks() {
  const pathname = normalizePath(usePathname());
  return (
    <nav aria-label="Main" className="hidden lg:flex items-center gap-8">
      {NAV_LINKS.map((link) => {
        // Hash placeholders never match — they render in inactive style.
        const active = link.href !== "#" && pathname === link.href;
        return (
          <Link
            key={link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            style={{ ...NAV_STYLE, color: active ? ACTIVE_YELLOW : undefined }}
            className={
              active
                ? "border-b-2 border-[#FFEA9E] pb-1 transition"
                : "text-white/85 transition hover:text-white"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
