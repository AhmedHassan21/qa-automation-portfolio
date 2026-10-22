# QA Automation Portfolio — Playwright + TypeScript

UI test automation suite for [saucedemo.com](https://www.saucedemo.com), built as a portfolio
demonstration of production-style test automation practices.

## What this demonstrates

- **Page Object Model** — every page is a class in `pages/`; tests contain no selectors, only
  intent. Selectors live in exactly one place, so a UI change means editing one file.
- **Locator strategy** — stable `data-test` attributes and role-based locators
  (`getByRole`, `getByPlaceholder`) instead of brittle CSS/XPath chains.
- **Negative testing** — bad credentials, locked accounts, and incomplete checkout forms are
  covered alongside the happy path.
- **Data-driven assertions** — sorting tests read *all* prices/names and assert against a sorted
  copy, rather than hard-coding an expected order.
- **API contract testing** — a second suite exercises a REST API directly through Playwright's
  `request` fixture: status codes, response schemas, resource relationships, the full CRUD
  lifecycle, and response-time checks. No browser involved.
- **Accessibility scanning** — axe-core runs WCAG 2.0/2.1 AA scans on the core pages and
  gates CI on critical/serious violations.
- **CI-ready** — GitHub Actions workflow runs the suite on every push; failures upload the
  Playwright HTML report with traces and screenshots as an artifact.

## Test coverage

| Suite | Area | Tests |
|---|---|---|
| UI (`tests/*.spec.ts`) | Authentication | valid login, wrong password, locked-out user |
| UI | Inventory | price sort low→high, name sort A→Z |
| UI | Shopping flow | full purchase end-to-end, checkout validation (missing postal code) |
| API (`tests/api/posts-api.spec.ts`) | Read contracts | collection schema, single resource, 404 handling, nested routes, response time |
| API | CRUD lifecycle | create, partial payloads, update, delete |
| A11y (`tests/a11y.accessibility.spec.ts`) | axe-core scans (WCAG 2.0/2.1 AA) | no critical/serious violations on login, inventory, cart |

The API suite targets [JSONPlaceholder](https://jsonplaceholder.typicode.com), a stable fake REST
API. One test deliberately pins a quirk of its actual behavior (empty payloads are accepted and
echoed back with only the assigned id) — tests assert what servers do, not what docs claim.

## Running locally

```bash
npm install
npx playwright install chromium   # first time only
npm test                          # headless
npm run test:headed               # watch it run
npm run report                    # open the HTML report
```

## Structure

```
pages/             Page Object Model classes (login, inventory, cart, checkout)
tests/             UI test suites + shared test data
tests/api/         API contract tests (Playwright request fixture)
tests/a11y.accessibility.spec.ts  axe-core accessibility scans
.github/workflows  CI pipeline (GitHub Actions)
```

## Roadmap ideas

- Allure reporting for richer historical results

