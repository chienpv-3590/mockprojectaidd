import { test, expect } from "./fixtures/auth";

/**
 * Playwright test suite for /sun-kudos/profile/[userId] — Other-User Profile Page (Read-Only).
 *
 * NEW UI (as of 2026-05-27) features:
 *  - Shared header (viewer's own identity + notifications)
 *  - ProfileBanner: avatar, h1 name, dept/title, hero badge
 *  - Back link "← Quay lại Sun Kudos"
 *  - Gold CTA "Gửi Kudos cho người này" → ?compose=<userId>
 *  - ProfileStatsPanel: 3 rows (NO "Mở Secret Box" button, NO box counters)
 *  - ProfileAwardsHeader: KUDOS title only (year <select> dropdown removed)
 *  - ProfileKudosFeed: NO received/sent tabs (showTabs=false) → static "Đã nhận" label
 *
 * Test cases:
 * - PROFILE-001: invalid uuid → 404 "Sunner không tồn tại."
 * - PROFILE-002: banner shows h1 with user name (non-empty)
 * - PROFILE-003: exactly 3 stat rows; NO "Mở Secret Box" button; NO "Số Secret Box chưa mở" row
 * - PROFILE-004: NO received/sent tab toggle; static "Đã nhận" feed label present
 * - PROFILE-005: year <select> dropdown removed — no <select> rendered
 * - PROFILE-006: page <title> matches /\| Sun\* Kudos/ and name part is non-empty
 * - PROFILE-007: from /sun-kudos, click a profile link → URL settles on /sun-kudos/profile/<uuid>
 * - PROFILE-008: "Gửi Kudos cho người này" CTA present → click → ?compose=<uuid> in URL + dialog open
 * - PROFILE-009: logged-out → redirected to /login
 * - PROFILE-010: logged-in but viewing own profile → redirected to /sun-kudos/profile
 */

const INVALID_USER_ID = "00000000-0000-0000-0000-000000000000";

/**
 * Navigate to /sun-kudos and extract a real profile URL from the first kudos
 * card that has a clickable profile link.
 * Returns { url, userId } or null if no links found.
 */
async function findFirstProfileLink(page: import("@playwright/test").Page): Promise<{ url: string; userId: string } | null> {
  await page.goto("/sun-kudos");
  await page.waitForLoadState("domcontentloaded");

  const profileLinks = page.locator('a[href*="/sun-kudos/profile/"]');
  const count = await profileLinks.count();
  if (count === 0) return null;

  const href = await profileLinks.first().getAttribute("href");
  if (!href) return null;

  // Extract uuid from href like /sun-kudos/profile/<uuid>
  const uuidMatch = href.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (!uuidMatch) return null;

  const userId = uuidMatch[1];
  const url = href.startsWith("/") ? `http://localhost:3000${href}` : href;
  return { url, userId };
}

