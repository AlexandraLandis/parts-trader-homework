import { test as base, expect } from '@playwright/test';
import { AutomationExerciseApi } from '../api/AutomationExerciseApi';
import { unreachableReason } from '../config/environment-status';
import { type Environment, getEnvironment } from '../config/environments';
import { chooseProducts, type Product, type ProductChoice } from '../data/catalog';
import { buildUser, type User } from '../data/users';
import { AccountStatusPage } from '../pages/AccountStatusPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { PaymentPage } from '../pages/PaymentPage';
import { SignupPage } from '../pages/SignupPage';

export type EnvironmentOptions = {
  environment: Environment;
  /** Which products `productsToBuy` picks: a number at random (default 2), or a list of names. */
  productChoice: ProductChoice;
};

type Fixtures = {
  homePage: HomePage;
  cartPage: CartPage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountStatusPage: AccountStatusPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  api: AutomationExerciseApi;
  /** A new user's details, with no account yet. Their account is deleted after the test. */
  newUser: User;
  /** A user whose account already exists (created through the API). Deleted after the test. */
  registeredUser: User;
  /** Products from API 1, picked by `productChoice`. The picks are listed in the report. */
  productsToBuy: Product[];
  skipIfEnvironmentUnreachable: void;
};

// Ads (including a full-screen ad that interrupts navigation) and analytics: not ours to test.
const BLOCKED_HOSTS =
  /googlesyndication|doubleclick|googleadservices|adservice\.google|fundingchoicesmessages|google-analytics|googletagmanager|cloudflareinsights/;

export const test = base.extend<EnvironmentOptions & Fixtures>({
  environment: [getEnvironment(), { option: true }],
  productChoice: [2, { option: true }],

  // Skips every test if the setup project found the environment unreachable.
  skipIfEnvironmentUnreachable: [
    async ({ environment }, use, testInfo) => {
      const reason = unreachableReason(environment.baseURL);
      testInfo.skip(Boolean(reason), `Environment unreachable: ${reason}`);
      await use();
    },
    { auto: true },
  ],

  context: async ({ context }, use) => {
    await context.route(BLOCKED_HOSTS, (route) => route.abort());
    await use(context);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  accountStatusPage: async ({ page }, use) => use(new AccountStatusPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),

  api: async ({ request }, use) => use(new AutomationExerciseApi(request)),

  newUser: async ({ api, environment }, use) => {
    const user = buildUser(environment.userPassword);
    await use(user);
    await api.deleteAccount(user.email, user.password);
  },

  registeredUser: async ({ api, environment }, use) => {
    const user = buildUser(environment.userPassword);
    const created = await api.createAccount(user);
    expect(created.responseCode, `creating test user ${user.email}`).toBe(201);
    await use(user);
    await api.deleteAccount(user.email, user.password);
  },

  productsToBuy: async ({ api, productChoice }, use, testInfo) => {
    const products = chooseProducts(await api.getProducts(), productChoice);
    // To rerun a failure with the same products: test.use({ productChoice: [<these names>] }).
    testInfo.annotations.push({ type: 'products', description: products.map((p) => p.name).join(', ') });
    await use(products);
  },
});

export { expect };
