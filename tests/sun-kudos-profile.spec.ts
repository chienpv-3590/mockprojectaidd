import { test, expect } from "./fixtures/auth";

/**
 * Playwright test suite for /sun-kudos/profile/[userId] — User Profile Page.
 *
 * Test cases covered:
 * - PROFILE-001: invalid userId renders 404 not-found page
 * - PROFILE-002: profile card shows full_name_vi + back link
 * - PROFILE-003: 4 stat tiles all visible
 * - PROFILE-004: back link navigates to /sun-kudos
 * - PROFILE-005: page title contains profile name
 * - PROFILE-006: navigating from a kudos card sender/receiver link lands on correct profile URL
 * - PROFILE-007: unauthenticated user is redirected to /login?next=/sun-kudos/profile/[userId]
 * - PROFILE-008: tier stat tile value matches one of "–", "Bronze", "Silver", "Gold"
 *
 * Strategy for acquiring a real userId: navigate to /sun-kudos, find first card
 * with a sender link that includes /sun-kudos/profile/, capture the userId from
 * that href, then exercise the profile page directly.
 */

const INVALID_USER_ID = "00000000-0000-0000-0000-000000000000";

/**
 * Navigate to /sun-kudos and extract a real profile URL from the first kudos
 * card that has a clickable sender or receiver profile link.
 * Returns null if the feed has no cards with profile links (e.g. empty seed).
 */
async function findFirstProfileUrl(page: import("@playwright/test").Page): Promise<string | null> {
  await page.goto("/sun-kudos");
  await page.waitForLoadState("domcontentloaded");

  // Try sender links first, then receiver links
  const profileLinks = page.locator('a[href*="/sun-kudos/profile/"]');
  const count = await profileLinks.count();
  if (count === 0) return null;

  const href = await profileLinks.first().getAttribute("href");
  if (!href) return null;

  // href may be relative like /sun-kudos/profile/<uuid>
  return href.startsWith("/") ? `http://localhost:3000${href}` : href;
}

