# Feedback

## Comments

- Improvement 1: Make the test environment reachable, or say it's meant to be down
  - Description: `https://test.automationexercise.com/` doesn't respond, so every test skips on it. That's a good way to test the skip mechanism, but it's not clear if it's on purpose. If it is, saying so in the exercise would save time spent checking whether something on my side is wrong.

- Improvement 2: Point out that the site's test cases have errors
  - Description: The exercise asks for Test Cases 14 and 15 as written on the site, and the written steps have mistakes (ISSUES.md, Issue 18). The success message is easy to miss because it only shows for a second or two while the payment is sent. A note that the steps may not match the site exactly would help candidates know how literally to follow them.

- Improvement 3: Mention that the shared site limits parallel runs
  - Description: Under parallel load the site answers "This website is under heavy load (queue full)" or HTTP 503. I had to drop to 2 workers locally and 1 on CI. Since the exercise asks about test performance, it would help to know this up front, or to have an instance we can run more workers against.

- Improvement 4: Say how many verifyLogin tests are expected
  - Description: "Write tests that verifyLogin, including API 7, 8, 9, and 10" reads as a minimum. I added edge cases (missing and empty fields, wrong password case, a deleted account, SQL injection, other request methods). Saying whether extra cases are welcome would help candidates plan their time.

- Feedback 1: The note about form data was useful
  - Description: The API docs don't say POST requests need `x-www-form-urlencoded`, and JSON bodies are rejected with a 400 inside an HTTP 200 response. The exercise calling this out saved a lot of debugging. One of the API tests checks that a JSON body is rejected.

- Feedback 2: Suggested enhancement for the products API
  - Description: I pick random products for the order tests from API 1. The API doesn't say whether a product is in stock, so the tests can't filter to products that can be bought. Every product is in stock today. The details are in ISSUES.md, Enhancement 1.

---

## Links

[README](README.md) | [EXERCISE](EXERCISE.md) | [GETTING_STARTED](GETTING_STARTED.md) | [ISSUES](ISSUES.md)
