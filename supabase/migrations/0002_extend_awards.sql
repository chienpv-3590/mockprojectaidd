-- SAA 2025 — Extend awards table with detail-page fields.
-- Adds: long description, quantity + unit, value (single or breakdown),
-- where value_breakdown is JSONB for the Signature 2025 dual-value case.
-- All columns nullable to preserve existing rows during migration apply.

alter table public.awards
  add column if not exists long_description_vi text,
  add column if not exists quantity_text       text,
  add column if not exists unit_text           text,
  add column if not exists value_text          text,
  add column if not exists value_breakdown     jsonb;

-- value_breakdown shape (when non-null):
--   [{ "label": "cho giải cá nhân", "amount_text": "5.000.000 VNĐ" },
--    { "label": "cho giải tập thể", "amount_text": "8.000.000 VNĐ" }]
