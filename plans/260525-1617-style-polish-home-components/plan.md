---
id: 260525-1617-style-polish-home-components
title: Home page style polish — close remaining medium/minor gaps vs design
status: completed
created: 2026-05-25
completed: 2026-05-25
mode: momorph
blockedBy: [260525-1611-home-ui-major-gaps]
blocks: []
relatedPlans:
  - 260525-1429-home-page-momorph     # completed; original home page
  - 260525-1611-home-ui-major-gaps    # structural changes this polish builds on
---

# Home style polish

## Goal
Close the remaining visual gaps between the home page and the MoMorph design after the structural changes (B4 section + award card overlay) land. Per-element styles (sizing, typography, spacing, dimensions) brought in line with Figma `get_node` styles.

## Scope (the 6 deferred gaps from previous gap analysis)
1. **Hero typography** — "ROOT FURTHER" image is smaller than design proportions
2. **Hero countdown** — boxes look smaller / plainer than design; verify spec dimensions
3. **Hero B2 event info** — bland inline text; design has labeled "Thời gian:" / "Địa điểm:" with proper typography
4. **Header nav links** — verify breakpoints (design appears to hide at narrow widths)
5. **Floating FAB** — spec item 6 says 105×64 pill; current dimensions need verification
6. **Section polish** — kudos bg opacity, footer spacing, hover/focus states

## Stack (unchanged)
Next.js 16 · React 19 · Tailwind 4 · TypeScript · Montserrat fonts

## Phase Layout
| Phase | Title | Depends on | Status |
|---|---|---|---|
| 01 | [Survey design via MoMorph `get_node` for key elements](./phase-01-survey-element-styles.md) | — | ✓ |
| 02 | [Apply per-element style updates](./phase-02-apply-style-polish.md) | 01 | ✓ |
| 03 | [Verify + commit](./phase-03-verify-and-commit.md) | 02 | ✓ |

## In Scope
Element-level CSS/Tailwind updates across these existing components:
- `app/_components/home/hero.tsx` — ROOT FURTHER image size, event info `<p>` typography, CTA spacing
- `app/_components/home/countdown-timer.tsx` — box dimensions, separator styling, label typography
- `app/_components/home/header.tsx` — nav link visibility breakpoint (verify), slot button dimensions per spec A1.6/A1.8 (40×40)
- `app/_components/home/floating-fab.tsx` — pill dimensions per spec item 6 (105×64 with rounded radius)
- `app/_components/home/kudos-section.tsx` — bg image opacity / blend mode for legibility
- `app/_components/home/footer.tsx` — spacing, link typography
- (Possibly) `app/page.tsx` — section vertical spacing

## Out of Scope
- Adding NEW UI elements (covered by `260525-1611-home-ui-major-gaps`)
- Interaction wiring (nav target pages, FAB click handler, language i18n) — still stubs per parent plan
- Animation beyond CSS hover/focus transitions
- Visual changes to the `<Header>`'s NotificationBell / UserMenu / LanguageSwitcher children — these are working components from parent plans
- Award card visual upgrade — already covered in `major-gaps` plan

## Key Risks
- Style metrics fetched via `get_node` may differ between artboard sizes — assume desktop 1440 as canonical, adjust mobile via breakpoints.
- Hero ROOT FURTHER scaling needs to balance with countdown + CTAs vertically — increasing size too much could push CTAs below the fold.
- Kudos bg image opacity tweak risks reducing brand visibility — verify against the original design.

## Success Criteria
- Visual diff against `plans/260525-1429-home-page-momorph/research/preview.png` shows tighter match on hero proportions, countdown look, event info, footer.
- All previously-stubbed dimensions (FAB pill, header slot buttons) match spec values.
- `next build` passes; `eslint` clean; no console errors.

## Cross-plan
Strictly sequenced after `260525-1611-home-ui-major-gaps`. Both plans touch hero / award card / page composition — running this one second avoids merge churn.

## Completion Notes
All three phases executed on 2026-05-25. Phase 01 surveyed 12 elements via MoMorph `get_node`, documented in `research/style-metrics.md`. Phase 02 applied metrics-aligned polish to 6 components: user-menu (gold border), hero (enlarged imagery, uppercase labels, wider CTAs), countdown-timer (larger boxes with borders), kudos-section (dark card wrapper), awards-grid (tighter spacing), and header (nav styling). Phase 03 verified tsc/eslint/build all exit 0; commit deferred to orchestrator.
