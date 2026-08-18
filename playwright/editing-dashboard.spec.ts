import { Page, expect, test } from '@playwright/test';
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';
import { DASHBOARD_HUB_URL, TABLE_SELECTOR, PAGE_LOAD_TIMEOUT_MS, WIDGET_LOAD_TIMEOUT_MS, deleteTestDashboard } from './helpers';

const navigateToDashboardHub = async (page: Page) => {
  await page.goto(DASHBOARD_HUB_URL);
  await page.locator(TABLE_SELECTOR).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
  await page.locator(TABLE_SELECTOR).locator('a').first().waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });
};

const navigateToGenericDashboard = async (page: Page, dashboardName: string) => {
  await navigateToDashboardHub(page);
  await page.getByRole('link', { name: dashboardName, exact: true }).click();
  await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
};

const openKebabDropdown = async (page: Page) => {
  await page.getByRole('button', { name: 'kebab dropdown toggle' }).click();
  await page.getByRole('menuitem', { name: 'Set as homepage' }).waitFor({ state: 'visible' });
};


const findDashboardNames = (page: Page) => {
  return page.evaluate((selector) => {
    const table = document.querySelector(selector);
    if (!table) return { defaultName: null, nonDefaultName: null };
    const rows = table.querySelectorAll('tbody tr');
    let defaultName: string | null = null;
    let nonDefaultName: string | null = null;
    for (const row of rows) {
      const firstTd = row.querySelector(':scope > td:first-child');
      const link = row.querySelector(':scope > td:nth-child(2) a');
      const name = link?.textContent ?? null;
      if (!firstTd || !name) continue;
      if (firstTd.querySelector('svg')) {
        if (!defaultName) defaultName = name;
      } else {
        if (!nonDefaultName) nonDefaultName = name;
      }
      if (defaultName && nonDefaultName) break;
    }
    return { defaultName, nonDefaultName };
  }, TABLE_SELECTOR);
};

const hasHomeIcon = async (page: Page, dashboardName: string) => {
  return page.evaluate(
    ({ selector, name }) => {
      const table = document.querySelector(selector);
      if (!table) return false;
      const rows = table.querySelectorAll('tbody tr');
      for (const row of rows) {
        const link = row.querySelector(':scope > td:nth-child(2) a');
        if (link?.textContent === name) {
          const firstTd = row.querySelector(':scope > td:first-child');
          return !!firstTd?.querySelector('svg');
        }
      }
      return false;
    },
    { selector: TABLE_SELECTOR, name: dashboardName }
  );
};

test.describe('Set Dashboard as Homepage from Generic Page', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
  });

  test('should set a dashboard as homepage and see home icon in Dashboard Hub', async ({ page }) => {
    await navigateToDashboardHub(page);

    const { nonDefaultName } = await findDashboardNames(page);
    if (!nonDefaultName) {
      test.skip(true, 'No non-default dashboard found to test with');
      return;
    }

    await navigateToGenericDashboard(page, nonDefaultName);
    await openKebabDropdown(page);

    const setAsHomepageItem = page.getByRole('menuitem', { name: 'Set as homepage' });
    await expect(setAsHomepageItem).toBeVisible();
    await setAsHomepageItem.click();

    await page.getByText(`'${nonDefaultName}' has been set as homepage`).waitFor({ state: 'visible', timeout: 10000 });

    await navigateToDashboardHub(page);

    expect(await hasHomeIcon(page, nonDefaultName)).toBe(true);
  });

  test('should show disabled "Set as homepage" with tooltip when dashboard is already homepage', async ({ page }) => {
    await navigateToDashboardHub(page);

    const { defaultName } = await findDashboardNames(page);
    if (!defaultName) {
      test.skip(true, 'No default dashboard found');
      return;
    }

    await navigateToGenericDashboard(page, defaultName);
    await openKebabDropdown(page);

    const setAsHomepageItem = page.getByRole('menuitem', { name: 'Set as homepage' });
    await expect(setAsHomepageItem).toBeVisible();
    await expect(setAsHomepageItem).toHaveAttribute('aria-disabled', 'true');

    await setAsHomepageItem.hover();
    await expect(page.getByRole('tooltip', { name: 'This dashboard is already set as your homepage' })).toBeVisible({ timeout: 5000 });
  });

  test('should switch homepage from one dashboard to another', async ({ page }) => {
    await navigateToDashboardHub(page);

    const { defaultName, nonDefaultName } = await findDashboardNames(page);
    if (!defaultName || !nonDefaultName) {
      test.skip(true, 'Need at least 2 dashboards (one default, one non-default) to test');
      return;
    }

    await navigateToGenericDashboard(page, nonDefaultName);
    await openKebabDropdown(page);
    await page.getByRole('menuitem', { name: 'Set as homepage' }).click();

    await page.getByText(`'${nonDefaultName}' has been set as homepage`).waitFor({ state: 'visible', timeout: 10000 });

    await navigateToDashboardHub(page);
    await page.getByRole('link', { name: nonDefaultName, exact: true }).waitFor({ state: 'visible', timeout: 10000 });

    expect(await hasHomeIcon(page, nonDefaultName)).toBe(true);
    expect(await hasHomeIcon(page, defaultName)).toBe(false);
  });
});

