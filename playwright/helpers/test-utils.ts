import { Page, expect } from '@playwright/test';

// Get the base URL from environment or use default
const getBaseURL = () => {
  return process.env.HCC_ENV_URL || process.env.PLAYWRIGHT_BASE_URL || 'https://stage.foo.redhat.com:1337';
};

// Prevents inconsistent cookie prompting that is problematic for UI testing
export async function disableCookiePrompt(page: Page) {
  await page.route('**/*', async (route, request) => {
    if (request.url().includes('consent.trustarc.com') && request.resourceType() !== 'document') {
      await route.abort();
    } else {
      await route.continue();
    }
  });
}

export async function login(page: Page, user: string, password: string): Promise<void> {
  // Fail in a friendly way if the proxy config is not set up correctly
  await expect(page.locator("text=Lockdown"), 'proxy config incorrect').toHaveCount(0);

  await disableCookiePrompt(page);

  // Wait for and fill username field
  await page.getByLabel('Red Hat login').first().fill(user);
  await page.getByRole('button', { name: 'Next' }).click();

  // Wait for and fill password field
  await page.getByLabel('Password').first().fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Confirm login was valid
  await expect(page.getByText('Invalid login')).not.toBeVisible();
}

// Shared login logic for test beforeEach blocks
export async function ensureLoggedIn(page: Page): Promise<void> {
  const user = process.env.E2E_USER;
  const password = process.env.E2E_PASSWORD;

  if (!user || !password) {
    throw new Error('E2E_USER and E2E_PASSWORD environment variables must be set');
  }

  // Navigate to the app (will redirect to SSO if not logged in)
  const baseURL = getBaseURL();
  await page.goto(baseURL, { waitUntil: 'load', timeout: 60000 });

  // Check if already logged in by looking for the Add widgets button
  const addWidgetsButton = page.getByRole('button', { name: 'Add widgets' });
  const loggedIn = await addWidgetsButton.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);

  if (!loggedIn) {
    // Wait for SSO redirect and login form to load
    await page.waitForLoadState("load");
    await login(page, user, password);

    // Wait for navigation after login (SSO redirect back to app)
    await page.waitForLoadState("networkidle", { timeout: 60000 });
    await page.waitForLoadState("load");
    await expect(page.getByText('Invalid login')).not.toBeVisible();

    // Wait for dashboard to be displayed (increased timeout for slow SSO)
    await expect(addWidgetsButton, 'dashboard not displayed').toBeVisible({ timeout: 60000 });

    // Conditionally accept cookie prompt
    const acceptAllButton = page.getByRole('button', { name: 'Accept all'});
    if (await acceptAllButton.isVisible()) {
      await acceptAllButton.click();
    }
  }
}
