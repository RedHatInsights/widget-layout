import type { Page } from '@playwright/test';

export async function login(page: Page) {
  const username = process.env.E2E_USER;
  const password = process.env.E2E_PASSWORD;
  if (!username || !password) return;

  // Wait for SSO redirect
  await page.waitForURL(/sso.*redhat\.com|auth/, { timeout: 30000 });

  // Fill username
  const usernameField = page.locator('#username-verification');
  await usernameField.waitFor({ state: 'visible', timeout: 15000 });
  await usernameField.fill(username);

  // Click Next
  await page.locator('#login-show-step2').click();

  // Fill password
  const passwordField = page.locator('#password');
  await passwordField.waitFor({ state: 'visible', timeout: 15000 });
  await passwordField.fill(password);

  // Submit login
  await page.locator('#rh-password-verification-submit-button').click();

  // Wait for redirect back to the app
  await page.waitForLoadState('networkidle', { timeout: 30000 });
}
