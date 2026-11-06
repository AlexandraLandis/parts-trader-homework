import type { Locator, Page } from '@playwright/test';

// The header links the tests use, and the page each one lands on.
const DESTINATIONS = {
  Cart: '/view_cart',
  'Signup / Login': '/login',
  'Delete Account': '/delete_account',
} as const;

export class Header {
  readonly loggedInAs: Locator;
  private readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('#header');
    this.loggedInAs = this.root.getByText('Logged in as');
  }

  /**
   * Clicks a header link and waits for the next page to load. Some buttons on this site (like
   * "Proceed To Checkout") don't work until the page's scripts have loaded, so clicking too
   * early does nothing.
   */
  async navigateTo(name: keyof typeof DESTINATIONS): Promise<void> {
    await this.root.getByRole('link', { name }).click();
    await this.page.waitForURL((url) => url.pathname === DESTINATIONS[name]);
  }
}
