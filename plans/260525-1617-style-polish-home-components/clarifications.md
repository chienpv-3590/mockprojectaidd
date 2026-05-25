# Clarifications

## Session 2026-05-25
- Q: How to sequence with the existing `260525-1611-home-ui-major-gaps` plan? → A: Sequence — major-gaps first, polish second. This plan `blockedBy: [260525-1611-home-ui-major-gaps]`. Avoids edit conflicts on shared files (`award-card.tsx`, `app/page.tsx`).
- Q: Should this plan add NEW elements (e.g. more sections)? → A: No — polish only. Adding new UI belongs in the major-gaps or a future plan.
- Q: Hero ROOT FURTHER size — go bigger per design? → A: Yes, scale up to match design proportions. Verify against `get_node` before guessing pixel values.
- Q: FAB pill 105×64? → A: Per spec item 6. Verify dimensions via `get_node` if the node ID is in the overview.
- Q: Header nav visibility breakpoint? → A: Currently `hidden lg:flex`. Verify against design at multiple widths.
