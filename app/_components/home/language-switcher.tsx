"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Locale = "VN" | "EN";

const ASSETS = "/home";

const LOCALES: { code: Locale; label: string; flagSrc: string }[] = [
  { code: "VN", label: "Tiếng Việt", flagSrc: `${ASSETS}/flag-vn.svg` },
  { code: "EN", label: "English", flagSrc: `${ASSETS}/flag-en.svg` },
];

const TRIGGER_STYLE = {
  fontFamily: "var(--font-montserrat), system-ui, sans-serif",
  fontWeight: 600 as const,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "0.15px",
};

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Locale>("VN");
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

  const current = LOCALES.find((l) => l.code === selected) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Change language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-white/90 transition hover:bg-white/5"
      >
        <Image
          src={current.flagSrc}
          alt={`${current.label} flag`}
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
                onClick={() => {
                  setSelected(loc.code);
                  setOpen(false);
                  // i18n wiring deferred — selection is visual only for now.
                }}
                className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-white/90 transition hover:bg-white/10 ${
                  selected === loc.code ? "bg-white/5" : ""
                }`}
                style={{ fontFamily: "var(--font-montserrat), system-ui, sans-serif", fontWeight: 500 }}
              >
                <Image src={loc.flagSrc} alt="" width={18} height={18} unoptimized className="h-4 w-4" />
                <span>{loc.label}</span>
                <span className="ml-auto text-xs opacity-60">{loc.code}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
