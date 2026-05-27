// One-shot script: apply migration 0003_kudos_live_board.sql + seed rows to the
// live Supabase project via Management API (raw SQL endpoint).
//
// Usage:   node scripts/apply-migration-0003.mjs
// Requires: SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF in .env.local

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Parse .env.local
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Fetch service_role key via Management API
// ---------------------------------------------------------------------------
console.log("Fetching service_role key…");
const keysRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys`, {
  headers: { Authorization: `Bearer ${PAT}` },
});
if (!keysRes.ok) throw new Error(`Failed to fetch API keys: ${keysRes.status} ${await keysRes.text()}`);
const keys = await keysRes.json();
const SR = keys.find((k) => k.name === "service_role")?.api_key;
if (!SR) throw new Error("service_role key not found in project API keys");

// ---------------------------------------------------------------------------
// Helper: run a SQL query against the project DB
// ---------------------------------------------------------------------------
async function runSQL(label, sql) {
  console.log(`\nRunning: ${label}…`);
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAT}`,
      "Content-Type": "application/json",
    },
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

// ---------------------------------------------------------------------------
// 1. Apply migration 0003
// ---------------------------------------------------------------------------
const migrationSQL = readFileSync(
  resolve(root, "supabase/migrations/0003_kudos_live_board.sql"),
  "utf8",
);
await runSQL("migration 0003_kudos_live_board", migrationSQL);

// ---------------------------------------------------------------------------
// 2. Apply seed rows (departments, hashtags, special_days, demo function)
//    Extract only the kudos-specific seed blocks from seed.sql so we don't
//    re-apply award/event_settings rows redundantly.
// ---------------------------------------------------------------------------
const seedSQL = readFileSync(resolve(root, "supabase/seed.sql"), "utf8");

// Extract from the DEPARTMENTS heading onwards (everything after the original demo fn grant)
const seedStart = seedSQL.indexOf("-- DEPARTMENTS");
if (seedStart === -1) throw new Error("Could not find DEPARTMENTS section in seed.sql");
const kudosSeed = seedSQL.slice(seedStart);
await runSQL("seed: departments + hashtags + special_days + demo fn", kudosSeed);

// ---------------------------------------------------------------------------
// 3. Verification queries
// ---------------------------------------------------------------------------
const tableCheck = await runSQL(
  "verify: user_profiles, kudos_hearts, secret_boxes",
  `select
     to_regclass('public.user_profiles') as user_profiles,
     to_regclass('public.kudos_hearts')  as kudos_hearts,
     to_regclass('public.secret_boxes')  as secret_boxes;`,
);

const hashtagCount = await runSQL(
  "verify: hashtag count",
  `select count(*) as hashtag_count from public.hashtags;`,
);

const tierCheck = await runSQL(
  "verify: kudos_tier(50), kudos_tier(20), kudos_tier(9)",
  `select kudos_tier(50) as tier_50, kudos_tier(20) as tier_20, kudos_tier(9) as tier_9;`,
);

// ---------------------------------------------------------------------------
// 4. Summary
// ---------------------------------------------------------------------------
console.log("\n=== Verification Summary ===");
if (Array.isArray(tableCheck) && tableCheck[0]) {
  const r = tableCheck[0];
  const allPresent = r.user_profiles && r.kudos_hearts && r.secret_boxes;
  console.log(`Tables present: user_profiles=${r.user_profiles ?? "MISSING"}, kudos_hearts=${r.kudos_hearts ?? "MISSING"}, secret_boxes=${r.secret_boxes ?? "MISSING"}`);
  if (!allPresent) throw new Error("One or more expected tables are missing!");
}
if (Array.isArray(hashtagCount) && hashtagCount[0]) {
  const count = parseInt(hashtagCount[0].hashtag_count ?? hashtagCount[0].count, 10);
  console.log(`Hashtag count: ${count} (expected 14)`);
  if (count !== 14) console.warn(`  WARNING: expected 14 hashtags, got ${count}`);
}
if (Array.isArray(tierCheck) && tierCheck[0]) {
  const r = tierCheck[0];
  console.log(`kudos_tier: tier(50)=${r.tier_50} (exp 3), tier(20)=${r.tier_20} (exp 2), tier(9)=${r.tier_9} (exp 0)`);
  if (String(r.tier_50) !== "3" || String(r.tier_20) !== "2" || String(r.tier_9) !== "0") {
    throw new Error("kudos_tier function returned unexpected values!");
  }
}

console.log("\nMigration 0003 applied and verified successfully.");
