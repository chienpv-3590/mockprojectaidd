# Postgres 42703 (undefined_column) on /he-thong-giai — Diagnosis + Repair

**Date:** 2026-05-26
**Mode:** Quick

## Symptom
`Uncaught Error: {code: "42703", ...}` when loading `/he-thong-giai` (or `/sun-kudos`, or `/` — any page that calls `getAwards()`).

## Root cause
**Schema drift.** Migration `supabase/migrations/0002_extend_awards.sql` adds 5 columns to `public.awards` (`long_description_vi`, `quantity_text`, `unit_text`, `value_text`, `value_breakdown`). The migration is committed to the repo but **not applied** to the remote Supabase project at `llybwzmdbumbcgsaligk.supabase.co`. `lib/data/awards.ts:8-10` selects those 5 columns → Postgres rejects with `42703`.

## Evidence
- `lib/data/awards.ts:8-10` — SELECT list includes the new columns.
- `supabase/migrations/0002_extend_awards.sql:6-12` — adds the columns (idempotent `add column if not exists`).
- `supabase` CLI not installed locally; `psql` not installed locally → cannot apply from this host.
- `.env.local` points at project `llybwzmdbumbcgsaligk` — only v0001 schema is live there.

## Repair (you run this — no code change)

### Option A — Supabase Studio (fastest)
1. Open `https://supabase.com/dashboard/project/llybwzmdbumbcgsaligk/sql`
2. Paste contents of `supabase/migrations/0002_extend_awards.sql` → **Run**
3. Paste contents of `supabase/seed.sql` → **Run** (re-seeds the 6 rows with detail-page values via `on conflict do update`)
4. Reload `/he-thong-giai` — error gone, 6 cards render with detail fields.

### Option B — Supabase CLI (if you prefer)
```bash
npm i -g supabase            # install once
supabase link --project-ref llybwzmdbumbcgsaligk
supabase db push             # applies migrations/0002_extend_awards.sql
# Seed: paste seed.sql into SQL editor (CLI does not auto-seed remote projects)
```

## Verify
After Step 3 of Option A, run in the SQL editor:
```sql
select code, quantity_text, unit_text, value_text, value_breakdown
from public.awards
order by display_order;
```
Expected: 6 rows. `signature-creator` row has `value_text = null` and `value_breakdown` populated with 2-item JSON array. Other 5 rows: `value_text` populated, `value_breakdown = null`.

Then in browser DevTools Console on `/he-thong-giai`: no `42703` error in Network tab; page renders.

## Prevention
No code repair to add a regression test against — the bug is purely operational (migration not applied). Two lightweight guards worth considering (separate plan, not this fix):
1. **Pre-deploy check**: a `predeploy` npm script that runs `supabase db push --dry-run` and fails if pending migrations exist.
2. **DAL graceful degrade**: `lib/data/awards.ts` could catch `42703` specifically and log "missing migration: 0002_extend_awards" — but this masks the real issue and is anti-pattern. Recommend NOT doing this.

## Files inspected (none modified)
- `lib/data/awards.ts`
- `lib/data/types.ts`
- `supabase/migrations/0002_extend_awards.sql`
- `supabase/seed.sql`
- `supabase/README.md`
- `.env.local`

## Unresolved questions
- None. Action is unambiguous: apply migration + re-seed via Supabase Studio.

**Status:** DONE — diagnosis complete, no code change, repair is one SQL editor paste.
