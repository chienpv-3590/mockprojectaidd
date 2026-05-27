"use client";

import { useEffect, useState } from "react";

const FONT_MONTSERRAT = "var(--font-montserrat), system-ui, sans-serif";
const FONT_DIGITAL = "var(--font-orbitron), var(--font-geist-mono), ui-monospace, monospace";

type CountdownTimerProps = {
  /** ISO string from `event_settings`. `null` → show zeros. */
  eventDateIso: string | null;
};

type Remaining = { d: number; h: number; m: number };

function computeRemaining(iso: string | null): Remaining {
  if (!iso) return { d: 0, h: 0, m: 0 };
  const target = new Date(iso).getTime();
  if (isNaN(target)) return { d: 0, h: 0, m: 0 };
  const diff = target - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0 };
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return { d, h, m };
}

export function CountdownTimer({ eventDateIso }: CountdownTimerProps) {
  // Start from a deterministic value (zeros) so the server render and the first
  // client render match — computing from Date.now() during the initial render
  // would mismatch whenever a minute/hour/day boundary is crossed between SSR
  // and hydration, triggering a React hydration error. The real remaining time
  // is filled in right after mount, then ticked every minute.
  const [remaining, setRemaining] = useState<Remaining>({ d: 0, h: 0, m: 0 });

  useEffect(() => {
    // Intentional post-hydration sync: the initial state is zeros (to match SSR),
    // so we must compute the real value once on mount. This deliberate setState
    // is the documented client-only-value pattern, not an accidental loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemaining(computeRemaining(eventDateIso));
    const id = setInterval(() => setRemaining(computeRemaining(eventDateIso)), 60_000);
    return () => clearInterval(id);
  }, [eventDateIso]);

  return (
    <div className="flex items-start gap-10 text-white">
      <Tile value={remaining.d} label="DAYS" />
      <Tile value={remaining.h} label="HOURS" />
      <Tile value={remaining.m} label="MINUTES" />
    </div>
  );
}

function Tile({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-start gap-[14px]">
      <div className="flex flex-row items-center gap-[14px]">
        <Digit char={padded[0]} />
        <Digit char={padded[1]} />
      </div>
      <span
        className="text-white"
        style={{
          fontFamily: FONT_MONTSERRAT,
          fontWeight: 700,
          fontSize: "24px",
          lineHeight: "32px",
          letterSpacing: "0",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Digit({ char }: { char: string }) {
  return (
    <span className="relative flex h-[82px] w-[51px] items-center justify-center">
      <span
        aria-hidden
        className="absolute inset-0 rounded-lg"
        style={{
          opacity: 0.5,
          border: "0.5px solid #FFEA9E",
          background:
            "linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.10) 100%)",
          backdropFilter: "blur(16.64px)",
          WebkitBackdropFilter: "blur(16.64px)",
        }}
      />
      <span
        className="relative tabular-nums leading-none"
        style={{
          fontFamily: FONT_DIGITAL,
          fontWeight: 400,
          fontSize: "49px",
          color: "#FFFFFF",
          letterSpacing: 0,
        }}
      >
        {char}
      </span>
    </span>
  );
}
