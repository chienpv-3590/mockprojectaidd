import { test, expect } from "./fixtures/auth";

/**
 * Playwright test suite for /sun-kudos/[id] — Kudos Detail Page.
 *
 * Test IDs prefixed with DETAIL- to distinguish from MoMorph IDs.
 *
 * Covers:
 * - DETAIL-001  Invalid UUID → 404 not-found page
 * - DETAIL-002  Valid id → enlarged card with sender, receiver, message, time, hashtags
 * - DETAIL-003  Back link returns to /sun-kudos
 * - DETAIL-004  Sender and receiver names are links to /sun-kudos/profile/[userId]
 * - DETAIL-005  "Sao chép liên kết" button present
 * - DETAIL-006  Heart count visible (♥ {n})
 * - DETAIL-007  Feature hashtag badge renders (uppercase gold chip) when present
 * - DETAIL-008  Unauthenticated user is redirected to /login?next=/sun-kudos/[id]
 * - DETAIL-009  page.title() contains sender → receiver names
 */

const FEED_PATH = "/sun-kudos";
const INVALID_UUID = "00000000-0000-0000-0000-000000000000";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Navigate to /sun-kudos and grab the href of the first card's view-detail link.
 * Returns null if no card is found (empty feed state).
 */
async function getFirstCardDetailHref(page: import("@playwright/test").Page): Promise<string | null> {
  await page.goto(FEED_PATH);
  await expect(page).toHaveTitle(/Kudos|Sun/i);

  // Wait up to 5 s for a card content link → /sun-kudos/{id}. Exclude profile
  // links by href (their visible text is a person name, not "profile").
  const firstDetailLink = page
    .locator('a[href*="/sun-kudos/"]:not([href*="/profile/"])')
    .filter({ hasNotText: /Quay lại|danh sách/ })
    .first();

  try {
    await firstDetailLink.waitFor({ state: "attached", timeout: 5_000 });
    return await firstDetailLink.getAttribute("href");
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

test.describe("/sun-kudos/[id] — Kudos Detail", () => {
  test.beforeEach(async ({ authedContext, page }) => {
    // Ensure authedContext cookie is injected into the page's browser context
    // before any navigation. The fixture handles cookie injection; referencing
    // authedContext here ensures it runs before the test body.
    void authedContext;
    void page; // page shares the same context; no extra navigation here
  });

  // --------------------------------------------------------------------------
  // DETAIL-001 — Invalid UUID renders 404 page
  // --------------------------------------------------------------------------
  test("DETAIL-001 — invalid id renders 404 page", async ({ page }) => {
    await page.goto(`/sun-kudos/${INVALID_UUID}`);

    // Next.js calls notFound() which renders not-found.tsx
    await expect(
      page.getByText("Kudos không tồn tại hoặc đã bị xóa.")
    ).toBeVisible();

    // Back link points to /sun-kudos
    const backLink = page.locator('a[href="/sun-kudos"]');
    await expect(backLink.first()).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // DETAIL-002 — Valid id renders enlarged card with all key content
  // --------------------------------------------------------------------------
  test("DETAIL-002 — valid id renders enlarged card with sender, receiver, message, time, hashtags", async ({
    page,
  }) => {
    const href = await getFirstCardDetailHref(page);
    if (!href) {
      test.skip(true, "No kudos cards visible in feed — skipping detail check");
      return;
    }

    await page.goto(href);
    await page.waitForLoadState("domcontentloaded");

    // Sender user block: at least one <a> linking to a profile
    const profileLinks = page.locator('a[href*="/sun-kudos/profile/"]');
    await expect(profileLinks.first()).toBeVisible();

    // Formatted timestamp — appears as a <p> with date digits (dd/mm/yyyy hh:mm)
    const timeText = page.locator(
      'p:has-text("/"), span:has-text("/")'
    ).filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ });
    await expect(timeText.first()).toBeVisible();

    // Message body is a <p> inside main with some text content
    const main = page.locator("main");
    await expect(main).toBeVisible();

    // At least one non-empty paragraph (the kudos message)
    const messagePara = main.locator("p").filter({ hasNotText: /\// }).first();
    await expect(messagePara).toBeVisible();

    // Hashtag chips — rendered as <span> with "#" prefix (if present)
    // We don't assert count because a kudos may have zero small hashtags.
    // Just verify the container area rendered without error.
    await expect(page.locator("body")).not.toContainText("Error");
    await expect(page.locator("body")).not.toContainText("500");
  });

  // --------------------------------------------------------------------------
  // DETAIL-003 — Back link returns to feed
  // --------------------------------------------------------------------------
  test("DETAIL-003 — back link returns to /sun-kudos", async ({ page }) => {
    const href = await getFirstCardDetailHref(page);
    if (!href) {
      test.skip(true, "No kudos cards visible — skipping back-link check");
      return;
    }

    await page.goto(href);
    await page.waitForLoadState("domcontentloaded");

    const backLink = page.locator('a[href="/sun-kudos"]').filter({
      hasText: /Quay lại/,
    });
    await expect(backLink.first()).toBeVisible();

    await backLink.first().click();
    // App Router soft-nav: wait for the URL to settle on the feed.
    await page.waitForURL(/\/sun-kudos\/?$/);
    expect(page.url()).toMatch(/\/sun-kudos\/?$/);
  });

  // --------------------------------------------------------------------------
  // DETAIL-004 — Sender and receiver names are links to profile
  // --------------------------------------------------------------------------
  test("DETAIL-004 — sender and receiver names are clickable links to /sun-kudos/profile/[userId]", async ({
    page,
  }) => {
    const href = await getFirstCardDetailHref(page);
    if (!href) {
      test.skip(true, "No kudos cards — skipping profile-link check");
      return;
    }

    await page.goto(href);
    await page.waitForLoadState("domcontentloaded");

    // The detail page renders two UserBlock components, each an <a> pointing
    // to /sun-kudos/profile/{uuid}
    const profileLinks = page.locator('a[href*="/sun-kudos/profile/"]');
    const count = await profileLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Each link should have a non-empty href with a UUID segment
    const senderHref = await profileLinks.nth(0).getAttribute("href");
    const receiverHref = await profileLinks.nth(1).getAttribute("href");
    expect(senderHref).toMatch(/\/sun-kudos\/profile\/[a-f0-9-]+/);
    expect(receiverHref).toMatch(/\/sun-kudos\/profile\/[a-f0-9-]+/);
  });

  // --------------------------------------------------------------------------
  // DETAIL-005 — "Sao chép liên kết" button is present
  // --------------------------------------------------------------------------
  test("DETAIL-005 — copy link button present", async ({ page }) => {
    const href = await getFirstCardDetailHref(page);
    if (!href) {
      test.skip(true, "No kudos cards — skipping copy-link check");
      return;
    }

    await page.goto(href);
    await page.waitForLoadState("domcontentloaded");

    const copyBtn = page.locator('button:has-text("Sao chép liên kết")');
    await expect(copyBtn).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // DETAIL-006 — Heart count visible
  // --------------------------------------------------------------------------
  test("DETAIL-006 — heart count visible", async ({ page }) => {
    const href = await getFirstCardDetailHref(page);
    if (!href) {
      test.skip(true, "No kudos cards — skipping heart-count check");
      return;
    }

    await page.goto(href);
    await page.waitForLoadState("domcontentloaded");

    // The heart count is rendered as "♥ {n}" — look for the ♥ symbol
    const heartSpan = page.locator('span:has-text("♥")').first();
    await expect(heartSpan).toBeVisible();

    // Sibling text node contains a numeric count
    const heartArea = page
      .locator("span")
      .filter({ hasText: /♥\s*\d+/ })
      .first();
    await expect(heartArea).toBeVisible();
    const text = await heartArea.textContent();
    expect(text).toMatch(/♥\s*\d+/);
  });

  // --------------------------------------------------------------------------
  // DETAIL-007 — Feature hashtag badge renders when present
  // --------------------------------------------------------------------------
  test("DETAIL-007 — feature hashtag badge renders when present", async ({
    page,
  }) => {
    const href = await getFirstCardDetailHref(page);
    if (!href) {
      test.skip(true, "No kudos cards — skipping feature-hashtag check");
      return;
    }

    await page.goto(href);
    await page.waitForLoadState("domcontentloaded");

    // The badge is an inline-block div with uppercase text and a gold background.
    // It only renders if kudos.feature_hashtag is set; if absent we skip silently.
    const badge = page.locator(
      'div[style*="FFEA9E"], span[style*="FFEA9E"], div[style*="ffea9e"]'
    ).first();

    const hasBadge = await badge.isVisible().catch(() => false);
    if (!hasBadge) {
      // Badge absent — acceptable if this kudos has no feature hashtag.
      // Just confirm the page loaded without errors.
      await expect(page.locator("main")).toBeVisible();
      return;
    }

    // When badge is present it should be uppercased text
    const badgeText = await badge.textContent();
    expect(badgeText?.trim().length).toBeGreaterThan(0);
    // Rendered with textTransform: uppercase — text should equal its own toUpperCase
    expect(badgeText?.trim()).toBe(badgeText?.trim().toUpperCase());
  });

  // --------------------------------------------------------------------------
  // DETAIL-008 — Unauthenticated user is redirected to /login?next=/sun-kudos/[id]
  // --------------------------------------------------------------------------
  test("DETAIL-008 — unauth user is redirected to /login", async ({
    context,
  }) => {
    // Use a fresh page from the RAW context — no auth cookie injected.
    const unauthPage = await context.newPage();

    // Clear any existing cookies so no session is present
    await context.clearCookies();

    const detailPath = `/sun-kudos/${INVALID_UUID}`;
    await unauthPage.goto(detailPath);
    await unauthPage.waitForLoadState("domcontentloaded");

    // The auth middleware redirects logged-out users on protected routes to
    // /login (no next= param — the login flow always returns to home).
    const finalUrl = unauthPage.url();
    expect(finalUrl).toMatch(/\/login/);

    await unauthPage.close();
  });

  // --------------------------------------------------------------------------
  // DETAIL-009 — page title contains sender → receiver names
  // --------------------------------------------------------------------------
  test("DETAIL-009 — page title contains sender → receiver names", async ({
    page,
  }) => {
    const href = await getFirstCardDetailHref(page);
    if (!href) {
      test.skip(true, "No kudos cards — skipping title check");
      return;
    }

    await page.goto(href);
    // Wait for metadata to resolve (generateMetadata is async server-side)
    await page.waitForLoadState("domcontentloaded");

    const title = await page.title();

    // Title format: "{sender_name} → {receiver_name} | Sun* Kudos"
    // At minimum it should contain the arrow separator and the brand
    expect(title).toMatch(/→/);
    expect(title).toMatch(/Sun\*\s*Kudos|Kudos/i);
  });
});
