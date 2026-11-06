import { faker } from '@faker-js/faker';
import type { Product } from '../../../data/catalog';
import { buildCard } from '../../../data/payment';
import type { User } from '../../../data/users';
import { expect, test } from '../../../fixtures';
import type { AccountStatusPage } from '../../../pages/AccountStatusPage';
import type { CartPage } from '../../../pages/CartPage';
import type { OrderTable } from '../../../pages/components/OrderTable';
import { CheckoutPage } from '../../../pages/CheckoutPage';
import type { LoginPage } from '../../../pages/LoginPage';
import type { PaymentPage } from '../../../pages/PaymentPage';
import type { SignupPage } from '../../../pages/SignupPage';
import { formatPrice } from '../../../utils/format';

// Each helper is one or more of the test case's written steps, named after them in the report.

async function signUp(loginPage: LoginPage, signupPage: SignupPage, accountStatusPage: AccountStatusPage, user: User) {
  await test.step("Fill all details in Signup and create account, verify 'ACCOUNT CREATED!' and 'Logged in as username'", async () => {
    await loginPage.startSignup(user.name, user.email);
    await signupPage.fillAccountDetails(user);
    await signupPage.createAccount();
    await expect(accountStatusPage.created).toHaveText('Account Created!');
    await accountStatusPage.continue();
    await expect(loginPage.header.loggedInAs).toHaveText(`Logged in as ${user.name}`);
  });
}

// The cart and checkout pages show the same product table. Each product was added once.
async function checkProducts(table: OrderTable, products: Product[]) {
  await expect(table.names).toHaveText(products.map((product) => product.name));
  for (const product of products) {
    const row = table.row(product.id);
    await expect(row.price).toHaveText(formatPrice(product.price));
    await expect(row.quantity).toHaveText('1');
    await expect(row.total).toHaveText(formatPrice(product.price));
  }
}

async function checkCart(cartPage: CartPage, products: Product[]) {
  await test.step('Verify that cart page is displayed', async () => {
    await checkProducts(cartPage.items, products);
  });
}

async function checkOrder(checkoutPage: CheckoutPage, user: User, products: Product[]) {
  await test.step('Verify Address Details and Review Your Order', async () => {
    await expect(checkoutPage.deliveryAddress).toHaveText(CheckoutPage.expectedAddress(user));
    await expect(checkoutPage.billingAddress).toHaveText(CheckoutPage.expectedAddress(user));
    await checkProducts(checkoutPage.items, products);
    const orderTotal = products.reduce((sum, product) => sum + product.price, 0);
    await expect(checkoutPage.totalAmount).toHaveText(formatPrice(orderTotal));
  });
}

async function placeOrderAndPay(checkoutPage: CheckoutPage, paymentPage: PaymentPage, user: User) {
  await test.step("Place the order, enter payment details, click 'Pay and Confirm Order' and verify the success message", async () => {
    await checkoutPage.placeOrder(faker.lorem.sentence());
    // The message shows for a second or two before the next page replaces it; see
    // PaymentPage.messageShownOnSubmit() for why it's read this way.
    const message = paymentPage.messageShownOnSubmit();
    await paymentPage.pay(buildCard(`${user.firstName} ${user.lastName}`));
    expect(await message).toBe('Your order has been placed successfully!');
    await expect(paymentPage.orderPlaced).toHaveText('Order Placed!');
    await expect(paymentPage.confirmation).toBeVisible();
  });
}

// Not a written step: placing the order should use up the cart.
async function checkCartIsEmpty(cartPage: CartPage) {
  await test.step('Verify the cart is empty after the order', async () => {
    await cartPage.header.navigateTo('Cart');
    await expect(cartPage.items.names).toHaveCount(0);
    await expect(cartPage.emptyMessage).toContainText('Cart is empty!');
  });
}

async function deleteAccount(accountStatusPage: AccountStatusPage) {
  await test.step("Click 'Delete Account', verify 'ACCOUNT DELETED!' and click 'Continue'", async () => {
    await accountStatusPage.header.navigateTo('Delete Account');
    await expect(accountStatusPage.deleted).toHaveText('Account Deleted!');
    await accountStatusPage.continue();
  });
}

// Each test buys products picked at random from API 1 (two by default). To buy specific ones:
// test.use({ productChoice: ['Blue Top', 'Men Tshirt'] }), or a number for that many at random.

test.describe('Placing an order', () => {
  test.beforeEach(async ({ homePage }) => {
    test.slow();

    await test.step("Navigate to url 'http://automationexercise.com'", () => homePage.goto());

    // These sections exist only on the home page.
    await test.step('Verify that home page is visible', async () => {
      await expect(homePage.carouselHeading).toBeVisible();
      await expect(homePage.featuresItemsHeading).toBeVisible();
      await expect(homePage.recommendedHeading).toBeVisible();
    });
  });

  test('a guest can register during checkout and complete the order', { tag: ['@p1', '@TC14'] }, async ({
    newUser, productsToBuy, homePage, cartPage, loginPage, signupPage, accountStatusPage, checkoutPage, paymentPage,
  }) => {
    await test.step('Add products to cart', () => homePage.products.addToCart(...productsToBuy.map((product) => product.name)));

    await test.step("Click 'Cart' button", () => homePage.header.navigateTo('Cart'));

    await checkCart(cartPage, productsToBuy);

    await test.step('Click Proceed To Checkout', () => cartPage.proceedToCheckout());

    await test.step("Click 'Register / Login' button", () => cartPage.goToRegisterLogin());

    await signUp(loginPage, signupPage, accountStatusPage, newUser);

    await test.step("Click 'Cart' button", () => homePage.header.navigateTo('Cart'));

    await test.step("Click 'Proceed To Checkout' button", () => cartPage.proceedToCheckout());

    await checkOrder(checkoutPage, newUser, productsToBuy);

    await placeOrderAndPay(checkoutPage, paymentPage, newUser);

    await checkCartIsEmpty(cartPage);

    await deleteAccount(accountStatusPage);
  });

  test('a user who registers before checkout can complete the order', { tag: ['@p1', '@TC15'] }, async ({
    newUser, productsToBuy, homePage, cartPage, loginPage, signupPage, accountStatusPage, checkoutPage, paymentPage,
  }) => {
    await test.step("Click 'Signup / Login' button", () => homePage.header.navigateTo('Signup / Login'));

    await signUp(loginPage, signupPage, accountStatusPage, newUser);

    await test.step('Add products to cart', () => homePage.products.addToCart(...productsToBuy.map((product) => product.name)));

    await test.step("Click 'Cart' button", () => homePage.header.navigateTo('Cart'));

    await checkCart(cartPage, productsToBuy);

    await test.step('Click Proceed To Checkout', () => cartPage.proceedToCheckout());

    await checkOrder(checkoutPage, newUser, productsToBuy);

    await placeOrderAndPay(checkoutPage, paymentPage, newUser);

    await checkCartIsEmpty(cartPage);

    await deleteAccount(accountStatusPage);
  });
});
