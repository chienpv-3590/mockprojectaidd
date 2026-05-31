"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { setLocaleCookie } from "@/lib/i18n/set-locale-cookie";
import { useI18n } from "@/lib/i18n/locale-context";

type Code = "VN" | "EN";

/** Maps the display code to the URL/cookie locale code. */
const LANG_OF: Record<Code, "vi" | "en"> = { VN: "vi", EN: "en" };

const ASSETS = "/home";

const LOCALES: { code: Code; labelKey: "vietnamese" | "english"; flagSrc: string }[] = [
  { code: "VN", labelKey: "vietnamese", flagSrc: `${ASSETS}/flag-vn.svg` },
  { code: "EN", labelKey: "english", flagSrc: `${ASSETS}/flag-en.svg` },
];

const TRIGGER_STYLE = {
  fontFamily: "var(--font-montserrat), system-ui, sans-serif",
  fontWeight: 600 as const,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "0.15px",
};

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, dict } = useI18n();
  const [open, setOpen] = useState(false);
  // Selection follows the active locale (cookie-backed), so it stays correct
  // after navigating to a page whose URL no longer carries ?lang.
  const selected: Code = locale === "en" ? "EN" : "VN";
  const ref = useRef<HTMLDivElement>(null);

  const changeLocale = (code: Code) => {
    setOpen(false);
    const lang = LANG_OF[code];
    // Set the cookie first so the very next server render uses the new locale.
    setLocaleCookie(lang);
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", lang);
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  };

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

  const current = LOCALES.find((l) => l.code === selected) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={dict.languageSwitcher.ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-white/90 transition hover:bg-white/5"
      >
        <Image
          src={current.flagSrc}
          alt={dict.languageSwitcher[current.labelKey]}
          width={20}
          height={20}
          unoptimized
          className="h-5 w-5"
        />
        <span style={TRIGGER_STYLE}>{current.code}</span>
        <Image
          src={`${ASSETS}/down.svg`}
          alt=""
          width={16}
          height={16}
          unoptimized
          className={`h-4 w-4 opacity-80 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Languages"
          className="absolute right-0 top-full z-30 mt-2 min-w-[160px] overflow-hidden rounded-md border border-white/10 bg-[#0b1a26] shadow-xl"
        >
          {LOCALES.map((loc) => (
            <li key={loc.code}>
              <button
                type="button"
                role="option"
                aria-selected={selected === loc.code}
                onClick={() => changeLocale(loc.code)}
                className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/10 ${
                  selected === loc.code ? "bg-white/5" : ""
                }`}
                style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif", fontWeight: 500 }}
              >
                <Image src={loc.flagSrc} alt="" width={18} height={18} unoptimized className="h-4 w-4" />
                <span>{dict.languageSwitcher[loc.labelKey]}</span>
                <span className="ml-auto text-xs opacity-60">{loc.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
