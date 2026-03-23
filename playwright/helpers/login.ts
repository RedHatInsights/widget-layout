import { Page, expect } from '@playwright/test';

export async function disableCookiePrompt(page: Page) {
  await page.route('*/*', async (route, request) => {
    if (request.url().includes('consent.trustarc.com') &&
        request.resourceType() !== 'document') {
      await route.abort();
    } else {
      await route.continue();
    }
  });
}

export async function login(page: Page): Promise<void> {
  const username = process.env.E2E_USER;
  const password = process.env.E2E_PASSWORD;
  if (!username || !password) return;

  // Check for proxy configuration issues
  await expect(page.locator("text=Lockdown"), 'proxy config incorrect')
    .toHaveCount(0);

  await disableCookiePrompt(page);

  // Fill username using semantic label
  await page.getByLabel('Red Hat login').first().fill(username);
  await page.getByRole('button', { name: 'Next' }).click();

  // Fill password using semantic label
  await page.getByLabel('Password').first().fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Verify login was successful
  await expect(page.getByText('Invalid login')).not.toBeVisible();
}
