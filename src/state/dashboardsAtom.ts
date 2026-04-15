import { atom } from 'jotai';
import {
  DashboardTemplate,
  TemplateConfig,
  copyDashboardTemplate,
  deleteDashboardTemplateFromHub,
  getUsersDashboards,
  importDashboardTemplate,
  setDefaultTemplate,
} from '../api/dashboard-templates';

export const dashboardsAtom = atom<DashboardTemplate[]>([]);

export const deleteDashboardAtom = atom(null, async (_get, set, id: DashboardTemplate['id']) => {
  await deleteDashboardTemplateFromHub(id);
  const dashboards = await getUsersDashboards();
  set(dashboardsAtom, dashboards);
});

export const setDefaultDashboardAtom = atom(null, async (_get, set, id: DashboardTemplate['id']) => {
  await setDefaultTemplate(id);
  const dashboards = await getUsersDashboards();
  set(dashboardsAtom, dashboards);
});

export const createDashboardAtom = atom(
  null,
  async (
    _get,
    set,
    data: { dashboardName: string; templateBase: { name: string; displayName: string }; templateConfig: TemplateConfig; setAsHomepage?: boolean }
  ) => {
    const { setAsHomepage, ...importData } = data;
    const result = await importDashboardTemplate(importData);
    if (setAsHomepage) {
      await setDefaultTemplate(result.id);
    }
    const dashboards = await getUsersDashboards();
    set(dashboardsAtom, dashboards);
    return result;
  }
);

export const importDashboardAtom = atom(
  null,
  async (_get, set, data: { dashboardName: string; templateBase: { name: string; displayName: string }; templateConfig: TemplateConfig }) => {
    const result = await importDashboardTemplate(data);
    const dashboards = await getUsersDashboards();
    set(dashboardsAtom, dashboards);
    return result;
  }
);

export const duplicateDashboardAtom = atom(
  null,
  async (_get, set, data: { id: DashboardTemplate['id']; dashboardName: string; setAsHomepage?: boolean }) => {
    const result = await copyDashboardTemplate(data.id, { dashboardName: data.dashboardName });
    if (data.setAsHomepage) {
      await setDefaultTemplate(result.id);
    }
    const dashboards = await getUsersDashboards();
    set(dashboardsAtom, dashboards);
    return result;
  }
);
