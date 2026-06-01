// One-shot script: apply migration 0006_authz_hardening.sql (C1 + C2) and
// re-create the patched seed_kudos_demo_for_current_user function (C5) to the
// live Supabase project via Management API, then verify.
//
// Usage:   node scripts/apply-migration-0006.mjs
// Requires: SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF in .env.local

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const PAT = env.SUPABASE_ACCESS_TOKEN;
const REF = env.SUPABASE_PROJECT_REF;
if (!PAT || !REF) throw new Error("Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF in .env.local");

async function runSQL(label, sql) {
  console.log(`\nRunning: ${label}…`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`  FAILED (${res.status}): ${text}`);
    throw new Error(`SQL failed for "${label}": ${res.status}`);
  }
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  console.log(`  OK:`, Array.isArray(parsed) ? `${parsed.length} row(s)` : parsed);
  return parsed;
}

// 1. Apply migration 0006 (C1 submit_kudos_atomic guard + C2 secret_boxes WITH CHECK)
await runSQL(
  "migration 0006_authz_hardening",
  readFileSync(resolve(root, "supabase/migrations/0006_authz_hardening.sql"), "utf8"),
);

// 2. Re-create the patched seed function (C5 — auth.users rows for demo identities)
const seedSQL = readFileSync(resolve(root, "supabase/seed.sql"), "utf8");
const fnStart = seedSQL.indexOf("create or replace function public.seed_kudos_demo_for_current_user()");
const grantMarker = "grant execute on function public.seed_kudos_demo_for_current_user() to authenticated;";
const fnEnd = seedSQL.indexOf(grantMarker);
if (fnStart === -1 || fnEnd === -1) throw new Error("Could not locate seed_kudos_demo function in seed.sql");
const fnBlock = seedSQL.slice(fnStart, fnEnd + grantMarker.length);
await runSQL("recreate seed_kudos_demo_for_current_user (C5)", fnBlock);

// 3. Verify C1 — submit_kudos_atomic body now enforces auth.uid()
const c1 = await runSQL(
  "verify C1: submit_kudos_atomic has auth.uid() guard",
  `select position('p_from_user is distinct from auth.uid()' in pg_get_functiondef(p.oid)) > 0 as guarded
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'submit_kudos_atomic';`,
);

// 4. Verify C2 — secret_boxes UPDATE policy has a WITH CHECK clause
const c2 = await runSQL(
  "verify C2: secret_boxes update policy WITH CHECK",
  `select with_check from pg_policies
    where schemaname='public' and tablename='secret_boxes'
      and policyname='owner updates secret_boxes';`,
);

console.log("\n=== Verification Summary ===");
console.log(`C1 submit_kudos_atomic guarded: ${c1?.[0]?.guarded === true ? "YES" : "NO — CHECK"}`);
console.log(`C2 secret_boxes WITH CHECK:     ${c2?.[0]?.with_check ? c2[0].with_check : "NULL — CHECK"}`);
if (c1?.[0]?.guarded !== true) throw new Error("C1 guard not present after apply!");
if (!c2?.[0]?.with_check) throw new Error("C2 WITH CHECK not present after apply!");
console.log("\nMigration 0006 + seed patch applied and verified successfully.");
