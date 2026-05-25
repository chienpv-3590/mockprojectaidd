---
phase: 03
track: B
title: Google OAuth server action + callback route
status: completed
blockedBy: [02]
---

# Phase 03 — Track B: Google OAuth flow

## Goal
Server-action that initiates Supabase Google OAuth + a callback route that exchanges the code for a session cookie, then redirects to `/`.

## Files to create
- `app/login/actions.ts` — `'use server'` module exporting `signInWithGoogle()` server action
- `app/auth/callback/route.ts` — `GET` handler: exchanges `?code=` via `supabase.auth.exchangeCodeForSession()`, redirects to `next` (default `/`)

## Implementation Steps
1. **Server action `signInWithGoogle`:**
   - Read `origin` from Next.js `headers()` (request URL).
   - Call `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '${origin}/auth/callback?next=/' } })`.
   - If error, `throw` — Next.js surfaces it to the client.
   - On success, the helper returns `{ data: { url } }` — `redirect(url)` via `next/navigation`.
2. **Callback route handler:**
   - Read `code` and `next` from `request.nextUrl.searchParams`.
   - If `code` present → `exchangeCodeForSession(code)` using server client. On success → `NextResponse.redirect(new URL(next ?? '/', request.url))`.
   - On failure → redirect to `/login?error=auth_callback_failed`.
3. **Login error rendering:** Phase 05 wires `?error=` query param into the UI (toast or inline message).

## Manual setup (documented in README)
- In Supabase dashboard: Authentication → Providers → Google → enable, paste Google OAuth Client ID + Secret from Google Cloud Console.
- Authorized redirect URI in Google Cloud: `https://{project-ref}.supabase.co/auth/v1/callback`.
- Site URL in Supabase: `http://localhost:3000` (dev) and production URL.

## Success Criteria
- Hitting the server action manually (devtools) opens Google consent screen.
- After consent, browser lands on `/` with a Supabase session cookie set.

## Risks
- `exchangeCodeForSession` requires the **server** client (cookie-bound), not the browser client. Easy to import the wrong factory — review.
- PKCE flow (default in `@supabase/ssr`) stores verifier in cookie — middleware must NOT strip it.

## Out of Scope
- Sign-out flow (no UI placement decided yet — defer to future plan).

## Outcome
**Delivered:** `app/login/actions.ts` exporting `signInWithGoogle()` server action (reads origin from headers, calls `supabase.auth.signInWithOAuth()` with redirectTo callback, redirects on success). `app/auth/callback/route.ts` GET handler exchanges code for session via `exchangeCodeForSession()`, redirects to `/` or home, bounces on error to `/login?error=auth_callback_failed`. Manual Supabase Google provider config step documented in README. Tested end-to-end; manual sign-in flow works without issues.
