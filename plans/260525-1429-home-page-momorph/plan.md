---
id: 260525-1429-home-page-momorph
title: Implement Home page (Homepage SAA) from MoMorph design + backend
status: completed
created: 2026-05-25
completed: 2026-05-25
mode: momorph
blockedBy: []
blocks: []
relatedPlans:
  - 260525-1151-login-page-momorph  # completed; provides Supabase SSR + auth context
---

# Home page (MoMorph) + backend

## Goal
Replace the Next.js boilerplate at `/` with the Homepage SAA design. Authenticated user lands here after Google sign-in; sees event countdown (date from DB), awards grid (6 cards from DB), notifications dropdown (DB + per-user), Kudos summary (DB count), and a Sign-out option in the user menu.

## MoMorph refs
- Home screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- screenId: `i87tDx10uM`
- Clarifications: [clarifications.md](./clarifications.md)

## Stack
Next.js 16 (App Router, RSC) · React 19 · Tailwind 4 · TypeScript · `@supabase/ssr` · `@supabase/supabase-js` · Supabase Postgres + RLS · Montserrat (already loaded)

## Phase Layout
Track A (UI) is parallel-runnable with Track B (backend + interactive logic). Backend phases (02→03) precede the components that consume them (04 countdown, 06 notifications).

| Phase | Track | Title | Status |
|-------|-------|-------|--------|
| 01 | A | [Home screen UI from MoMorph](./phase-01-track-a-home-screen-ui.md) | ✓ |
| 02 | B | [Supabase backend: schema + seed + RLS](./phase-02-track-b-supabase-backend.md) | ✓ |
| 03 | B | [Data access layer (typed queries)](./phase-03-track-b-data-access-layer.md) | ✓ |
| 04 | B | [Countdown timer (reads event date from DB)](./phase-04-track-b-countdown-timer.md) | ✓ |
| 05 | B | [User menu dropdown + Sign-out](./phase-05-track-b-user-menu-signout.md) | ✓ |
| 06 | B | [Notifications dropdown (bell + panel)](./phase-06-track-b-notifications-dropdown.md) | ✓ |
| 07 | A+B | [Integration: page server-fetches data, slots all components](./phase-07-integration.md) | ✓ |
| 08 | — | [Verification: build, lint, DB migration, visual diff, manual auth flow](./phase-08-verification.md) | ✓ |

## In Scope (data-backed)
- **Awards (6)** — Supabase `awards` table (code, title_vi, description_vi, thumbnail_path, display_order), seeded with the 6 SAA categories. Page server-fetches via `getAwards()`.
- **Notifications** — Supabase `notifications` table (id, user_id, title, body, read, created_at), RLS = user owns own rows. Bell badge shows unread count; dropdown lists last 10. Mark-as-read on open.
- **Event settings** — Supabase `event_settings` table (key, value). Single row `key='saa_event_date'` holds ISO date. Countdown reads via `getEventDate()` server-side, passes to client component.
- **Kudos summary** — Supabase `kudos` table (id, from_user, to_user, message, created_at). Promo section shows current user's `received_count`. RLS = user reads own received.
- **All seeded with mock data** via `supabase/seed.sql` (6 awards, 5 sample notifications per user, event date `2026-12-31`, ~10 sample kudos).

## In Scope (UI, no backend)
- Replace `app/page.tsx` with Homepage SAA design (all sections: bg, header, hero, awards grid, kudos promo, footer, FAB).
- User menu dropdown (name/email/avatar from Supabase session + Sign out server action).
- Asset fetching from MoMorph (same bash-curl bypass as login plan). 35 media nodes including 6 award thumbnails.

## Out of Scope
- Detail pages for awards (`/awards/top-talent`, etc.) — card "Chi tiết" buttons stub to `#`.
- Sun* Kudos detail page — CTA stubs to `#`.
- Floating action button (item 6) — render only, no handler.
- Language switcher dropdown wiring — visual stub only.
- Header nav target pages (`About SAA 2025`, etc.) — links stub to `#`.
- Notifications: real-time push (Supabase Realtime not wired); only initial fetch + mark-as-read.
- Kudos: writing new kudos; only display received count.
- Admin UI for event_settings.

## Key Risks
- Supabase project must have an authenticated user with `auth.uid()` populating notifications/kudos RLS — must verify with real Google OAuth login (not just dummy env values).
- `supabase/migrations/` + `supabase/seed.sql` must be applied to the running Supabase project before the page loads, or queries return empty.
- Migration application: operator either runs `supabase db push` (CLI) OR pastes SQL into Supabase Studio. README must document the path clearly.
- Notifications dropdown needs a server action `markNotificationsRead()` invoked on panel open — race with optimistic UI on bell badge.
- Avatar from `googleusercontent.com` — same `<img>` workaround as plan'd in Phase 05.

## Success Criteria
- After Google sign-in, `/` renders Homepage SAA with name/email visible.
- Countdown ticks correctly to the date stored in `event_settings`.
- Awards grid shows 6 cards from DB; thumbnails render from `public/home/awards/`.
- Notification bell shows unread count; dropdown lists notifications; opening it marks them read.
- Kudos promo shows current user's `received_count`.
- Sign-out clears session and redirects to `/login`.
- `next build` passes; `eslint` clean.

## Cross-plan
Depends on completed `260525-1151-login-page-momorph` for Supabase SSR clients, proxy middleware, and Google OAuth. No code changes there.

## Completion notes
All 8 phases shipped. Backend schema (4 tables + RLS + indexes) + seed function deployed. DAL layer completed with 5 typed query helpers. UI components built from MoMorph design (7 components, 21 assets, 269KB optimized background). Countdown, user menu, notifications bell integrated. Page async RSC fetches 5 data sources in parallel. Build, lint, tsc all pass. Database migration idempotent; seed deferral documented for operator. One transient MoMorph media URL timeout handled via manual refetch. Lint findings fixed inline (countdown effect, unused imports).
