# Issues

## Documented Issues

Defects found on the dev environment (<https://automationexercise.com/>) while exploring the site and writing the tests, most severe first.

### Critical

- Issue 1: Payment accepts any card details
  - Description: An order is placed with card number `abcd`, a 1-digit CVC, expiry month `13` and year `1999`. Neither the browser nor the server validates the card fields.
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 2: The invoice amount is taken from the URL
  - Description: After payment, the invoice URL contains the total (`/download_invoice/1500`). Changing it changes the invoice: `/download_invoice/1` returns "Your total purchase amount is 1". Invoices aren't tied to a real order.
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

### High

- Issue 3: The user details API exposes personal data without authentication
  - Description: `GET /api/getUserDetailByEmail?email=<any email>` returns the account's name, date of birth and full address to anyone, with no session or credentials.
  - Found by: API testing (curl) while checking API 14.
  - Reproducible: Yes, every time.

- Issue 4: A link from any website can delete a logged-in user's account
  - Description: `GET /delete_account` deletes the account immediately, with no confirmation, no POST and no CSRF token. A link in an email or on another site deletes the account of any logged-in user who clicks it.
  - Found by: Exploratory testing with the Playwright MCP browser (visiting the URL deleted the test account).
  - Reproducible: Yes, every time.

- Issue 5: Invoices can be downloaded without logging in
  - Description: `/download_invoice/<amount>` returns an invoice to a guest ("Hi , Your total purchase amount is…").
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 6: Guests can open checkout and payment directly
  - Description: "Proceed To Checkout" asks guests to log in, but going to `/checkout` or `/payment` directly opens those pages anyway.
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 7: The same email can register twice in different letter case
  - Description: The duplicate-email check only catches an exact match, so the same address in upper case creates a second account. Login is also case-sensitive, so the two accounts are separate.
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 8: The cart accepts zero, negative and very large quantities
  - Description: The server accepts any quantity. A negative quantity reduces the cart total, and `1000000` produced a line total of Rs. 999,998,000.
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

### Medium

- Issue 9: "Add to cart" fails silently
  - Description: The site's `cart.js` only reacts when the `add_to_cart` request succeeds; there is no error handling. When the server fails (it regularly answers 503 or "heavy load (queue full)"), the user sees nothing: no confirmation and no error.
  - Found by: Automated testing (an add-to-cart step timed out waiting for the confirmation), then reading the site's script.
  - Reproducible: Yes, by blocking the `add_to_cart` request in DevTools. On the live site it happens intermittently, under load.

- Issue 10: Signup accepts invalid details
  - Description: An account was created with zip code `notazip`, mobile number `not-a-phone` and a birth date of 31 February. The values then appear as the delivery address.
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 11: "Add to cart" changes data through a GET request
  - Description: Adding to the cart is `GET /add_to_cart/<id>`. GET requests should never change data: link prefetching and crawlers can trigger them, and a link on another site can change a user's cart (as in Issue 4).
  - Found by: Watching network traffic during exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 12: The API answers HTTP 200 for every response
  - Description: Errors return HTTP 200, with the real status (400, 404, 405) only in the body's `responseCode`. HTTP clients, monitoring and caches treat failures as successes.
  - Found by: API testing (curl).
  - Reproducible: Yes, every time.

- Issue 13: Accessibility barriers (WCAG 2.1 A/AA)
  - Description:
    - icon-only buttons with no accessible name (newsletter subscribe, search)
    - unlabelled inputs (product quantity, contact attachment; the newsletter email relies on its placeholder)
    - unnamed carousel controls on the home page
    - insufficient colour contrast on prices, breadcrumbs and the active navigation link
    - no level-1 heading on any page except home
  - Found by: axe scans, plus inspecting the accessibility tree with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 23: Addresses aren't verified against the chosen country
  - Description: An account was created with a made-up US address (US state, city and zip code) and the country set to New Zealand. Nothing checks that the address exists or that it belongs to the chosen country, so the account, and every order delivered to it, can carry an address that can't be delivered to.
  - Found by: Manual exploratory testing.
  - Reproducible: Yes, every time.

### Low

- Issue 14: Search doesn't ignore surrounding spaces
  - Description: `top` returns 14 products; ` top ` returns 7.
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 15: Unknown products and categories return HTTP 200 instead of 404
  - Description: `/product_details/999999` and `/category_products/999999` render an empty page template with status 200.
  - Found by: Exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 16: Fonts are loaded over insecure HTTP and blocked
  - Description: `main.css` imports Google Fonts with `http://` URLs. Browsers block them on the HTTPS site, so the fonts never load and every page logs three console errors.
  - Found by: Browser console errors during exploratory testing with the Playwright MCP browser.
  - Reproducible: Yes, every time.

- Issue 17: Wrong page titles and response type
  - Description: The cart page is titled "Checkout", and the "Account Deleted" page is titled "Account Created". API responses are labelled `Content-Type: text/html` instead of `application/json`.
  - Found by: Exploratory testing with the Playwright MCP browser, and API testing (curl).
  - Reproducible: Yes, every time.

- Issue 18: The site's test case steps have errors
  - Description: In TC18, the example ("Dress") contradicts the expected result ("WOMEN - TOPS PRODUCTS"). There are also smaller errors: "detail detail" in TC8, "12.Click" in TC14 and TC24, "'Add To Cart'" in TC22 (the button says "Add to cart"), and "at the time registration of account" in TC23.
  - Found by: Playwright MCP exploration: the collapsed test case steps were collected and compared with the site.
  - Reproducible: Yes, every time.

- Issue 19: Grammar and consistency errors in text users see
  - Description: No words are misspelled, but:

    | Where | Current | Suggested |
    |---|---|---|
    | Signup error | *Email Address already exist!* | *Email address already exists!* |
    | Footer, every page | *…and be updated your self...* | *Get the latest updates from our site.* |
    | Home page | *…either they are at beginner or advance level.* | *…whether they are at a beginner or advanced level.* |
    | Home page heading | *FEATURES ITEMS* | *FEATURED ITEMS* |
    | Contact page | *Below contact form is for testing purpose.* | *The contact form below is for testing purposes.* |
    | Product names | *Men Tshirt*, *T SHIRT*, *T-Shirt*; *…Outfits -Pink* | One spelling, *T-Shirt*; *… - Pink* |
    | Invoice | *Hi , Your total purchase amount is…* | *Hi Alex, your total purchase amount is…* |

  - Found by: Playwright MCP exploration: the text of every reachable page was collected, checked against a dictionary, and reviewed by hand.
  - Reproducible: Yes, every time.

- Issue 20: PATCH requests get a different error format from the rest of the API
  - Description: Unsupported methods normally return `{"responseCode": 405, "message": "This request method is not supported."}`. PATCH to `/api/verifyLogin` returns `{"detail": "Method \"PATCH\" not allowed."}` instead, the web framework's default error, so a client that reads `responseCode` gets nothing.
  - Found by: API testing (curl) while checking API 9 with other request methods.
  - Reproducible: Yes, every time.

- Issue 21: Hovering a product card hides the product image behind a second "Add to cart" button
  - Description: Every product card in the product grid (home and products pages) already shows its price, name and an "Add to cart" button. Hovering the card slides an orange overlay over it that repeats the same price, name and button (the same `data-product-id`) and covers the product image. Users lose sight of the product at the moment they're deciding whether to buy it, and the page has two identical buttons per product.
  - Found by: Manual exploratory testing.
  - Reproducible: Yes, every time.

- Issue 22: The signup address form doesn't change with the country
  - Description: In the "Address Information" part of signup, choosing a different country (India, Canada, Australia, Israel, New Zealand or Singapore) leaves the US-style fields as they are: State, City and Zipcode. Users outside the US get no fields for their own address format (for example province, postcode or PIN code), and nothing checks the values against the chosen country (Issue 23).
  - Found by: Manual exploratory testing.
  - Reproducible: Yes, every time.

- Issue 24: Addresses start with a stray period when no title is chosen
  - Description: The Title (Mr / Mrs) radio buttons on the signup form are optional, but the delivery and billing addresses at checkout always print the title followed by a period. With no title chosen, the name line reads ". Alex Landis". The form should either require a title or leave out the period when there isn't one.
  - Found by: Manual exploratory testing.
  - Reproducible: Yes, every time.

## Suggested Enhancements

- Enhancement 1: Show whether a product is in stock in the products list API
  - Description: API 1 (`GET /api/productsList`) returns each product's id, name, price, brand and category, but not whether it's in stock. The only place stock shows up is the "Availability: In Stock" text on each product's page. There's no stock endpoint, and `?inStock=true` is ignored. I'd like to add an availability field to each product, for example:

    ```json
    { "id": 1, "name": "Blue Top", "price": "Rs. 500", "inStock": true, ... }
    ```

    Then the order tests could pick from only the products that can be bought, instead of assuming everything is in stock. Today every product is "In Stock" (checked all 34), so the tests pick from the full list.
  - Found by: Writing the order tests (choosing random products from API 1), then checking every product page with the Playwright MCP browser.

---

## Links

[README](README.md) | [EXERCISE](EXERCISE.md) | [GETTING_STARTED](GETTING_STARTED.md) | [FEEDBACK](FEEDBACK.md)
