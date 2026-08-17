import { act, renderHook } from '@testing-library/react';
import useDashboardTemplate from '../useDashboardTemplate';
import { DashboardTemplate, ExtendedTemplateConfig, WidgetMapping } from '../../api/dashboard-templates';
import {
  getDashboardTemplate,
  getWidgetMapping,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplateHub,
} from '../../api/dashboard-templates-new';

jest.mock('awesome-debounce-promise', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (fn: (...args: any[]) => any) => fn,
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: () => true,
}));

jest.mock('../../api/dashboard-templates-new', () => ({
  ...jest.requireActual('../../api/dashboard-templates-new'),
  getDashboardTemplate: jest.fn(),
  getWidgetMapping: jest.fn(),
  mapTemplateConfigToExtendedTemplateConfig: jest.fn(),
  patchDashboardTemplateHub: jest.fn(),
}));

let mockIsNewBackend = false;
const mockRenameDashboardInList = jest.fn();
const mockInvalidateStartPage = jest.fn();
const mockSetDrawerExpanded = jest.fn();

jest.mock('../../state/dashboardsAtom', () => ({
  renameDashboardAtom: { __test_id: 'rename' },
}));
jest.mock('../../state/templateAtom', () => ({
  templateIdAtom: { __test_id: 'templateId' },
}));
jest.mock('../../state/store', () => ({
  backendFlagAtom: { __test_id: 'backendFlag' },
}));
jest.mock('../../state/drawerExpandedAtom', () => ({
  drawerExpandedAtom: { __test_id: 'drawerExpanded' },
}));

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: (atom: { __test_id?: string }) => {
    if (atom?.__test_id === 'backendFlag') return mockIsNewBackend;
    return undefined;
  },
  useSetAtom: (atom: { __test_id?: string }) => {
    if (atom?.__test_id === 'rename') return mockRenameDashboardInList;
    if (atom?.__test_id === 'templateId') return mockInvalidateStartPage;
    if (atom?.__test_id === 'drawerExpanded') return mockSetDrawerExpanded;
    return jest.fn();
  },
}));

const mockedGetDashboardTemplate = getDashboardTemplate as jest.MockedFunction<typeof getDashboardTemplate>;
const mockedGetWidgetMapping = getWidgetMapping as jest.MockedFunction<typeof getWidgetMapping>;
const mockedMapTemplateConfig = mapTemplateConfigToExtendedTemplateConfig as jest.MockedFunction<typeof mapTemplateConfigToExtendedTemplateConfig>;
const mockedPatchDashboardTemplate = patchDashboardTemplateHub as jest.MockedFunction<typeof patchDashboardTemplateHub>;

const emptyTemplate: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };

const createMockDashboardTemplate = (overrides: Partial<DashboardTemplate> = {}): DashboardTemplate => ({
  id: 1,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  deletedAt: null,
  userId: '1',
  default: true,
  templateBase: { name: 'test', displayName: 'Test' },
  templateConfig: { sm: [], md: [], lg: [], xl: [] },
  dashboardName: 'Dashboard',
  ...overrides,
});

const mockWidgetMapping: WidgetMapping = {
  rhel: {
    scope: 'landing',
    module: './RhelWidget',
    defaults: { w: 1, h: 1, maxH: 1, minH: 1 },
  },
  openshift: {
    scope: 'landing',
    module: './OpenShiftWidget',
    defaults: { w: 1, h: 1, maxH: 1, minH: 1 },
  },
};

