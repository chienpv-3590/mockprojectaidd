---
id: 260525-1611-home-ui-major-gaps
title: Home page UI polish — close major gaps vs MoMorph design
status: completed
created: 2026-05-25
completed: 2026-05-25
mode: momorph
blockedBy: []
blocks: [260525-1617-style-polish-home-components]  # styling polish builds on this plan's structural changes
relatedPlans:
  - 260525-1429-home-page-momorph  # completed; this plan refines its UI output
---

# Home UI polish — major gaps

## Goal
Close the two largest visual gaps between the shipped home page (`/`) and the MoMorph design:
1. **Missing B4 "Root Further" section** — decorative `ROOT` + `FURTHER` background typography, multi-paragraph Vietnamese description, English proverb quote.
2. **Award card visual** — currently generic `award-bg.png` for all 6 cards + plain `h3` title. Design overlays per-award stylized text image (`MM_MEDIA_Top Talent`, etc.) directly on the dark thumbnail.

Other gaps (countdown size, hero typography, event-info styling, FAB dimensions, header nav at narrow widths) are deferred to a future polish pass.

## Stack (unchanged)
Next.js 16 · React 19 · Tailwind 4 · TypeScript · existing Supabase DAL · Montserrat fonts

## Phase Layout
| Phase | Title | Depends on | Status |
|---|---|---|---|
| 01 | [Build B4 "Root Further" description section](./phase-01-build-b4-root-further-section.md) | — | ✓ |
| 02 | [Upgrade award card with per-award text overlay](./phase-02-upgrade-award-card-with-text-overlay.md) | — | ✓ |
| 03 | [Verify + commit](./phase-03-verify-and-commit.md) | 01, 02 | ✓ |

## Assets already on disk
- `public/home/root-text.png` (189×67) — stylized "ROOT"
- `public/home/further-text.png` (290×67) — stylized "FURTHER"
- `public/home/awards/top-talent.png` (10.7 KB) — stylized "Top Talent"
- `public/home/awards/top-project.png` (12.3 KB) — stylized "Top Project"
- `public/home/awards/top-project-leader.png` (18.7 KB)
- `public/home/awards/best-manager.png` (11.9 KB)
- `public/home/awards/signature-2025-creator.png` (19.3 KB)
- `public/home/awards/mvp.png` (8.5 KB)
- `public/home/awards/award-bg.png` (168 KB) — shared dark-with-shimmer bg

All assets fetched in the parent plan; no new MoMorph calls required for this polish.

## In Scope
- **Phase 01:** new component `app/_components/home/root-further-description.tsx`. Renders B4 section between `<Hero>` and `<AwardsGrid>` in `app/page.tsx`. Layered: huge faded `ROOT FURTHER` background type (using the two .png assets, low opacity / negative z-index) + Vietnamese paragraph + English quote ("A tree with deep roots fears no storm").
- **Phase 02:** modify `award-card.tsx` so the thumbnail composes `award-bg.png` (full background) + per-award text image (`thumbnail_path` already in DB) overlaid centered. Remove or shrink the `h3` title since the text is now in the image. Keep description (`description_vi`) + "Chi tiết" link below.

## Out of Scope (deferred)
- Countdown box redesign (DD/HH/MM/SS proportions, larger typography)
- Hero "ROOT FURTHER" image sizing
- Event-info text styling (Thời gian / Địa điểm)
- Floating FAB exact pill dimensions
- Header nav link visibility at viewport breakpoints
- Per-section spacing / gradient polish

## Key Risks
- B4's exact Vietnamese paragraph text isn't extractable from the design preview at this resolution. I'll use the spec hint ("multi-paragraph description of the Root Further theme") + plausible Vietnamese copy that captures the brand spirit. Operator should swap for real copy when available.
- Award text images have different aspect ratios (e.g. MVP is 116×52, Top Talent is ~N×35). Overlay sizing needs `object-contain` + max-width tuning so each card looks balanced.

## Success Criteria
- `/` shows the new B4 section between hero and awards grid, with decorative ROOT FURTHER background type + body copy.
- 6 award cards each show their unique stylized text image overlaid on the shared dark background.
- `next build` passes; `eslint` clean.
- Visual diff against `preview.png` shows the missing B4 section now present and the cards distinguishable.

## Cross-plan
Depends on completed `260525-1429-home-page-momorph` for the page scaffold and all assets. Touches only `app/page.tsx`, `app/_components/home/award-card.tsx`, and adds one new component file.

## Completion Notes
Phase 01 created `app/_components/home/root-further-description.tsx` with decorative ROOT/FURTHER background typography (opacity 0.07–0.10), 3 Vietnamese paragraphs (placeholder copy), and English quote. Phase 02 restructured award cards to overlay per-award text images on shared dark background, removed redundant h3 titles, and added line-clamp-2 to descriptions. Phase 03 verified tsc, eslint, and build all exit 0. Plan synced to completed state; git commit deferred to orchestrator.
