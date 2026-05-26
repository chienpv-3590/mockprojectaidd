// One-shot patch: update awards.value_breakdown with sub-labels per design.
// Pulls service_role via Supabase Management API (uses SUPABASE_ACCESS_TOKEN +
// SUPABASE_PROJECT_REF from .env.local), then PATCHes each row via PostgREST.

import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const PAT = env.SUPABASE_ACCESS_TOKEN;
const REF = env.SUPABASE_PROJECT_REF;
if (!SUPABASE_URL || !PAT || !REF) throw new Error("Missing env vars");

const keysRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys`, {
  headers: { Authorization: `Bearer ${PAT}` },
});
const keys = await keysRes.json();
const SR = keys.find((k) => k.name === "service_role").api_key;

const UPDATES = [
  { code: "top-talent", value_text: null, value_breakdown: [{ label: "cho mỗi giải thưởng", amount_text: "7.000.000 VNĐ" }] },
  { code: "top-project", value_text: null, value_breakdown: [{ label: "cho mỗi giải thưởng", amount_text: "15.000.000 VNĐ" }] },
  { code: "top-project-leader", value_text: null, value_breakdown: [{ label: "cho mỗi giải thưởng", amount_text: "7.000.000 VNĐ" }] },
  { code: "best-manager", value_text: null, value_breakdown: [{ label: null, amount_text: "10.000.000 VNĐ" }] },
  { code: "mvp", value_text: null, value_breakdown: [{ label: null, amount_text: "15.000.000 VNĐ" }] },
];

for (const u of UPDATES) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/awards?code=eq.${u.code}`,
    {
      method: "PATCH",
      headers: {
        apikey: SR,
        Authorization: `Bearer ${SR}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ value_text: u.value_text, value_breakdown: u.value_breakdown }),
    },
  );
  if (!res.ok) throw new Error(`${u.code}: ${res.status} ${await res.text()}`);
  console.log(`${u.code}: ok`);
}
