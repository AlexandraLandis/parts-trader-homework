import { BasePage } from './BasePage';

/** The login page. It also has the first step of signup. */
export class LoginPage extends BasePage {
  protected readonly path = 'login';

  async startSignup(name: string, email: string): Promise<void> {
    await this.page.getByTestId('signup-name').fill(name);
    await this.page.getByTestId('signup-email').fill(email);
    await this.page.getByTestId('signup-button').click();
  }
}