const mockExtendedTemplate: ExtendedTemplateConfig = {
  sm: [],
  md: [],
  lg: [
    { i: 'landing-./RhelWidget#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'RHEL', widgetType: 'landing-./RhelWidget' },
    { i: 'landing-./OpenShiftWidget#1', x: 1, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'OpenShift', widgetType: 'landing-./OpenShiftWidget' },
  ],
  xl: [],
};

const mockRemappedTemplate: ExtendedTemplateConfig = {
  sm: [],
  md: [],
  lg: [
    { i: 'rhel#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'RHEL', widgetType: 'rhel' },
    { i: 'openshift#1', x: 1, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'OpenShift', widgetType: 'openshift' },
  ],
  xl: [],
};

describe('useDashboardTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsNewBackend = false;
  });

  it('should return initial state with empty template, isLoaded false, no error and no dashboardName', () => {
    mockedGetDashboardTemplate.mockReturnValue(
      new Promise(() => {
        /* never resolves */
      })
    );

    const { result } = renderHook(() => useDashboardTemplate(1));

    expect(result.current.template).toEqual(emptyTemplate);
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.dashboardName).toBeUndefined();
    expect(typeof result.current.saveTemplate).toBe('function');
  });

  it('should fetch and remap template on mount', async () => {
    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate({ dashboardName: 'My Dashboard' }));
    mockedMapTemplateConfig.mockReturnValue(mockExtendedTemplate);
    mockedGetWidgetMapping.mockResolvedValue(mockWidgetMapping);

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    expect(mockedGetDashboardTemplate).toHaveBeenCalledWith(1);
    expect(mockedGetWidgetMapping).toHaveBeenCalled();
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.dashboard?.dashboardName).toBe('My Dashboard');
    expect(result.current.template).toEqual(mockRemappedTemplate);
  });

  it('should set error when getDashboardTemplate throws an Error instance', async () => {
    mockedGetDashboardTemplate.mockRejectedValue(new Error('Network error'));

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.error).toEqual(new Error('Network error'));
    expect(result.current.template).toEqual(emptyTemplate);
  });

  it('should set fallback error message when getDashboardTemplate throws a non-Error value', async () => {
    mockedGetDashboardTemplate.mockRejectedValue('string error');

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    expect(result.current.isLoaded).toBe(true);
    expect(result.current.error).toEqual(new Error('Failed to fetch dashboard template'));
  });

  it('should update template and call patchDashboardTemplateHub via saveTemplate', async () => {
    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());
    mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
    mockedGetWidgetMapping.mockResolvedValue({});
    mockedPatchDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    const newTemplate: ExtendedTemplateConfig = {
      sm: [],
      md: [],
      lg: [{ i: 'rhel#0', x: 0, y: 0, w: 2, h: 3, maxH: 4, minH: 1, title: 'My RHEL', widgetType: 'rhel' }],
      xl: [],
    };

    await act(async () => {
      await result.current.saveTemplate(newTemplate);
    });

    expect(result.current.template).toEqual(newTemplate);
    expect(mockedPatchDashboardTemplate).toHaveBeenCalledWith(1, {
      templateConfig: {
        sm: [],
        md: [],
        lg: [{ i: 'rhel#0', x: 0, y: 0, w: 2, h: 3, maxH: 4, minH: 1, title: 'My RHEL' }],
        xl: [],
      },
    });
  });

  it('should use "Widget" as default title when item.title is falsy in saveTemplate', async () => {
    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());
    mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
    mockedGetWidgetMapping.mockResolvedValue({});
    mockedPatchDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    const templateWithNoTitle: ExtendedTemplateConfig = {
      sm: [],
      md: [{ i: 'widget#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: '', widgetType: 'widget' }],
      lg: [],
      xl: [],
    };

    await act(async () => {
      await result.current.saveTemplate(templateWithNoTitle);
    });

    expect(mockedPatchDashboardTemplate).toHaveBeenCalledWith(1, {
      templateConfig: {
        sm: [],
        md: [{ i: 'widget#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'Widget' }],
        lg: [],
        xl: [],
      },
    });
  });

  it('should refetch when id changes', async () => {
    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate({ dashboardName: 'Dashboard 1' }));
    mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
    mockedGetWidgetMapping.mockResolvedValue({});

    const { result, rerender } = await act(async () => renderHook(({ id }) => useDashboardTemplate(id), { initialProps: { id: 1 } }));

    expect(mockedGetDashboardTemplate).toHaveBeenCalledWith(1);
    expect(result.current.dashboard?.dashboardName).toBe('Dashboard 1');

    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate({ id: 2, dashboardName: 'Dashboard 2' }));

    await act(async () => {
      rerender({ id: 2 });
    });

    expect(mockedGetDashboardTemplate).toHaveBeenCalledWith(2);
    expect(result.current.dashboard?.dashboardName).toBe('Dashboard 2');
  });

  it('should return items as-is when widget mapping has no match for scope-module', async () => {
    const templateWithUnknownWidget: ExtendedTemplateConfig = {
      sm: [],
      md: [],
      lg: [
        {
          i: 'unknown-scope-./UnknownModule#0',
          x: 0,
          y: 0,
          w: 1,
          h: 1,
          maxH: 1,
          minH: 1,
          title: 'Unknown',
          widgetType: 'unknown-scope-./UnknownModule',
        },
      ],
      xl: [],
    };

    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());
    mockedMapTemplateConfig.mockReturnValue(templateWithUnknownWidget);
    mockedGetWidgetMapping.mockResolvedValue(mockWidgetMapping);

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    // The unknown widget should be returned unchanged since there's no mapping
    expect(result.current.template.lg[0]).toEqual(templateWithUnknownWidget.lg[0]);
  });

  it('should remap only matching items and leave non-matching items unchanged', async () => {
    const mixedTemplate: ExtendedTemplateConfig = {
      sm: [],
      md: [],
      lg: [
        { i: 'landing-./RhelWidget#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'RHEL', widgetType: 'landing-./RhelWidget' },
        { i: 'unknown-./Widget#1', x: 1, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'Unknown', widgetType: 'unknown-./Widget' },
      ],
      xl: [],
    };

    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());
    mockedMapTemplateConfig.mockReturnValue(mixedTemplate);
    mockedGetWidgetMapping.mockResolvedValue(mockWidgetMapping);

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    // The RHEL widget should be remapped
    expect(result.current.template.lg[0]).toEqual({
      i: 'rhel#0',
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      maxH: 1,
      minH: 1,
      title: 'RHEL',
      widgetType: 'rhel',
    });

    // The unknown widget should remain unchanged
    expect(result.current.template.lg[1]).toEqual(mixedTemplate.lg[1]);
  });

  it('should apply remapShortKeys when isNewBackend is true', async () => {
    mockIsNewBackend = true;

    const shortKeyTemplate: ExtendedTemplateConfig = {
      sm: [],
      md: [],
      lg: [
        { i: 'rhel#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'RHEL', widgetType: 'rhel' },
        { i: 'openshift#1', x: 1, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'OpenShift', widgetType: 'openshift' },
      ],
      xl: [],
    };

    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());
    mockedMapTemplateConfig.mockReturnValue(shortKeyTemplate);
    mockedGetWidgetMapping.mockResolvedValue(mockWidgetMapping);

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    expect(result.current.template).toEqual(mockRemappedTemplate);
  });

  it('should keep unknown widget types unchanged during remapShortKeys', async () => {
    mockIsNewBackend = true;

    const templateWithUnknown: ExtendedTemplateConfig = {
      sm: [],
      md: [],
      lg: [{ i: 'unknownWidget#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'Unknown', widgetType: 'unknownWidget' }],
      xl: [],
    };

    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());
    mockedMapTemplateConfig.mockReturnValue(templateWithUnknown);
    mockedGetWidgetMapping.mockResolvedValue({});

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    expect(result.current.template.lg[0].i).toBe('unknownWidget#0');
    expect(result.current.template.lg[0].widgetType).toBe('unknownWidget');
  });

  it('should call renameDashboardInList and update local dashboard state', async () => {
    const initial = createMockDashboardTemplate({ id: 5, dashboardName: 'Old Name' });
    const updated = { ...initial, dashboardName: 'New Name' };

    mockedGetDashboardTemplate.mockResolvedValue(initial);
    mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
    mockedGetWidgetMapping.mockResolvedValue({});
    mockRenameDashboardInList.mockResolvedValue(updated);

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(5)));

    expect(result.current.dashboard?.dashboardName).toBe('Old Name');

    await act(async () => {
      await result.current.renameDashboard('New Name');
    });

    expect(mockRenameDashboardInList).toHaveBeenCalledWith({ id: 5, dashboardName: 'New Name' });
    expect(result.current.dashboard?.dashboardName).toBe('New Name');
  });

  it('should invalidate start page when saving template for a default dashboard', async () => {
    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate({ default: true }));
    mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
    mockedGetWidgetMapping.mockResolvedValue({});
    mockedPatchDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    await act(async () => {
      await result.current.saveTemplate(emptyTemplate);
    });

    expect(mockInvalidateStartPage).toHaveBeenCalledWith(-1);
  });

  it('should not invalidate start page when saving template for a non-default dashboard', async () => {
    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate({ default: false }));
    mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
    mockedGetWidgetMapping.mockResolvedValue({});
    mockedPatchDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    await act(async () => {
      await result.current.saveTemplate(emptyTemplate);
    });

    expect(mockInvalidateStartPage).not.toHaveBeenCalled();
  });

  it('should log error to console when saveTemplate patch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const patchError = new Error('Patch failed');

    mockedGetDashboardTemplate.mockResolvedValue(createMockDashboardTemplate());
    mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
    mockedGetWidgetMapping.mockResolvedValue({});
    mockedPatchDashboardTemplate.mockRejectedValue(patchError);

    const { result } = await act(async () => renderHook(() => useDashboardTemplate(1)));

    await act(async () => {
      await result.current.saveTemplate(emptyTemplate);
    });

    expect(consoleSpy).toHaveBeenCalledWith(patchError);
    consoleSpy.mockRestore();
  });

  it('should reset drawer expanded state on mount', async () => {
    mockedGetDashboardTemplate.mockReturnValue(
      new Promise(() => {
        /* never resolves */
      })
    );

    renderHook(() => useDashboardTemplate(1));

    expect(mockSetDrawerExpanded).toHaveBeenCalledWith(false);
  });
});
