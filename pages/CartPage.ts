import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { OrderTable } from './components/OrderTable';

export class CartPage extends BasePage {
  protected readonly path = 'view_cart';
  readonly items: OrderTable;
  /** "Cart is empty! Click here to buy products." */
  readonly emptyMessage: Locator;
  private readonly proceedButton: Locator;
  private readonly checkoutPopup: Locator;

  constructor(page: Page) {
    super(page);
    this.items = new OrderTable(page.locator('#cart_info_table'));
    this.emptyMessage = page.locator('#empty_cart');
    this.proceedButton = page.getByText('Proceed To Checkout');
    this.checkoutPopup = page.locator('#checkoutModal');
  }

  /** Logged in: goes to checkout. Guest: opens a popup asking them to register or log in. */
  async proceedToCheckout(): Promise<void> {
    await this.proceedButton.click();
  }

  /** The guest popup's "Register / Login" link. */
  async goToRegisterLogin(): Promise<void> {
    await this.checkoutPopup.getByRole('link', { name: 'Register / Login' }).click();
    await this.page.waitForURL('**/login');
  }
}
