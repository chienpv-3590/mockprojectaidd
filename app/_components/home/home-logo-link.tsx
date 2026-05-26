"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { makeNavClickHandler, normalizePath } from "./nav-links";

const ASSETS = "/home";

type HomeLogoLinkProps = {
  size: "header" | "footer";
};

/**
 * Logo link that scrolls to top when clicked while already on the home page
 * (design A1.1 — "Click: về trang chủ (đầu trang)"). On other routes it
 * navigates to "/" normally.
 */
export function HomeLogoLink({ size }: HomeLogoLinkProps) {
  const pathname = normalizePath(usePathname());
  const active = pathname === "/";
  const dimensions =
    size === "header" ? { width: 52, height: 48, cls: "h-12 w-auto" } : { width: 52, height: 48, cls: "h-10 w-auto" };

  return (
    <Link
      href="/"
      aria-label="Sun* Annual Awards 2025 — Home"
      onClick={makeNavClickHandler(active)}
      className={size === "header" ? "shrink-0" : undefined}
    >
      <Image
        src={`${ASSETS}/logo.png`}
        alt="Sun* Annual Awards 2025"
        width={dimensions.width}
        height={dimensions.height}
        priority={size === "header"}
        className={dimensions.cls}
      />
    </Link>
  );
}
