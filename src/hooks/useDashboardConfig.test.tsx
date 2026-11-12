import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import useDashboardConfig from './useDashboardConfig';
import { loadedLayoutTypeAtom, templateAtom, templateIdAtom } from '../state/templateAtom';
import { notificationsAtom } from '../state/notificationsAtom';

// Polyfill crypto.randomUUID for jsdom
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234' },
});

// --- Mocks ---

const mockGetDashboardTemplates = jest.fn();
const mockPatchDashboardTemplate = jest.fn().mockResolvedValue(undefined);

jest.mock('./useApi', () => ({
  __esModule: true,
  useApi: () => ({
    getDashboardTemplates: mockGetDashboardTemplates,
    patchDashboardTemplate: mockPatchDashboardTemplate,
  }),
}));

jest.mock('./useCurrentUser', () => ({
  __esModule: true,
  default: () => ({ currentUser: { username: 'test-user' } }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: () => true,
}));

// --- Test data ---

const emptyTemplateConfig = { sm: [], md: [], lg: [], xl: [] };

function renderConfigHook(layoutType: string = 'dashboard-insightsDashboard', store = createStore()) {
  const wrapper = ({ children }: { children?: React.ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(() => useDashboardConfig(layoutType as never), { wrapper }) };
}

// --- Tests ---

describe('useDashboardConfig', () => {
  beforeEach(() => {
    mockGetDashboardTemplates.mockReset();
    mockPatchDashboardTemplate.mockClear();
  });

  it('loads the default template of the layout type', async () => {
    mockGetDashboardTemplates.mockResolvedValue([
      { id: 33, default: true, templateConfig: emptyTemplateConfig },
      { id: 44, default: false, templateConfig: emptyTemplateConfig },
    ]);
    const { store } = renderConfigHook();
    await waitFor(() => expect(store.get(templateIdAtom)).toBe(33));
  });

  it('falls back to the first template when none is marked default', async () => {
    mockGetDashboardTemplates.mockResolvedValue([
      { id: 11, default: false, templateConfig: emptyTemplateConfig },
      { id: 22, default: false, templateConfig: emptyTemplateConfig },
    ]);
    const { store, result } = renderConfigHook();
    await waitFor(() => expect(store.get(templateIdAtom)).toBe(11));
    expect(result.current.isLoaded).toBe(true);
    expect(mockGetDashboardTemplates).toHaveBeenCalledWith('dashboard-insightsDashboard');
  });

  it('warns and drops the save when no dashboard template is loaded', async () => {
    mockGetDashboardTemplates.mockResolvedValue([]);
    const { store, result } = renderConfigHook();
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(store.get(templateIdAtom)).toBeNaN();

    await act(async () => {
      await result.current.saveTemplate({ ...emptyTemplateConfig });
    });

    const titles = store.get(notificationsAtom).map((notification) => notification.title);
    expect(titles).toContain('Changes not saved');
    expect(mockPatchDashboardTemplate).not.toHaveBeenCalled();
  });

  it('saves the template when one is loaded', async () => {
    mockGetDashboardTemplates.mockResolvedValue([{ id: 55, default: true, templateConfig: emptyTemplateConfig }]);
    const { store, result } = renderConfigHook();
    await waitFor(() => expect(store.get(templateIdAtom)).toBe(55));

    await act(async () => {
      await result.current.saveTemplate({ ...emptyTemplateConfig });
    });

    // The patch is debounced (1500ms) but resolves as part of saveTemplate
    expect(mockPatchDashboardTemplate).toHaveBeenCalledWith(55, expect.anything());
    const titles = store.get(notificationsAtom).map((notification) => notification.title);
    expect(titles).not.toContain('Changes not saved');
  });

  it('re-resolves the default when a different layout type mounts with the shared store', async () => {
    mockGetDashboardTemplates.mockResolvedValue([{ id: 11, default: true, templateConfig: emptyTemplateConfig }]);
    const first = renderConfigHook('landing-landingPage');
    await waitFor(() => expect(first.store.get(templateIdAtom)).toBe(11));
    expect(mockGetDashboardTemplates).toHaveBeenCalledWith('landing-landingPage');
    first.unmount();

    mockGetDashboardTemplates.mockResolvedValue([{ id: 22, default: true, templateConfig: emptyTemplateConfig }]);
    const second = renderConfigHook('dashboard-insightsDashboard', first.store);
    await waitFor(() => expect(second.store.get(templateIdAtom)).toBe(22));
    expect(mockGetDashboardTemplates).toHaveBeenCalledWith('dashboard-insightsDashboard');
    expect(second.store.get(loadedLayoutTypeAtom)).toBe('dashboard-insightsDashboard');
  });

  it('keeps the selected template without refetching when the same layout type remounts', async () => {
    mockGetDashboardTemplates.mockResolvedValue([{ id: 11, default: true, templateConfig: emptyTemplateConfig }]);
    const first = renderConfigHook('dashboard-insightsDashboard');
    await waitFor(() => expect(first.store.get(templateIdAtom)).toBe(11));
    expect(mockGetDashboardTemplates).toHaveBeenCalledTimes(1);
    first.unmount();

    const second = renderConfigHook('dashboard-insightsDashboard', first.store);
    await waitFor(() => expect(second.result.current.isLoaded).toBe(true));
    expect(mockGetDashboardTemplates).toHaveBeenCalledTimes(1);
    expect(second.store.get(templateIdAtom)).toBe(11);
  });

  it('clears the stale selection when the new layout type fails to load, so edits cannot cross-save', async () => {
    mockGetDashboardTemplates.mockResolvedValue([{ id: 11, default: true, templateConfig: emptyTemplateConfig }]);
    const first = renderConfigHook('landing-landingPage');
    await waitFor(() => expect(first.store.get(templateIdAtom)).toBe(11));
    first.unmount();

    mockGetDashboardTemplates.mockResolvedValue([]);
    const second = renderConfigHook('dashboard-insightsDashboard', first.store);
    await waitFor(() => expect(second.result.current.isLoaded).toBe(true));

    expect(second.store.get(templateIdAtom)).toBeNaN();
    expect(second.store.get(templateAtom)).toEqual(emptyTemplateConfig);

    await act(async () => {
      await second.result.current.saveTemplate({ ...emptyTemplateConfig });
    });
    expect(mockPatchDashboardTemplate).not.toHaveBeenCalled();
    const titles = second.store.get(notificationsAtom).map((notification) => notification.title);
    expect(titles).toContain('Changes not saved');
  });

  it('notifies only once even though the failed load is retried once', async () => {
    mockGetDashboardTemplates.mockRejectedValue(new Error('boom'));
    const { store } = renderConfigHook();
    await waitFor(() => expect(mockGetDashboardTemplates).toHaveBeenCalledTimes(2));
    expect(store.get(notificationsAtom).length).toBe(1);
  });

  it('recovers when the automatic retry succeeds', async () => {
    mockGetDashboardTemplates
      .mockRejectedValueOnce(new Error('transient network error'))
      .mockResolvedValue([{ id: 22, default: true, templateConfig: emptyTemplateConfig }]);
    const { store } = renderConfigHook();
    await waitFor(() => expect(store.get(templateIdAtom)).toBe(22));
    expect(store.get(loadedLayoutTypeAtom)).toBe('dashboard-insightsDashboard');
  });
});
