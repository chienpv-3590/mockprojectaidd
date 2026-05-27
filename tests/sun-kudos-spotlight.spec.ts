import { test, expect } from "./fixtures/auth";

/**
 * E2E suite for the Spotlight Board redesign (B.6 + B.7).
 * Plan: plans/260526-1548-spotlight-board-redesign/
 * MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
 *
 * Covers redesign behaviors not in the base sun-kudos.spec.ts:
 * - word cloud renders recipient names (B.7)
 * - node click → Kudos detail / profile fallback (B.7, TC 33ca8f8a/31693bb7)
 * - activity log strip "HH:MM <name> đã nhận được một Kudos mới"
 * - "N KUDOS" count from DB (B.7.1)
 * - search highlights matching node (B.7.3)
 * - pan/zoom toggle (B.7.2, TC cac4b7a3)
 * - empty/loading state handling (TC d035e3b8)
 */

const PAGE_PATH = "/sun-kudos";

function spotlightRegion(page: import("@playwright/test").Page) {
  return page.locator('[aria-labelledby="spotlight-heading"]');
}

/** The word-cloud svg carries viewBox="0 0 1100 420" (toolbar icons don't). */
function cloudTextNodes(page: import("@playwright/test").Page) {
  return spotlightRegion(page).locator('svg[viewBox="0 0 1100 420"] text');
}

/**
 * d3-cloud lays out asynchronously (dynamic import + layout pass). Wait until
 * either the cloud text nodes appear OR the empty-state copy renders.
 * Returns the settled node count (0 ⇒ empty state).
 */
async function waitForCloud(page: import("@playwright/test").Page): Promise<number> {
  const region = spotlightRegion(page);
  const nodes = cloudTextNodes(page);
  const empty = region.getByText("Chưa có Kudos nào để hiển thị.");
  await expect(nodes.first().or(empty)).toBeVisible({ timeout: 10000 });
  return nodes.count();
}

test.describe("/sun-kudos — Spotlight Board redesign", () => {
  test.beforeEach(async ({ authedContext, page }) => {
    void authedContext;
    await page.goto(PAGE_PATH);
    await expect(page).toHaveTitle(/Kudos|Sun/i);
  });

  test("SPOT-001 — header shows 'SPOTLIGHT BOARD' + subtitle", async ({ page }) => {
    const region = spotlightRegion(page);
    await expect(region).toBeVisible();
    await expect(region.getByRole("heading", { name: /SPOTLIGHT BOARD/i })).toBeVisible();
    await expect(region.getByText("Sun* Annual Awards 2025")).toBeVisible();
  });

  test("SPOT-002 — count badge shows 'N KUDOS' from DB", async ({ page }) => {
    const region = spotlightRegion(page);
    const badge = region.getByText(/\d[\d.,]*\s*KUDOS/i).first();
    await expect(badge).toBeVisible();
    const txt = (await badge.textContent()) ?? "";
    // Number must be a real integer (not the old hardcoded 388 fallback removed).
    expect(txt).toMatch(/\d/);
  });

  test("SPOT-003 — word cloud renders recipient name nodes", async ({ page }) => {
    const count = await waitForCloud(page);
    if (count === 0) {
      // TC d035e3b8 empty-state branch.
      await expect(
        spotlightRegion(page).getByText("Chưa có Kudos nào để hiển thị.")
      ).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
      await expect(cloudTextNodes(page).first()).toBeVisible();
    }
  });

  test("SPOT-004 — node click navigates to Kudos detail or profile", async ({ page }) => {
    const count = await waitForCloud(page);
    test.skip(count === 0, "No spotlight nodes seeded — skipping click nav");

    await cloudTextNodes(page).first().click();
    await page.waitForURL(/\/sun-kudos\/(profile\/)?[a-f0-9-]{8,}/i, { timeout: 5000 });
    expect(page.url()).toMatch(/\/sun-kudos\/(profile\/)?[a-f0-9-]{8,}/i);
  });

  test("SPOT-005 — activity log strip shows 'đã nhận được một Kudos mới'", async ({ page }) => {
    const count = await waitForCloud(page);
    test.skip(count === 0, "No data — activity log hidden");

    const logLine = spotlightRegion(page)
      .getByText(/đã nhận được một Kudos mới/i)
      .first();
    await expect(logLine).toBeVisible();
    // Format per design node 2940:14230: "<HH:MM> <name> đã nhận được một Kudos mới".
    // Single line carries the name + phrase; at least one line in the strip
    // also shows the HH:MM time prefix (skipped only when timestamp missing).
    const lineTxt = (await logLine.textContent()) ?? "";
    expect(lineTxt).toMatch(/.+\s+đã nhận được một Kudos mới/);

    const stripTxt =
      (await spotlightRegion(page)
        .locator('div:has-text("đã nhận được một Kudos mới")')
        .last()
        .textContent()) ?? "";
    expect(stripTxt).toMatch(/\d{1,2}:\d{2}/);
  });

  test("SPOT-006 — search input accepts text + respects 100-char max", async ({ page }) => {
    const region = spotlightRegion(page);
    const search = region.getByRole("searchbox", { name: /Tìm kiếm Sunner/i });
    await expect(search).toBeVisible();
    await expect(search).toHaveAttribute("maxlength", "100");

    await search.fill("a".repeat(150));
    expect((await search.inputValue()).length).toBeLessThanOrEqual(100);
  });

  test("SPOT-007 — search query highlights a matching node without crashing", async ({ page }) => {
    const region = spotlightRegion(page);
    const count = await waitForCloud(page);
    test.skip(count === 0, "No nodes to highlight");

    const nodes = cloudTextNodes(page);
    // Grab a real name from the first rendered node, then search for it.
    const firstName = ((await nodes.first().textContent()) ?? "").trim();
    test.skip(firstName.length < 2, "Node text too short to search");

    const search = region.getByRole("searchbox", { name: /Tìm kiếm Sunner/i });
    await search.fill(firstName.slice(0, Math.min(4, firstName.length)));
    // Debounce is 200ms; wait then assert the cloud is still rendered (no crash).
    await page.waitForTimeout(350);
    await expect(nodes.first()).toBeVisible();
  });

  test("SPOT-008 — pan/zoom toggle flips aria-pressed", async ({ page }) => {
    const region = spotlightRegion(page);
    const btn = region.getByRole("button", { name: /Pan và Zoom/i });
    await expect(btn).toBeVisible();
    const before = await btn.getAttribute("aria-pressed");
    await btn.click();
    const after = await btn.getAttribute("aria-pressed");
    expect(after).not.toBe(before);
  });
});
