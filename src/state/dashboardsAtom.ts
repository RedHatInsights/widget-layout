import { atom } from 'jotai';
import { DashboardTemplate } from '../api/dashboard-templates';

export const dashboardsAtom = atom<DashboardTemplate[]>([]);
