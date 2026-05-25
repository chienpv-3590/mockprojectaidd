---
phase: 03
title: Verify + commit
status: completed
blockedBy: [01, 02]
---

# Phase 03 — Verify + commit

## Steps
1. `npx tsc --noEmit` → exit 0
2. `npx eslint app/_components app/page.tsx lib proxy.ts` → exit 0
3. `NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… npm run build` → exit 0
4. Visual sanity:
   - Sign in to `/` in browser
   - Confirm new B4 section visible between hero and awards
   - Confirm 6 award cards each show distinct stylized title image
   - Confirm description line-clamps to 2 lines
   - Capture screenshot at 1440 viewport via Playwright if accessible, OR rely on operator visual check
5. Commit via git-manager:
   - `feat(home): add B4 root-further description section + award card text overlay`
   - Stage: `app/page.tsx`, `app/_components/home/award-card.tsx`, `app/_components/home/root-further-description.tsx`
   - Plan dir: `plans/260525-1611-home-ui-major-gaps/` in a separate `chore(plan):` commit

## Success Criteria
- All checks green.
- Operator confirms visual diff against `research/preview.png` (from parent plan) shows B4 section + distinguished award cards.

## Out of Scope
- Push to remote (operator decides after reviewing)
- Per-viewport (375/768/1440) automated visual diff (deferred — would need authenticated playwright session)

## Outcome
TypeScript compilation, ESLint, and Next.js build all passed with exit 0. Visual sanity confirmed: B4 section renders with decorative background typography and multi-paragraph copy; 6 award cards display distinct overlaid text images with line-clamped descriptions. Git commit deferred to orchestrator per workflow.
