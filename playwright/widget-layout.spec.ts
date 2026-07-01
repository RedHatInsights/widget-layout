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
    // Verify page is loaded with widgets before testing drawer
    const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
    await expect(widgetTiles.first()).toBeVisible({ timeout: 10000 });

    const addWidgetButton = page.getByRole('button', { name: 'Add widgets' });
    await expect(addWidgetButton).toBeVisible();

    const drawerText = page.getByText('Add new and previously removed widgets');

    // Check current drawer state (don't swallow errors)
    const isDrawerVisible = await drawerText.isVisible();

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
    // Verify page is loaded with widgets before testing drawer
    const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
    await expect(widgetTiles.first()).toBeVisible({ timeout: 10000 });

    const addWidgetsButton = page.getByRole('button', { name: 'Add widgets' });
    const drawerText = page.getByText('Add new and previously removed widgets');

    // Check current drawer state (don't swallow errors)
    const isDrawerVisible = await drawerText.isVisible();

    if (!isDrawerVisible) {
      // Open the drawer first
      await addWidgetsButton.click();
      await expect(drawerText).toBeVisible({ timeout: 5000 });
    }

    // Click Add widgets again to close
    await addWidgetsButton.click();

    // Wait for drawer close animation to complete
    await page.waitForTimeout(1500);

    // Verify the instruction text is no longer visible
    await expect(drawerText).not.toBeVisible({ timeout: 5000 });
  });

  test('should display main widget cards on the page', async ({ page }) => {
    // Verify the main content area is present
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Verify widget tiles are present on the page (at least one)
    const widgetTiles = page.locator('#widget-layout-container .pf-v6-widget-grid-tile');
    await expect(widgetTiles.first()).toBeVisible({ timeout: 10000 });

    // Verify we have multiple widgets
    const count = await widgetTiles.count();
    expect(count).toBeGreaterThan(0);

    // Check for default widgets that appear after reset
    // Red Hat Enterprise Linux is the first widget in the default layout
    const widgetTitles = page.locator('#widget-layout-container .pf-v6-widget-grid-tile__title');
    await expect(widgetTitles.first()).toBeVisible();

    // Optionally check for specific default widgets if they should always be present
    // (commenting out for now since widget availability may vary by permissions)
    // await expect(page.locator('#widget-layout-container .pf-v6-widget-grid-tile__title').filter({ hasText: 'Red Hat Enterprise Linux' })).toBeVisible();
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
  // SKIPPED: This test removes all widgets from the dashboard, which affects
  // subsequent tests in the same run (they fail because dashboard is empty).
  //
  // To properly test this, we need one of:
  // 1. Test isolation via beforeEach that resets dashboard (requires API auth fix)
  // 2. Run this test in a separate worker/file
  // 3. Add cleanup that clicks "Reset to default" and handles the confirmation modal
  //
  // The drawer auto-open behavior IS working (verified manually and in unit tests).
  // This test validates the full E2E flow but needs isolation to run in CI.

  test.skip('should auto-open drawer after user removes all widgets', async ({ page }) => {
    await disableCookiePrompt(page);
    await page.goto('/');

    // Wait for the page to load with widgets
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: 30000 });

    // Find all widget tiles
    const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
    const initialCount = await widgetTiles.count();

    if (initialCount === 0) {
      test.skip(true, 'Dashboard is already empty');
      return;
    }

    // Remove all widgets
    for (let i = 0; i < initialCount; i++) {
      const firstWidget = widgetTiles.first();
      const menuToggle = firstWidget.locator('button.pf-v6-widget-grid-tile__menu-toggle');
      await menuToggle.click();

      const removeButton = page.getByRole('menuitem', { name: 'Remove' });
      await removeButton.click();
      await page.waitForTimeout(500);
    }

    // Verify empty state and drawer auto-open
    await expect(page.getByText('No dashboard content')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Add new and previously removed widgets/)).toBeVisible({ timeout: 10000 });

    const drawerCards = page.locator('[data-ouia-component-id^="add-widget-card-"]');
    await expect(drawerCards.first()).toBeVisible({ timeout: 5000 });
  });
});
