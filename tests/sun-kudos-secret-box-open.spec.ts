import { test, expect } from "./fixtures/auth";
import { SunKudosProfileSelfPage } from "./pages/sun-kudos-profile-self-page";
import { SecretBoxOpenDialogPage } from "./pages/secret-box-open-dialog-page";

/**
 * E2E for the Secret Box "chưa mở" modal (MoMorph J3-4YFIpMM).
 *
 * Covers the dialog UX flow on top of /sun-kudos/profile:
 *   - SBOX-001: clicking the stats "Mở Secret Box" tile opens the dialog in closed state
 *   - SBOX-002: clicking the closed box swaps to revealed state, decrements counter
 *   - SBOX-003: pressing Escape closes the dialog
 *   - SBOX-004: clicking the X button closes the dialog
 *
 * Each test self-seeds N unopened boxes for the freshly-minted Playwright user
 * via service_role so the spec runs deterministically.
 */

const PROFILE_PATH = "/sun-kudos/profile";
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://llybwzmdbumbcgsaligk.supabase.co";
const PAT = process.env.SUPABASE_ACCESS_TOKEN ?? "";
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "";

let cachedServiceRole: string | null = null;
async function getServiceRole(): Promise<string> {
  if (cachedServiceRole) return cachedServiceRole;
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`,
    { headers: { Authorization: `Bearer ${PAT}` } }
  );
  if (!res.ok) throw new Error(`api-keys: ${res.status}`);
  const keys = (await res.json()) as Array<{ name: string; api_key: string }>;
  const sr = keys.find((k) => k.name === "service_role");
  if (!sr?.api_key) throw new Error("service_role missing");
  cachedServiceRole = sr.api_key;
  return cachedServiceRole;
}

/** Insert N unopened secret boxes owned by `userId` via service_role. */
async function seedUnopenedBoxes(userId: string, n: number): Promise<void> {
  const sr = await getServiceRole();
  const rows = Array.from({ length: n }, () => ({
    owner: userId,
    status: "unopened",
  }));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/secret_boxes`, {
    method: "POST",
    headers: {
      apikey: sr,
      Authorization: `Bearer ${sr}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    throw new Error(`seedUnopenedBoxes: ${res.status} ${await res.text()}`);
  }
}

test.describe("Secret Box open modal — /sun-kudos/profile", () => {
  test("SBOX-001 — clicking 'Mở Secret Box' opens dialog in closed state", async ({
    authedContext,
    testUserId,
    page,
  }) => {
    void authedContext;
    await seedUnopenedBoxes(testUserId, 2);

    await page.goto(PROFILE_PATH);
    await page.waitForLoadState("domcontentloaded");

    const profilePage = new SunKudosProfileSelfPage(page);
    const dialogPage = new SecretBoxOpenDialogPage(page);

    const unopened = parseInt(
      (await profilePage.boxUnopendedStat().textContent())?.trim() ?? "0",
      10
    );
    expect(unopened).toBeGreaterThan(0);

    await profilePage.secretBoxButton().click();
    await expect(dialogPage.dialog()).toBeVisible({ timeout: 5000 });
    await expect(dialogPage.title()).toHaveText(/KHÁM PHÁ/i);
    await expect(dialogPage.instruction()).toBeVisible();
    await expect(dialogPage.rewardLabel()).toHaveCount(0);
    expect(await dialogPage.counterValue()).toBe(unopened);
  });

  test("SBOX-002 — clicking the closed box reveals a badge and decrements counter", async ({
    authedContext,
    testUserId,
    page,
  }) => {
    void authedContext;
    await seedUnopenedBoxes(testUserId, 2);

    await page.goto(PROFILE_PATH);
    await page.waitForLoadState("domcontentloaded");

    const profilePage = new SunKudosProfileSelfPage(page);
    const dialogPage = new SecretBoxOpenDialogPage(page);

    const unopenedBefore = parseInt(
      (await profilePage.boxUnopendedStat().textContent())?.trim() ?? "0",
      10
    );
    expect(unopenedBefore).toBeGreaterThan(0);

    await profilePage.secretBoxButton().click();
    await expect(dialogPage.dialog()).toBeVisible({ timeout: 5000 });

    await dialogPage.boxImage().click();
    await expect(dialogPage.rewardLabel()).toBeVisible({ timeout: 10_000 });
    await expect(dialogPage.title()).toHaveText(/MỞ SECRET BOX THÀNH CÔNG/i);
    expect(await dialogPage.counterValue()).toBe(unopenedBefore - 1);
  });

  test("SBOX-003 — Escape closes the dialog", async ({
    authedContext,
    testUserId,
    page,
  }) => {
    void authedContext;
    await seedUnopenedBoxes(testUserId, 1);

    await page.goto(PROFILE_PATH);
    await page.waitForLoadState("domcontentloaded");

    const profilePage = new SunKudosProfileSelfPage(page);
    const dialogPage = new SecretBoxOpenDialogPage(page);

    await profilePage.secretBoxButton().click();
    await expect(dialogPage.dialog()).toBeVisible({ timeout: 5000 });

    await page.keyboard.press("Escape");
    await expect(dialogPage.dialog()).toHaveCount(0);
  });

  test("SBOX-004 — X button closes the dialog", async ({
    authedContext,
    testUserId,
    page,
  }) => {
    void authedContext;
    await seedUnopenedBoxes(testUserId, 1);

    await page.goto(PROFILE_PATH);
    await page.waitForLoadState("domcontentloaded");

    const profilePage = new SunKudosProfileSelfPage(page);
    const dialogPage = new SecretBoxOpenDialogPage(page);

    await profilePage.secretBoxButton().click();
    await expect(dialogPage.dialog()).toBeVisible({ timeout: 5000 });

    await dialogPage.closeButton().click();
    await expect(dialogPage.dialog()).toHaveCount(0);
  });
});
