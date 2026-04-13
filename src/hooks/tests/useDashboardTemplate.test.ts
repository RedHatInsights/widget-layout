import { act, renderHook } from '@testing-library/react';
import useDashboardTemplate from '../useDashboardTemplate';
import {
  DashboardTemplate,
  ExtendedTemplateConfig,
  WidgetMapping,
  getDashboardTemplate,
  getWidgetMapping,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplateHub,
} from '../../api/dashboard-templates';

jest.mock('awesome-debounce-promise', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (fn: (...args: any[]) => any) => fn,
}));

jest.mock('../../api/dashboard-templates', () => ({
  getDashboardTemplate: jest.fn(),
  getWidgetMapping: jest.fn(),
  mapTemplateConfigToExtendedTemplateConfig: jest.fn(),
  patchDashboardTemplateHub: jest.fn(),
  widgetIdSeparator: '#',
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
  userIdentityID: 1,
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
    module: './OpenshiftWidget',
    defaults: { w: 1, h: 1, maxH: 1, minH: 1 },
  },
};

const mockExtendedTemplate: ExtendedTemplateConfig = {
  sm: [],
  md: [],
  lg: [
    { i: 'landing-./RhelWidget#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'RHEL', widgetType: 'landing-./RhelWidget' },
    { i: 'landing-./OpenshiftWidget#1', x: 1, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: 'OpenShift', widgetType: 'landing-./OpenshiftWidget' },
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
});
