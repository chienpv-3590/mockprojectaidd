---
phase: 06
track: —
title: Verification — build, lint, manual sign-in
status: completed
blockedBy: [05]
---

# Phase 06 — Verification

## Goal
Confirm the screen builds, lints, and the full Google sign-in round-trip works against a real Supabase project.

## Steps
1. **Build:** `npm run build` — must pass with no errors. Type errors block.
2. **Lint:** `npm run lint` — must pass.
3. **Dev server smoke test (manual):**
   - Set real `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
   - Configure Google provider in Supabase dashboard (per Phase 03 manual setup)
   - `npm run dev` → open `http://localhost:3000/` → expect redirect to `/login`
   - Click "Continue with Google" → Google consent → redirect back to `/` with session
   - Refresh `/` → stays on `/` (no redirect loop)
   - Clear cookies → reload `/` → bounces to `/login`
4. **Visual diff (Track A leftover):** the `momorph-implement-design` skill's Phase 3 visual-diff step (≤ 2 rounds) should already have run during Phase 01. If integration changes shifted layout (banner above form), re-run a single visual-diff pass.

## Success Criteria
- All four steps pass.
- No console errors in browser devtools during the sign-in round-trip.

## Out of Scope
- Automated e2e tests (no Playwright config exists). Add in a future plan if needed.
- Production deployment.

## Manual checklist for the operator
- [x] `.env.local` created from `.env.local.example` with real values
- [x] Supabase dashboard: Google provider enabled, Client ID/Secret pasted
- [x] Google Cloud: redirect URI added (`https://{ref}.supabase.co/auth/v1/callback`)
- [x] Supabase dashboard: Site URL includes `http://localhost:3000`

## Outcome
**Delivered:** `npm run build` passes cleanly (exit 0), `npm run lint` clean (eslint + tsc). Manual dev smoke test completed: `/` redirects to `/login` when logged out; Google button launches OAuth consent; successful consent redirects to `/` with Supabase session cookie; page refresh on `/` does NOT loop back to login; cookies cleared → `/` bounces to `/login` again. Browser console: no errors during round-trip. Visual diff re-run: no shifts from Phase 01 after integration. All four success criteria met. Project ready for deployment.
