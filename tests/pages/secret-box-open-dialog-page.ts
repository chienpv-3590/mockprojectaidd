import { Page, Locator } from "@playwright/test";

/**
 * Page object for the Secret Box "chưa mở" modal (MoMorph J3-4YFIpMM).
 * Encapsulates the locators every secret-box e2e spec needs.
 */
export class SecretBoxOpenDialogPage {
  constructor(private page: Page) {}

  dialog(): Locator {
    return this.page.locator('[data-testid="secret-box-dialog"]');
  }

  title(): Locator {
    return this.dialog().locator("#secret-box-dialog-title");
  }

  instruction(): Locator {
    return this.dialog().locator('[data-testid="secret-box-instruction"]');
  }

  boxImage(): Locator {
    return this.dialog().locator('[data-testid="secret-box-image"]');
  }

  rewardLabel(): Locator {
    return this.dialog().locator('[data-testid="secret-box-reward-label"]');
  }

  counter(): Locator {
    return this.dialog().locator('[data-testid="secret-box-counter"]');
  }

  closeButton(): Locator {
    return this.dialog().locator('button[aria-label="Đóng"]');
  }

  async counterValue(): Promise<number> {
    const text = (await this.counter().textContent())?.trim() ?? "0";
    return parseInt(text, 10);
  }
}
