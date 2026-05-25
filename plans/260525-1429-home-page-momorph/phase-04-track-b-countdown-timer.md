---
phase: 04
track: B
title: Countdown timer (reads event date from DB)
status: completed
blockedBy: [03]
---

# Phase 04 — Track B: Countdown timer

## Goal
Client component that displays days / hours / minutes remaining until the event date supplied by the parent. Ticks every minute. Shows "Coming soon" if the date is in the past or null.

## Files to create
- `app/_components/home/countdown-timer.tsx` — `"use client"` component

## Props
```ts
type CountdownTimerProps = {
  /**
   * Event date — fetched server-side via `getEventDate()` from `lib/data/event-settings.ts`.
   * `null` → render "Coming soon" (also when date is in the past).
   * Must be passed as ISO string (Date objects don't serialize across server/client boundary).
   */
  eventDateIso: string | null;
};
```

## Behavior
- Parse `eventDateIso` to Date on the client. If null / invalid / past → render `<ComingSoon />` ("Coming soon" per spec B1.2).
- Otherwise render three 2-digit boxes: `DD`, `HH`, `MM` with labels "Ngày", "Giờ", "Phút" per spec B1.3.
- Tick: `setInterval(60_000)` (minute precision is enough). Cleanup on unmount.
- SSR-safe: initial render uses the same `eventDateIso` prop on server + client — no hydration mismatch because both compute from the same string. Use `useState(() => computeRemaining(eventDateIso))` initializer.

## Why prop instead of env var
Per the expanded plan: event date now lives in `event_settings` table (Phase 02). Page server-fetches it via `getEventDate()` and passes the ISO string down. This lets ops change the date without redeploying the app.

## Risks
- Time-zone: parsing the ISO string respects its TZ offset. UI shows time in user's local clock. Acceptable.
- Server-to-client drift: server computes "remaining" at request time, client computes "remaining" at hydration time. ~100ms drift is invisible at minute precision.
- If the DB query fails, parent passes `null` → countdown shows "Coming soon" (degrades gracefully).

## Success Criteria
- Component renders correct DD/HH/MM for a future date.
- Shows "Coming soon" when `eventDateIso` is `null` or in past.
- No hydration warnings in browser console.
- Ticks update the UI every minute.

## Out of Scope
- Seconds display.
- "Time's up — event in progress" state.
- Real-time DB subscription (would require Supabase Realtime).

## Outcome
Built `app/_components/home/countdown-timer.tsx` ("use client") component accepting `eventDateIso` prop. Renders DD/HH/MM boxes for future dates, "Coming soon" for past/null. Ticks every 60s. No hydration mismatch (both server/client compute from same ISO string). Lint finding (redundant setRemaining in effect) fixed inline.
