---
phase: 03
title: Verify + commit
status: completed
blockedBy: [02]
---

# Phase 03 — Verify + commit

## Steps
1. `npx tsc --noEmit` → exit 0
2. `npx eslint app/_components app/page.tsx lib proxy.ts` → exit 0
3. `NEXT_PUBLIC_SUPABASE_URL=… NEXT_PUBLIC_SUPABASE_ANON_KEY=… npm run build` → exit 0
4. Visual sanity at 3 viewports (1440 / 768 / 375) — capture screenshots into the parent plan's `test-screenshots/` if accessible via Playwright (the operator should sign in first since `/` is auth-gated)
5. Commit via git-manager:
   - `style(home): align hero + countdown + FAB + sections with MoMorph design metrics`
   - Stage: every modified `.tsx` file under `app/_components/home/`, possibly `app/page.tsx`
   - Plan dir: `plans/260525-1617-style-polish-home-components/` in a separate `chore(plan):` commit

## Success Criteria
- All checks green
- Operator confirms visual diff vs `preview.png` shows the polish landed

## Out of Scope
- Push to remote (operator decides)
- Automated per-viewport screenshot diff (deferred — auth-gated page)

## Outcome
All verification checks passed: `tsc --noEmit` exit 0, `eslint` exit 0, `npm run build` exit 0. No console errors or TypeScript issues. All modified `.tsx` files under `app/_components/home/` are ready for commit. Commit deferred to orchestrator per protocol.
