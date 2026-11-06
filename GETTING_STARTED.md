# Getting Started

## Purpose

How to get, set up and run the automated tests for [Automation Exercise](https://automationexercise.com/). The suite covers the tests the exercise asks for:

| Test case | Spec |
|---|---|
| Test Case 14: Place Order, Register while Checkout | [tests/ui/e2e/place-order.spec.ts](tests/ui/e2e/place-order.spec.ts) |
| Test Case 15: Place Order, Register before Checkout | [tests/ui/e2e/place-order.spec.ts](tests/ui/e2e/place-order.spec.ts) |
| API 7, 8, 9 and 10 (`verifyLogin`) | [tests/api/account/verify-login.spec.ts](tests/api/account/verify-login.spec.ts) |

The API tests also cover edge cases: a request without an email or without a password, empty values, credentials sent as JSON instead of form data, an unregistered email, a wrong password, a password in the wrong letter case, a deleted account, SQL injection, and GET and PUT as well as DELETE. The order tests also check that the cart is empty after the order.

Tools: Playwright Test, TypeScript, ESLint and Faker.

## Getting the Latest Code

```bash
git clone https://github.com/AlexandraLandis/parts-trader-homework.git
cd parts-trader-homework
```

To update an existing copy: `git pull`, then `npm ci`.

## Setting Up the Environment

Prerequisites: [Node.js](https://nodejs.org/) (current LTS or newer) and Git.

```bash
npm ci                               # dependencies
npx playwright install --with-deps   # browsers
npm run check                        # optional: type-check and lint
```

### Environments

Defined in [config/environments.ts](config/environments.ts); choose one with `TEST_ENV` (default `dev`).

| `TEST_ENV` | Base URL | |
|---|---|---|
| `dev` | <https://automationexercise.com/> | Working instance |
| `test` | <https://test.automationexercise.com/> | Unreachable: every test is skipped |

`BASE_URL` and `USER_PASSWORD` override the stored values. A setup project ([tests/setup/environment.setup.ts](tests/setup/environment.setup.ts)) checks the environment before the tests run. If it doesn't respond, every test is skipped with the reason, instead of each one failing on a timeout.

## Running the Tests

| Command | Runs |
|---|---|
| `npm test` | All tests: API, and UI on Chromium |
| `npm run test:api` / `npm run test:ui` | API tests only / UI tests only |
| `npm run test:all-browsers` | API, and UI on Chromium, Firefox and WebKit |
| `npm run test:dev` / `npm run test:test` | All tests against a specific environment |
| `npm run check` | Type-check and lint |
| `npm run report` | Open the last HTML report |

```bash
npx playwright test -g "@TC14"   # one test case, by its tag (@TC14, @TC15, @API-7 … @API-10)
npx playwright test -g "@p1"     # by priority
npx playwright test --headed     # with visible browsers
npx playwright test --ui         # interactive UI mode
```

Every test has a priority tag:

| Tag | Meaning |
|---|---|
| `@p1` | Critical: a failure blocks a release. Buying works end to end, and login accepts the right credentials and only those. |
| `@p2` | Important: the API's error responses for bad requests. |
| `@p3` | Low risk: unsupported request methods. |

CI ([.github/workflows/playwright.yml](.github/workflows/playwright.yml)) type-checks, lints and runs the tests on every push and pull request.

A pre-commit hook ([.husky/pre-commit](.husky/pre-commit)) does the same before each commit and blocks the commit if anything fails. `npm ci` installs it. To skip it once, e.g. when the shared site is overloaded: `git commit --no-verify`.

## Additional Details

### Layout

```
api/        Client for the API endpoints the tests use (productsList, verifyLogin, createAccount, deleteAccount)
config/     Environments and the reachability check
data/       Test data: Faker builders for users and cards, picking the products to buy
fixtures/   The project's `test`: page objects, the API client, test users
pages/      Page objects; pages/components/ holds parts shared by several pages
utils/      Small helpers, e.g. formatting a price the way the site shows it
tests/
  setup/    Environment check (runs first)
  api/      verify-login (API 7-10)
  ui/       place-order (TC14, TC15)
```

### Decisions

- **Page object model.** Page objects hold locators and actions; the tests make the assertions.
- **Generated test data.** Each test gets a new user from Faker, with a unique email, so tests are independent and give the same result on every run. The user's account is deleted after the test.
- **Random products.** The order tests buy products picked at random from API 1 (two by default), and the report lists which ones. `test.use({ productChoice: 3 })` picks three; `test.use({ productChoice: ['Blue Top'] })` buys specific products, e.g. to rerun a failure.
- **Data setup through the API.** The API tests that need an existing account create it with API 11 and delete it with API 12. POST requests are sent as form data, which the API requires.
- **Waiting for pages to load after navigation.** Some buttons on this site (like "Proceed To Checkout") don't work until the page's scripts have loaded, so header navigation waits for the next page.
- **Ads and analytics are blocked.** They slow pages down, and one full-screen ad interrupts navigation.
- **Following the written steps.** The UI tests follow each test case's written steps, and each step shows up by name in the report. "Your order has been placed successfully!" only shows while the payment is being sent, so the test reads it inside the page as the form is submitted (see `PaymentPage.messageShownOnSubmit()`).

### Performance

The site is a shared public server that answers "heavy load (queue full)" under parallel load, so local runs use 2 workers and CI uses 1. Creating accounts through the API rather than the UI keeps the API tests fast. With an environment we control, the suite could run with more workers and be sharded across CI machines.

### Troubleshooting

- **Everything is skipped:** the environment is unreachable (expected for `TEST_ENV=test`). The reason is in the report.
- **"Heavy load (queue full)" or 5xx errors:** the shared site is overloaded. Rerun, or use `--workers=1`.
- **Browsers are missing:** run `npx playwright install --with-deps` again.

---

## Links

[README](README.md) | [EXERCISE](EXERCISE.md) | [ISSUES](ISSUES.md) | [FEEDBACK](FEEDBACK.md)