test.describe("/sun-kudos/profile/[userId] — Other-User Profile (Read-Only)", () => {
  test.beforeEach(async ({ authedContext, page }) => {
    void authedContext;
  });

  // ============================================================================
  // PROFILE-001 — invalid uuid renders 404 not-found page
  // ============================================================================

  test("PROFILE-001 — invalid uuid renders 404 'Sunner không tồn tại.'", async ({ page }) => {
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
  // PROFILE-002 — banner shows h1 name (non-empty)
  // ============================================================================

  test("PROFILE-002 — banner displays h1 with user name (non-empty)", async ({ page }) => {
    const profileLink = await findFirstProfileLink(page);
    if (!profileLink) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileLink.url);
    await page.waitForLoadState("domcontentloaded");

    // h1 with user name
    const nameHeading = page.locator("h1").first();
    await expect(nameHeading).toBeVisible();
    const nameText = await nameHeading.textContent();
    expect(nameText?.trim().length).toBeGreaterThan(0);
  });

  // ============================================================================
  // PROFILE-003 — exactly 3 stat rows; NO secret box UI
  // ============================================================================

  test("PROFILE-003 — exactly 3 stat rows visible; NO 'Mở Secret Box' button", async ({ page }) => {
    const profileLink = await findFirstProfileLink(page);
    if (!profileLink) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileLink.url);
    await page.waitForLoadState("domcontentloaded");

    // Assert the 3 stat row labels are present
    const expectedLabels = [
      "Số Kudos bạn nhận được:",
      "Số kudos bạn đã gửi:",
      "Số tim bạn nhận được:",
    ];

    for (const label of expectedLabels) {
      const count = await page.locator(`text="${label}"`).count();
      expect(count).toBeGreaterThan(0);
    }

    // Assert "Mở Secret Box" button is NOT present
    const secretBoxButton = page.locator('button:has-text("Mở Secret Box")');
    await expect(secretBoxButton).toHaveCount(0);

    // Assert "Số Secret Box chưa mở" is NOT present
    const boxUnopened = page.locator('text="Số Secret Box chưa mở:"');
    await expect(boxUnopened).toHaveCount(0);
  });

  // ============================================================================
  // PROFILE-004 — NO tab toggle; static "Đã nhận" label
  // ============================================================================

  test("PROFILE-004 — NO received/sent tab toggle; static 'Đã nhận' label present", async ({ page }) => {
    const profileLink = await findFirstProfileLink(page);
    if (!profileLink) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileLink.url);
    await page.waitForLoadState("domcontentloaded");

    // Assert NO tab buttons with role="tab"
    const tabButtons = page.locator('[role="tab"]');
    await expect(tabButtons).toHaveCount(0);

    // Assert static "Đã nhận: N Kudos" label exists (with aria-label)
    const receivedLabel = page.locator('p[aria-label="Kudos đã nhận"]');
    await expect(receivedLabel).toBeVisible();

    const labelText = await receivedLabel.textContent();
    expect(labelText?.trim()).toMatch(/^Đã nhận: \d+ Kudos$/);
  });

  // ============================================================================
  // PROFILE-005 — year <select> dropdown removed
  // ============================================================================

  test("PROFILE-005 — no year <select> dropdown is rendered", async ({ page }) => {
    const profileLink = await findFirstProfileLink(page);
    if (!profileLink) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileLink.url);
    await page.waitForLoadState("domcontentloaded");

    // The awards header no longer renders a year filter — the feed now spans
    // all years, so no <select> should exist on the page.
    await expect(page.locator("select")).toHaveCount(0);
    // Page still renders normally.
    await expect(page.locator("h1").first()).toBeVisible();
  });

  // ============================================================================
  // PROFILE-006 — page <title> matches pattern with name
  // ============================================================================

  test("PROFILE-006 — page <title> matches /| Sun\\* Kudos/ with non-empty name before |", async ({ page }) => {
    const profileLink = await findFirstProfileLink(page);
    if (!profileLink) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileLink.url);
    await page.waitForLoadState("domcontentloaded");

    // generateMetadata returns `${profile.full_name_vi} | Sun* Kudos`
    await expect(page).toHaveTitle(/\| Sun\* Kudos/i);

    // Title must have non-empty name part before |
    const title = await page.title();
    const namePart = title.split("|")[0].trim();
    expect(namePart.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // PROFILE-007 — clicking profile link from /sun-kudos navigates to /sun-kudos/profile/<uuid>
  // ============================================================================

  test("PROFILE-007 — from /sun-kudos, clicking profile link → URL /sun-kudos/profile/<uuid>", async ({ page }) => {
    const profileLink = await findFirstProfileLink(page);
    if (!profileLink) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    // We're already at /sun-kudos from findFirstProfileLink
    const profileAnchor = page.locator('a[href*="/sun-kudos/profile/"]').first();
    await profileAnchor.click();

    // Wait for soft-nav to settle
    await page.waitForURL(/\/sun-kudos\/profile\/[a-f0-9-]+/);

    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/sun-kudos\/profile\/[a-f0-9-]{36}/);
    expect(currentUrl).toContain(profileLink.userId);
  });

  // ============================================================================
  // PROFILE-008 — "Gửi Kudos cho người này" CTA opens compose dialog
  // ============================================================================

  test('PROFILE-008 — "Gửi Kudos cho người này" CTA → ?compose=<uuid> + dialog opens', async ({ page }) => {
    const profileLink = await findFirstProfileLink(page);
    if (!profileLink) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    await page.goto(profileLink.url);
    await page.waitForLoadState("domcontentloaded");

    // Capture the profile owner's display name to verify it prefills the dialog.
    const ownerName = (await page.locator("h1").first().textContent())?.trim() ?? "";

    // CTA must be present
    const ctaLink = page.locator('a:has-text("Gửi Kudos cho người này")');
    await expect(ctaLink.first()).toBeVisible();

    // Click the CTA → deep-link to the board with ?compose=<userId>
    await ctaLink.first().click();
    await page.waitForURL(/\/sun-kudos\?compose=/);
    expect(page.url()).toContain(`?compose=${profileLink.userId}`);

    // The board auto-opens the submit dialog (LiveBoardClient seeds
    // dialogOpen = !!initialRecipient). Assert it is visible — unconditionally,
    // this is the core behavioral requirement.
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.first()).toBeVisible({ timeout: 7000 });

    // The recipient must be pre-filled with the profile owner.
    if (ownerName.length > 0) {
      await expect(dialog.first()).toContainText(ownerName, { timeout: 5000 });
    }
  });

  // ============================================================================
  // PROFILE-009 — logged-out user redirected to /login
  // ============================================================================

  test("PROFILE-009 — logged-out user redirected to /login", async ({ browser }) => {
    const unauthContext = await browser.newContext();
    const unauthPage = await unauthContext.newPage();

    const targetPath = `/sun-kudos/profile/${INVALID_USER_ID}`;
    await unauthPage.goto(targetPath);
    await unauthPage.waitForLoadState("domcontentloaded");

    // Should redirect to /login
    const url = unauthPage.url();
    expect(url).toMatch(/\/login/);

    await unauthContext.close();
  });

  // ============================================================================
  // PROFILE-010 — viewing own profile redirects to /sun-kudos/profile
  // ============================================================================

  test("PROFILE-010 — viewing own profile /sun-kudos/profile/<own-uuid> → redirect to /sun-kudos/profile", async ({
    page,
    testUserId,
  }) => {
    // Navigate directly to the user's own profile by UUID
    await page.goto(`/sun-kudos/profile/${testUserId}`);
    await page.waitForLoadState("domcontentloaded");

    // Should redirect to /sun-kudos/profile (not /sun-kudos/profile/<uuid>)
    const url = page.url();
    expect(url).toMatch(/\/sun-kudos\/profile(?:$|\?)/);
    expect(url).not.toContain(testUserId);

    // Page should still render normally (self-profile view)
    const selfProfileH1 = page.locator("h1").first();
    await expect(selfProfileH1).toBeVisible();
  });

  // ============================================================================
  // PROFILE-011 — page render does not trigger the React 19 RSC dev perf bug
  // (vercel/next.js#86060). Two known triggers in this stack:
  //   1. Multiple independent `supabase.auth.getUser()` async spans across the
  //      root layout + nested page → React records overlapping spans with a
  //      negative duration. Fixed by `getCachedUser()` (React.cache dedup).
  //   2. An in-page `redirect()` from /sun-kudos/profile/{own-uuid} aborts
  //      before any child renders, leaving childrenEndTime = -Infinity → throw.
  //      Fixed by moving the self-redirect to proxy.ts (middleware).
  // The trigger surfaces as:
  //   "Failed to execute 'measure' on 'Performance': '​ProfilePage' cannot have
  //    a negative time stamp." in the browser console.
  // PROFILE-011 covers the normal-render path; PROFILE-011a covers the
  // self-redirect path that proxy.ts now handles before the page is reached.
  // ============================================================================

  test("PROFILE-011 — visiting profile page emits no 'negative time stamp' performance.measure error", async ({
    page,
  }) => {
    const profileLink = await findFirstProfileLink(page);
    if (!profileLink) {
      test.skip(true, "No kudos cards with profile links found in feed — seed data required");
      return;
    }

    const perfErrors: string[] = [];
    page.on("pageerror", (err) => {
      if (/cannot have a negative time stamp/i.test(err.message)) {
        perfErrors.push(err.message);
      }
    });
    page.on("console", (msg) => {
      if (msg.type() === "error" && /cannot have a negative time stamp/i.test(msg.text())) {
        perfErrors.push(msg.text());
      }
    });

    await page.goto(profileLink.url);
    await page.waitForLoadState("networkidle");

    expect(perfErrors, perfErrors.join("\n")).toHaveLength(0);
  });

  test("PROFILE-011a — visiting /sun-kudos/profile/{own-uuid} (self-redirect) emits no 'negative time stamp' error", async ({
    page,
    testUserId,
  }) => {
    const perfErrors: string[] = [];
    page.on("pageerror", (err) => {
      if (/cannot have a negative time stamp/i.test(err.message)) {
        perfErrors.push(err.message);
      }
    });
    page.on("console", (msg) => {
      if (msg.type() === "error" && /cannot have a negative time stamp/i.test(msg.text())) {
        perfErrors.push(msg.text());
      }
    });

    // Direct hit on /sun-kudos/profile/{own-uuid} — proxy.ts should intercept
    // and 307-redirect to /sun-kudos/profile (canonical) before the page renders.
    await page.goto(`/sun-kudos/profile/${testUserId}`);
    await page.waitForLoadState("networkidle");

    expect(page.url()).toMatch(/\/sun-kudos\/profile(?:$|\?)/);
    expect(page.url()).not.toContain(testUserId);
    expect(perfErrors, perfErrors.join("\n")).toHaveLength(0);
  });
});
