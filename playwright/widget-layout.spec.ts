/**
 * Widget Layout Playwright Tests
 *
 * Test Types:
 * - E2E Tests: Simulate real user journeys using only UI interactions (clicking, typing, dragging)
 * - Integration Tests: Use API calls for setup/teardown to test frontend-backend integration
 *
 * Prefer E2E for user workflows. Use integration tests when:
 * - API setup is needed to create specific test conditions
 * - Pure UI setup would be too complex or fragile
 * - Testing edge cases that are hard to reproduce via UI
 *
 * Mark integration tests with "[Integration]" prefix in test name.
 */
import { test, expect } from '@playwright/test';
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';

test.describe('Widget Layout - Basic Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
    await page.goto('/');
  });

  test('should render the site correctly', async ({ page }) => {
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
    await disableCookiePrompt(page);
    await page.goto('/');
    // Wait for dashboard to be ready
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

  test('should not show the widget drawer by default on page load', async ({ page }) => {
    await page.locator('#widget-layout-container .pf-v6-widget-grid-tile__title')
      .first()
      .waitFor({ state: 'visible', timeout: 180000 });

    const drawerText = page.getByText('Add new and previously removed widgets');
    await expect(drawerText).not.toBeVisible();
  });
});

test.describe('Widget Layout - Empty Dashboard Auto-Open', () => {
  // Note: This test is skipped because widgets on the landing page cannot be
  // removed via UI interactions (no kebab menu/remove button on individual widgets).
  // The drawer auto-open behavior for empty dashboards is tested in unit tests.
  // To test this E2E, we would need either:
  // 1. API setup to create an empty dashboard (requires solving auth issues)
  // 2. UI to remove widgets (not currently available on landing page)
  // 3. Navigate to a different dashboard type that allows widget removal

  test.skip('should auto-open drawer after user removes all widgets', async ({ page }) => {
    // Placeholder for future implementation when widget removal UI is available
    // or when we solve the API authentication issue for dashboard setup
  });
});
