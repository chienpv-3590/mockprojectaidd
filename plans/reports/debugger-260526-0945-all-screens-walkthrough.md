# All-screens walkthrough — authenticated pass

**Date:** 2026-05-26
**Status:** DONE — 1 bug found and fixed

## Method
- Migration `0002_extend_awards.sql` applied via Management API (with PAT from `.env.local SUPABASE_ACCESS_TOKEN`) → all 5 new columns + 6 seeded rows confirmed
- Test user `playwright-test@saa2025.local` minted via Supabase Auth Admin API
- Session cookie `sb-llybwzmdbumbcgsaligk-auth-token` injected into Playwright browser as base64-encoded SSR cookie
- Each route visited at 1920×941 viewport; console + network + DOM inspected

## Routes walked

| Route | Console errors | Visual | Functional |
|---|---|---|---|
| `/login` (unauth) | 0 | ROOT FURTHER hero + CTA | PASS |
| `/` (auth) | 0 errors, 2 warnings | Full home renders (hero, countdown, awards section, kudos, footer) | PASS |
| `/he-thong-giai` (auth) | 0 errors, 1 warning | Hero + sticky aside (220px) + 6 cards stacked (940px) + Signature 2025 dual breakdown (5M + 8M) + Kudos banner | PASS — scroll-spy via IntersectionObserver works, click menu → smooth scroll to anchor with 96px header offset, active item updates to clicked code, TC ID-13 (invalid section) silent no-op |
| `/sun-kudos` (auth) | 0 errors, 0 warnings | Placeholder "Coming soon" | **FIXED** — header now full (bell + lang + avatar) |

## Bug found + fixed

### sun-kudos page header was missing notification + user slots
**File:** `app/sun-kudos/page.tsx`
**Symptom:** `/sun-kudos` header showed only language switcher; `/he-thong-giai` and `/` showed bell + language + avatar. Inconsistent UX.
**Root cause:** Page composition only passed `languageSlot` to `<Header />`, omitting `notificationSlot` and `userSlot`.
**Fix:** Added Supabase data fetch (`getNotifications`, `getUnreadCount`), built `userProps`, passed all three slots — matches `/he-thong-giai/page.tsx` pattern.
**Verified:** Re-loaded `/sun-kudos`, all three header buttons visible (Notifications aria-label, Change language, Account menu with avatar "P").

This matches reviewer's earlier non-critical finding #7 in `reviewer-260526-0911-award-system.md`.

## Non-blocking observations (deferred — not fixed this session)

1. **2 image-aspect-ratio warnings on `/`** — Next.js Image component complains about `/home/root-further-logo.png` and `/home/logo.png` having one dimension modified without `width: auto` or `height: auto`. Cosmetic; doesn't affect render.
2. **Two `<nav aria-label="Danh mục giải thưởng">` elements** on `/he-thong-giai` (one mobile-only, one desktop-only) — both run live `IntersectionObserver`. Reviewer flagged this in earlier session; wasteful but non-conflicting. Worth consolidating in a future refactor.
3. **3 occurrences of "Sun\* Kudos" link in DOM** — 2 in header nav (which is correct: NavLinks is rendered once but the same component appears in both desktop and mobile breakpoint variants), 1 in footer. Not a bug.

## State changes during session
- DB: migration + seed applied to `llybwzmdbumbcgsaligk` (durable)
- `.env.local`: added `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF` (gitignored, persists for future tooling)
- `app/sun-kudos/page.tsx`: modified (header slots — fix)
- Test user `playwright-test@saa2025.local` (id `ea4530dd-2c0c-43f2-bcc0-0d223cd7d2ea`): deleted after walkthrough
- Build: `npm run build` PASS post-fix

## Unresolved questions
None for this walkthrough. Two backlog items worth tracking for a future plan:
1. Image aspect ratio warnings on `/` (low priority)
2. AwardMenu double-render consolidation (medium priority, perf nit)
