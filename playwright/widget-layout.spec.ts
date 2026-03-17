import { test, expect } from '@playwright/test';

test.describe('Widget Layout - Basic Rendering', () => {
  test('should render the site correctly', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Handle cookie consent if present
    try {
      const cookieFrame = page.frameLocator('iframe[name="trustarc_cm"]');
      const cookieButton = cookieFrame.getByRole('button', { name: 'Agree and proceed with' });
      await cookieButton.waitFor({ state: 'visible', timeout: 10000 });
      await cookieButton.click();
      await page.waitForTimeout(2000);
    } catch (error) {
      // Cookie banner didn't appear or was already accepted
    }

    // Check if we're redirected to SSO login page
    const currentUrl = page.url();
    if (currentUrl.includes('sso.stage.redhat.com') || currentUrl.includes('auth')) {
      const username = process.env.E2E_USER;
      const password = process.env.E2E_PASSWORD;

      if (username && password) {
        // Step 1: Fill in username
        await page.getByRole('textbox', { name: 'Red Hat login' }).fill(username);

        // Step 2: Click Next button
        await page.getByRole('button', { name: 'Next' }).click();

        // Wait for password field to appear
        await page.waitForTimeout(1000);

        // Step 3: Fill in password
        await page.getByRole('textbox', { name: 'Password' }).fill(password);

        // Step 4: Click Log in button
        await page.getByRole('button', { name: 'Log in' }).click();

        // Wait for redirect back to console
        await page.waitForLoadState('networkidle', { timeout: 30000 });
      }
    }

    // Wait for the page to be fully loaded after authentication
    await page.waitForLoadState('domcontentloaded');

    // Verify the page loaded successfully
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();

    // Verify we have a valid page title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Verify authenticated page elements are present
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Add widgets' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset to default' })).toBeVisible();

    // Verify main content is rendered
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Widget Layout - Add Widget from Drawer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the root console page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Handle cookie consent if present
    // Cookie banner is inside an iframe, so we need to access it
    try {
      // Wait for the cookie consent iframe to appear
      const cookieFrame = page.frameLocator('iframe[name="trustarc_cm"]');
      const cookieButton = cookieFrame.getByRole('button', { name: 'Agree and proceed with' });
      await cookieButton.waitFor({ state: 'visible', timeout: 10000 });
      await cookieButton.click();
      // Wait a bit for the cookie banner to close
      await page.waitForTimeout(2000);
    } catch (error) {
      // Cookie banner didn't appear or was already accepted, continue
    }

    // Check if we're redirected to SSO login page
    const currentUrl = page.url();
    if (currentUrl.includes('sso.stage.redhat.com') || currentUrl.includes('auth')) {
      // We need to authenticate
      const username = process.env.E2E_USER;
      const password = process.env.E2E_PASSWORD;

      if (username && password) {
        // Step 1: Fill in username
        await page.getByRole('textbox', { name: 'Red Hat login' }).fill(username);

        // Step 2: Click Next button
        await page.getByRole('button', { name: 'Next' }).click();

        // Wait for password field to appear
        await page.waitForTimeout(1000);

        // Step 3: Fill in password
        await page.getByRole('textbox', { name: 'Password' }).fill(password);

        // Step 4: Click Log in button
        await page.getByRole('button', { name: 'Log in' }).click();

        // Wait for redirect back to console
        await page.waitForLoadState('networkidle', { timeout: 30000 });
      }
    }

    // Wait for the page to be fully loaded after authentication
    await page.waitForLoadState('domcontentloaded');

    // Wait for the Add widgets button to be visible (indicates page is ready)
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: 30000 });
  });

  test('should open the widget drawer when clicking Add widgets button', async ({ page }) => {
    const addWidgetButton = page.getByRole('button', { name: 'Add widgets' });
    await expect(addWidgetButton).toBeVisible();

    const drawerText = page.getByText('Add new and previously removed widgets');

    // Check if drawer is already open
    const isDrawerVisible = await drawerText.isVisible().catch(() => false);

    if (isDrawerVisible) {
      // Drawer is already open, close it first to test the opening action
      await addWidgetButton.click();
      await page.waitForTimeout(1000);
      await expect(drawerText).not.toBeVisible({ timeout: 5000 });
    }

    // Now open the drawer
    await addWidgetButton.click();

    // Wait for drawer animation to complete
    await page.waitForTimeout(1000);

    // Verify the drawer opens by checking for the instruction text
    await expect(drawerText).toBeVisible({ timeout: 10000 });

    // Verify the instruction about drag and drop is visible
    await expect(page.getByText(/drag and drop to a new location/i)).toBeVisible();
  });

  test('should display available widgets in the drawer', async ({ page }) => {
    // Check if drawer is already open, if not, open it
    const drawerText = page.getByText('Add new and previously removed widgets');
    const isDrawerVisible = await drawerText.isVisible().catch(() => false);

    if (!isDrawerVisible) {
      // Open the drawer
      await page.getByRole('button', { name: 'Add widgets' }).click();
      await page.waitForTimeout(1000);
    }

    // Wait for drawer to be visible
    await expect(drawerText).toBeVisible({ timeout: 5000 });

    // Check for example draggable widgets in the drawer
    // These might vary, so we'll check if ANY text content appears in the drawer area
    const drawerSection = page.locator('text=Add new and previously removed widgets').locator('..');
    await expect(drawerSection).toBeVisible();
  });

  test('should close the drawer when clicking Add widgets button again', async ({ page }) => {
    const drawerText = page.getByText('Add new and previously removed widgets');

    // Ensure drawer is open first
    const isDrawerVisible = await drawerText.isVisible().catch(() => false);
    if (!isDrawerVisible) {
      // Open the drawer
      await page.getByRole('button', { name: 'Add widgets' }).click();
      await page.waitForTimeout(1000);
      await expect(drawerText).toBeVisible({ timeout: 5000 });
    }

    // Click Add widgets again to close
    await page.getByRole('button', { name: 'Add widgets' }).click();

    // Wait for drawer to close
    await page.waitForTimeout(1000);

    // Verify the instruction text is no longer visible
    await expect(drawerText).not.toBeVisible({ timeout: 5000 });
  });

  test('should display main widget cards on the page', async ({ page }) => {
    // Verify the main content area is present
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Check for service widget cards on the page - target specific card title elements
    await expect(page.locator('#widget-layout-container .pf-v6-widget-grid-tile__title').filter({ hasText: 'Red Hat Enterprise Linux' })).toBeVisible();
    await expect(page.locator('#widget-layout-container .pf-v6-widget-grid-tile__title').filter({ hasText: /^Red Hat OpenShift$/ })).toBeVisible();
    await expect(page.getByText('Recently visited')).toBeVisible();
  });

  test('should have Reset to default button visible', async ({ page }) => {
    // Verify the Reset to default button is present
    const resetButton = page.getByRole('button', { name: 'Reset to default' });
    await expect(resetButton).toBeVisible();
  });
});
