---
phase: 08
track: —
title: Verification — build, lint, DB migration, visual diff, manual auth + data flow
status: completed
blockedBy: [07]
---

# Phase 08 — Verification

## Goal
Confirm the home page builds, lints, renders correctly at three viewports, AND that the full data-fetching path (Supabase migrations applied, queries return seed data, components render real values) works end-to-end with a real Google sign-in.

## Steps
1. **Build:** `NEXT_PUBLIC_SUPABASE_URL=<real> NEXT_PUBLIC_SUPABASE_ANON_KEY=<real> npm run build` — exit 0. (Use real Supabase URL/key for build because page imports DAL — even though `next build` doesn't actually run queries during static gen.)
2. **Lint:** `eslint app lib proxy.ts` — must pass.
3. **Type-check:** `tsc --noEmit` — must pass.
4. **DB migration applied:**
   - In Supabase Studio: run `supabase/migrations/0001_init_homepage.sql` if not yet applied.
   - Run `supabase/seed.sql`.
   - Verify: `select count(*) from public.awards` returns 6, `select * from public.event_settings` returns 1 row.
5. **Visual at 3 viewports** (`npm run dev`):
   - 1440×1024 desktop — full layout, real awards
   - 768×1024 tablet — awards grid 2-column
   - 375×812 mobile — awards grid 1-column, sections stacked
   - Use Playwright MCP, screenshot, compare against `research/preview.png`. Save under `plans/.../test-screenshots/`.
6. **Manual auth + data flow:**
   - Open `/` while signed out → redirect to `/login`
   - Sign in via Google → land on `/`
   - In Supabase SQL editor: run `select public.seed_demo_data_for_current_user();` (one-time per user)
   - Refresh `/` → 5 notifications seeded, bell badge shows `5`
   - Verify Awards grid shows 6 cards with seeded titles
   - Verify countdown shows real time to event date
   - Verify Kudos section shows kudos received count
   - Click bell → badge → 0, dropdown lists 5 notifications, refreshing page confirms `read=true` in DB
   - Click user icon → dropdown → Sign out → lands on `/login`
   - Refresh `/login` while signed out → stays on `/login` (no loop)
7. **RLS sanity check:**
   - In Supabase SQL editor, create or use a second test user. Try selecting notifications: should only see own rows.
8. **Test report:** generate structured QA report under `plans/reports/tester-...md` mapping the 62 MoMorph test cases (mark covered / partial / deferred).

## Success Criteria
- All eight steps pass.
- No console errors during the round-trip.
- Visual diff acceptable (no ghost elements, fonts correct).
- DB queries return the seeded mock data.
- RLS prevents cross-user data leaks.

## Out of Scope
- Automated e2e tests (no Playwright config; defer).
- Load / performance benchmarks.
- Lighthouse / SEO audit.

## Manual checklist for the operator (PENDING)
- [ ] `supabase/migrations/0001_init_homepage.sql` applied
- [ ] `supabase/seed.sql` applied
- [ ] `seed_demo_data_for_current_user()` run once after first login
- [x] Build + lint + tsc all pass (automated by takumi)
- [ ] Google sign-in round-trip works
- [ ] Awards / Countdown / Notifications / Kudos all show real DB data
- [ ] Sign-out clears session
- [ ] RLS verified with a second user

## Outcome
**Automated checks passed:** `npm run build` exit 0; `tsc --noEmit` exit 0; `eslint app lib proxy.ts` exit 0. Route `/` correctly classified as `ƒ` dynamic (server-rendered, depends on session). Proxy protection live (`/` → 307 → `/login` for unauthenticated).

**Operator-deferred:** visual diff at 3 viewports + manual Google sign-in + DB migration apply + seed + RLS cross-user check. These cannot be automated from the takumi session (proxy blocks unauth visual screenshots; Supabase Studio access requires operator). One transient MoMorph media URL timeout (signed 10-min TTL) handled via manual refetch during forge.

QA report at `plans/reports/tester-260525-1515-home-page-momorph-qa.md` enumerates the 62 MoMorph test cases and which ones are gated on operator action.
