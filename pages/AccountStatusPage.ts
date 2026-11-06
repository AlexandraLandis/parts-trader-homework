import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** The "Account Created!" and "Account Deleted!" confirmation pages. */
export class AccountStatusPage extends BasePage {
  protected readonly path = 'account_created';
  readonly created: Locator;
  readonly deleted: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.created = page.getByTestId('account-created');
    this.deleted = page.getByTestId('account-deleted');
    this.continueButton = page.getByTestId('continue-button');
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
    await this.page.waitForURL((url) => url.pathname === '/');
  }
}
