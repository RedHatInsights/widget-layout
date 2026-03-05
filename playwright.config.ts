import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for widget-layout E2E tests
 *
 * Environment variables:
 * - PLAYWRIGHT_BASE_URL: Base URL for the test environment (default: http://localhost:1337)
 * - E2E_USER: Test user credentials
 * - E2E_PASSWORD: Test user password
 */
export default defineConfig({
  testDir: './playwright',

  // Maximum time one test can run
  timeout: 60 * 1000,

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
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:1337',

    // Collect trace on first retry of failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
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
