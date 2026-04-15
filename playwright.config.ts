import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for widget-layout E2E tests
 *
 * Authentication is handled by @redhat-cloud-services/playwright-test-auth
 * via global setup. The session is saved to playwright/.auth/user.json
 * and reused across all tests.
 *
 * Environment variables:
 * - E2E_USER: Test user credentials
 * - E2E_PASSWORD: Test user password
 */
export default defineConfig({
  testDir: './playwright',

  // Global setup: authenticate once and reuse session across all tests
  globalSetup: require.resolve('@redhat-cloud-services/playwright-test-auth/global-setup'),

  // Maximum time one test can run (increased for stage environment)
  timeout: 180 * 1000,

  // Test configuration
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  // Reporter configuration
  reporter: [
    ['html'],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://stage.foo.redhat.com:1337/',

    // Reuse authentication state from global setup
    storageState: 'playwright/.auth/user.json',

    // Skip TLS certificate verification (self-signed certs)
    ignoreHTTPSErrors: true,

    // Collect trace on first retry of failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Increased timeouts for stage environment
    navigationTimeout: 60 * 1000,
    actionTimeout: 30 * 1000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

});
