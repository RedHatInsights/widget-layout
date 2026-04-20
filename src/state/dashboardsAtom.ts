import { atom } from 'jotai';
import {
  DashboardTemplate,
  deleteDashboardTemplateFromHub,
  getUsersDashboards,
  renameDashboardTemplate,
  setDefaultTemplate,
} from '../api/dashboard-templates';

export const dashboardsAtom = atom<DashboardTemplate[]>([]);

export const deleteDashboardAtom = atom(null, async (_get, set, id: DashboardTemplate['id']) => {
  await deleteDashboardTemplateFromHub(id);
  const dashboards = await getUsersDashboards();
  set(dashboardsAtom, dashboards);
});

export const renameDashboardAtom = atom(null, async (_get, set, { id, dashboardName }: { id: DashboardTemplate['id']; dashboardName: string }) => {
  const updated = await renameDashboardTemplate(id, { dashboardName });
  const dashboards = await getUsersDashboards();
  set(dashboardsAtom, dashboards);
  return updated;
});

export const setDefaultDashboardAtom = atom(null, async (_get, set, id: DashboardTemplate['id']) => {
  await setDefaultTemplate(id);
  const dashboards = await getUsersDashboards();
  set(dashboardsAtom, dashboards);
});
