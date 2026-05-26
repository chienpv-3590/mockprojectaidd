---
phase: 05
track: I
status: completed
blockedBy: [01, 02, 03, 04]
---

# Phase 05 — Integration: wire UI to DB + scroll-spy + tests

## Context Links
- Plan: [plan.md](./plan.md)
- Clarifications: [clarifications.md](./clarifications.md)
- All upstream phases must be merged before starting this one.

## Overview
- **Priority:** High
- **Status:** Pending
- Single integration phase. Replaces Track A mock data with the DB-backed `Award[]`, wires the Track A `KudosBanner` CTA to `/sun-kudos`, adds the interactive layer (click-to-scroll + IntersectionObserver scroll-spy), and validates against test cases ID-0 through ID-14.

## Requirements

### Data wiring
- Route (`app/he-thong-giai/page.tsx`) passes `awards={awards}` from `getAwards(supabase)` into `<AwardSystem>`.
- `<AwardCard>` reads `quantity_text` + `unit_text` for the quantity row, `value_text` OR maps over `value_breakdown[]` for the value rows.
- `<AwardMenu>` derives 6 items from the same `awards` array, in `display_order`, using `code` as anchor target.

### Interactive layer (client component `award-menu-controller.tsx`)
- Menu item click → `e.preventDefault()` + `document.getElementById(code).scrollIntoView({ behavior: 'smooth', block: 'start' })` + push `#${code}` to URL via `history.replaceState`.
- IntersectionObserver watches the 6 card sections (root `null`, `rootMargin: '-40% 0px -55% 0px'`, threshold `0`). On intersect → set local active state → highlight corresponding menu item.
- Guard: if `document.getElementById(code)` returns null on click (TC ID-13 invalid section), no-op silently — no thrown error.
- Hover state via CSS only (TC ID-10) — no JS.

### Mobile (<lg) behavior
- Menu becomes a horizontal scrollable `<nav>` (overflow-x auto, `snap-x`). Click still scrolls the parent.
- Cards stack with image on top, text below.

### Kudos CTA
- `<KudosBanner>` `Chi tiết` button renders as `<Link href="/sun-kudos">`. No `onClick` needed.

### Test cases coverage (validate manually + via Playwright if available)
- TC ID-0 / ID-1: auth gate verified in Phase 03 — re-verify after integration.
- TC ID-3 / ID-4 / ID-5 / ID-6 / ID-7 / ID-8: visual GUI checks (full-page screenshot diff against MoMorph design).
- TC ID-9 / ID-11: click each menu item → assert scroll position lands on section + active class on clicked item only.
- TC ID-10: hover menu item → assert hover style applied.
- TC ID-12: click Kudos `Chi tiết` → assert `/sun-kudos` reached.
- TC ID-13: in console run `document.querySelector('[data-menu="nonexistent"]')?.click()` → no JS error.
- TC ID-14: `/sun-kudos` placeholder renders (not 404).

## Architecture
- New client component `app/_components/award-system/award-menu-controller.tsx` (or similar) wraps the menu `<aside>` so it can use `useEffect` + IntersectionObserver.
- The card grid stays a server-rendered list — only the menu needs client state.
- Active item highlight = CSS class toggle driven by client state.

## Related Code Files
**Create:**
- `app/_components/award-system/award-menu-controller.tsx`

**Modify:**
- `app/_components/award-system/award-system.tsx` (Phase 01 output) — pass `awards` through; mount the menu controller; add `id={award.code}` to each card section.
- `app/_components/award-system/kudos-banner.tsx` (Phase 01 output) — replace stub CTA with `<Link href="/sun-kudos">`.
- `app/he-thong-giai/page.tsx` — ensure data flow wired (no stubs left).

## Implementation Steps
1. Confirm Phase 01 + 02 + 03 + 04 merged. Pull latest.
2. Rewrite `<AwardSystem>` to consume `awards` from props (replace any inline mock array).
3. Add `id={award.code}` to each `<AwardCard>` root section.
4. Extract menu into `award-menu-controller.tsx` with `"use client"`:
   - State: `activeCode` (string, default = first award.code).
   - On mount: instantiate `IntersectionObserver` for each `#${code}` element, update `activeCode` on intersect.
   - Click handler: prevent default, scroll, update URL hash, set `activeCode`.
   - Cleanup observer on unmount.
5. Style active item per design: yellow text + 2px underline. Inactive: white/70.
6. Update `<KudosBanner>` button → `<Link href="/sun-kudos">`.
7. Mobile breakpoint: menu uses `flex-row overflow-x-auto` + `snap-x` instead of `flex-col`.
8. Run `npm run build`. Fix any type errors.
9. Manual run-through of all 15 test cases. Fix gaps.
10. Visual diff against design (open MoMorph in one tab, `/he-thong-giai` in another, compare each section).

## Todo
- [x] `<AwardSystem>` reads from `awards` prop only
- [x] `<AwardCard>` renders `quantity_text` + `unit_text` row
- [x] `<AwardCard>` renders `value_text` OR `value_breakdown[]` (Signature 2025 case)
- [x] Menu controller mounted with IntersectionObserver + click handler
- [x] Active menu item highlighted yellow + underline
- [x] Invalid section click is silent no-op (TC ID-13)
- [x] Mobile menu collapses to horizontal pill row
- [x] Kudos banner `Chi tiết` → `/sun-kudos`
- [x] `npm run build` passes
- [x] All 14 test cases validated (TC ID-0 through ID-14 PASS)

## Success Criteria
- Every TC ID-0 through ID-14 either passes or has a documented "Out of scope" note (none expected).
- Visual match against MoMorph design — no gaps that a casual review would catch.
- No console errors on load, scroll, click, or hover.

## Risk Assessment
- **Risk:** IntersectionObserver `rootMargin` values feel wrong at certain viewport heights → active item lags or skips. **Mitigation:** Tune `rootMargin` interactively; fall back to scroll-position math if observer proves unreliable.
- **Risk:** Smooth scroll on Safari behaves differently. **Mitigation:** `scroll-behavior: smooth` CSS on `html` as a safety net.
- **Risk:** Signature 2025 layout breaks because it renders 2 value rows where others render 1. **Mitigation:** Card component handles `value_breakdown` rendering generically (map over array).

## Security Considerations
- No new data exposure beyond existing `awards` reads.
- Anchor navigation operates on static `code` strings from DB — no user input → no XSS surface.

## Next Steps
- [x] Plan marked `completed` in `plan.md` frontmatter.
- [x] All phases synced to `completed` status.
- Consider follow-up plan for: real `/sun-kudos` page content, H-1 OAuth `?next=` param preservation across all auth routes, non-critical refinements (dual observer consolidation, aria-current semantic, file modularization).
