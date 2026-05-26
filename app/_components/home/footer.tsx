"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS, makeNavClickHandler, normalizePath } from "./nav-links";
import { HomeLogoLink } from "./home-logo-link";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const FONT_MONTSERRAT_ALT = "var(--font-montserrat-alt), system-ui, sans-serif";

// Footer mirrors the header nav (per design item 7) + adds "Tiêu chuẩn chung"
// at the end. Keeping link config in nav-links.ts ensures both render the
// same labels and apply the same active-click-scroll-to-top behavior.
const FOOTER_LINKS = [
  ...NAV_LINKS,
  { label: "Tiêu chuẩn chung", href: "#" },
];

export function Footer() {
  const pathname = normalizePath(usePathname());
  return (
    <footer className="bg-[#00101A] px-6 py-10 text-white/80 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <HomeLogoLink size="footer" />
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-y-2"
        >
          {FOOTER_LINKS.map((link) => {
            const active = link.href !== "#" && pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={makeNavClickHandler(active)}
                style={{
                  fontFamily: FONT_MONTSERRAT,
                  fontWeight: 500,
                  fontSize: "14px",
                  color: active ? "#FFEA9E" : "#FFFFFF",
                }}
                className={
                  active
                    ? "inline-flex h-14 items-center gap-1 border-b-2 border-[#FFEA9E] px-4 transition hover:bg-[rgba(255,234,158,0.1)]"
                    : "inline-flex h-14 items-center gap-1 px-4 transition hover:bg-[rgba(255,234,158,0.1)]"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <p
          className="text-center text-xs text-white/60"
          style={{ fontFamily: FONT_MONTSERRAT_ALT, fontWeight: 700 }}
        >
          Bản quyền thuộc về Sun* © 2025
        </p>
      </div>
    </footer>
  );
}
