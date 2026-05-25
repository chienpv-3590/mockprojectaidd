# Tester Report — Home page QA (post fix-bug rounds)

**Date:** 2026-05-25 20:29
**Target:** `/` (auth-gated) rendered via temp `/preview-home`
**Design:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM (Homepage SAA, screen_id `i87tDx10uM`)
**Method:** Static checks + visual diff at 3 viewports (1440 / 768 / 375). Preview route + middleware exception removed before commit.

## Overview

| Check | Result |
|---|---|
| `tsc --noEmit` | PASS (exit 0) |
| `eslint app lib proxy.ts` | PASS (exit 0) |
| `next build` | PASS (4 routes, /, /login, /auth/callback, /_not-found) |
| Console errors | 0 |
| Console warnings | 3 (Next/Image aspect-ratio hints, non-blocking) |
| Visual diff @ 1440 | PASS — all sections match design |
| Visual diff @ 768 | PASS — 2-col grid, hero CTAs stack |
| Visual diff @ 375 | PASS — 1-col grid, hero scales |
| Live DB awards content | matches design (verified prior round) |

Screenshots: `tester-260525-2029-home-qa-{1440,768,375}.png`.

## Per-section diff vs design

| Section | Status |
|---|---|
| Header (A1) | OK — logo, "About SAA 2025" active yellow underline, "Awards Information", "Sun* Kudos", VN flag dropdown (EN flag now distinct) |
| Hero (3.5/B1/B2/B3) | OK — ROOT FURTHER logo left, "Comming soon", countdown DAYS/HOURS/MINUTES, event info yellow values, livestream note, ABOUT AWARDS (yellow) + ABOUT KUDOS (outline) |
| Root Further (B4) | OK — centered logo, justified body paragraphs, English-proverb quote, more body |
| Awards header (C1) | OK — caption + full-width dark-gray HR (#2E3940, 1px) + yellow title — matches Figma node `2167:9071` exactly |
| Awards grid (C2) | OK — 3×2 cards, titles + descriptions match design (`Signature 2025 - Creator`, `MVP (Most Valuable Person)`) |
| Kudos block (D1/D2) | OK — caption + yellow title + body with inline-bold "Điểm mới của SAA 2025:" + Chi tiết yellow button + KUDOS logo |
| Footer (7) | OK — logo + 4 links + copyright |
| FAB (6) | OK — yellow pill bottom-right |

## Console warnings (non-blocking)

```
Image with src "/home/root-further-logo.png" has either width or height modified, but not the other.
Image with src "/home/logo.png" has either width or height modified, but not the other.
Image with src "http://localhost:3000/home/logo-kudos.svg" has either width or height modified, but not the other.
```

Next.js hints to add `width: auto` or `height: auto` style. Not visual regressions; classes already use `h-auto w-full max-w-[N]px` for these images. Acceptable to ignore but could be silenced by setting explicit `style={{ width: "auto" }}` if desired.

## Fixes applied this session (cumulative since last commit)

| Fix | Files |
|---|---|
| Add Hero left layout + design metrics (prior sessions) | `hero.tsx`, `countdown-timer.tsx` |
| Add RootFurther B4 content section | `root-further-description.tsx` |
| Upgrade award cards with thumbnail overlay | `award-card.tsx`, `awards-grid.tsx` |
| Header label "Award Information" → "Awards Information" | `header.tsx` |
| Kudos folded "ĐIỂM MỚI CỦA SAA 2025" heading into inline-bold paragraph; drop unused `receivedCount` prop chain | `kudos-section.tsx`, `page.tsx` |
| Distinct EN flag (Union Jack) | `language-switcher.tsx` + new `public/home/flag-en.svg` |
| Hero event-info values now yellow `#FFEA9E` | `hero.tsx` |
| Awards HR divider (full-width 1px `#2E3940`, wrapper gap 16px) | `awards-grid.tsx` |
| DB award titles + descriptions match design | `supabase/seed.sql` + live DB update via Mgmt API |

## Test-case coverage (rough vs 62 MoMorph test cases)

| Category | Coverage |
|---|---|
| Access control (proxy redirects) | OK — `/` → 307 `/login` when logged-out |
| Header layout + active state | OK |
| Hero countdown ticking | OK — interval @ 60s |
| Hero event info | OK |
| Hero CTAs (`#`) | wired, navigation deferred (no detail pages yet) |
| Awards header + HR | OK |
| Award cards (6) | OK |
| Kudos block | OK |
| User menu + sign-out | unchanged this round (verified prior) |
| Notifications bell | unchanged this round (verified prior) |
| Language switcher dropdown | OK — distinct flags, i18n wiring deferred |
| Floating FAB | OK (visual only) |
| Footer | OK |

## Recommendation

**Pass.** Code green (tsc + eslint + build), visual matches design at 3 viewports, no console errors. The temp preview route used to capture screenshots was deleted before this report and `PUBLIC_PATHS` was reverted in `lib/supabase/middleware.ts`. Ready to commit.

## Unresolved questions

- Next/Image aspect-ratio warnings (3) — keep as-is or add `style={{ width: "auto" }}`? Non-blocking either way.
- Hero "Comming soon" double-m typo is preserved per design image; spec text says "Coming soon". Confirm with product which is canonical.
- Header nav `href="#"` — should we wire to `Awards Information` / `Sun* Kudos` detail pages now or wait for those routes to exist?
- Supabase PAT `sbp_984c81…` from prior session still active — please revoke at https://supabase.com/dashboard/account/tokens.
