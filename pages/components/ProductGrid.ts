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
      // Each card has two "Add to cart" buttons (ISSUES.md, Issue 21). The one users actually
      // click is on an overlay that only appears while the mouse is over the card, so hover first.
      const card = this.root.locator('.single-products').filter({ has: this.page.getByText(name, { exact: true }) });
      await card.hover();
      await card.locator('.product-overlay').getByText('Add to cart').click();
      await this.addedToCartPopup.getByText('Your product has been added to cart.').waitFor();
      await this.addedToCartPopup.getByRole('button', { name: 'Continue Shopping' }).click();
      await this.addedToCartPopup.waitFor({ state: 'hidden' });
    }
  }
}
