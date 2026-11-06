import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import useDashboardConfig from './useDashboardConfig';
import { templateIdAtom } from '../state/templateAtom';
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

function renderConfigHook() {
  const store = createStore();
  const wrapper = ({ children }: { children?: React.ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(() => useDashboardConfig('dashboard-insightsDashboard'), { wrapper }) };
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
    expect(store.get(templateIdAtom)).toBe(-1);

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
});
