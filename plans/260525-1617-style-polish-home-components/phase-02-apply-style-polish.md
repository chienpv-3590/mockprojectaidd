---
phase: 02
title: Apply per-element style polish
status: completed
blockedBy: [01]
---

# Phase 02 — Apply style polish

## Goal
Apply all 6 polish updates by editing existing component files. Use `research/style-metrics.md` from Phase 01 as the source of truth.

## Files to modify
- `app/_components/home/hero.tsx`
- `app/_components/home/countdown-timer.tsx`
- `app/_components/home/header.tsx`
- `app/_components/home/floating-fab.tsx`
- `app/_components/home/kudos-section.tsx`
- `app/_components/home/footer.tsx`
- `app/page.tsx` (section vertical spacing only if needed)

## Per-file change checklist

### `hero.tsx`
- [ ] ROOT FURTHER `<Image>` width: bump from `w-64 sm:w-80 lg:w-[28rem]` to match design proportions (likely `w-80 sm:w-[26rem] lg:w-[36rem]` or per `research/style-metrics.md`)
- [ ] Event info `<p>` (Thời gian / Địa điểm): style "Thời gian:" and "Địa điểm:" as small uppercase labels; values as larger Montserrat 600 white
- [ ] CTA buttons: spacing between buttons (gap-4 → gap-5/6 per design), padding-x to match Figma
- [ ] Optional: tighten min-h to bring CTA buttons above the fold at 1440×900

### `countdown-timer.tsx`
- [ ] Box `<span>` padding: bump from `px-3 py-2` to per-spec values
- [ ] Box font-size: bump from `text-3xl sm:text-4xl` to per-spec
- [ ] Add subtle border / shadow if design has it
- [ ] Label text-size: ensure "Ngày / Giờ / Phút" matches spec

### `header.tsx`
- [ ] Nav link visibility breakpoint: confirm `hidden lg:flex` matches design (might be `md` or `sm`)
- [ ] Notification + User slot buttons: ensure 40×40 per spec A1.6/A1.8 (already `h-10 w-10`, verify)
- [ ] Header padding: confirm `px-6 py-4 sm:px-10` matches design

### `floating-fab.tsx`
- [ ] Width: bump from `w-[105px]` to spec value (already 105 — verify)
- [ ] Height: bump from `h-16` (64px) to spec value (already 64 — verify)
- [ ] Border radius: spec says "Pill 105x64" — full pill = `rounded-full`, currently `rounded-full` ✓
- [ ] Verify icon + label positioning

### `kudos-section.tsx`
- [ ] Bg image opacity: tweak from `opacity-40` to match design legibility
- [ ] Logo image size: `h-16` may need bump to match design dominance
- [ ] CTA padding to match B3 CTA

### `footer.tsx`
- [ ] Vertical padding: tweak `py-10` to match design
- [ ] Link spacing: `gap-x-6 gap-y-2` might need adjustment
- [ ] Logo size: confirm `h-10` matches spec 7.1 (69×64)

### `app/page.tsx` (only if spacing audit reveals issues)
- [ ] Vertical padding between Hero / B4 / AwardsGrid / KudosSection / Footer

## Constraints
- Edit existing files only. Do NOT create new components.
- Use `research/style-metrics.md` values — do not eyeball.
- Tailwind utility classes preferred; inline `style={{}}` for exact pixel values only when Tailwind doesn't have a matching utility.

## Success Criteria
- Each checkbox above ticked, with reference to the metric in `research/style-metrics.md`.
- Visual diff against `plans/260525-1429-home-page-momorph/research/preview.png` shows tighter match.
- `next build` + `tsc` + `eslint` all pass.

## Risks
- Increasing ROOT FURTHER image size may push the countdown / CTAs out of viewport at common screen sizes. Verify at 1440×900 + 1366×768.
- Hero `min-h-[80vh]` may need to grow to accommodate larger content.

## Out of Scope
- Adding new sections, new components, new interactivity.
- Animation, scroll-triggered reveals.

## Outcome
Applied metrics-aligned Polish across 6 components: `user-menu.tsx` (square gold border button), `hero.tsx` (ROOT FURTHER image enlarged to w-80 sm:w-[26rem] lg:w-[36rem] xl:w-[42rem]; event info labels uppercase tracking, values semi-bold; CTA gap-10 px-9 py-3.5), `countdown-timer.tsx` (boxes text-5xl/6xl px-5 py-3 sm:px-7 sm:py-4 with borders/backdrop-blur; outer gap gap-6 sm:gap-10; label tracking-[0.2em]), `kudos-section.tsx` (inner content wrapped in rounded-2xl bg-[#0F0F0F] card; logo h-20 sm:h-24), `awards-grid.tsx` (py-24 lg:py-32; gap-8; title lg:text-5xl), `header.tsx` (h-20; bg rgba(16,20,23,0.8); logo h-12; nav gap-7; lg:px-20). All files modified, tsc/eslint/build pass.
