import { Page, Locator } from "@playwright/test";

/**
 * Page object for /sun-kudos Live Board.
 * Encapsulates locators for hero, submit input, carousels, filters, cards, sidebar, etc.
 */
export class SunKudosPage {
  constructor(private page: Page) {}

  // Hero section
  heroBanner(): Locator {
    return this.page.locator(
      'section[aria-labelledby*="KudosBoard"], section:has(h1)'
    );
  }

  heroTitle(): Locator {
    // KudosHero renders <h1 id="kudos-hero-heading">Hệ thống ghi nhận và cảm ơn</h1>.
    return this.page.locator("#kudos-hero-heading");
  }

  footer(): Locator {
    return this.page.locator("footer");
  }

  // Submit input (A.1) — rendered as a <button> whose aria-label is the prompt
  // text "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?" (not an <input>).
  submitInput(): Locator {
    return this.page.locator('button[aria-label*="gửi lời cảm ơn"]');
  }

  submitButton(): Locator {
    return this.page.locator('button:has-text("Gửi")').first();
  }

  // Submit dialog
  submitDialog(): Locator {
    return this.page.locator('dialog, [role="dialog"]').first();
  }

  submitDialogRecipientField(): Locator {
    return this.submitDialog().locator('input[placeholder*="recipient"]');
  }

  submitDialogHashtagDropdown(): Locator {
    return this.submitDialog().locator(
      'select, [role="combobox"], button:has-text("Hashtag")'
    );
  }

  submitDialogTextarea(): Locator {
    return this.submitDialog().locator("textarea");
  }

  submitDialogSendButton(): Locator {
    return this.submitDialog().locator('button:has-text("Gửi")');
  }

  closeDialogButton(): Locator {
    // DialogHeader renders the close (✕) button with aria-label="Đóng".
    return this.submitDialog().locator('button[aria-label="Đóng"]').first();
  }

  // Highlight carousel — <section aria-labelledby="highlight-kudos-heading">
  highlightCarousel(): Locator {
    return this.page.locator('section[aria-labelledby="highlight-kudos-heading"]');
  }

  highlightCard(index: number): Locator {
    // 0-indexed. Cards render as native <article> elements (no role/class attr).
    return this.highlightCarousel().locator("article").nth(index);
  }

  highlightPrevButton(): Locator {
    return this.highlightCarousel().locator('button[aria-label="Slide trước"]');
  }

  highlightNextButton(): Locator {
    return this.highlightCarousel().locator('button[aria-label="Slide tiếp theo"]');
  }

  highlightPaginationText(): Locator {
    return this.highlightCarousel().locator('span:has-text("/")');
  }

  // Filters — dropdown selectboxes ("Hashtag" / "Phòng ban"). The trigger button
  // lives in the HighlightCarousel section header; clicking it opens a
  // role="listbox" of options (aria-label = the button label).
  hashtagFilterButton(): Locator {
    return this.highlightCarousel().locator('button:has-text("Hashtag")');
  }

  departmentFilterButton(): Locator {
    return this.highlightCarousel().locator('button:has-text("Phòng ban")');
  }

  filterListbox(label: "Hashtag" | "Phòng ban"): Locator {
    return this.highlightCarousel().locator(`ul[role="listbox"][aria-label="${label}"]`);
  }

  filterOptionButton(label: "Hashtag" | "Phòng ban", index = 0): Locator {
    return this.filterListbox(label).locator('li[role="option"] button').nth(index);
  }

  // "Xoá bộ lọc" — clears both filters; sits to the right of the Phòng ban button.
  clearFilterButton(): Locator {
    return this.highlightCarousel().locator('button[aria-label="Xoá bộ lọc"]');
  }

  // Backwards-compatible aliases used by older specs.
  hashtagFilterChip(): Locator {
    return this.hashtagFilterButton();
  }
  hashtagFilterDropdown(): Locator {
    return this.hashtagFilterButton();
  }
  departmentFilterDropdown(): Locator {
    return this.departmentFilterButton();
  }

  // Kudos feed
  feedContainer(): Locator {
    return this.page.locator('[role="main"], main').first();
  }

  feedCard(index: number): Locator {
    // Feed cards live in the ALL KUDOS section as native <article> elements.
    return this.page
      .locator('section[aria-labelledby="all-kudos-heading"] article')
      .nth(index);
  }

  // Sender = first PersonBlock link, receiver = second. Both link to the
  // person's profile (/sun-kudos/profile/{userId}).
  cardSenderName(card: Locator): Locator {
    return card.locator('a[href*="/sun-kudos/profile/"]').first();
  }

  cardReceiverName(card: Locator): Locator {
    return card.locator('a[href*="/sun-kudos/profile/"]').nth(1);
  }

  cardTime(card: Locator): Locator {
    // Timestamp renders as "HH:MM - DD/MM/YYYY" in the first <p>.
    return card.locator("p").filter({ hasText: /\d{1,2}:\d{2}/ }).first();
  }

  cardBody(card: Locator): Locator {
    // Message body is the <p> inside the detail link (not the timestamp <p>).
    return card
      .locator('a[href*="/sun-kudos/"]:not([href*="/profile/"]) p')
      .first();
  }

