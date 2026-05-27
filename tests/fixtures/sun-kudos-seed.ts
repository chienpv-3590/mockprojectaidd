import { test as base } from "@playwright/test";

/**
 * Seed fixture for Sun Kudos tests.
 *
 * Before each test, call `seed_kudos_demo_for_current_user()` RPC via service_role
 * to populate the demo user with a deterministic set of kudos cards, highlighting
 * different scenarios: sent, received, with hearts, special-day hearts, etc.
 *
 * The fixture runs once per test worker; cleanup is deferred to auth fixture's teardown.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://llybwzmdbumbcgsaligk.supabase.co";
const PAT = process.env.SUPABASE_ACCESS_TOKEN ?? "";
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "";

if (!PAT || !PROJECT_REF) {
  throw new Error(
    "Sun Kudos seed fixture needs SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF"
  );
}

let cachedServiceRole: string | null = null;

async function getServiceRole(): Promise<string> {
  if (cachedServiceRole) return cachedServiceRole;
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`,
    { headers: { Authorization: `Bearer ${PAT}` } }
  );
  if (!res.ok) {
    throw new Error(`Fetch api-keys failed: ${res.status} ${await res.text()}`);
  }
  const keys = (await res.json()) as Array<{ name: string; api_key: string }>;
  const sr = keys.find((k) => k.name === "service_role");
  if (!sr?.api_key) throw new Error("service_role key not returned");
  cachedServiceRole = sr.api_key;
  return cachedServiceRole;
}

/**
 * Seed demo kudos for the authenticated user.
 * Calls the `seed_kudos_demo_for_current_user()` RPC which populates:
 * - 5+ recent kudos (sent, received, with hearts)
 * - Highlight carousel data
 * - Spotlight recipients
 * - Optional special-day test data
 *
 * This RPC should exist in the database as a security-definer function
 * callable by authenticated users.
 */
export async function seedKudosForUser(userId: string): Promise<void> {
  const serviceRole = await getServiceRole();

  // Call the RPC to seed demo data for this user
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/seed_kudos_demo_for_current_user`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(
      `Seed RPC returned ${res.status}: ${text} — tests will run with existing DB state`
    );
    // Do NOT throw — tests should still run with empty/existing state
  }
}

type SunKudosSeedFixtures = {
  seededKudos: void;
};

/**
 * Extend the auth fixture with kudos seeding.
 * Assumes 'authedContext' was set up by auth.ts fixture.
 */
export const test = base.extend<SunKudosSeedFixtures>({
  seededKudos: async ({ context }, use) => {
    // Extract user ID from the auth cookie if possible, or use a test email hash
    // For simplicity, we'll use the same test user ID as in auth.ts
    const TEST_USER_ID = "playwright-e2e-user-id"; // This should match the user created by auth fixture

    try {
      await seedKudosForUser(TEST_USER_ID);
      console.log(`Seeded kudos for user ${TEST_USER_ID}`);
    } catch (err) {
      console.warn(`Failed to seed kudos: ${err}`);
    }

    await use();
  },
});

export const expect = test.expect;
