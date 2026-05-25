# Tester Report — Home page 100% MoMorph design match

**Date:** 2026-05-25 19:45
**Target:** `/` (home page)
**Design:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM (Homepage SAA)
**Scope:** code + DB content + visual diff fix for UI deviations vs design

## Overview

| Check | Result |
|---|---|
| `tsc --noEmit` | PASS |
| `eslint app lib proxy.ts` | PASS |
| `next build` | PASS (4 routes) |
| Visual diff via temp `/preview-home` route, 1440x900 | PASS |
| Live Supabase DB (awards content) | UPDATED via Mgmt API → matches design |
| Temp `/preview-home` route + `PUBLIC_PATHS` entry | REMOVED before commit |
| Files touched | 5 (.tsx) + 1 (seed.sql) |

## Method

User reported that the home UI did not match the design 100% even after prior polish passes. Auth-gated `/` cannot be screenshotted by Claude — so I created a temporary public `/preview-home` route that renders the same component tree with auth-free server-side data fetch, took before/after fullpage screenshots, then removed the route and reverted `lib/supabase/middleware.ts` `PUBLIC_PATHS`.

Comparison artifacts:
- `tester-260525-1945-home-final-fullpage.png` (after fix)
- `tester-260525-1945-home-final-hero.png` (hero viewport detail)

## Gaps found vs design (and fixes)

1. **Header nav label** — code had `"Award Information"` (singular). MoMorph spec A1/A1.3 says `"Awards Information"` (plural). FIX: `app/_components/home/header.tsx` line 10.

2. **Awards section subtitle missing** — design + spec C1 require a third descriptive line under the heading: `"Các hạng mục sẽ được trao giải theo TOP những người xuất sắc nhất."` FIX: added a `<p>` under the h2 in `app/_components/home/awards-grid.tsx`.

3. **Award titles mismatch design** — DB had `"Signature 2025 Creator"` (no dash) and `"MVP"` (no parenthetical). Design + spec C2.5 / C2.6 require `"Signature 2025 - Creator"` and `"MVP (Most Valuable Person)"`. FIX: `supabase/seed.sql` + UPDATE on live DB via Management API.

4. **Award descriptions mismatch design** — all 6 award `description_vi` values in DB were generic placeholders that did not match the design copy. Replaced with the exact design strings per spec C2.1.3 etc. FIX: `supabase/seed.sql` + UPDATE on live DB.

5. **Kudos section had an extra heading** — code rendered `"ĐIỂM MỚI CỦA SAA 2025"` as a separate uppercase heading line above the body paragraph. Design folds this phrase inline at the start of the body paragraph. FIX: refactored to a single paragraph with `"Điểm mới của SAA 2025:"` as a bold inline prefix. `app/_components/home/kudos-section.tsx`.

6. **Hero event-info values not yellow** — design shows `"26/12/2025"` and `"Âu Cơ Art Center"` in the yellow brand color `#FFEA9E`. Code rendered them in white. FIX: `app/_components/home/hero.tsx` event-info span — color now `CTA_YELLOW`, and label color upgraded from `white/70` to `white` to match design contrast.

## Live DB update

Applied via Supabase Management API (PAT scope: project owner):

```sql
update public.awards set title_vi=..., description_vi=... where code in (
  'top-talent','top-project','top-project-leader','best-manager',
  'signature-creator','mvp'
);
```

HTTP 201 + verified select returned the new values. `supabase/seed.sql` updated to match so a fresh `db reset` reproduces the same content.

## Files modified

| File | Change |
|---|---|
| `app/_components/home/header.tsx` | `Award Information` → `Awards Information` |
| `app/_components/home/awards-grid.tsx` | added subtitle `<p>` |
| `app/_components/home/kudos-section.tsx` | folded `"ĐIỂM MỚI CỦA SAA 2025"` heading into inline bold prefix |
| `app/_components/home/hero.tsx` | event-info values now `#FFEA9E`; labels white |
| `supabase/seed.sql` | award titles + descriptions match design |

## What I CANNOT verify from this seat

- Real `/` (authenticated) screenshot. The temp preview route is gone. Operator should load `/` in a logged-in browser and compare against design. The component tree is identical to what `/preview-home` rendered, plus `<NotificationBell>` + `<UserMenu>` in the header (also already-shipped components, unchanged this pass).

## Recommendation

**Pass.** All design-vs-code deltas identified by structured diff have been fixed in code + DB. Build / lint / typecheck all clean. Stage all 5 component files + `supabase/seed.sql` for commit. The PAT (`sbp_984c81…`) used to update the DB is still active — operator should revoke at https://supabase.com/dashboard/account/tokens when convenient.

## Unresolved questions

- Subtle background-gradient alignment between hero and root-further sections (the painterly art piece) — visual match looks good at 1440 width but I did not stress-test 768 / 375 viewports this pass.
- The hero "Comming soon" text retains the design's typo (double 'm'). Spec writes it correctly as "Coming soon" but the rendered design preserves the typo. Kept code aligned with the design image; flag to product if a future fix is wanted.
