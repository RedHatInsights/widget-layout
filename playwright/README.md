# Widget Layout E2E Tests

This directory contains end-to-end tests for the widget-layout application using Playwright.

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
# Run all tests
npm run test:playwright

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Run specific test file
npx playwright test playwright/hello-world.spec.ts

# Run tests in debug mode
npx playwright test --debug


## Writing Tests

### Basic Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/staging/widget-layout');
    // Your test code here
  });
});
```

### Available Environment Variables

These are automatically provided by the Konflux E2E pipeline:

- `PLAYWRIGHT_BASE_URL` - Base URL for the test environment
- `E2E_USER` - Test user credentials
- `E2E_PASSWORD` - Test user password
- `E2E_HCC_ENV_URL` - HCC environment URL
- `E2E_STAGE_ACTUAL_HOSTNAME` - Stage hostname

### Best Practices

1. **Use descriptive test names**: Start with "should" for clarity
2. **Wait for elements**: Use Playwright's auto-waiting features
3. **Avoid hard-coded waits**: Use `waitForLoadState`, `waitForSelector`, etc.
4. **Keep tests independent**: Each test should be able to run standalone
5. **Use page object models**: For complex pages, create helper classes
6. **Handle authentication**: Create reusable login helpers

## CI/CD Integration

These tests run automatically in the Konflux pipeline on every pull request. The pipeline:

1. Builds the application container
2. Starts the app sidecar (serves assets on port 8000)
3. Starts the proxy sidecar (routes requests)
4. Runs Playwright tests against the test environment
5. Reports results back to the PR

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Learning Resources Example](https://github.com/RedHatInsights/learning-resources/tree/main/playwright)
- [Konflux E2E Pipeline Docs](https://github.com/RedHatInsights/frontend-experience-docs/blob/master/pages/testing/e2e-pipeline.md)