test.describe('Inline Editing Dashboard Name', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
  });

  test('should rename a dashboard and see the new name on the generic page and in Dashboard Hub', async ({ page }) => {
    await navigateToDashboardHub(page);

    const { nonDefaultName } = await findDashboardNames(page);
    if (!nonDefaultName) {
      test.skip(true, 'No non-default dashboard found to test with');
      return;
    }

    const newName = `Renamed ${Date.now()}`;

    await navigateToGenericDashboard(page, nonDefaultName);

    await page.getByRole('button', { name: 'Edit dashboard name' }).click();
    const input = page.getByRole('textbox', { name: 'Dashboard name' });
    await expect(input).toBeVisible();
    await input.clear();
    await input.fill(newName);
    await page.getByRole('button', { name: 'Confirm name' }).click();

    await expect(input).not.toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });
    await expect(page.locator('h1').filter({ hasText: newName })).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

    await navigateToDashboardHub(page);
    await expect(page.getByRole('link', { name: newName })).toBeVisible({ timeout: 10000 });

    // Restore the original name
    await navigateToGenericDashboard(page, newName);
    await page.getByRole('button', { name: 'Edit dashboard name' }).click();
    const restoreInput = page.getByRole('textbox', { name: 'Dashboard name' });
    await restoreInput.clear();
    await restoreInput.fill(nonDefaultName);
    await page.getByRole('button', { name: 'Confirm name' }).click();
    await expect(restoreInput).not.toBeVisible({ timeout: 5000 });
  });

  test('should cancel editing and keep the original name', async ({ page }) => {
    await navigateToDashboardHub(page);

    const { nonDefaultName } = await findDashboardNames(page);
    if (!nonDefaultName) {
      test.skip(true, 'No non-default dashboard found to test with');
      return;
    }

    await navigateToGenericDashboard(page, nonDefaultName);

    await page.getByRole('button', { name: 'Edit dashboard name' }).click();
    const input = page.getByRole('textbox', { name: 'Dashboard name' });
    await expect(input).toBeVisible();
    await input.clear();
    await input.fill('Should Not Be Saved');
    await page.getByRole('button', { name: 'Cancel editing' }).click();

    await expect(input).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('h1').filter({ hasText: nonDefaultName })).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Dashboard Hub - Page Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
  });

  test('should render the dashboard hub with table and headers', async ({ page }) => {
    await navigateToDashboardHub(page);

    await expect(page.getByRole('heading', { name: 'Dashboard Hub', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create dashboard' })).toBeVisible();

    const table = page.locator(TABLE_SELECTOR);
    await expect(table).toBeVisible();

    await expect(table.getByRole('columnheader', { name: 'Homepage' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Last Modified' })).toBeVisible();

    // Wait for data rows to load (table renders before data arrives)
    const firstLink = table.locator('a').first();
    await expect(firstLink).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });
  });
});

test.describe('Dashboard Hub - Create Blank Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
  });

  test('should create a blank dashboard and see it in the hub table', async ({ page }) => {
    const TEST_NAME = `__e2e_create_${Date.now()}`;
    await navigateToDashboardHub(page);

    try {
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Create dashboard' }).click();
      await page.getByRole('menuitem', { name: 'Create from blank' }).click();

      const modal = page.locator('[data-ouia-component-id="CreateBlankDashboardModal"]');
      await modal.waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });
      await modal.getByPlaceholder('from-scratch dashboard').fill(TEST_NAME);

      const createBtn = modal.getByRole('button', { name: 'Create dashboard' });
      await expect(createBtn).toBeEnabled({ timeout: WIDGET_LOAD_TIMEOUT_MS });
      await createBtn.click();

      await page.getByRole('link', { name: TEST_NAME, exact: true }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
    } finally {
      await deleteTestDashboard(page, TEST_NAME);
    }
  });
});

