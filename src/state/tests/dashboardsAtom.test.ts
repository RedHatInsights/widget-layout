import { createStore } from 'jotai';
import { dashboardsAtom, deleteDashboardAtom } from '../dashboardsAtom';
import { templateIdAtom } from '../templateAtom';
import { DashboardTemplate } from '../../api/dashboard-templates';

const mockDeleteDashboardTemplateFromHub = jest.fn();
const mockGetUsersDashboards = jest.fn();

jest.mock('../store', () => ({
  getApi: () => ({
    deleteDashboardTemplateFromHub: mockDeleteDashboardTemplateFromHub,
    getUsersDashboards: mockGetUsersDashboards,
  }),
}));

const makeDashboard = (overrides: Partial<DashboardTemplate> = {}): DashboardTemplate => ({
  id: 1,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  deletedAt: null,
  userId: 'user-1',
  default: false,
  templateBase: { name: 'base', displayName: 'Base' },
  templateConfig: { sm: [], md: [], lg: [], xl: [] },
  dashboardName: 'Dashboard 1',
  ...overrides,
});

describe('deleteDashboardAtom', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
  });

  it('should call the API to delete the dashboard and refresh the list', async () => {
    const remaining = [makeDashboard({ id: 2, dashboardName: 'Dashboard 2' })];
    mockDeleteDashboardTemplateFromHub.mockResolvedValue(true);
    mockGetUsersDashboards.mockResolvedValue(remaining);

    store.set(dashboardsAtom, [makeDashboard({ id: 1 }), ...remaining]);

    await store.set(deleteDashboardAtom, 1);

    expect(mockDeleteDashboardTemplateFromHub).toHaveBeenCalledWith(1);
    expect(mockGetUsersDashboards).toHaveBeenCalled();
    expect(store.get(dashboardsAtom)).toEqual(remaining);
  });

  it('should reset templateIdAtom when the deleted dashboard is currently selected', async () => {
    mockDeleteDashboardTemplateFromHub.mockResolvedValue(true);
    mockGetUsersDashboards.mockResolvedValue([]);

    store.set(templateIdAtom, 5);
    store.set(dashboardsAtom, [makeDashboard({ id: 5 })]);

    await store.set(deleteDashboardAtom, 5);

    expect(store.get(templateIdAtom)).toBe(-1);
  });

  it('should not reset templateIdAtom when a different dashboard is deleted', async () => {
    mockDeleteDashboardTemplateFromHub.mockResolvedValue(true);
    mockGetUsersDashboards.mockResolvedValue([makeDashboard({ id: 3 })]);

    store.set(templateIdAtom, 3);
    store.set(dashboardsAtom, [makeDashboard({ id: 3 }), makeDashboard({ id: 7 })]);

    await store.set(deleteDashboardAtom, 7);

    expect(store.get(templateIdAtom)).toBe(3);
  });

  it('should propagate API errors', async () => {
    mockDeleteDashboardTemplateFromHub.mockRejectedValue(new Error('Network error'));

    await expect(store.set(deleteDashboardAtom, 1)).rejects.toThrow('Network error');
    expect(mockGetUsersDashboards).not.toHaveBeenCalled();
  });
});
