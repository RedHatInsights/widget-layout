import { createStore } from 'jotai';
import {
  createDashboardAtom,
  dashboardsAtom,
  deleteDashboardAtom,
  duplicateDashboardAtom,
  importDashboardAtom,
  renameDashboardAtom,
  setDefaultDashboardAtom,
} from '../dashboardsAtom';
import { templateIdAtom } from '../templateAtom';
import { DashboardTemplate } from '../../api/dashboard-templates';

const mockDeleteDashboardTemplateFromHub = jest.fn();
const mockGetUsersDashboards = jest.fn();
const mockRenameDashboardTemplate = jest.fn();
const mockSetDefaultTemplate = jest.fn();
const mockImportDashboardTemplate = jest.fn();
const mockCopyDashboardTemplate = jest.fn();

jest.mock('../store', () => ({
  getApi: () => ({
    deleteDashboardTemplateFromHub: mockDeleteDashboardTemplateFromHub,
    getUsersDashboards: mockGetUsersDashboards,
    renameDashboardTemplate: mockRenameDashboardTemplate,
    setDefaultTemplate: mockSetDefaultTemplate,
    importDashboardTemplate: mockImportDashboardTemplate,
    copyDashboardTemplate: mockCopyDashboardTemplate,
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

describe('renameDashboardAtom', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
  });

  it('should call renameDashboardTemplate and refresh the dashboard list', async () => {
    const updated = makeDashboard({ id: 1, dashboardName: 'Renamed' });
    mockRenameDashboardTemplate.mockResolvedValue(updated);
    mockGetUsersDashboards.mockResolvedValue([updated]);

    await store.set(renameDashboardAtom, { id: 1, dashboardName: 'Renamed' });

    expect(mockRenameDashboardTemplate).toHaveBeenCalledWith(1, { dashboardName: 'Renamed' });
    expect(mockGetUsersDashboards).toHaveBeenCalled();
    expect(store.get(dashboardsAtom)).toEqual([updated]);
  });

  it('should return the updated dashboard', async () => {
    const updated = makeDashboard({ id: 3, dashboardName: 'New Name' });
    mockRenameDashboardTemplate.mockResolvedValue(updated);
    mockGetUsersDashboards.mockResolvedValue([updated]);

    const result = await store.set(renameDashboardAtom, { id: 3, dashboardName: 'New Name' });

    expect(result).toEqual(updated);
  });

  it('should propagate API errors', async () => {
    mockRenameDashboardTemplate.mockRejectedValue(new Error('Rename failed'));

    await expect(store.set(renameDashboardAtom, { id: 1, dashboardName: 'X' })).rejects.toThrow('Rename failed');
    expect(mockGetUsersDashboards).not.toHaveBeenCalled();
  });
});

describe('setDefaultDashboardAtom', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
  });

  it('should call setDefaultTemplate, refresh the list, and reset templateIdAtom', async () => {
    const dashboards = [makeDashboard({ id: 2, default: true })];
    mockSetDefaultTemplate.mockResolvedValue(undefined);
    mockGetUsersDashboards.mockResolvedValue(dashboards);

    store.set(templateIdAtom, 5);

    await store.set(setDefaultDashboardAtom, 2);

    expect(mockSetDefaultTemplate).toHaveBeenCalledWith(2);
    expect(mockGetUsersDashboards).toHaveBeenCalled();
    expect(store.get(dashboardsAtom)).toEqual(dashboards);
    expect(store.get(templateIdAtom)).toBe(-1);
  });

  it('should propagate API errors', async () => {
    mockSetDefaultTemplate.mockRejectedValue(new Error('Set default failed'));

    await expect(store.set(setDefaultDashboardAtom, 1)).rejects.toThrow('Set default failed');
    expect(mockGetUsersDashboards).not.toHaveBeenCalled();
  });
});

describe('createDashboardAtom', () => {
  let store: ReturnType<typeof createStore>;

  const createData = {
    dashboardName: 'New Dashboard',
    templateBase: { name: 'base', displayName: 'Base' },
    templateConfig: { sm: [] as never[], md: [] as never[], lg: [] as never[], xl: [] as never[] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
  });

  it('should call importDashboardTemplate and refresh the list', async () => {
    const created = makeDashboard({ id: 10, dashboardName: 'New Dashboard' });
    mockImportDashboardTemplate.mockResolvedValue(created);
    mockGetUsersDashboards.mockResolvedValue([created]);

    await store.set(createDashboardAtom, createData);

    expect(mockImportDashboardTemplate).toHaveBeenCalledWith(createData);
    expect(mockSetDefaultTemplate).not.toHaveBeenCalled();
    expect(mockGetUsersDashboards).toHaveBeenCalled();
    expect(store.get(dashboardsAtom)).toEqual([created]);
  });

  it('should set as homepage when setAsHomepage is true', async () => {
    const created = makeDashboard({ id: 10 });
    mockImportDashboardTemplate.mockResolvedValue(created);
    mockSetDefaultTemplate.mockResolvedValue(undefined);
    mockGetUsersDashboards.mockResolvedValue([created]);

    store.set(templateIdAtom, 5);

    await store.set(createDashboardAtom, { ...createData, setAsHomepage: true });

    expect(mockImportDashboardTemplate).toHaveBeenCalledWith(createData);
    expect(mockSetDefaultTemplate).toHaveBeenCalledWith(10);
    expect(store.get(templateIdAtom)).toBe(-1);
  });

  it('should not set as homepage when setAsHomepage is false', async () => {
    const created = makeDashboard({ id: 10 });
    mockImportDashboardTemplate.mockResolvedValue(created);
    mockGetUsersDashboards.mockResolvedValue([created]);

    store.set(templateIdAtom, 5);

    await store.set(createDashboardAtom, { ...createData, setAsHomepage: false });

    expect(mockSetDefaultTemplate).not.toHaveBeenCalled();
    expect(store.get(templateIdAtom)).toBe(5);
  });

  it('should return the created dashboard', async () => {
    const created = makeDashboard({ id: 10 });
    mockImportDashboardTemplate.mockResolvedValue(created);
    mockGetUsersDashboards.mockResolvedValue([created]);

    const result = await store.set(createDashboardAtom, createData);

    expect(result).toEqual(created);
  });

  it('should propagate API errors from importDashboardTemplate', async () => {
    mockImportDashboardTemplate.mockRejectedValue(new Error('Import failed'));

    await expect(store.set(createDashboardAtom, createData)).rejects.toThrow('Import failed');
    expect(mockGetUsersDashboards).not.toHaveBeenCalled();
  });
});

