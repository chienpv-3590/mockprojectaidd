# Tester Report — Home page vs MoMorph Design

**Date:** 2026-05-25 15:15
**Target:** `/` (route protected by `proxy.ts`)
**Design:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
**Plan:** `plans/260525-1429-home-page-momorph/`
**Tester:** automated (compile/lint/build/curl) + operator-deferred for visual & data flow

## Overview

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ exit 0 |
| `eslint app lib proxy.ts` | ✅ exit 0 |
| `next build` | ✅ exit 0 (5 routes: `/`, `/_not-found`, `/auth/callback`, `/login`, proxy middleware) |
| Route shape: `/` | ✅ `ƒ` Dynamic (server-rendered) — correct, depends on session |
| Route protection `/` (logged-out) | ✅ HTTP 307 → `/login` |
| Visual at 3 viewports | ⚠️ DEFERRED — requires authenticated session (proxy blocks unauthenticated access) |
| Manual sign-in + data flow | ⚠️ DEFERRED — operator step (see checklist below) |
| RLS sanity check (2 users) | ⚠️ DEFERRED — operator step |

## Architecture delivered

### Backend (Phase 02)
`supabase/migrations/0001_init_homepage.sql` + `supabase/seed.sql`:
- 4 tables: `awards`, `event_settings`, `notifications`, `kudos`
- RLS: awards + event_settings public-read; notifications + kudos user-scoped via `auth.uid()`
- Seed: 6 awards, 1 event date row, `seed_demo_data_for_current_user()` SECURITY DEFINER function for per-user demo notifications + kudos

### Data access (Phase 03)
`lib/data/`: types + 4 query modules (awards, event-settings, notifications, kudos). Throws on Supabase errors.

### UI components (Phase 01)
`app/_components/home/`: header, hero, awards-grid, award-card, kudos-section, footer, floating-fab. Modular, props-driven, all under 110 lines each.

### Interactive client components
- `countdown-timer.tsx` (Phase 04) — `useState` initializer for SSR-safe initial render, `setInterval(60_000)`, "Coming soon" fallback
- `user-menu.tsx` (Phase 05) — dropdown w/ avatar/name/email + `signOut` form action, click-outside + Esc
- `notification-bell.tsx` (Phase 06) — bell + red badge + dropdown; optimistic mark-as-read via `useTransition`

### Integration (Phase 07)
`app/page.tsx` async RSC: `Promise.all` fetches awards + event date + notifications + unread + kudos count; passes server-fetched data to all dynamic components.

## Per-element check (compile-level)

| Section | Component file | Renders |
|---|---|---|
| Header | header.tsx + slots | logo + 4 nav links (`#` stubs) + LanguageStub + NotificationBell + UserMenu |
| Hero | hero.tsx + CountdownTimer slot | keyvisual-bg.jpg + ROOT FURTHER + "Coming soon"/countdown + event info + 2 CTA buttons |
| Awards | awards-grid.tsx + award-card.tsx | section header + responsive 1/2/3-col grid + 6 cards (DB-fetched) |
| Kudos | kudos-section.tsx | promo with `receivedCount`-aware copy + CTA |
| Footer | footer.tsx | logo + 4 footer nav links + Vietnamese copyright |
| FAB | floating-fab.tsx | yellow pill bottom-right (visual stub) |

## MoMorph test-case coverage (research/test_cases.txt — 62 TCs)

Selective mapping (full 62-row matrix omitted for brevity; classifying by category):

| Category | Cases | Coverage |
|---|---|---|
| Access conditions (ACCESSING) | ~4 | ✅ proxy redirects unauth→/login, auth→/ |
| GUI: layout / positioning | ~25 | ✅ implemented per design; needs visual diff to confirm pixel-fidelity |
| GUI: language switcher | ~3 | ⚠️ stub (per plan — deferred) |
| GUI: countdown / hero | ~5 | ✅ countdown ticks, "Coming soon" fallback, hero rendered |
| Function: Google OAuth | ~2 | ✅ inherited from login plan (unchanged) |
| Function: notifications | ~6 | ✅ bell badge, dropdown, mark-as-read on open |
| Function: user menu | ~4 | ✅ avatar/name/email + sign-out |
| Function: award cards | ~6 | ✅ render from DB; "Chi tiết" buttons stub to `#` (per plan) |
| Function: Kudos | ~3 | ✅ receivedCount displayed; CTA stubs to `#` (per plan) |
| Function: floating FAB | ~2 | ⚠️ visual stub (per plan) |
| Function: header nav | ~2 | ⚠️ all link to `#` (per plan — no detail pages) |

**Estimate:** ~46/62 ✅ implemented · ~12 ⚠️ per-plan visual stubs (deferred) · ~4 require operator visual verification.

## Operator manual checklist (before this plan is truly "done")

- [ ] Apply `supabase/migrations/0001_init_homepage.sql` in Supabase Studio
- [ ] Apply `supabase/seed.sql` in Supabase Studio
- [ ] Sign in via Google at `/login` → should land on `/`
- [ ] After first sign-in, run in Supabase SQL editor: `select public.seed_demo_data_for_current_user();`
- [ ] Reload `/` → verify:
  - [ ] 6 awards visible in grid with thumbnails
  - [ ] Countdown ticks (or "Coming soon" if event date past)
  - [ ] Notification bell shows badge "5"
  - [ ] User dropdown shows Google name/email/avatar
  - [ ] Kudos section shows "Bạn đã nhận được 3 lời khen"
- [ ] Click bell → dropdown opens, badge clears to 0, refresh confirms `read=true` in DB
- [ ] Click user dropdown → "Đăng xuất" → bounced to `/login`
- [ ] Test at 1440 / 768 / 375 viewports — capture screenshots, compare against `research/preview.png`
- [ ] (Optional) Sign in as 2nd Google account → verify RLS: only own notifications + kudos visible

## Known gaps (per plan — not bugs)

1. Header nav links → `href="#"` (no detail pages this plan)
2. Award card "Chi tiết" → `href="#"` (no detail pages this plan)
3. Sun* Kudos CTA → `href="#"` (no Kudos detail page this plan)
4. Floating FAB → render only, no handler (per plan)
5. Language switcher → text button only, no dropdown (per plan — deferred)
6. Notifications: pull-only (no Realtime; per plan)

## Recommendation

**Pass automated.** Compile, lint, build all green. Route protection live. Code shape matches plan. The 4 operator-deferred items (visual diff at 3 viewports + sign-in flow + DB seed + RLS check) gate final acceptance — they cannot be automated from this session.

## Unresolved

- Without operator running migrations + sign-in, the page renders empty arrays from DAL queries (awards=[], notifications=[], etc.). Build still passes because queries are async at request time, not at build time.
- Event date in seed defaults to `2026-12-31T19:00:00+07:00` — change in DB if real SAA date differs.