test.describe('Dashboard Hub - Duplicate Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
  });

  test('should duplicate an existing dashboard from the hub table', async ({ page }) => {
    const DUPLICATE_NAME = `__e2e_duplicate_${Date.now()}`;
    await navigateToDashboardHub(page);

    // Wait for data rows to load
    const table = page.locator(TABLE_SELECTOR);
    const firstLink = table.locator('a').first();
    await expect(firstLink).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

    // Get the Duplicate button from the first row's actions
    const firstDuplicateBtn = table.getByRole('button', { name: 'Duplicate' }).first();
    await page.waitForLoadState('networkidle');

    try {
      await firstDuplicateBtn.click();

      const modal = page.locator('[data-ouia-component-id="DuplicateDashboardModal"]');
      await expect(modal).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });

      await modal.getByPlaceholder('duplicate dashboard').fill(DUPLICATE_NAME);
      const duplicateBtn = modal.getByRole('button', { name: 'Duplicate dashboard' });
      await expect(duplicateBtn).toBeEnabled({ timeout: WIDGET_LOAD_TIMEOUT_MS });
      await duplicateBtn.click();

      // Verify success notification
      await page.getByText(`Dashboard '${DUPLICATE_NAME}' duplicated successfully`).waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });

      // Table doesn't auto-refresh after duplication — reload to verify
      await page.goto(DASHBOARD_HUB_URL);
      await page.locator(TABLE_SELECTOR).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
      await expect(page.getByRole('link', { name: DUPLICATE_NAME, exact: true })).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });
    } finally {
      await deleteTestDashboard(page, DUPLICATE_NAME);
    }
  });
});

test.describe('Dashboard Hub - Delete Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
  });

  test('should delete a dashboard and see it removed from the hub', async ({ page }) => {
    const DELETE_NAME = `__e2e_delete_${Date.now()}`;
    await navigateToDashboardHub(page);

    // Create a dashboard to delete
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Create dashboard' }).click();
    await page.getByRole('menuitem', { name: 'Create from blank' }).click();

    const modal = page.locator('[data-ouia-component-id="CreateBlankDashboardModal"]');
    await modal.waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });
    await modal.getByPlaceholder('from-scratch dashboard').fill(DELETE_NAME);
    const createBtn = modal.getByRole('button', { name: 'Create dashboard' });
    await expect(createBtn).toBeEnabled({ timeout: WIDGET_LOAD_TIMEOUT_MS });
    await createBtn.click();

    await page.getByRole('link', { name: DELETE_NAME, exact: true }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

    // Navigate to the dashboard
    await page.getByRole('link', { name: DELETE_NAME, exact: true }).click();
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

    // Delete it
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'kebab dropdown toggle' }).click();
    await page.getByRole('menuitem', { name: 'Delete dashboard' }).click();

    await page.getByText(/Deleting the dashboard will remove/).waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });
    await page.getByRole('checkbox', { name: /I understand that this action cannot be undone/i }).check();
    await page.getByRole('button', { name: 'Delete dashboard' }).click();

    // Verify redirected to hub and dashboard is gone
    await page.locator(TABLE_SELECTOR).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
    await expect(page.getByRole('link', { name: DELETE_NAME, exact: true })).not.toBeVisible();
  });
});

test.describe('Dashboard Hub - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
  });

  test('should navigate from hub to dashboard and back via breadcrumb', async ({ page }) => {
    await navigateToDashboardHub(page);

    const table = page.locator(TABLE_SELECTOR);
    const firstLink = table.locator('a').first();
    await expect(firstLink).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });
    const dashboardName = await firstLink.textContent();

    if (!dashboardName) {
      test.skip(true, 'No dashboard found to navigate to');
      return;
    }

    // Navigate to the dashboard
    await firstLink.click();
    await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });

    // Verify breadcrumb shows dashboard name
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByText(dashboardName)).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Dashboard Hub' })).toBeVisible();

    // Navigate back via breadcrumb
    await breadcrumb.getByRole('link', { name: 'Dashboard Hub' }).click();

    // Verify back on hub
    await expect(page.getByRole('heading', { name: 'Dashboard Hub', level: 1 })).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT_MS });
    await expect(table).toBeVisible();
  });
});

test.describe('Generic Dashboard Page - Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await disableCookiePrompt(page);
  });

  test('should render the generic dashboard page with all controls', async ({ page }) => {
    await navigateToDashboardHub(page);

    const table = page.locator(TABLE_SELECTOR);
    const firstLink = table.locator('a').first();
    await expect(firstLink).toBeVisible({ timeout: WIDGET_LOAD_TIMEOUT_MS });
    const dashboardName = await firstLink.textContent();

    if (!dashboardName) {
      test.skip(true, 'No dashboard found to navigate to');
      return;
    }

    await navigateToGenericDashboard(page, dashboardName);

    // Header controls
    await expect(page.locator('h1').filter({ hasText: dashboardName })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit dashboard name' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add widgets' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'kebab dropdown toggle' })).toBeVisible();

    // Breadcrumb
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Dashboard Hub' })).toBeVisible();
    await expect(breadcrumb.getByText(dashboardName)).toBeVisible();

    // Kebab menu items
    await openKebabDropdown(page);
    await expect(page.getByRole('menuitem', { name: 'Set as homepage' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Duplicate dashboard' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Copy configuration string' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Delete dashboard' })).toBeVisible();
  });
});
