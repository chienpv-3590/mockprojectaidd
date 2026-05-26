---
phase: 02
track: B
status: completed
runnable_concurrently_with: [01, 03, 04]
---

# Phase 02 — Track B: Extend awards schema + re-seed

## Context Links
- Plan: [plan.md](./plan.md)
- Clarifications: [clarifications.md](./clarifications.md)
- Existing schema: `supabase/migrations/0001_init_homepage.sql`
- Existing seed: `supabase/seed.sql`
- Existing data type: `lib/data/types.ts`
- Existing DAL: `lib/data/awards.ts`

## Overview
- **Priority:** High
- **Status:** Pending
- The MoMorph design surfaces fields that don't exist yet on the `awards` table: `quantity` (count + unit), `value` (money text), `long_description` (multi-sentence), and a `value_breakdown` for Signature 2025's dual-value case.
- Extend table, re-seed, expand the TS type + DAL `select()` so consumers can read the new fields.

## Requirements
- Backwards compatible: home page (`/`) continues to render via existing fields.
- All 6 awards populated with detail-page fields after migration + seed.
- Signature 2025 carries `value_breakdown = [{label: 'cho giải cá nhân', amount_text: '5.000.000 VNĐ'}, {label: 'cho giải tập thể', amount_text: '8.000.000 VNĐ'}]` and `value_text = null`.
- Other 5 awards carry `value_text` populated and `value_breakdown = null`.

## Architecture
- New columns are nullable so existing seed survives during migration apply.
- Re-seed (`on conflict do update`) writes new values for all 6 rows.
- `Award` type gains `long_description_vi`, `quantity_text`, `unit_text`, `value_text`, `value_breakdown`.
- `value_breakdown` typed as `Array<{label: string; amount_text: string}> | null` on the TS side; stored as `jsonb`.

## Related Code Files
**Create:**
- `supabase/migrations/0002_extend_awards.sql`

**Modify:**
- `supabase/seed.sql` — extend the awards `insert ... on conflict ...` with new columns
- `lib/data/types.ts` — add fields to `Award`
- `lib/data/awards.ts` — extend `.select()` list

## Implementation Steps
1. Write `0002_extend_awards.sql`:
   ```sql
   alter table public.awards
     add column if not exists long_description_vi text,
     add column if not exists quantity_text       text,
     add column if not exists unit_text           text,
     add column if not exists value_text          text,
     add column if not exists value_breakdown     jsonb;
   ```
2. Update `supabase/seed.sql` — extend the existing `insert into public.awards (...)` columns list and `do update` clause to include the 5 new columns. Concrete values from MoMorph specs:
   - top-talent: qty `10`, unit `Cá nhân`, value `7.000.000 VNĐ`, breakdown `null`, long_description from spec D.1
   - top-project: qty `02`, unit `Tập thể`, value `15.000.000 VNĐ`, breakdown `null`, long_description from spec D.2
   - top-project-leader: qty `03`, unit `Cá nhân`, value `7.000.000 VNĐ`, breakdown `null`, long_description from spec D.3
   - best-manager: qty `01`, unit `Cá nhân`, value `10.000.000 VNĐ`, breakdown `null`, long_description from spec D.4
   - signature-creator: qty `01`, unit `Cá nhân/Tập thể`, value `null`, breakdown `[{cá nhân, 5tr}, {tập thể, 8tr}]`, long_description from spec D.5
   - mvp: qty `01`, unit `Cá nhân`, value `15.000.000 VNĐ`, breakdown `null`, long_description from spec D.6
3. Update `lib/data/types.ts`:
   ```ts
   export type AwardValueBreakdown = { label: string; amount_text: string };
   export type Award = {
     id: string; code: string; title_vi: string; description_vi: string;
     thumbnail_path: string | null; display_order: number;
     long_description_vi: string | null;
     quantity_text: string | null;
     unit_text: string | null;
     value_text: string | null;
     value_breakdown: AwardValueBreakdown[] | null;
   };
   ```
4. Update `lib/data/awards.ts` — expand `.select(...)` to include new columns.
5. Apply migration via Supabase Studio (per project README workflow).
6. Run `npm run build` to ensure type extension didn't break home page.

## Todo
- [x] `supabase/migrations/0002_extend_awards.sql` created
- [x] `supabase/seed.sql` updated with concrete spec values
- [x] `Award` type extended
- [x] `getAwards()` select list extended
- [x] Migration applied to Supabase
- [x] Re-seed run
- [x] `npm run build` passes
- [x] Home page (`/`) still renders correctly after schema change

## Success Criteria
- `select * from awards` returns all 6 rows with the 5 new fields populated.
- TypeScript build passes without errors.
- Home page renders unchanged.

## Risk Assessment
- **Risk:** Existing home-page query breaks if `.select()` strict column list missed a column. **Mitigation:** Run `npm run build` + manual smoke test on `/` after change.
- **Risk:** JSONB shape drift. **Mitigation:** Lock shape in TS type; treat as read-only in app.

## Security Considerations
- RLS unchanged — existing `awards readable by anyone` policy covers new columns.
- No PII added.

## Next Steps
- Phase 03 consumes the extended `Award` type via the new route.
- Phase 05 integration replaces Phase 01's mock data with the DB-backed values.
