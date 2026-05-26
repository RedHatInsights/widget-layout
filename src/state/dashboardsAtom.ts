import { atom } from 'jotai';
import { DashboardTemplate, TemplateConfig } from '../api/dashboard-templates';
import { getApi } from './store';

export const dashboardsAtom = atom<DashboardTemplate[]>([]);

export const deleteDashboardAtom = atom(null, async (_get, set, id: DashboardTemplate['id']) => {
  const api = getApi();
  await api.deleteDashboardTemplateFromHub(id);
  const dashboards = await api.getUsersDashboards();
  set(dashboardsAtom, dashboards);
});

export const renameDashboardAtom = atom(null, async (_get, set, { id, dashboardName }: { id: DashboardTemplate['id']; dashboardName: string }) => {
  const api = getApi();
  const updated = await api.renameDashboardTemplate(id, { dashboardName });
  const dashboards = await api.getUsersDashboards();
  set(dashboardsAtom, dashboards);
  return updated;
});

export const setDefaultDashboardAtom = atom(null, async (_get, set, id: DashboardTemplate['id']) => {
  const api = getApi();
  await api.setDefaultTemplate(id);
  const dashboards = await api.getUsersDashboards();
  set(dashboardsAtom, dashboards);
});

export const createDashboardAtom = atom(
  null,
  async (
    _get,
    set,
    data: { dashboardName: string; templateBase: { name: string; displayName: string }; templateConfig: TemplateConfig; setAsHomepage?: boolean }
  ) => {
    const api = getApi();
    const { setAsHomepage, ...importData } = data;
    const result = await api.importDashboardTemplate(importData);
    if (setAsHomepage) {
      await api.setDefaultTemplate(result.id);
    }
    const dashboards = await api.getUsersDashboards();
    set(dashboardsAtom, dashboards);
    return result;
  }
);

export const importDashboardAtom = atom(
  null,
  async (_get, set, data: { dashboardName: string; templateBase: { name: string; displayName: string }; templateConfig: TemplateConfig }) => {
    const api = getApi();
    const result = await api.importDashboardTemplate(data);
    const dashboards = await api.getUsersDashboards();
    set(dashboardsAtom, dashboards);
    return result;
  }
);

export const duplicateDashboardAtom = atom(
  null,
  async (_get, set, data: { id: DashboardTemplate['id']; dashboardName: string; setAsHomepage?: boolean }) => {
    const api = getApi();
    const result = await api.copyDashboardTemplate(data.id, { dashboardName: data.dashboardName });
    if (data.setAsHomepage) {
      await api.setDefaultTemplate(result.id);
    }
    const dashboards = await api.getUsersDashboards();
    set(dashboardsAtom, dashboards);
    return result;
  }
);
