/**
 * Page Object — /sun-kudos/profile/[userId] (Other-User Profile)
 *
 * Encapsulates selectors and interactions for the read-only other-user profile page.
 * Simplifies test assertions and reduces selector duplication.
 */

import { Page, expect } from "@playwright/test";

export class SunKudosProfilePage {
  constructor(readonly page: Page) {}

  /**
   * Navigate to another user's profile by UUID.
   * Assumes path-based navigation (Next.js resolves /sun-kudos/profile/<uuid>).
   */
  async goto(userId: string) {
    await this.page.goto(`/sun-kudos/profile/${userId}`);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Get the page title (for metadata assertions).
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get the profile name from the h1 banner heading.
   */
  async getBannerName(): Promise<string | null> {
    const nameHeading = this.page.locator("h1").first();
    return nameHeading.textContent();
  }

  /**
   * Check if banner name is visible (non-empty).
   */
  async isBannerNameVisible(): Promise<boolean> {
    const nameHeading = this.page.locator("h1").first();
    const isVisible = await nameHeading.isVisible();
    const text = await nameHeading.textContent();
    return isVisible && (text?.trim()?.length ?? 0) > 0;
  }

  /**
   * Check if "Mở Secret Box" button is present (should NOT be on other-user profile).
   */
  async hasSecretBoxButton(): Promise<boolean> {
    const button = this.page.locator('button:has-text("Mở Secret Box")');
    return (await button.count()) > 0;
  }

  /**
   * Check if "Số Secret Box chưa mở" stat row is present (should NOT be on other-user profile).
   */
  async hasSecretBoxStatRow(): Promise<boolean> {
    const row = this.page.locator('text="Số Secret Box chưa mở:"');
    return (await row.count()) > 0;
  }

  /**
   * Get count of stat rows visible.
   * Expected: 3 (received, sent, hearts). Should NOT include unopened/opened.
   */
  async getStatRowCount(): Promise<number> {
    const expectedLabels = [
      "Số Kudos bạn nhận được:",
      "Số kudos bạn đã gửi:",
      "Số tim bạn nhận được:",
    ];
    let count = 0;
    for (const label of expectedLabels) {
      const found = await this.page.locator(`text="${label}"`).count();
      if (found > 0) count++;
    }
    return count;
  }

  /**
   * Check if tab buttons (received/sent toggle) are present.
   * Should return 0 for other-user profile.
   */
  async getTabCount(): Promise<number> {
    return this.page.locator('[role="tab"]').count();
  }

  /**
   * Get the "Đã nhận" (received) static label text.
   */
  async getReceivedLabel(): Promise<string | null> {
    const label = this.page.locator('p[aria-label="Kudos đã nhận"]');
    return label.textContent();
  }

  /**
   * Count year <select> controls in the awards header. The year dropdown was
   * removed (feed now spans all years), so this should always be 0.
   */
  async yearControlCount(): Promise<number> {
    return this.page.locator("select").count();
  }

  /**
   * Get the "Gửi Kudos cho người này" CTA link.
   */
  getCtaLink() {
    return this.page.locator('a:has-text("Gửi Kudos cho người này")');
  }

  /**
   * Check if CTA link is present.
   */
  async hasCtaLink(): Promise<boolean> {
    return (await this.getCtaLink().count()) > 0;
  }

  /**
   * Click CTA link and wait for URL change to /sun-kudos?compose=<userId>.
   */
  async clickCta() {
    await this.getCtaLink().first().click();
    await this.page.waitForURL(/\/sun-kudos\?compose=/);
  }

  /**
   * Get current URL.
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Check if compose dialog (with role="dialog") is visible.
   */
  async isComposeDialogVisible(): Promise<boolean> {
    const dialog = this.page.locator('[role="dialog"]').filter({ hasText: /gửi|compose|kudos/i });
    return (await dialog.count()) > 0 && (await dialog.first().isVisible());
  }

  /**
   * Get the back link "← Quay lại Sun Kudos" → /sun-kudos.
   */
  getBackLink() {
    return this.page.locator('a[href="/sun-kudos"]').filter({ hasText: /quay lại|back/i }).first();
  }

  /**
   * Check if back link is present.
   */
  async hasBackLink(): Promise<boolean> {
    return (await this.getBackLink().count()) > 0;
  }

  /**
   * Check if "Sunner không tồn tại." (not-found message) is visible.
   */
  async isNotFoundMessageVisible(): Promise<boolean> {
    const msg = this.page.locator('text="Sunner không tồn tại."');
    return (await msg.count()) > 0 && (await msg.first().isVisible());
  }

  /**
   * Wait for the page to be fully loaded (h1 visible, feed initialized).
   */
  async waitForPageReady() {
    const banner = this.page.locator("h1").first();
    await expect(banner).toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert that the banner name is non-empty.
   */
  async assertBannerNamePresent() {
    const nameText = await this.getBannerName();
    expect(nameText?.trim().length).toBeGreaterThan(0);
  }

  /**
   * Assert that exactly 3 stat rows are present.
   */
  async assertStatRowCount(expected: number = 3) {
    const count = await this.getStatRowCount();
    expect(count).toBe(expected);
  }

  /**
   * Assert that NO secret box UI is present.
   */
  async assertNoSecretBoxUI() {
    const hasButton = await this.hasSecretBoxButton();
    const hasRow = await this.hasSecretBoxStatRow();
    expect(hasButton).toBe(false);
    expect(hasRow).toBe(false);
  }

  /**
   * Assert that NO tab toggle is present (received-only feed).
   */
  async assertNoTabToggle() {
    const tabCount = await this.getTabCount();
    expect(tabCount).toBe(0);
  }

  /**
   * Assert that the "Đã nhận: N Kudos" label is visible.
   */
  async assertReceivedLabelVisible() {
    const label = await this.getReceivedLabel();
    expect(label?.trim()).toMatch(/^Đã nhận: \d+ Kudos$/);
  }

  /**
   * Assert that NO year <select> control is present (year dropdown removed).
   */
  async assertNoYearControl() {
    expect(await this.yearControlCount()).toBe(0);
  }

  /**
   * Assert that CTA link is present.
   */
  async assertCtaPresent() {
    const has = await this.hasCtaLink();
    expect(has).toBe(true);
  }

  /**
   * Assert that title matches pattern and contains user name.
   */
  async assertTitleFormat() {
    const title = await this.getTitle();
    expect(title).toMatch(/\| Sun\* Kudos/i);
    const namePart = title.split("|")[0].trim();
    expect(namePart.length).toBeGreaterThan(0);
  }

  /**
   * Assert that back link exists.
   */
  async assertBackLinkPresent() {
    const has = await this.hasBackLink();
    expect(has).toBe(true);
  }

  /**
   * Assert 404 not-found message is visible (for invalid UUID).
   */
  async assertNotFound() {
    const visible = await this.isNotFoundMessageVisible();
    expect(visible).toBe(true);
  }
}
