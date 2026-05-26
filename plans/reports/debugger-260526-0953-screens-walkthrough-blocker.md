# All-screens walkthrough — blocked at migration apply

**Date:** 2026-05-26
**Status:** PAUSED — env blocker, not code

## Goal
Walk every existing route, capture errors, fix any bug found.

## Routes inventoried (from `next build` output)
- `/` (home)
- `/login` (public)
- `/he-thong-giai` (Award System detail — new this plan)
- `/sun-kudos` (placeholder — new this plan)
- `/auth/callback` (OAuth handler — not directly testable without OAuth flow)

## Unauthenticated walk (via Playwright MCP browser on http://localhost:3000)

| Route | Result |
|---|---|
| `/login` | PASS — renders cleanly, 0 console errors, screenshot matches design (ROOT FURTHER hero + LOGIN With Google CTA) |
| `/` | PASS — redirects → `/login` (auth gate works) |
| `/he-thong-giai` | PASS — redirects → `/login` (auth gate works) |
| `/sun-kudos` | PASS — redirects → `/login` (auth gate works) |

## Static checks
- `npm run build` — PASS
- `npm run lint` — app code clean (errors only in `.claude/` tooling, out of scope)

## Confirmed bug (carried over from previous session)
- **Postgres 42703** `column awards.long_description_vi does not exist` when `getAwards()` runs against the remote DB.
- Verified live via REST: all 5 new columns (`long_description_vi`, `quantity_text`, `unit_text`, `value_text`, `value_breakdown`) are MISSING on project `llybwzmdbumbcgsaligk`.
- Migration `supabase/migrations/0002_extend_awards.sql` is correct and committed (`04b0437`) but NOT applied to the remote Supabase DB.
- Affects both `/he-thong-giai` AND `/` once user is signed in (home page also calls `getAwards()`).

## What was attempted to apply the migration
1. **Local CLI** — `supabase` CLI not installed; `psql` not installed → can't apply from this host.
2. **User Studio paste (×2)** — user reported "applied" twice; REST probe still shows columns missing after each. Likely cause: clicking Run didn't execute, or wrong project selected in Studio, or RLS warning modal silently cancelled.
3. **Service_role key** — provided by user. Tested against:
   - `https://api.supabase.com/v1/projects/{ref}/database/query` → 401 `JWT failed verification` (Management API needs Personal Access Token, not service_role)
   - `https://{ref}.supabase.co/pg/columns` → 404 (no pg-meta on the public REST URL)
   - PostgREST data layer accepts service_role but it does NOT support DDL.
4. **DB connection URI** — user pasted the literal placeholder template `postgresql://postgres:[YOUR-PASSWORD]@db.llybwzmdbumbcgsaligk.supabase.co:5432/postgres`. The `[YOUR-PASSWORD]` was never replaced with the real password.

## What's needed to unblock (any ONE of these)
- **DB password** — visible after clicking "Reveal" or "Reset database password" in Studio → Settings → Database
- **Personal Access Token** — generated at https://supabase.com/dashboard/account/tokens
- **Direct user action in Studio** — open SQL editor, verify project ref in URL bar is `llybwzmdbumbcgsaligk`, paste migration block, click Run, see green "Success" toast; then paste seed block, Run again

## Recommended next-step verification once migration is actually applied
Run this curl from anywhere — if it returns 6 rows of JSON instead of `{"code":"42703",...}`, the migration landed:
```bash
curl -s "https://llybwzmdbumbcgsaligk.supabase.co/rest/v1/awards?select=code,quantity_text,value_text&order=display_order.asc" \
  -H "apikey: <anon_key_from_.env.local>" \
  -H "Authorization: Bearer <anon_key_from_.env.local>"
```

## Authenticated walk — DEFERRED
Once 42703 clears, the following are queued:
- `/he-thong-giai` — verify 6 award cards render, scroll-spy works on menu click, IntersectionObserver updates active item, KudosBanner `Chi tiết` → `/sun-kudos`, Signature 2025 card shows BOTH value rows (5M + 8M).
- `/` (home) — verify still renders post-schema-change (no regression).
- `/sun-kudos` — verify placeholder renders, header active state on `Sun* Kudos` link.
- Header nav active state on each route per `usePathname()`.
- Mobile breakpoint — verify pill row menu with hidden scrollbar (scrollbar-hide utility added this session).

## Files touched this session
- None. Diagnostic-only. The previous session's repair (`scrollbar-hide` utility in `app/globals.css`) remains in place.

## Unresolved questions
1. Why is the user's Studio paste not executing? Worth a fresh session where the user copies a tiny test SQL first (`select count(*) from public.awards;`) to confirm Studio is hitting the right DB.
2. Should the seed.sql file's `value_breakdown` JSONB cast (`::jsonb`) work the same way in pgbouncer/transaction-pooled connections as in direct Postgres? (Should — but worth verifying if pooler is used.)
