import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

const NAV_LINKS = [
  { label: "About SAA 2025", href: "#" },
  { label: "Awards Information", href: "#" },
  { label: "Voting Tickets", href: "#" },
  { label: "Sun* Kudos", href: "#" },
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

export function Header({ languageSlot, notificationSlot, userSlot }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex h-20 items-center justify-between px-6 py-3 backdrop-blur-md sm:px-10 lg:px-20"
      style={{ backgroundColor: "rgba(16, 20, 23, 0.8)" }}
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
        <nav aria-label="Main" className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={NAV_STYLE}
              className="text-white/85 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {languageSlot}
        {notificationSlot}
        {userSlot}
      </div>
    </header>
  );
}
