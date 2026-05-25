import Image from "next/image";
import Link from "next/link";

const ASSETS = "/home";
const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const FONT_MONTSERRAT_ALT = "var(--font-montserrat-alt), system-ui, sans-serif";

const FOOTER_LINKS = [
  { label: "About SAA 2025", href: "#" },
  { label: "Awards Information", href: "#" },
  { label: "Sun* Kudos", href: "#" },
  { label: "Tiêu chuẩn chung", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-[#00101A] px-6 py-10 text-white/80 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <Link href="/" aria-label="Sun* Annual Awards 2025 — Home">
          <Image
            src={`${ASSETS}/logo.png`}
            alt="Sun* Annual Awards 2025"
            width={52}
            height={48}
            className="h-10 w-auto"
          />
        </Link>
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-white/70 transition hover:text-white"
              style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 500 }}
            >
              {link.label}
            </Link>
          ))}
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
