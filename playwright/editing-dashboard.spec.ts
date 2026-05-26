import { test, expect, Page } from '@playwright/test';
import { disableCookiePrompt } from '@redhat-cloud-services/playwright-test-auth';

const DASHBOARD_HUB_URL = '/dashboard-hub';
const TABLE_SELECTOR = '[data-ouia-component-id="DashboardsTable"]';

const navigateToDashboardHub = async (page: Page) => {
  await page.goto(DASHBOARD_HUB_URL);
  await page.locator(TABLE_SELECTOR).waitFor({ state: 'visible', timeout: 30000 });
};

const navigateToGenericDashboard = async (page: Page, dashboardName: string) => {
  await navigateToDashboardHub(page);
  await page.getByRole('link', { name: dashboardName }).click();
  await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: 30000 });
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
  return page.evaluate(({ selector, name }) => {
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
  }, { selector: TABLE_SELECTOR, name: dashboardName });
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

    await expect(input).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('h1').filter({ hasText: newName })).toBeVisible({ timeout: 5000 });

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
