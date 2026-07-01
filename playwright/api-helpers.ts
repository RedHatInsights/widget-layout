import { Page } from '@playwright/test';

const API_BASE = '/api/widget-layout/v1';

interface DashboardTemplate {
  id: number;
  default: boolean;
  templateBase: {
    name: string;
    displayName: string;
  };
  templateConfig: {
    sm: any[];
    md: any[];
    lg: any[];
    xl: any[];
  };
  dashboardName: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
}

/**
 * Create an empty dashboard via the API
 */
export async function createEmptyDashboard(
  page: Page,
  dashboardName: string = `E2E Empty Dashboard ${Date.now()}`
): Promise<DashboardTemplate> {
  const response = await page.request.post(`${API_BASE}/import`, {
    data: {
      dashboardName,
      templateBase: {
        name: 'landing-landingPage',
        displayName: 'Landing Page',
      },
      templateConfig: {
        sm: [],
        md: [],
        lg: [],
        xl: [],
      },
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create dashboard: ${response.status()} ${await response.text()}`);
  }

  return response.json();
}

/**
 * Delete a dashboard via the API
 */
export async function deleteDashboard(page: Page, templateId: number): Promise<void> {
  const response = await page.request.delete(`${API_BASE}/${templateId}/hub`);

  if (!response.ok() && response.status() !== 404) {
    throw new Error(`Failed to delete dashboard: ${response.status()} ${await response.text()}`);
  }
}

/**
 * Set a dashboard as the default (homepage)
 */
export async function setDefaultDashboard(page: Page, templateId: number): Promise<void> {
  const response = await page.request.post(`${API_BASE}/${templateId}/default`);

  if (!response.ok()) {
    throw new Error(`Failed to set default dashboard: ${response.status()} ${await response.text()}`);
  }
}

/**
 * Get all user dashboards
 */
export async function getUserDashboards(page: Page): Promise<DashboardTemplate[]> {
  const response = await page.request.get(`${API_BASE}?dashboardType=landing`);

  if (!response.ok()) {
    throw new Error(`Failed to get dashboards: ${response.status()} ${await response.text()}`);
  }

  const data = await response.json();
  return data.data || [];
}
