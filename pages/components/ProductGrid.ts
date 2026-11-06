import type { Locator, Page } from '@playwright/test';

/** The product grid on the home and products pages, and the "Added!" popup it opens. */
export class ProductGrid {
  private readonly root: Locator;
  private readonly addedToCartPopup: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('.features_items');
    this.addedToCartPopup = page.locator('#cartModal');
  }

  /** Adds each product to the cart from its hover overlay, closing the "Added!" popup each time. */
  async addToCart(...names: string[]): Promise<void> {
    for (const name of names) {
      // Each card has two "Add to cart" buttons (ISSUES.md, Issue 21). One is always shown on the
      // card. The other is on an orange overlay that the site hides until the mouse is over the
      // card, and it covers the card when it appears. A user's mouse has to cross the card to
      // reach either button, so the overlay's is the one they actually click. The test hovers
      // first to show the overlay, then clicks that button.
      const card = this.root.locator('.single-products').filter({ has: this.page.getByText(name, { exact: true }) });
      await card.hover();
      await card.locator('.product-overlay').getByText('Add to cart').click();
      await this.addedToCartPopup.getByText('Your product has been added to cart.').waitFor();
      await this.addedToCartPopup.getByRole('button', { name: 'Continue Shopping' }).click();
      await this.addedToCartPopup.waitFor({ state: 'hidden' });
    }
  }
}
