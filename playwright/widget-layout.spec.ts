import { expect, test } from '@playwright/test';
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';
import { TABLE_SELECTOR, PAGE_LOAD_TIMEOUT_MS, WIDGET_LOAD_TIMEOUT_MS, deleteTestDashboard } from './helpers';

const DRAWER_TIMEOUT_MS = 5000;

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
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

    // If dashboard is empty, reset to default to ensure it has widgets
    const emptyState = page.getByText('No dashboard content');
    if (await emptyState.isVisible()) {
      await page.getByRole('button', { name: 'Reset to default' }).click();
      await page.getByRole('checkbox', { name: /I understand that this action cannot be undone/i }).check();
      await page.getByRole('button', { name: 'Reset layout' }).click();
      await page.locator('.pf-v6-c-card__title-text').first().waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });
    }
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
      await expect(drawerText).not.toBeVisible({ timeout: DRAWER_TIMEOUT_MS });
    }

    // Now open the drawer
    await addWidgetButton.click();

    // Wait for drawer animation to complete
    await page.waitForTimeout(1000);

    // Verify the drawer opens by checking for the instruction text
    await expect(drawerText).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

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
    await expect(drawerText).toBeVisible({ timeout: DRAWER_TIMEOUT_MS });

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
      await expect(drawerText).toBeVisible({ timeout: DRAWER_TIMEOUT_MS });
    }

    // Click Add widgets again to close
    await page.getByRole('button', { name: 'Add widgets' }).click();

    // Wait for drawer to close
    await page.waitForTimeout(1000);

    // Verify the instruction text is no longer visible
    await expect(drawerText).not.toBeVisible({ timeout: DRAWER_TIMEOUT_MS });
  });

  test('should display main widget cards on the page', async ({ page }) => {
    // Verify the main content area is present
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Check that widget cards are rendered on the page
    const widgetCards = page.locator('.pf-v6-c-card__title-text');
    await widgetCards.first().waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });
    const count = await widgetCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should have Reset to default button visible', async ({ page }) => {
    // Verify the Reset to default button is present
    const resetButton = page.getByRole('button', { name: 'Reset to default' });
    await expect(resetButton).toBeVisible();
  });

  test('should not show the widget drawer by default on page load', async ({ page }) => {
    await page
      .locator('.pf-v6-c-card__title-text')
      .first()
      .waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });

    const drawerText = page.getByText('Add new and previously removed widgets');
    await expect(drawerText).not.toBeVisible();
  });
});

test.describe('Widget Layout - Empty Dashboard', () => {
  test('should auto-open the widget drawer when landing on an empty dashboard', async ({ page }) => {
    const TEST_DASHBOARD_NAME = `__e2e_empty_dashboard_${Date.now()}`;
    await disableCookiePrompt(page);

    await page.goto('/dashboard-hub');
    await page.locator(TABLE_SELECTOR).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

    try {
      // Create a blank dashboard (no homepage change needed)
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Create dashboard' }).click();
      await page.getByRole('menuitem', { name: 'Create from blank' }).click();

      const modal = page.locator('[data-ouia-component-id="CreateBlankDashboardModal"]');
      await modal.waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });
      await modal.getByPlaceholder('from-scratch dashboard').fill(TEST_DASHBOARD_NAME);

      const createBtn = modal.getByRole('button', { name: 'Create dashboard' });
      await expect(createBtn).toBeEnabled({ timeout: WIDGET_LOAD_TIMEOUT_MS });
      await createBtn.click();

      // Wait for the new dashboard to appear in the table
      await page.getByRole('link', { name: TEST_DASHBOARD_NAME, exact: true }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

      // Navigate to the empty dashboard
      await page.getByRole('link', { name: TEST_DASHBOARD_NAME, exact: true }).click();
      await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

      // Verify drawer auto-opened on empty dashboard
      const drawerText = page.getByText('Add new and previously removed widgets');
      await expect(drawerText).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

      // Verify empty state is shown
      await expect(page.getByText('No dashboard content')).toBeVisible();
    } finally {
      await deleteTestDashboard(page, TEST_DASHBOARD_NAME);
    }
  });
});
