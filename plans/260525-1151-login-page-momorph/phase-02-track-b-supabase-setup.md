---
phase: 02
track: B
title: Supabase project + SSR client setup
status: completed
---

# Phase 02 — Track B: Supabase SSR setup

## Goal
Install `@supabase/ssr` + `@supabase/supabase-js`, create browser + server client factories, and wire env-var contract.

## Files to create
- `lib/supabase/client.ts` — browser client via `createBrowserClient`
- `lib/supabase/server.ts` — server-component / route-handler client via `createServerClient` + Next.js `cookies()`
- `lib/supabase/middleware.ts` — `updateSession(request: NextRequest)` helper (refresh-token rotation) for Phase 04
- `.env.local.example` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `lib/env.ts` — typed env accessor that throws on missing vars (fail-fast at boot)

## Files to modify
- `package.json` — add deps
- `README.md` — append "## Auth setup" section: Supabase project creation + Google provider config link, env-var copy step

## Implementation Steps
1. `npm install @supabase/ssr @supabase/supabase-js`
2. Write client factories using **Next.js 16 App Router pattern** (read official `@supabase/ssr` docs in `node_modules/@supabase/ssr/README.md` — pattern may have shifted; do NOT rely on training-data snippets).
3. Server client must call `cookies()` from `next/headers` and wire `getAll` / `setAll` for cookie persistence.
4. `lib/env.ts`: throw `Error` with actionable message if either var is missing/empty.
5. Add `.env.local` to `.gitignore` if not already.

## Success Criteria
- `npm run build` passes with the two env vars set to dummy non-empty values (`http://localhost`, `dummy`).
- Importing `createClient` from `lib/supabase/server` in a server component compiles without `cookies()` warnings.

## Risks
- Next.js 16 `cookies()` API may be async — verify against `node_modules/next/dist/docs/`.
- `@supabase/ssr` versions ≥ 0.5 changed the cookie API from `get`/`set` to `getAll`/`setAll`. Use whichever the installed version exports.

## Out of Scope
- DB schema, RLS policies, profiles table — auth-only for this plan.

## Outcome
**Delivered:** `@supabase/ssr` + `@supabase/supabase-js` installed. Browser client (`lib/supabase/client.ts` via `createBrowserClient`), server client (`lib/supabase/server.ts` with async `cookies()` from next/headers per Next.js 16), middleware helper (`lib/supabase/middleware.ts` for token refresh). `lib/env.ts` typed accessor (throws on missing vars). `.env.local.example` with required vars. README updated with "## Auth setup" section. Build passes with dummy env values. No deviations from spec.
