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
 *
 * ⚠️ CRITICAL: Always call disableCookiePrompt(page) BEFORE navigation
 * The TrustArc cookie consent popup WILL block clicks and cause mysterious test failures.
 * Every beforeEach must call it first!
 */
import { test, expect } from '@playwright/test';
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';

// Timing constants - all timeouts in milliseconds
// These account for CI environment constraints and network latency

// Animation/transition waits
const DRAWER_ANIMATION_MS = 1000;
const MODAL_TRANSITION_MS = 500;

// Element visibility timeouts
const PAGE_LOAD_TIMEOUT_MS = 30000;      // 30s - Initial page load with auth
const WIDGET_LOAD_TIMEOUT_MS = 10000;    // 10s - Widget tiles appearing
const DRAWER_TIMEOUT_MS = 5000;          // 5s - Drawer open/close
const EXTENDED_TIMEOUT_MS = 180000;      // 3min - For exceptionally slow operations

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
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
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
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
  });

  test('should open the widget drawer when clicking Add widgets button', async ({ page }) => {
    // Verify page is loaded with widgets before testing drawer
    const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
    await expect(widgetTiles.first()).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

    const addWidgetButton = page.getByRole('button', { name: 'Add widgets' });
    await expect(addWidgetButton).toBeVisible();

    const drawerText = page.getByText('Add new and previously removed widgets');

    // Check current drawer state (don't swallow errors)
    const isDrawerVisible = await drawerText.isVisible();

    if (isDrawerVisible) {
      // Drawer is already open, close it first to test the opening action
      await addWidgetButton.click();
      await expect(drawerText).not.toBeVisible({ timeout: DRAWER_TIMEOUT_MS });
    }

    // Now open the drawer
    await addWidgetButton.click();

    // Verify the drawer opens by checking for the instruction text
    await expect(drawerText).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

    // Verify the instruction about drag and drop is visible
    await expect(page.getByText(/drag and drop to a new location/i)).toBeVisible();
  });

  test('should display available widgets in the drawer', async ({ page }) => {
    // Verify page is loaded with widgets before testing drawer
    const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
    await expect(widgetTiles.first()).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

    const drawerText = page.getByText('Add new and previously removed widgets');

    // Check if drawer is already open, if not, open it
    const isDrawerVisible = await drawerText.isVisible();

    if (!isDrawerVisible) {
      // Open the drawer
      await page.getByRole('button', { name: 'Add widgets' }).click();
    }

    // Wait for drawer to be visible
    await expect(drawerText).toBeVisible({ timeout: DRAWER_TIMEOUT_MS });

    // Verify drawer contains widget cards to add
    const drawerCards = page.locator('[data-ouia-component-id^="add-widget-card-"]');
    await expect(drawerCards.first()).toBeVisible();
  });

  test('should close the drawer when clicking Add widgets button again', async ({ page }) => {
    // Verify page is loaded with widgets before testing drawer
    const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
    await expect(widgetTiles.first()).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

    const addWidgetsButton = page.getByRole('button', { name: 'Add widgets' });
    const drawerText = page.getByText('Add new and previously removed widgets');

    // Check current drawer state (don't swallow errors)
    const isDrawerVisible = await drawerText.isVisible();

    if (!isDrawerVisible) {
      // Open the drawer first
      await addWidgetsButton.click();
      await expect(drawerText).toBeVisible({ timeout: DRAWER_TIMEOUT_MS });
    }

    // Click Add widgets again to close
    await addWidgetsButton.click();

    // Verify the instruction text is no longer visible
    await expect(drawerText).not.toBeVisible({ timeout: DRAWER_TIMEOUT_MS });
  });

  test('should display main widget cards on the page', async ({ page }) => {
    // Verify the main content area is present
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Verify widget tiles are present on the page (at least one)
    const widgetTiles = page.locator('#widget-layout-container .pf-v6-widget-grid-tile');
    await expect(widgetTiles.first()).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

    // Verify we have multiple widgets
    const count = await widgetTiles.count();
    expect(count).toBeGreaterThan(0);

    // Verify widget titles are visible
    const widgetTitles = page.locator('#widget-layout-container .pf-v6-widget-grid-tile__title');
    await expect(widgetTitles.first()).toBeVisible();
  });

  test('should have Reset to default button visible', async ({ page }) => {
    // Verify the Reset to default button is present
    const resetButton = page.getByRole('button', { name: 'Reset to default' });
    await expect(resetButton).toBeVisible();
  });

  test('should not show the widget drawer by default on page load', async ({ page }) => {
    await page.locator('#widget-layout-container .pf-v6-widget-grid-tile__title')
      .first()
      .waitFor({ state: 'visible', timeout: EXTENDED_TIMEOUT_MS });

    const drawerText = page.getByText('Add new and previously removed widgets');
    await expect(drawerText).not.toBeVisible();
  });
});

test.describe('Widget Layout - Empty Dashboard Auto-Open', () => {
  test('should auto-open drawer after user removes all widgets', async ({ page }) => {
    await disableCookiePrompt(page);
    await page.goto('/');

    // Wait for the page to load with widgets
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

    // Find all widget tiles
    const widgetTiles = page.locator('.pf-v6-widget-grid-tile');
    const initialCount = await widgetTiles.count();

    if (initialCount === 0) {
      test.skip(true, 'Dashboard is already empty');
      return;
    }

    try {
      // Remove all widgets one by one
      for (let i = 0; i < initialCount; i++) {
        const firstWidget = widgetTiles.first();
        const menuToggle = firstWidget.locator('button.pf-v6-widget-grid-tile__menu-toggle');
        await menuToggle.click();

        const removeButton = page.getByRole('menuitem', { name: 'Remove' });
        await removeButton.click();

        // Wait for widget to be removed from DOM
        await page.waitForTimeout(MODAL_TRANSITION_MS);
      }

      // Verify empty state appears
      await expect(page.getByText('No dashboard content')).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

      // Verify drawer auto-opens when all widgets removed
      await expect(page.getByText(/Add new and previously removed widgets/)).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

      // Verify drawer contains widgets to add back
      const drawerCards = page.locator('[data-ouia-component-id^="add-widget-card-"]');
      await expect(drawerCards.first()).toBeVisible({ timeout: DRAWER_TIMEOUT_MS });
    } finally {
      // Cleanup: Reset dashboard to default state for subsequent tests
      // This uses the same reset flow that works in global setup
      console.log('Resetting dashboard to default state after widget removal test...');

      const resetButton = page.getByRole('button', { name: 'Reset to default' });
      await resetButton.click();

      // Check the "I understand" checkbox (waiting for it to be visible ensures modal is loaded)
      const checkbox = page.getByRole('checkbox', { name: /I understand that this action cannot be undone/i });
      await checkbox.check();

      // Click the "Reset layout" confirm button
      const confirmButton = page.getByRole('button', { name: 'Reset layout' });
      await confirmButton.click();

      // Wait for reset to complete - verify widgets are restored
      const restoredWidgets = page.locator('.pf-v6-widget-grid-tile');
      await expect(restoredWidgets.first()).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

      const restoredCount = await restoredWidgets.count();
      console.log(`Dashboard reset complete. Widgets restored: ${restoredCount}`);
    }
  });
});
