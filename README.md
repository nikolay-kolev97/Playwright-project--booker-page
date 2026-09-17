# Book Store Playwright Project

This is a test automation project built with Playwright and JavaScript against the DemoQA Book Store application.

I created the project to practice building a Playwright framework that covers more than basic UI tests. It includes UI and API testing, API + UI scenarios, custom fixtures, authentication with storage state, network mocking, browser context isolation, reporting, and GitHub Actions.

## Project Structure

```text id="wfb58s"
├── fixtures/
├── helpers/
├── pages/
├── tests/
│   ├── api/
│   └── authenticated/
├── playwright.config.js
└── .github/workflows/
```

The project is separated by responsibility:

* `pages/` contains the Page Objects used by the UI tests.
* `helpers/` contains the API helper.
* `fixtures/` contains reusable test setup and cleanup.
* `tests/api/` contains API tests.
* `tests/authenticated/` contains tests that use a saved authenticated session.

## What is tested

The project contains several types of tests.

### UI

UI tests cover scenarios such as searching for books, opening book details, login validation, and profile functionality.

Page Objects are used so that selectors and common page actions are kept outside the tests.

### API

API tests use Playwright's `APIRequestContext` directly.

The tests work with DemoQA endpoints for:

* creating users;
* generating authentication tokens;
* retrieving users;
* adding books;
* deleting books;
* deleting test users.

The API calls are kept in `BookStoreApi.js` instead of being duplicated across the tests.

### API + UI

The project also contains a hybrid test where API calls are used to prepare the test data and the UI is used for the final verification.

The flow is roughly:

```text id="u8v1j5"
Create user through API
→ Generate token
→ Add book through API
→ Verify through API
→ Login through UI
→ Verify the book in Profile
→ Clean up test data
```

I used this approach because creating test data through the API is faster and keeps unnecessary setup out of the UI flow.

## Custom Fixtures

A custom `testUser` fixture handles the lifecycle of temporary users.

Before the test it creates a user and generates a token. After the test it performs the cleanup.

This keeps setup and teardown logic separate from the actual test scenario.

## Authentication

For tests that need an already authenticated user, the project uses Playwright `storageState`.

Authentication is prepared by:

```text id="c47psw"
tests/auth.setup.js
```

The authenticated Playwright project depends on this setup and loads the saved browser state from:

```text id="snq5ki"
playwright/.auth/user.json
```

The authentication state is ignored by Git and is not committed to the repository.

Tests that create and manage their own users do not use this authenticated project.

## Network Mocking

Some tests use `page.route()` to replace the real Book Store API response.

The mocking scenarios include custom book data, an empty book collection, and server-error responses.

These tests do not modify the real DemoQA data because the response is intercepted only inside the Playwright browser session.

## Running the Project

Install dependencies:

```bash id="z2b7rx"
npm install
```

Install the Playwright browsers:

```bash id="uvxjq8"
npx playwright install
```

Create a `.env` file:

```env id="md0r9a"
BASE_URL=https://demoqa.com
E2E_USERNAME=your_username
E2E_PASSWORD=your_password
```

Then run the complete local suite:

```bash id="l2tdoh"
npm test
```

Other available commands:

```bash id="i5nb58"
npm run test:smoke
npm run test:regression
npm run test:auth
npm run test:headed
npm run report
```

## Tags

Tests are organized with tags including:

```text id="e7k4mx"
@smoke
@regression
@local-auth
```

This makes it possible to run smaller groups of tests without maintaining separate suites.

## Debugging and Reports

The project uses Playwright's HTML report together with traces, screenshots, and video for failed tests.

For local debugging, Playwright Inspector can be started with:

```bash id="5e8q69"
npx playwright test --debug
```

A saved trace can be opened with:

```bash id="brz9a1"
npx playwright show-trace path/to/trace.zip
```

## CI

GitHub Actions runs the automated tests on pull requests and changes to `master`.

The CI suite runs the Chromium project and excludes tests marked with `@local-auth`:

```bash id="20nh8j"
npx playwright test --project=chromium --grep-invert @local-auth
```

I separated these tests after finding that persistent DemoQA authentication worked locally but was not reliable from the GitHub Actions environment. The rest of the suite can therefore still provide a stable CI check without depending on that external authentication behavior.

The `master` branch is protected and requires the CI check to pass before changes can be merged.

## Main Concepts Used

This project gave me practical experience with:

* Playwright Page Object Model
* UI and API automation
* APIRequestContext
* custom fixtures and teardown
* browser contexts and test isolation
* storageState
* Playwright projects and dependencies
* API + UI test flows
* network interception and mocking
* auto-waiting and assertions
* retries and timeouts
* traces and HTML reports
* test tags and filtering
* GitHub Actions
* pull requests and protected branches
