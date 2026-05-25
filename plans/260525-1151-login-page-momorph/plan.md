---
id: 260525-1151-login-page-momorph
title: Implement Login Page from MoMorph design
status: completed
created: 2026-05-25
mode: momorph
blockedBy: []
blocks: []
---

# Login Page (MoMorph)

## Goal
Implement the `/login` page from the MoMorph Figma design with Google OAuth via Supabase, and protect `/` so unauthenticated users are redirected to `/login`.

## MoMorph refs
- Login screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- screenId: `GzbNeVGJHz`
- Clarifications: [clarifications.md](./clarifications.md)

## Stack
Next.js 16 (App Router, RSC) · React 19 · Tailwind 4 · TypeScript · `@supabase/ssr` · `@supabase/supabase-js`

## Two-Track Layout
Track A (UI) and Track B (auth/logic) are **parallel-runnable**. No `blockedBy` between them. Integration phase merges them.

| Phase | Track | Title | Status |
|-------|-------|-------|--------|
| 01 | A | [Login screen UI from MoMorph](./phase-01-track-a-login-screen-ui.md) | ✓ completed |
| 02 | B | [Supabase project + SSR client setup](./phase-02-track-b-supabase-setup.md) | ✓ completed |
| 03 | B | [Google OAuth server action + callback route](./phase-03-track-b-google-oauth-flow.md) | ✓ completed |
| 04 | B | [Session middleware + route protection](./phase-04-track-b-middleware-protection.md) | ✓ completed |
| 05 | A+B | [Integrate UI ↔ auth, replace mock handlers](./phase-05-integration.md) | ✓ completed |
| 06 | — | [Verification: build, lint, manual Google sign-in](./phase-06-verification.md) | ✓ completed |

## Out of Scope
- Email/password auth (form fields rendered visual-only per design)
- Signup, forgot-password, MFA, account settings (links route to `#`)
- Custom dashboard at `/` (keep existing boilerplate, just protect it)
- i18n, accessibility audit beyond labels/aria-required
- Test framework setup (no Jest/Playwright config exists — phase 06 = manual verification + `next build`)

## Key Risks
- Supabase env vars missing in dev → Phase 02 must include `.env.local` template + README note
- Google OAuth requires Supabase dashboard config (Google client ID/secret) — manual step documented in Phase 03
- Middleware refresh-token logic per `@supabase/ssr` is subtle — follow official Next.js 16 snippet, don't improvise
- `next.config.ts` does not currently allow Google avatar host — add `images.remotePatterns` only if avatar shown post-login (deferred)

## Completion Notes

**What shipped:**
- `/login` page (async RSC) with Vietnamese SAA 2025 branding: header, hero ("ROOT FURTHER" 2025), Google OAuth button, language switcher visual stub.
- Server action `signInWithGoogle()` + callback route `GET /auth/callback` for Google OAuth code exchange.
- Supabase SSR setup: `lib/supabase/{client,server,middleware}.ts`, typed env accessor, `.env.local.example`.
- Session middleware (renamed to `proxy.ts` per Next.js 16 deprecation) protecting `/` via cookie refresh + auth check.
- Error banner rendering `?error=auth_callback_failed` on login page.
- Assets: logo, branding, SVG icons, optimized background (preview.png → background.jpg).
- Build & lint verified clean; manual Google sign-in tested end-to-end.

**Design discoveries:**
- No email/password form fields in actual design — only Google button. Dropped disabled-fields assumption.
- No signup/forgot-password links in design — not rendered.
- Language switcher exists visually; wiring deferred to future i18n plan.
- Background painterly artwork unavailable from MoMorph (HTTP 500 on node fetch). Workaround: used full design preview render as background, accepting faint "ghost text" under overlays.

**Execution notes:**
- MoMorph MCP not registered in session; bypassed via direct HTTP+SSE curl calls — all fetches (overview, media, specs, test cases, preview.png) succeeded.
- Next.js 16 deprecation applied: `middleware.ts` → `proxy.ts`, `middleware()` → `proxy()`.

## Success Criteria
- `/login` matches MoMorph design (visual diff ≤ small) ✓
- Clicking "Continue with Google" launches OAuth, returns to `/` with active Supabase session ✓
- Direct visit to `/` while logged out redirects to `/login` ✓
- `next build` passes; `next lint` clean ✓
