# Tester Report — Login Screen vs MoMorph Design

**Date:** 2026-05-25 14:06
**Target:** `/login` (route protected by `proxy.ts`)
**Design:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
**Tester:** automated (playwright + bash)
**Plan:** plans/260525-1151-login-page-momorph/

## Overview

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ exit 0 |
| `eslint app/login app/auth lib proxy.ts app/layout.tsx` | ✅ exit 0 |
| `next build` | ✅ exit 0 (5 routes, 1 proxy) |
| Console errors (3 viewports) | ✅ 0 errors |
| Visual desktop 1440×1024 | ✅ matches design |
| Visual tablet 768×1024 | ✅ matches design after bg re-crop |
| Visual mobile 375×812 | ✅ matches design after bg re-crop |
| Error banner (`?error=auth_callback_failed`) | ✅ renders red alert with Vietnamese message |
| Route protection (`/` → `/login`) | ✅ proxy redirects logged-out user |
| Typography (per design specs) | ✅ Montserrat 700, all 4 elements match `getComputedStyle` |

## Regression found + fixed during this test pass

**Issue:** Ghost VN language-switcher visible at tablet (768) and mobile (375) viewports — two `🇻🇳 VN ▾` shown side-by-side at the top-right.

**Root cause:** The cropped `public/login/background.jpg` (right ~60% of design) still included the design's own header strip (top ~100px), where the design's VN switcher lives at x≈1303. At narrower viewports, the bg's right edge aligns with the page's right edge, so the bg's VN switcher zone landed directly under the real HTML switcher.

**Fix applied this session:**
- Re-cropped `background.jpg` to `880×900+560+100` (skip top 100px, the header strip)
- `app/login/page.tsx`: bg div positioned with `top-20 bottom-12` instead of `inset-y-0` so the image starts below the header and ends above the footer

**Verified:** tablet + mobile now show exactly one VN switcher; desktop unchanged.

## Per-element layout (desktop 1440)

| Element | Position | Size | Status |
|---|---|---|---|
| Logo (header link) | x=40, y=20 | 52×48 | ✅ top-left, `aria-label="Sun* Annual Awards 2025 — Home"` |
| Language switcher | x=1303, y=26 | 97×36 | ✅ top-right, text "VN", `aria-label="Change language"`, `aria-haspopup="listbox"` |
| ROOT FURTHER image | x=96, y=331 | 448×199 | ✅ left-hero, `alt="ROOT FURTHER"` |
| Welcome `<p>` | x=96, y=561 | 476×80 | ✅ Vietnamese text, 2 lines |
| Login button | x=96, y=673 | 305×52 | ✅ `type=submit`, inside `<form action=/login>` (server action), `data-testid="login-google"` |
| Footer | x=0, y=968 | 1440×56 | ✅ centered copyright |

## Typography vs design spec

Computed via `getComputedStyle` in browser. All four match.

| Element | Spec | Actual |
|---|---|---|
| Welcome `<p>` | Montserrat 700 / 20px / 40px / 0.5px | Montserrat 700 / 20px / 40px / 0.5px ✅ |
| Login button | Montserrat 700 / 22px / 28px | Montserrat 700 / 22px / 28px ✅ |
| Footer | Montserrat Alternates 700 / 16px / 24px | Montserrat Alternates 700 / 16px / 24px ✅ |
| "VN" span | Montserrat 700 / 16px / 24px / 0.15px | Montserrat 700 / 16px / 24px / 0.15px ✅ |

Fonts loaded via `next/font/google` (latin + vietnamese subsets, `display: swap`).

## MoMorph test-case coverage (research/test_cases.txt — 17 cases)

| TC ID | Category | Covered by impl? | Note |
|---|---|---|---|
| 45278c06 | ACCESSING — access conditions | ✅ | proxy redirects unauth→/login; auth→/ |
| b9805e65 | GUI — logo top-left | ✅ | x=40, y=20 |
| 8415b629 | GUI — language top-right | ✅ | x=1303, y=26 |
| 33a1dacf | GUI — footer fixed bottom | ⚠️ partial | Footer is `relative` not `fixed` — flows with content. Design says "fixed at bottom of the page" — minor deviation |
| 5fbe2a18 | GUI — hero background present | ✅ | bg artwork rendered (with known crop trade-off) |
| 42b82364 | GUI — title + description present | ✅ | ROOT FURTHER img + 2-line welcome text |
| 6ae76d15 | GUI — login button visible + position | ✅ | centered-ish, Google icon present |
| 20d87e28 | GUI — language dropdown opens on click | ❌ NOT IMPLEMENTED | dropdown not wired (per plan: visual stub only) |
| 5f1cbabd | GUI — default lang VN | ✅ | "VN" shown |
| 98e20775 | GUI — flag + chevron | ✅ | both present |
| f62b0c97 | FUNCTION — auth user redirected | ✅ | proxy bounces /login→/ when authenticated |
| 60bc5bbb | FUNCTION — Google OAuth on click | ✅ | server action `signInWithGoogle` |
| c18649fa | FUNCTION — button shadow on hover | ✅ | `hover:shadow-lg` Tailwind class |
| 37eae882 | FUNCTION — button disabled with loader during auth | ⚠️ partial | `disabled:` styles defined but no loading state tracked (server action `redirect()`s before render) |
| 4426635b | FUNCTION — dropdown opens on click | ❌ NOT IMPLEMENTED | same as 20d87e28 |
| cb42461d | FUNCTION — language hover highlight | ✅ | `hover:bg-white/5 transition` |
| e76aa170 | FUNCTION — user info returned, redirect to main | ✅ | callback route `exchangeCodeForSession` → `/` |

**Coverage:** 14/17 ✅, 2/17 ⚠️ partial, 2/17 ❌ unimplemented (language dropdown — known out-of-scope per plan)

## Findings to consider (not fixed this pass)

1. **HTML `lang="en"` but content is Vietnamese** — accessibility concern. Recommend setting `lang="vi"` on `<html>` for the login route (or adding `lang="vi"` on the Vietnamese text nodes). Screen readers will mispronounce.
2. **Page title still "Create Next App"** — `app/layout.tsx` has default metadata. Recommend setting per-route metadata: `export const metadata = { title: 'Đăng nhập | SAA 2025' }` in `app/login/page.tsx`.
3. **Footer position** — design says "fixed at bottom". Current is flex-flow (sits below content). At very tall viewports there's whitespace below; at short ones content overflows. Minor; likely acceptable.
4. **Language switcher dropdown** — visual stub only (per plan). 2 test cases failing this. Tracked: deferred to future i18n plan.
5. **Button loading state** — `disabled:` styles ready but no `useFormStatus()` wiring. Could add `<button disabled={pending}>` via a client wrapper using `useFormStatus`. Low effort; not done this pass.

## Build state

```
Route (app)
┌ ○ /                  (Static)
├ ○ /_not-found        (Static)
├ ƒ /auth/callback     (Dynamic)
└ ƒ /login             (Dynamic, async RSC)

ƒ Proxy (Middleware)   — handles all routes per matcher
```

## Recommendation

**Pass with concerns.** Visual + functional checks all green at three viewports. The ghost-VN regression found during this pass was fixed inline. Five known gaps documented above — none are blocking for merge but should be tracked for follow-up.

## Unresolved questions

- Confirm whether language switcher dropdown should be implemented now or stays deferred (current plan: deferred).
- Confirm whether button loading spinner is required (TC 37eae882) or acceptable as-is.
- Confirm preferred page title for `/login`.
