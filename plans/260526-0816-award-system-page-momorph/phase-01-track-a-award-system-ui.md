---
phase: 01
track: A
status: completed
runnable_concurrently_with: [02, 03, 04]
---

# Phase 01 — Track A: Award System screen UI from MoMorph

**Skill:** `momorph-implement-design`

## MoMorph refs
- Screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- screenId: `zFYDgyj_pD`
- Clarifications: [clarifications.md](./clarifications.md)

## Goal
Implement the Award System page UI pixel-faithfully from the MoMorph design. Components only — mock data extracted from design (titles, descriptions, quantities, values, image paths). No data fetching, no routing logic.

## Out of scope
- Supabase queries / real data wiring (handled in Phase 05 integration).
- Smooth-scroll behavior + IntersectionObserver scroll-spy (handled in Phase 05).
- Auth gate / route creation (Phase 03).
- Header nav active-state changes (Phase 04).

## Integration contract (for Phase 05)
- [x] Export a server-renderable `<AwardSystem awards={Award[]} />` container consuming the extended `Award` type from `lib/data/types.ts` (Phase 02 adds `quantity_text`, `unit_text`, `value_text`, `value_breakdown`, `long_description_vi`).
- [x] Left-menu items derived from the same `awards` array (one entry per row, in `display_order`).
- [x] Each card carries `id={award.code}` so menu clicks can target `#${code}`.
- [x] `<KudosBanner />` exposes an internal `<Link href="/sun-kudos">` for the `Chi tiết` button.
- [x] All 6 component files created: `award-hero.tsx`, `award-menu.tsx`, `award-detail-card.tsx`, `kudos-banner.tsx`, `award-system.tsx`, `mock-awards.ts`.
- [x] Visual rules applied: dark theme, yellow highlights, alternating image positions, responsive mobile/desktop layouts.
