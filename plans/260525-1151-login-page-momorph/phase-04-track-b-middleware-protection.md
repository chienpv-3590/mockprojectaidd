---
phase: 04
track: B
title: Session middleware + route protection
status: completed
blockedBy: [02]
---

# Phase 04 — Track B: Middleware + route protection

## Goal
Next.js `middleware.ts` that (a) refreshes the Supabase session on every request via `@supabase/ssr` and (b) redirects unauthenticated users away from protected routes to `/login`.

## Files to create
- `middleware.ts` (project root) — uses the `updateSession` helper from Phase 02

## Logic
1. Always call `updateSession(request)` first — required for refresh-token rotation. The helper returns the `NextResponse` with refreshed cookies.
2. After `updateSession`, instantiate the server client from the rotated request and `auth.getUser()`.
3. **Protected paths:** everything EXCEPT `/login`, `/auth/callback`, `/_next/*`, static assets, and `favicon.ico`.
4. If `user` is null AND path is protected → `NextResponse.redirect(new URL('/login', request.url))` (preserve `updateSession`'s cookies by copying them onto the redirect response).
5. If `user` is non-null AND path is `/login` → redirect to `/` (already signed in; no point staying on login page).
6. Otherwise return the `updateSession` response unchanged.

## Matcher
```ts
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

## Success Criteria
- Logged-out: visiting `/` → 307 to `/login`. Visiting `/login` → 200.
- Logged-in: visiting `/login` → 307 to `/`. Visiting `/` → 200.
- Static assets and `/_next/*` not intercepted (no double-fetch loops).

## Risks
- **Cookie copy on redirect is mandatory** — if you `return NextResponse.redirect(...)` directly without copying cookies from the `updateSession` response, the user loses the refreshed session and gets a redirect loop. Reference: `@supabase/ssr` Next.js middleware example.
- Forgetting to exclude `/auth/callback` from auth check causes the OAuth code exchange to redirect away mid-flow.

## Out of Scope
- Role-based access control. All authenticated users get the same access.

## Outcome
**Delivered:** `proxy.ts` (renamed from `middleware.ts` per Next.js 16 deprecation, function `proxy()` replaces `middleware()`). Implements session refresh via `updateSession()` helper on every request + auth check. Protected routes (all except `/login`, `/auth/callback`, `/_next/*`, static assets) redirect unauthenticated users to `/login`; signed-in users redirected from `/login` to `/`. Cookie management preserved across redirects. Matcher config prevents double-fetches. Tested: redirect flows working, session persists across page refreshes, no loops.