test.describe("/sun-kudos/profile/[userId] — Profile", () => {
  test.beforeEach(async ({ authedContext, page }) => {
    // Ensure authedContext cookies are injected; authedContext is the same
    // context that `page` belongs to via the base fixture extension.
    void authedContext;
  });

  // ============================================================================
  // PROFILE-001 — invalid userId renders not-found page
  // ============================================================================

  test("PROFILE-001 — invalid userId renders not-found page", async ({ page }) => {
    await page.goto(`/sun-kudos/profile/${INVALID_USER_ID}`);
    await page.waitForLoadState("domcontentloaded");

    // not-found.tsx renders "Sunner không tồn tại."
    await expect(
      page.locator('text="Sunner không tồn tại."')
    ).toBeVisible();

    // Should also show a back-link to /sun-kudos on the 404 page
    const backLink = page.locator('a[href="/sun-kudos"]');
    await expect(backLink.first()).toBeVisible();
  });

  // ============================================================================
  // PROFILE-002 — profile card shows name + back link
  // ============================================================================

  test("PROFILE-002 — profile card shows full_name_vi and back link", async ({ page }) => {
    const profileUrl = await findFirstProfileUrl(page);
    if (!profileUrl) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileUrl);
    await page.waitForLoadState("domcontentloaded");

    // Back link must be present
    const backLink = page.locator('a[href="/sun-kudos"]:has-text("Quay lại Sun Kudos")');
    await expect(backLink.first()).toBeVisible();

    // Profile name heading (h1) must be non-empty
    const nameHeading = page.locator("h1");
    await expect(nameHeading).toBeVisible();
    const nameText = await nameHeading.textContent();
    expect(nameText?.trim().length).toBeGreaterThan(0);
  });

  // ============================================================================
  // PROFILE-003 — 4 stat tiles all visible
  // ============================================================================

  test("PROFILE-003 — 4 stat tiles are all visible", async ({ page }) => {
    const profileUrl = await findFirstProfileUrl(page);
    if (!profileUrl) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileUrl);
    await page.waitForLoadState("domcontentloaded");

    // Each tile is identified by its label text
    const statLabels = [
      "Số Kudos nhận",
      "Số Kudos đã gửi",
      "Số tim nhận",
      "Hoa thị tier",
    ];

    for (const label of statLabels) {
      await expect(
        page.locator(`text="${label}"`).first()
      ).toBeVisible();
    }
  });

  // ============================================================================
  // PROFILE-004 — back link navigates to /sun-kudos
  // ============================================================================

  test("PROFILE-004 — back link navigates back to /sun-kudos", async ({ page }) => {
    const profileUrl = await findFirstProfileUrl(page);
    if (!profileUrl) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileUrl);
    await page.waitForLoadState("domcontentloaded");

    const backLink = page.locator('a[href="/sun-kudos"]:has-text("Quay lại Sun Kudos")').first();
    await expect(backLink).toBeVisible();
    await backLink.click();

    // App Router soft-nav: wait for the URL to settle on the feed.
    await page.waitForURL(/\/sun-kudos(?:$|\?)/);
    expect(page.url()).toMatch(/\/sun-kudos(?:$|\?)/);
  });

  // ============================================================================
  // PROFILE-005 — page title contains the profile's name
  // ============================================================================

  test("PROFILE-005 — page <title> contains the profile's display name", async ({ page }) => {
    const profileUrl = await findFirstProfileUrl(page);
    if (!profileUrl) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileUrl);
    await page.waitForLoadState("domcontentloaded");

    // generateMetadata returns `${profile.full_name_vi} | Sun* Kudos`
    await expect(page).toHaveTitle(/\| Sun\* Kudos/i);

    // Title must also include a non-empty name before the pipe
    const title = await page.title();
    const namePart = title.split("|")[0].trim();
    expect(namePart.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // PROFILE-006 — clicking a kudos card sender/receiver link navigates to their profile
  // ============================================================================

  test("PROFILE-006 — clicking sender/receiver name in feed opens correct profile URL", async ({ page }) => {
    await page.goto("/sun-kudos");
    await page.waitForLoadState("domcontentloaded");

    const profileLink = page.locator('a[href*="/sun-kudos/profile/"]').first();
    const count = await profileLink.count();

    if (count === 0) {
      test.skip(true, "No profile links found in feed — seed data required");
      return;
    }

    const expectedHref = await profileLink.getAttribute("href");
    await profileLink.click();
    // App Router soft-nav: wait for the profile URL to settle.
    await page.waitForURL(/\/sun-kudos\/profile\/[a-f0-9-]+/);

    // URL must match the profile path we clicked
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/sun-kudos\/profile\/[a-f0-9-]+/);

    if (expectedHref) {
      // Extract the UUID from the expected href and verify it appears in the URL
      const uuidMatch = expectedHref.match(/[a-f0-9-]{36}/);
      if (uuidMatch) {
        expect(currentUrl).toContain(uuidMatch[0]);
      }
    }
  });

  // ============================================================================
  // PROFILE-007 — unauthenticated user is redirected to /login?next=…
  // ============================================================================

  test("PROFILE-007 — unauthenticated user is redirected to /login", async ({
    browser,
  }) => {
    // Use a fresh context with NO auth cookies
    const unauthContext = await browser.newContext();
    const unauthPage = await unauthContext.newPage();

    const targetPath = `/sun-kudos/profile/${INVALID_USER_ID}`;
    await unauthPage.goto(targetPath);
    await unauthPage.waitForLoadState("domcontentloaded");

    // The auth middleware redirects logged-out users on protected routes to
    // /login (no next= param — the login flow always returns to home).
    const url = unauthPage.url();
    expect(url).toMatch(/\/login/);

    await unauthContext.close();
  });

  // ============================================================================
  // PROFILE-008 — tier label value is one of "–", "Bronze", "Silver", "Gold"
  // ============================================================================

  test('PROFILE-008 — "Hoa thị tier" tile value is "–", "Bronze", "Silver", or "Gold"', async ({
    page,
  }) => {
    const profileUrl = await findFirstProfileUrl(page);
    if (!profileUrl) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileUrl);
    await page.waitForLoadState("domcontentloaded");

    // The "Hoa thị tier" stat tile label; the sibling span above it holds the value
    const tierLabel = page.locator('text="Hoa thị tier"').first();
    await expect(tierLabel).toBeVisible();

    // The value is rendered in a span immediately before the label within the tile div
    // StatTile structure: <div><span value /><span label /></div>
    // Use the parent div and then find the first span (the value span)
    const tierTile = tierLabel.locator("..");
    const tierValue = tierTile.locator("span").first();
    const valueText = (await tierValue.textContent())?.trim() ?? "";

    expect(valueText).toMatch(/^(–|Bronze|Silver|Gold)$/);
  });
});
