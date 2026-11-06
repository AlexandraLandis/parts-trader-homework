import type { Locator, Page } from '@playwright/test';
import type { User } from '../data/users';
import { BasePage } from './BasePage';

/** Second step of signup, where the account details are entered. */
export class SignupPage extends BasePage {
  protected readonly path = 'signup';
  private readonly createAccountButton: Locator;

  constructor(page: Page) {
    super(page);
    this.createAccountButton = page.getByTestId('create-account');
  }

  /** Name and email were already entered on step one. */
  async fillAccountDetails(user: User): Promise<void> {
    const { page } = this;
    await page.getByLabel(`${user.title}.`, { exact: true }).check();
    await page.getByTestId('password').fill(user.password);
    await page.getByTestId('days').selectOption(String(user.birthDay));
    await page.getByTestId('months').selectOption(String(user.birthMonth));
    await page.getByTestId('years').selectOption(String(user.birthYear));
    await page.getByLabel('Sign up for our newsletter!').check();
    await page.getByLabel('Receive special offers from our partners!').check();
    await page.getByTestId('first_name').fill(user.firstName);
    await page.getByTestId('last_name').fill(user.lastName);
    await page.getByTestId('company').fill(user.company);
    await page.getByTestId('address').fill(user.address1);
    await page.getByTestId('address2').fill(user.address2);
    await page.getByTestId('country').selectOption(user.country);
    await page.getByTestId('state').fill(user.state);
    await page.getByTestId('city').fill(user.city);
    await page.getByTestId('zipcode').fill(user.zipcode);
    await page.getByTestId('mobile_number').fill(user.mobileNumber);
  }

  async createAccount(): Promise<void> {
    await this.createAccountButton.click();
  }
}