  cardHashtags(card: Locator): Locator {
    return card.locator("span").filter({ hasText: /^#/ });
  }

  cardHeartButton(card: Locator): Locator {
    // HeartButton aria-label is "{n} tim — thả tim/bỏ tim" with aria-pressed.
    return card.locator('button[aria-label*="tim"]').first();
  }

  cardHeartCount(card: Locator): Locator {
    return this.cardHeartButton(card).locator("span").first();
  }

  cardCopyLinkButton(card: Locator): Locator {
    return card.locator('button[aria-label="Copy Link"], button:has-text("Copy Link")').first();
  }

  cardViewDetailButton(card: Locator): Locator {
    // Detail nav = content link (/sun-kudos/{id}, excluding profile links) or
    // the highlight-only "Xem chi tiết" button.
    return card
      .locator('a[href*="/sun-kudos/"]:not([href*="/profile/"]), button:has-text("Chi tiết")')
      .first();
  }

  emptyStateMessage(): Locator {
    return this.page.locator(
      'text="Hiện tại chưa có Kudos nào.", text="No kudos yet"'
    );
  }

  // Spotlight board
  spotlightSection(): Locator {
    return this.page.locator('[aria-labelledby*="spotlight"], section:has(h2:has-text("Spotlight"))');
  }

  spotlightCountBadge(): Locator {
    // Rendered as an <h3>{n} KUDOS</h3> heading inside the spotlight canvas.
    return this.spotlightSection().getByText(/\d[\d.,]*\s*KUDOS/i).first();
  }

  spotlightPanZoomButton(): Locator {
    // aria-label is "Bật/Tắt chế độ Pan và Zoom" (Vietnamese, case-sensitive attr).
    return this.spotlightSection().getByRole("button", { name: /Pan và Zoom/i });
  }

  spotlightSearchInput(): Locator {
    // <input type="search" aria-label="Tìm kiếm Sunner" placeholder="Tìm kiếm">.
    return this.spotlightSection().getByRole("searchbox", { name: /Tìm kiếm Sunner/i });
  }

  spotlightCanvas(): Locator {
    // The d3-cloud word-cloud svg carries viewBox="0 0 1100 420".
    return this.spotlightSection().locator('svg[viewBox="0 0 1100 420"]');
  }

  // Sidebar stats
  sidebar(): Locator {
    return this.page.locator('aside, [aria-label*="sidebar"]').first();
  }

  sidebarStatLabel(label: string): Locator {
    return this.sidebar().locator(`span:has-text("${label}")`);
  }

  sidebarStatValue(label: string): Locator {
    return this.sidebar()
      .locator(`span:has-text("${label}")`)
      .locator(".. >> span")
      .last();
  }

  statKudosReceived(): Locator {
    return this.sidebar().locator('span:has-text("Kudos Received")');
  }

  statKudosSent(): Locator {
    return this.sidebar().locator('span:has-text("Kudos Sent")');
  }

  statHearts(): Locator {
    return this.sidebar().locator('span:has-text("Hearts")');
  }

  mosSecretBoxButton(): Locator {
    return this.sidebar().locator(
      'button:has-text("Mở Secret Box"), button:has-text("Open Secret Box")'
    );
  }

  secretBoxDialog(): Locator {
    return this.page.locator('dialog, [role="dialog"]:has-text("Secret")').first();
  }

  leaderboardSection(): Locator {
    return this.sidebar().locator('[role="region"], section');
  }

  leaderboardEmptyState(): Locator {
    return this.leaderboardSection().locator(
      'text="Chưa có dữ liệu", text="No data"'
    );
  }

  // Toast notifications
  toast(): Locator {
    return this.page.locator('[role="status"], .toast, .notification').first();
  }

  toastMessage(): Locator {
    // The message text lives directly inside the [role="status"] container.
    return this.toast();
  }

  // Auth gate (for negative tests)
  loginRedirect(): Locator {
    return this.page.locator('a[href="/login"]').first();
  }

  // ── Submit dialog — additional locators for SUBMIT-001..SUBMIT-004 ──────────

  /**
   * The recipient search input inside the submit dialog.
   * RecipientPicker renders <input id="recipient-search" placeholder="Tìm kiếm tên Sunner...">
   */
  submitDialogRecipientSearchInput(): Locator {
    return this.submitDialog().locator(
      '#recipient-search, input[placeholder*="Tìm kiếm tên Sunner"]'
    );
  }

  /**
   * The feature hashtag <select id="feature-hashtag"> inside the submit dialog.
   * FeatureHashtagSelect renders a plain <select> with options from featureHashtags prop.
   */
  submitDialogFeatureHashtagSelect(): Locator {
    return this.submitDialog().locator('#feature-hashtag, select');
  }

  /**
   * The [role="listbox"] dropdown rendered by RecipientPicker when search returns results.
   * aria-label="Kết quả tìm kiếm Sunner"
   */
  recipientSearchListbox(): Locator {
    return this.page.locator('[role="listbox"]');
  }

  /**
   * The hidden file input inside ImageStrip.
   * Rendered as <input type="file" accept="image/*" class="sr-only" aria-hidden>.
   * DO NOT upload files in tests — assert presence only.
   */
  dialogFileInput(): Locator {
    return this.submitDialog().locator('input[type="file"]');
  }

  /**
   * The first [role="alert"] inside the submit dialog — rendered by FieldError or RecipientPicker
   * when validation fires.
   */
  dialogValidationAlert(): Locator {
    return this.submitDialog().locator('[role="alert"]').first();
  }

  /**
   * The close (×) button in the submit dialog header.
   * DialogHeader renders <button aria-label="Đóng">.
   */
  submitDialogCloseButton(): Locator {
    return this.submitDialog().locator('button[aria-label="Đóng"]');
  }

  // ── Secret Box — additional locators for BOX-001..BOX-002 ───────────────────

  /**
   * Any visible dialog that might appear after clicking "Mở Secret Box".
   * The live-board uses a toast instead of a modal; accept both patterns.
   */
  secretBoxResultVisible(): Locator {
    return this.page.locator(
      '[role="dialog"], [role="status"], [role="alert"]'
    ).first();
  }
}
