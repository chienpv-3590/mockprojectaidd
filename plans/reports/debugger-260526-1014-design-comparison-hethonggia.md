# `/he-thong-giai` — section-by-section design vs current comparison

**Date:** 2026-05-26
**Status:** DONE — 2 visual bugs found and fixed
**Design ref:** https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD

## Method
- Pulled design frame image via MoMorph MCP (`get_frame_image`)
- Captured current implementation full-page screenshot at 1440×900 viewport (matches design width)
- Compared each section: Hero, Section Header, Menu, 6 Award Cards, Kudos Banner, Footer

## Per-section findings

### Hero — **BUG FIXED**
**Design:** ROOT FURTHER wordmark on left + colorful flowing keyvisual artwork on the upper-right + "Sun* Annual Awards 2025" subtitle + "Hệ thống giải thưởng SAA 2025" large yellow heading.

**Current (before):** Only ROOT FURTHER + subtitle + heading on flat dark navy. Keyvisual artwork completely hidden.

**Root cause:** `<section relative>` had `z-index: auto`, so the `-z-10` background-image layers escaped the section's local stacking context and were painted *behind* the parent's `bg-[#00101A]` div. The keyvisual JPG was loaded but invisible.

**Fix:** Added `isolation: isolate` (Tailwind `isolate`) on the hero section to clamp the stacking context locally. Replaced the flat 60% dark overlay with a left-to-right gradient (0.92 → 0 alpha) so the colorful artwork shows on the right while text stays readable on the left. Also changed `bg-center` → `bg-right-top` so the artwork anchors per design.

**File:** `app/_components/award-system/award-hero.tsx`

### Section header (between hero and cards) — **MATCH**
Both show "SUN* ANNUAL AWARDS 2025" small uppercase + horizontal separator line. OK.

### Left sticky menu — minor cosmetic diff (not fixed)
**Design:** Active item shows yellow text + small leading marker (looks like a bullet dot or short vertical bar to the left).
**Current:** Active item shows yellow text + 2px yellow underline below.
Both convey "active" — semantic equivalent. Listed as backlog cosmetic.

### Award cards (×6) — **MAJOR BUG FIXED**
**Design:** Each card has a uniform 336×336 circular medallion — dark golden interior with a glowing yellow neon ring around it, and the award wordmark (e.g., "TOP TALENT") rendered in 3D-style text in the center.

**Current (before):** Each card showed only a zoomed/stretched fragment of the wordmark text — distorted letterforms like "TA", "RO", "PRO", "IA". No circular ring background visible.

**Root cause:** `public/home/awards/*.png` files are *wordmark strips only* (e.g., `top-talent.png` = 222×36 px = the "TOP TALENT" text logo), NOT full medallions. The card was rendering these as `<Image fill object-cover>`, stretching a 222×36 strip to fill 336×336 → produced the cropped-letter look. The separate `award-bg.png` (336×336 circular medallion background) was never composed in.

**Fix:** Card now matches the home page `AwardCard` pattern — renders `award-bg.png` as the 336×336 background with `fill`, then layers the wordmark PNG centered with `width={280} height={80} max-h-[55%] max-w-[78%] object-contain`. Wordmark stays a wordmark; medallion ring shows uniformly across all 6 cards.

**File:** `app/_components/award-system/award-detail-card.tsx`

### Card content layout — **MATCH**
- Title (yellow), quantity row (trophy icon + "Số lượng giải thưởng: 10 Cá nhân"), value row(s), long description — all present in correct order.
- Alternating image-LEFT (cards 1, 3, 5) / image-RIGHT (cards 2, 4, 6) — matches design.
- Signature 2025 dual value rows (5.000.000 VNĐ cá nhân + 8.000.000 VNĐ tập thể) — matches design.

### Card icon glyphs — minor cosmetic diff (not fixed)
Design uses a heart-like icon next to each title and slightly different glyphs for quantity/value rows. Current uses trophy + ValueIcon. Same semantic role; backlog only.

### Kudos banner — **MATCH**
Yellow KUDOS triangle artwork on right + dark panel with copy + "Chi tiết" CTA → `/sun-kudos`. Matches design.

### Footer — **MATCH**
Logo + 4 nav links + "Bản quyền thuộc về Sun* © 2025". Matches.

## Summary

| Section | Pre-fix | Post-fix |
|---|---|---|
| Hero | ❌ Keyvisual hidden | ✅ Matches design |
| Section header | ✅ | ✅ |
| Menu | △ Cosmetic (underline vs bullet) | △ (deferred) |
| Award cards | ❌ Wordmark stretched | ✅ Matches design |
| Card content | ✅ | ✅ |
| Card icons | △ Different glyphs | △ (deferred) |
| Kudos banner | ✅ | ✅ |
| Footer | ✅ | ✅ |

## Files touched this session
- `app/_components/award-system/award-detail-card.tsx` — layered wordmark over award-bg.png
- `app/_components/award-system/award-hero.tsx` — `isolation: isolate` + left-to-right gradient overlay + `bg-right-top`
- `app/sun-kudos/page.tsx` — (earlier this session) added notification + user slots to Header

Build: PASS post-fix.

## Backlog (deferred cosmetic items)
1. Menu active marker: change from `border-b-2 underline` to a leading bullet/marker to better mirror design
2. Card title heart icon glyph
3. Card quantity/value icon glyphs (swap TrophyIcon/ValueIcon for design-specific glyphs)
4. Earlier deferred items still standing:
   - AwardMenu double-render (mobile + desktop variants → 2 live IntersectionObservers)
   - 2 Next.js Image aspect-ratio warnings on home page
   - OAuth `?next=` ignored in `app/login/actions.ts` (pre-existing)

## Unresolved questions
None.
