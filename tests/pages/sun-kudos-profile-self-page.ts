import { Page, Locator } from "@playwright/test";

/**
 * Page object for /sun-kudos/profile — User's Own Profile Page.
 * Encapsulates locators for profile banner, stats, badges, feed tabs, secret box.
 */
export class SunKudosProfileSelfPage {
  constructor(private page: Page) {}

  // Profile banner — name, title, avatar, department (div-based, no section wrapper)
  profileBanner(): Locator {
    // The banner is a div with h1 inside
    return this.page.locator('div:has(h1)').first();
  }

  profileName(): Locator {
    // h1 with the user's name
    return this.page.locator("h1").first();
  }

  profileTitle(): Locator {
    // Title/department code is a span near the h1
    return this.page.locator("span").filter({ hasText: /^[A-Z0-9]+$/ }).first();
  }

  profileAvatar(): Locator {
    // Avatar is inside a circular div with border
    return this.page.locator('img').filter({ hasText: /avatar/ }).first();
  }

  // Stats panel — 5 stat tiles (Received, Sent, Hearts, Box Opened, Box Unopened)
  // Each stat row has: <div><span label></span><span value></span></div>
  statRow(label: string): Locator {
    return this.page.locator(`text="${label}"`).locator("../../..").first();
  }

  statValue(label: string): Locator {
    // Find the label span, then get the sibling span with the numeric value
    return this.page.locator(`text="${label}"`).locator("../span").last();
  }

  receivedKudosStat(): Locator {
    return this.statValue("Số Kudos bạn nhận được:");
  }

  sentKudosStat(): Locator {
    return this.statValue("Số kudos bạn đã gửi:");
  }

  heartsStat(): Locator {
    return this.statValue("Số tim bạn nhận được:");
  }

  boxOpenedStat(): Locator {
    return this.statValue("Số Secret Box đã mở:");
  }

  boxUnopendedStat(): Locator {
    return this.statValue("Số Secret Box chưa mở:");
  }

  // Badge collection — 4 hero badges + 2 locked slots row
  badgeCollection(): Locator {
    return this.page.locator('div[aria-label="Bộ sưu tập huy hiệu"]').first();
  }

  badgeItem(index: number): Locator {
    // Earned hero badges render as <Image alt="New Hero"> etc.
    return this.badgeCollection().locator("img").nth(index);
  }

  lockedBadgeSlot(): Locator {
    // Locked slots expose aria-label "Huy hiệu N - chưa mở khóa"
    return this.badgeCollection().locator('[aria-label*="chưa mở khóa"]').first();
  }

  // Feed selector — design C.3 dropdown ("Đã nhận (N)" / "Đã gửi (N)").
  // The trigger always shows the active direction; options appear once opened.
  feedSelector(): Locator {
    return this.page.locator('[data-testid="feed-selector"]');
  }

  feedOption(direction: "received" | "sent"): Locator {
    const text = direction === "received" ? "Đã nhận" : "Đã gửi";
    return this.page.locator('[role="option"]').filter({ hasText: text }).first();
  }

  /** Open the dropdown and pick a direction. */
  async selectFeed(direction: "received" | "sent") {
    await this.feedSelector().click();
    await this.feedOption(direction).click();
  }

  // Kudos feed — list of cards (uses the standard KudosCard component)
  kudosFeed(): Locator {
    return this.page.locator('section[aria-label="Danh sách Kudos"]').first();
  }

  kudosCard(index: number): Locator {
    return this.kudosFeed().locator("article").nth(index);
  }

  // Awards header — year dropdown removed; feed now spans all years.
  // Used to assert the year <select> is no longer rendered.
  yearSelect(): Locator {
    return this.page.locator("select");
  }

  // Secret Box button — "Mở Secret Box"
  secretBoxButton(): Locator {
    return this.page.locator('button:has-text("Mở Secret Box")');
  }

  // Secret Box modal/reveal
  secretBoxModal(): Locator {
    return this.page.locator('dialog, [role="dialog"]').filter({ hasText: /Secret|Box|mở/i }).first();
  }

  secretBoxContent(): Locator {
    return this.secretBoxModal().locator("[role='contentinfo'], section, div").first();
  }

  secretBoxCloseButton(): Locator {
    return this.secretBoxModal().locator('button[aria-label="Đóng"], button:has-text("Đóng")').first();
  }

  // Back link
  backLink(): Locator {
    return this.page.locator('a[href="/sun-kudos"]:has-text("Quay lại")');
  }

  // Hero rank badge (Danh hiệu) — rendered as <Image alt="New|Rising|Super|Legend Hero">
  heroRankBadge(): Locator {
    return this.profileBanner().locator('img[alt$="Hero"]').first();
  }

  // Loading state
  loadingSpinner(): Locator {
    return this.page.locator('[role="progressbar"], svg:has-text("loading")').first();
  }

  // Empty state message (if no kudos in a direction)
  emptyStateFeedMessage(): Locator {
    return this.page.locator('text="Chưa có Kudos", text="Không tìm thấy"').first();
  }
}
