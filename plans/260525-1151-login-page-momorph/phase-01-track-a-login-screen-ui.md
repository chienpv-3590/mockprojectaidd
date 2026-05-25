---
phase: 01
track: A
title: Login screen UI from MoMorph
status: completed
---

# Phase 01 — Track A: Login screen UI

**Runner:** `tkm:momorph-implement-design` skill (at `/tkm:takumi` time). Do NOT pre-code in this plan.

## MoMorph refs
- Login screen: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
- fileKey: `9ypp4enmFmdK3YAFJLIu6C`
- screenId: `GzbNeVGJHz`
- Clarifications: [clarifications.md](./clarifications.md)

## Goal
Pixel-perfect static UI for the login screen at route `app/login/page.tsx`. Wire `onClick` / `onSubmit` to no-op stubs — integration phase replaces them.

## Out of Scope
- No Supabase imports, no server actions, no fetch calls.
- Email/password form fields: render per design, set `disabled` and add subtle "Coming soon" hint only if the design has a placeholder slot — otherwise leave plain.
- No middleware, no `/` changes.

## Integration Contract (consumed by Phase 05)
- Exposes a Google button with `data-testid="login-google"` and an `onClick` prop on the component (server action wired in Phase 05).
- Form-level `action` left empty for Phase 05 to wire.
- Asset folder: `public/login/` (per Next.js convention).

## Outcome
**Delivered:** `app/login/page.tsx` — async RSC rendering full UI per MoMorph design. Header with logo + language switcher, hero section ("ROOT FURTHER" + welcome text in Vietnamese), Google button wrapped in form (action wired in Phase 05), error banner support. No email/password form rendered (design has none). Assets: `public/login/logo.png`, `root-further-logo.png`, `vn.svg`, `down.svg`, `google.svg`, `background.jpg` (optimized preview render). Background fetch workaround applied per design discovery. Pixel-perfect match confirmed visually.
