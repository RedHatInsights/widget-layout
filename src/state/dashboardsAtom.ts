import { atom } from 'jotai';
import { DashboardTemplate, deleteDashboardTemplateFromHub, getUsersDashboards, setDefaultTemplate } from '../api/dashboard-templates';

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
