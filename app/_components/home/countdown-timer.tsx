"use client";

import { useEffect, useState } from "react";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";

type CountdownTimerProps = {
  /** ISO string from `event_settings`. `null` → "Coming soon". */
  eventDateIso: string | null;
};

type Remaining = { d: number; h: number; m: number };

function computeRemaining(iso: string | null): Remaining | null {
  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (isNaN(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return { d, h, m };
}

export function CountdownTimer({ eventDateIso }: CountdownTimerProps) {
  // Initialize with same computation server + client to avoid hydration mismatch.
  const [remaining, setRemaining] = useState<Remaining | null>(() => computeRemaining(eventDateIso));

  useEffect(() => {
    const id = setInterval(() => setRemaining(computeRemaining(eventDateIso)), 60_000);
    return () => clearInterval(id);
  }, [eventDateIso]);

  if (!remaining) {
    return (
      <p className="text-2xl text-white/85" style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 700 }}>
        Coming soon
      </p>
    );
  }

  return (
    <div className="flex items-center gap-6 text-white sm:gap-10">
      <Box value={remaining.d} label="Ngày" />
      <Separator />
      <Box value={remaining.h} label="Giờ" />
      <Separator />
      <Box value={remaining.m} label="Phút" />
    </div>
  );
}

function Box({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="rounded-lg border border-white/15 bg-white/10 px-5 py-3 text-5xl tabular-nums shadow-inner backdrop-blur-sm sm:px-7 sm:py-4 sm:text-6xl"
        style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 700 }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="text-xs uppercase tracking-[0.2em] text-white/70 sm:text-sm"
        style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 600 }}
      >
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <span
      className="-translate-y-3 text-5xl text-white/30 sm:text-6xl"
      aria-hidden
      style={{ fontFamily: FONT_MONTSERRAT, fontWeight: 700 }}
    >
      :
    </span>
  );
}
