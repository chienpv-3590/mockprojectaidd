import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

const NAV_LINKS = [
  { label: "About SAA 2025", href: "#", active: true },
  { label: "Awards Information", href: "#", active: false },
  { label: "Sun* Kudos", href: "#", active: false },
];

type HeaderProps = {
  languageSlot?: ReactNode;
  notificationSlot?: ReactNode;
  userSlot?: ReactNode;
};

const NAV_STYLE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 600 as const,
  fontSize: "14px",
  letterSpacing: "0.3px",
};

const ACTIVE_YELLOW = "#FFEA9E";

export function Header({ languageSlot, notificationSlot, userSlot }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 py-3 backdrop-blur-md sm:px-10 lg:px-20"
      style={{ backgroundColor: "rgba(0, 16, 26, 0.6)" }}
    >
      <div className="flex items-center gap-10">
        <Link href="/" aria-label="Sun* Annual Awards 2025 — Home" className="shrink-0">
          <Image
            src={`${ASSETS}/logo.png`}
            alt="Sun* Annual Awards 2025"
            width={52}
            height={48}
            priority
            className="h-12 w-auto"
          />
        </Link>
        <nav aria-label="Main" className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{ ...NAV_STYLE, color: link.active ? ACTIVE_YELLOW : undefined }}
              className={
                link.active
                  ? "border-b-2 border-[#FFEA9E] pb-1 transition"
                  : "text-white/85 transition hover:text-white"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {notificationSlot}
        {languageSlot}
        {userSlot}
      </div>
    </header>
  );
}
