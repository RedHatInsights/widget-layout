import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Run auth setup first if credentials are provided
  if (process.env.E2E_USER) {
    console.log('Running authentication setup...');
    try {
      const authSetup = await import('@redhat-cloud-services/playwright-test-auth/global-setup');
      await authSetup.default(config);
      console.log('Authentication complete');
    } catch (error) {
      console.error('Auth setup failed:', error);
      throw error;
    }
  }
  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: config.projects[0].use.storageState as string | undefined,
    baseURL: config.projects[0].use.baseURL,
    ignoreHTTPSErrors: config.projects[0].use.ignoreHTTPSErrors,
  });
  const page = await context.newPage();

  try {
    console.log('Global Setup: Resetting dashboard to default state...');

    // Navigate to the landing page
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');

    // Check if we have widgets - if not, reset to default
    const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
    const widgetCount = await widgetTiles.count().catch(() => 0);

    if (widgetCount === 0) {
      console.log('Dashboard is empty, clicking Reset to default...');

      // Click Reset to default button
      const resetButton = page.getByRole('button', { name: 'Reset to default' });
      await resetButton.click();

      // Wait for modal to appear
      await page.waitForTimeout(1000);

      // Check the "I understand" checkbox
      const checkbox = page.getByRole('checkbox', { name: /I understand that this action cannot be undone/i });
      await checkbox.check();

      // Click the "Reset layout" confirm button
      const confirmButton = page.getByRole('button', { name: 'Reset layout' });
      await confirmButton.click();

      // Wait for reset to complete and widgets to load
      await page.waitForTimeout(5000);

      // Verify widgets loaded
      const newWidgetCount = await widgetTiles.count().catch(() => 0);
      console.log(`Dashboard reset complete. Widgets loaded: ${newWidgetCount}`);
    } else {
      console.log(`Dashboard already has ${widgetCount} widgets, no reset needed`);
    }
  } catch (error) {
    console.error('Global Setup Error:', error);
    // Don't fail tests if setup fails - just log the error
  } finally {
    await browser.close();
  }
}

export default globalSetup;
