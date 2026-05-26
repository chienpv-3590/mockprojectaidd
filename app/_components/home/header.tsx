import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { NavLinks } from "./nav-links";

const ASSETS = "/home";

type HeaderProps = {
  languageSlot?: ReactNode;
  notificationSlot?: ReactNode;
  userSlot?: ReactNode;
};

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
        <NavLinks />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {notificationSlot}
        {languageSlot}
        {userSlot}
      </div>
    </header>
  );
}
