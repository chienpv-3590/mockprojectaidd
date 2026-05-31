// Inspect current kudos-related data via Supabase Management API.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; }),
);
const PAT = env.SUPABASE_ACCESS_TOKEN, REF = env.SUPABASE_PROJECT_REF;

export async function runSQL(sql, tries = 5) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${PAT}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: sql }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`SQL ${res.status}: ${text}`);
      return JSON.parse(text);
    } catch (e) {
      if (i === tries) throw e;
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = await runSQL(`
    select json_build_object(
      'kudos_total', (select count(*)::int from public.kudos),
      'kudos_by_sender', (select coalesce(json_agg(t),'[]') from (
          select from_user, count(*)::int n from public.kudos group by from_user order by n desc limit 5) t),
      'feature_hashtags', (select coalesce(json_agg(t),'[]') from (
          select id, label_vi from public.hashtags where kind='feature' limit 5) t),
      'small_hashtags', (select coalesce(json_agg(t),'[]') from (
          select id, label_vi from public.hashtags where kind='small' limit 8) t),
      'profiles_sample', (select coalesce(json_agg(t),'[]') from (
          select user_id, full_name_vi from public.user_profiles limit 8) t),
      'profiles_total', (select count(*)::int from public.user_profiles),
      'rpc_args', (select pg_get_function_arguments(oid) from pg_proc where proname='submit_kudos_atomic' limit 1),
      'real_users', (select coalesce(json_agg(t),'[]') from (
          select id, email from auth.users where email not like '%@saa2025.local' order by created_at desc limit 5) t)
    ) as result;
  `);
  console.log(JSON.stringify(out[0].result, null, 2));
}
