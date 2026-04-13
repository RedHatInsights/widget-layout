import { atom } from 'jotai';
<<<<<<< HEAD
import { DashboardTemplate, deleteDashboardTemplateFromHub, getUsersDashboards, setDefaultTemplate } from '../api/dashboard-templates';
=======
import {
  DashboardTemplate,
  deleteDashboardTemplateFromHub,
  getUsersDashboards,
  renameDashboardTemplate,
  setDefaultTemplate,
} from '../api/dashboard-templates';
>>>>>>> 9be2f2b (feat: add inline editing for dashboard name)

export const dashboardsAtom = atom<DashboardTemplate[]>([]);

export const deleteDashboardAtom = atom(null, async (_get, set, id: DashboardTemplate['id']) => {
  await deleteDashboardTemplateFromHub(id);
  const dashboards = await getUsersDashboards();
  set(dashboardsAtom, dashboards);
});

<<<<<<< HEAD
=======
export const renameDashboardAtom = atom(null, async (_get, set, { id, dashboardName }: { id: DashboardTemplate['id']; dashboardName: string }) => {
  const updated = await renameDashboardTemplate(id, { dashboardName });
  const dashboards = await getUsersDashboards();
  set(dashboardsAtom, dashboards);
  return updated;
});

>>>>>>> 9be2f2b (feat: add inline editing for dashboard name)
export const setDefaultDashboardAtom = atom(null, async (_get, set, id: DashboardTemplate['id']) => {
  await setDefaultTemplate(id);
  const dashboards = await getUsersDashboards();
  set(dashboardsAtom, dashboards);
});
