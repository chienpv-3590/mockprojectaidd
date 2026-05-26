import { test as base, type BrowserContext } from "@playwright/test";

/**
 * Auth fixture for protected SAA 2025 routes (/he-thong-giai, /sun-kudos, /).
 *
 * Strategy: instead of completing Google OAuth interactively, we mint an
 * email/password user via the Supabase Auth Admin API (service_role), sign in
 * with that user to get a real session, then inject the @supabase/ssr cookie
 * (`sb-{ref}-auth-token=base64-{base64(JSON.stringify(session))}`) into the
 * browser context. The server's `createServerClient` reads the cookie just as
 * if the user had logged in normally.
 *
 * The fixture creates the user once at suite-scope and deletes it on teardown
 * so tests stay deterministic.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://llybwzmdbumbcgsaligk.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const PAT = process.env.SUPABASE_ACCESS_TOKEN ?? "";
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "";

if (!ANON_KEY || !PAT || !PROJECT_REF) {
  throw new Error(
    "Tests need NEXT_PUBLIC_SUPABASE_ANON_KEY + SUPABASE_ACCESS_TOKEN + " +
      "SUPABASE_PROJECT_REF in .env.local"
  );
}

const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
const TEST_EMAIL = "playwright-e2e@saa2025.local";
const TEST_PASSWORD = "PlayE2E_2026!";

// Service role key cached after the first Management API lookup.
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
  if (!sr?.api_key) throw new Error("service_role key not returned by Management API");
  cachedServiceRole = sr.api_key;
  return cachedServiceRole;
}

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string };
};

async function createOrEnsureUser(): Promise<string> {
  const serviceRole = await getServiceRole();
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Playwright E2E" },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (json?.id) return json.id;
  // Look up existing user id (user already exists from a prior run)
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
  });
  const list = await listRes.json();
  const found = (list.users ?? []).find(
    (u: { email?: string }) => u.email === TEST_EMAIL
  );
  if (!found?.id) throw new Error(`Failed to mint or find ${TEST_EMAIL}`);
  return found.id;
}

async function deleteUser(userId: string): Promise<void> {
  const serviceRole = await getServiceRole();
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { apikey: serviceRole, Authorization: `Bearer ${serviceRole}` },
  });
}

async function signInAndGetSession(): Promise<SupabaseSession> {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    }
  );
  if (!res.ok) {
    throw new Error(`Sign in failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as SupabaseSession;
}

async function injectSessionCookie(
  context: BrowserContext,
  session: SupabaseSession
): Promise<void> {
  const payload = `base64-${Buffer.from(JSON.stringify(session)).toString(
    "base64"
  )}`;
  await context.addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: payload,
      domain: "localhost",
      path: "/",
      sameSite: "Lax",
      httpOnly: false,
      secure: false,
    },
  ]);
}

type AuthFixtures = {
  authedContext: BrowserContext;
};

export const test = base.extend<AuthFixtures>({
  authedContext: async ({ context }, use) => {
    const userId = await createOrEnsureUser();
    const session = await signInAndGetSession();
    await injectSessionCookie(context, session);
    await use(context);
    await deleteUser(userId);
  },
});

export const expect = test.expect;
