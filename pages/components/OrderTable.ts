import type { Locator } from '@playwright/test';

/** The product table on the cart and checkout pages. Rows have the id "product-<id>". */
export class OrderTable {
  readonly names: Locator;

  constructor(private readonly root: Locator) {
    this.names = root.locator('tbody tr[id^="product-"]').getByRole('heading', { level: 4 });
  }

  row(productId: number) {
    const row = this.root.locator(`#product-${productId}`);
    return {
      name: row.getByRole('heading', { level: 4 }),
      price: row.locator('.cart_price'),
      quantity: row.locator('.cart_quantity'),
      total: row.locator('.cart_total'),
    };
  }
}
