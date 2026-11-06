import type { Locator, Page } from '@playwright/test';
import type { PaymentCard } from '../data/payment';
import { BasePage } from './BasePage';

export class PaymentPage extends BasePage {
  protected readonly path = 'payment';
  readonly orderPlaced: Locator;
  readonly confirmation: Locator;
  private readonly payButton: Locator;

  constructor(page: Page) {
    super(page);
    this.payButton = page.getByTestId('pay-button');
    this.orderPlaced = page.getByTestId('order-placed');
    this.confirmation = page.getByText('Congratulations! Your order has been confirmed!');
  }

  /**
   * The success message the page shows when the payment form is submitted, or '' if it isn't
   * showing. Call it before pay(); the promise settles on submit.
   *
   * The message only exists between submitting and the next page loading, and Playwright's
   * locators wait for a navigation to finish, so they can't see it. This reads it inside the
   * page instead, once the site's own submit handler has shown it.
   */
  messageShownOnSubmit(): Promise<string> {
    return this.page.locator('#payment-form').evaluate(
      (form) =>
        new Promise<string>((resolve) => {
          form.addEventListener('submit', () => {
            // Read it once every submit handler (including the site's) has run.
            setTimeout(() => {
              const message = document.querySelector<HTMLElement>('#success_message');
              resolve(message?.checkVisibility() ? message.innerText.trim() : '');
            });
          }, { once: true });
        }),
    );
  }

  async pay(card: PaymentCard): Promise<void> {
    await this.page.getByTestId('name-on-card').fill(card.nameOnCard);
    await this.page.getByTestId('card-number').fill(card.number);
    await this.page.getByTestId('cvc').fill(card.cvc);
    await this.page.getByTestId('expiry-month').fill(card.expiryMonth);
    await this.page.getByTestId('expiry-year').fill(card.expiryYear);
    await this.payButton.click();
  }
}
