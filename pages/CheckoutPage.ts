import type { Locator, Page } from '@playwright/test';
import type { User } from '../data/users';
import { BasePage } from './BasePage';
import { OrderTable } from './components/OrderTable';

export class CheckoutPage extends BasePage {
  protected readonly path = 'checkout';
  /** Address lines, excluding the "Your delivery/billing address" title. */
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly items: OrderTable;
  readonly totalAmount: Locator;
  readonly comment: Locator;
  private readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    // Each address is a list whose first item is the "Your ... address" heading.
    const addressItems = (listId: string) =>
      page.locator(`#${listId}`).getByRole('listitem').filter({ hasNot: page.getByRole('heading') });
    this.deliveryAddress = addressItems('address_delivery');
    this.billingAddress = addressItems('address_invoice');
    const review = page.locator('#cart_info');
    this.items = new OrderTable(review);
    this.totalAmount = review.getByRole('row').filter({ hasText: 'Total Amount' }).locator('.cart_total_price');
    this.comment = page.locator('#ordermsg').getByRole('textbox');
    this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
  }

  /** The address lines the page shows for a user, in order (same for delivery and billing). */
  static expectedAddress(user: User): string[] {
    return [
      `${user.title}. ${user.firstName} ${user.lastName}`,
      user.company,
      user.address1,
      user.address2,
      `${user.city} ${user.state} ${user.zipcode}`,
      user.country,
      user.mobileNumber,
    ];
  }

  async placeOrder(comment: string): Promise<void> {
    await this.comment.fill(comment);
    await this.placeOrderButton.click();
    // The payment page's scripts (one shows the success message) must run before paying. They
    // run before DOMContentLoaded, so there's no need to wait for every image to load as well.
    await this.page.waitForURL('**/payment', { waitUntil: 'domcontentloaded' });
  }
}
