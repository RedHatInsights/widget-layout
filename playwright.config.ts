import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for widget-layout E2E tests
 *
 * Environment variables:
 * - HCC_ENV_URL: HCC environment URL (used in CI/Konflux)
 * - E2E_USER: Test user credentials
 * - E2E_PASSWORD: Test user password
 */
export default defineConfig({
  testDir: './playwright',

  // Maximum time one test can run (increased for stage environment and slow SSO)
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
    // Uses the proxy at https://stage.foo.redhat.com:1337 which routes to the app
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://stage.foo.redhat.com:1337/',

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
