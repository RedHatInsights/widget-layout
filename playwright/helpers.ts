import { Page } from '@playwright/test';

export const DASHBOARD_HUB_URL = '/dashboard-hub';
export const TABLE_SELECTOR = '[data-ouia-component-id="DashboardsTable"]';
export const PAGE_LOAD_TIMEOUT_MS = 30000;
export const WIDGET_LOAD_TIMEOUT_MS = 10000;

export const deleteTestDashboard = async (page: Page, dashboardName: string) => {
  await page.goto(DASHBOARD_HUB_URL);
  await page.locator(TABLE_SELECTOR).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
  await page.locator(TABLE_SELECTOR).locator('a').first().waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });

  const testLink = page.getByRole('link', { name: dashboardName, exact: true });
  if (!(await testLink.isVisible())) return;

  await testLink.click();
  await page.getByRole('button', { name: 'Add widgets' }).waitFor({ state: 'visible', timeout: PAGE_LOAD_TIMEOUT_MS });
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'kebab dropdown toggle' }).click();
  await page.getByRole('menuitem', { name: 'Delete dashboard' }).click();

  await page.getByText(/Deleting the dashboard will remove/).waitFor({ state: 'visible', timeout: WIDGET_LOAD_TIMEOUT_MS });
  await page.getByRole('checkbox', { name: /I understand that this action cannot be undone/i }).check();
  await page.getByRole('button', { name: 'Delete dashboard' }).click();
};
