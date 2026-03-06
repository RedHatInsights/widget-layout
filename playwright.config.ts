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

  // Maximum time one test can run (increased for stage environment)
  timeout: 120 * 1000,

  // Test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html'],
    ['list']
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    // In CI/Konflux: uses HCC_ENV_URL (e.g., https://console.stage.redhat.com)
    // Locally: uses localhost
    baseURL: process.env.HCC_ENV_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:1337',

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

  // Development server configuration (for local testing)
  webServer: process.env.CI ? undefined : {
    command: 'npm start',
    url: 'http://localhost:1337',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
