import { test, expect } from '@playwright/test';

/**
 * Hello World E2E Test Suite
 *
 * This is a basic skeleton test that demonstrates the E2E testing setup.
 * You can expand this file or create additional test files as needed.
 */

test.describe('Widget Layout - Hello World Tests', () => {

  test('should load the application homepage', async ({ page }) => {
    console.log('Starting test: should load the application homepage');
    const baseUrl = process.env.HCC_ENV_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:1337';
    console.log('Base URL:', baseUrl);

    // Navigate to the base URL
    console.log('Navigating to /');
    await page.goto('/');

    // Wait for the page to be fully loaded (with timeout)
    console.log('Waiting for page to load...');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

    // Basic assertion - check that the page loaded
    console.log('Page URL:', page.url());
    expect(page.url()).toBeTruthy();
    expect(page.url().length).toBeGreaterThan(0);

    console.log('✅ Hello World! Application loaded successfully.');
  });

  test('should have a valid page title', async ({ page }) => {
    console.log('Starting test: should have a valid page title');

    // Navigate to the widget layout route
    const testPath = '/widget-layout';
    console.log('Navigating to:', testPath);
    await page.goto(testPath);

    // Wait for navigation to complete
    console.log('Waiting for DOM to load...');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

    // Check that we got a valid response (not a 404)
    console.log('Checking page title...');
    const title = await page.title();
    expect(title).toBeDefined();
    expect(title.length).toBeGreaterThan(0);

    console.log(`✅ Page title: ${title}`);
  });

  test('should be able to interact with the DOM', async ({ page }) => {
    console.log('Starting test: should be able to interact with the DOM');

    // Navigate to the application
    const testPath = '/widget-layout';
    console.log('Navigating to:', testPath);
    await page.goto(testPath);

    // Wait for the page to load
    console.log('Waiting for page to load...');
    await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

    // Check that the body element exists
    console.log('Checking for body element...');
    const bodyElement = await page.locator('body');
    await expect(bodyElement).toBeVisible({ timeout: 30000 });

    console.log('✅ Hello World! DOM interaction successful.');
  });

  test('should be able to use environment variables', async ({ page }) => {
    console.log('Starting test: should be able to use environment variables');

    // This test demonstrates how to use environment variables
    // These will be provided by the Konflux pipeline
    const hccEnvUrl = process.env.HCC_ENV_URL;
    const e2eUser = process.env.E2E_USER;
    const baseUrl = process.env.HCC_ENV_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:1337';

    console.log('Environment variables check:');
    console.log('  - HCC_ENV_URL:', hccEnvUrl || 'NOT SET');
    console.log('  - E2E_USER:', e2eUser ? '***SET***' : 'NOT SET');
    console.log('  - Configured baseURL:', baseUrl);

    // Navigate using the base URL
    console.log('Navigating to /');
    await page.goto('/');

    // Simple assertion
    console.log('Current URL:', page.url());
    expect(page.url()).toBeTruthy();
    expect(page.url().length).toBeGreaterThan(0);

    console.log('✅ Hello World! Environment variables working correctly.');
  });

});

/**
 * NOTES FOR FUTURE TEST DEVELOPMENT:
 *
 * 1. Authentication Tests:
 *    - Use process.env.E2E_USER and process.env.E2E_PASSWORD
 *    - Create login helpers in a separate file (e.g., playwright/helpers/auth.ts)
 *
 * 2. Widget-Specific Tests:
 *    - Test widget rendering
 *    - Test widget interactions (drag, drop, resize)
 *    - Test widget configuration
 *
 * 3. API Tests:
 *    - Use page.request for API calls
 *    - Test data fetching and state management
 *
 * 4. Visual Regression Tests:
 *    - Use await page.screenshot() for visual comparisons
 *    - Consider using @playwright/test visual comparison features
 *
 * 5. Accessibility Tests:
 *    - Use axe-playwright for accessibility testing
 *    - Test keyboard navigation
 *
 * 6. Performance Tests:
 *    - Use page.metrics() to measure performance
 *    - Test load times and rendering performance
 */