describe('importDashboardAtom', () => {
  let store: ReturnType<typeof createStore>;

  const importData = {
    dashboardName: 'Imported',
    templateBase: { name: 'base', displayName: 'Base' },
    templateConfig: { sm: [] as never[], md: [] as never[], lg: [] as never[], xl: [] as never[] },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
  });

  it('should call importDashboardTemplate and refresh the list', async () => {
    const imported = makeDashboard({ id: 20, dashboardName: 'Imported' });
    mockImportDashboardTemplate.mockResolvedValue(imported);
    mockGetUsersDashboards.mockResolvedValue([imported]);

    await store.set(importDashboardAtom, importData);

    expect(mockImportDashboardTemplate).toHaveBeenCalledWith(importData);
    expect(mockGetUsersDashboards).toHaveBeenCalled();
    expect(store.get(dashboardsAtom)).toEqual([imported]);
  });

  it('should return the imported dashboard', async () => {
    const imported = makeDashboard({ id: 20 });
    mockImportDashboardTemplate.mockResolvedValue(imported);
    mockGetUsersDashboards.mockResolvedValue([imported]);

    const result = await store.set(importDashboardAtom, importData);

    expect(result).toEqual(imported);
  });

  it('should propagate API errors', async () => {
    mockImportDashboardTemplate.mockRejectedValue(new Error('Import failed'));

    await expect(store.set(importDashboardAtom, importData)).rejects.toThrow('Import failed');
    expect(mockGetUsersDashboards).not.toHaveBeenCalled();
  });
});

describe('duplicateDashboardAtom', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
  });

  it('should call copyDashboardTemplate and refresh the list', async () => {
    const duplicated = makeDashboard({ id: 30, dashboardName: 'Copy' });
    mockCopyDashboardTemplate.mockResolvedValue(duplicated);
    mockGetUsersDashboards.mockResolvedValue([duplicated]);

    await store.set(duplicateDashboardAtom, { id: 5, dashboardName: 'Copy' });

    expect(mockCopyDashboardTemplate).toHaveBeenCalledWith(5, { dashboardName: 'Copy' });
    expect(mockSetDefaultTemplate).not.toHaveBeenCalled();
    expect(mockGetUsersDashboards).toHaveBeenCalled();
    expect(store.get(dashboardsAtom)).toEqual([duplicated]);
  });

  it('should set as homepage when setAsHomepage is true', async () => {
    const duplicated = makeDashboard({ id: 30 });
    mockCopyDashboardTemplate.mockResolvedValue(duplicated);
    mockSetDefaultTemplate.mockResolvedValue(undefined);
    mockGetUsersDashboards.mockResolvedValue([duplicated]);

    store.set(templateIdAtom, 5);

    await store.set(duplicateDashboardAtom, { id: 5, dashboardName: 'Copy', setAsHomepage: true });

    expect(mockSetDefaultTemplate).toHaveBeenCalledWith(30);
    expect(store.get(templateIdAtom)).toBe(-1);
  });

  it('should not set as homepage when setAsHomepage is false', async () => {
    const duplicated = makeDashboard({ id: 30 });
    mockCopyDashboardTemplate.mockResolvedValue(duplicated);
    mockGetUsersDashboards.mockResolvedValue([duplicated]);

    store.set(templateIdAtom, 5);

    await store.set(duplicateDashboardAtom, { id: 5, dashboardName: 'Copy', setAsHomepage: false });

    expect(mockSetDefaultTemplate).not.toHaveBeenCalled();
    expect(store.get(templateIdAtom)).toBe(5);
  });

  it('should return the duplicated dashboard', async () => {
    const duplicated = makeDashboard({ id: 30 });
    mockCopyDashboardTemplate.mockResolvedValue(duplicated);
    mockGetUsersDashboards.mockResolvedValue([duplicated]);

    const result = await store.set(duplicateDashboardAtom, { id: 5, dashboardName: 'Copy' });

    expect(result).toEqual(duplicated);
  });

  it('should propagate API errors', async () => {
    mockCopyDashboardTemplate.mockRejectedValue(new Error('Copy failed'));

    await expect(store.set(duplicateDashboardAtom, { id: 5, dashboardName: 'Copy' })).rejects.toThrow('Copy failed');
    expect(mockGetUsersDashboards).not.toHaveBeenCalled();
  });
});
