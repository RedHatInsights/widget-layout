# Widget Layout E2E Tests

This directory contains end-to-end tests for the widget-layout application using Playwright.

## Authentication

Authentication is handled by the `@redhat-cloud-services/playwright-test-auth` package via **global setup**. This means:

- Login happens **once** before all tests run (not per-test)
- The authenticated session is saved to `playwright/.auth/user.json`
- All tests reuse this session via Playwright's `storageState` config
- Cookie consent prompts are blocked using `disableCookiePrompt(page)`

### Required Environment Variables

- `E2E_USER` - Username for Red Hat SSO authentication
- `E2E_PASSWORD` - Password for Red Hat SSO authentication

These are automatically provided by the Konflux E2E pipeline in CI.

## Getting Started

### Installation

```bash
# Install dependencies (including Playwright)
npm install

# Install Playwright browsers
npx playwright install --with-deps chromium
```

### Running Tests Locally

```bash
# Set credentials
export E2E_USER='your-username'
export E2E_PASSWORD='your-password'

# Run all tests
npm run test:playwright

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug
```

## Writing Tests

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Your test code here — user is already authenticated
  });
});
```

### Additional Environment Variables

These are automatically provided by the Konflux E2E pipeline:

- `PLAYWRIGHT_BASE_URL` - Base URL for the test environment
- `E2E_HCC_ENV_URL` - HCC environment URL
- `E2E_STAGE_ACTUAL_HOSTNAME` - Stage hostname

### Best Practices

1. **ALWAYS call `disableCookiePrompt` first**: Before any navigation, in every test/setup
2. **Use descriptive test names**: Start with "should" for clarity
3. **Wait for elements**: Use Playwright's auto-waiting features
4. **Avoid hard-coded waits**: Use `waitForLoadState`, `waitForSelector`, etc.
5. **Keep tests independent**: Each test should be able to run standalone
6. **No login logic in tests**: Authentication is handled by global setup
7. **Verify page state before interactions**: Don't use `.catch(() => false)` to hide errors

## CI/CD Integration

These tests run automatically in the Konflux pipeline on every pull request. The pipeline:

1. Builds the application container
2. Starts the app sidecar (serves assets on port 8000)
3. Starts the proxy sidecar (routes requests)
4. Runs Playwright tests against the test environment
5. Reports results back to the PR

## Troubleshooting

### ⚠️ ALWAYS CHECK FIRST: Cookie Consent Popup Blocking Interactions

**If tests are failing with mysterious timeouts or "element intercepts pointer events":**

The TrustArc cookie consent popup is probably blocking clicks. Symptoms:
- Clicks timing out after 30s of retries
- Error mentions `truste_popframe` or `truste_overlay` intercepting pointer events
- Tests fail in CI but pass locally
- Reset button or other UI elements can't be clicked

**Solution:** Ensure `disableCookiePrompt(page)` is called BEFORE any navigation:

```typescript
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';

test.beforeEach(async ({ page }) => {
  await disableCookiePrompt(page);  // ← MUST be first!
  await page.goto('/');
});
```

**This includes:**
- Every test's `beforeEach` hook
- Global setup functions
- Any custom page navigation helpers

**This issue can waste hours of debugging!** Always check cookie consent first when tests mysteriously fail.

---

### Tests failing with "element not found" or timeouts

**Dashboard is empty from previous test run:**
- The global setup (`playwright/global-setup.ts`) automatically resets the dashboard
- If it fails, manually visit the app and click "Reset to default"

**Authentication issues:**
- Verify `E2E_USER` and `E2E_PASSWORD` are set correctly
- Test credentials by logging into https://stage.foo.redhat.com manually
- Delete `playwright/.auth/user.json` to force re-authentication

**Stage environment is slow:**
- Tests default to 180s timeout for this reason
- Check https://status.redhat.com for outages

### Running Specific Tests

```bash
# Run one test file
npm run test:playwright -- widget-layout.spec.ts

# Run one test by name
npm run test:playwright -- -g "should open the widget drawer"

# Run with more verbose output
npm run test:playwright -- --reporter=line

# Generate HTML report after run
npx playwright show-report
```

### Viewing Test Results

After tests run, reports are available:
- **HTML Report**: `npx playwright show-report`
- **Screenshots**: `test-results/` directory (on failure)
- **Videos**: `test-results/` directory (on failure)
- **Traces**: Enable with `--trace on` flag

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [playwright-test-auth Package](https://www.npmjs.com/package/@redhat-cloud-services/playwright-test-auth)
- [Konflux E2E Pipeline Docs](https://github.com/RedHatInsights/frontend-experience-docs/blob/master/pages/testing/e2e-pipeline.md)
