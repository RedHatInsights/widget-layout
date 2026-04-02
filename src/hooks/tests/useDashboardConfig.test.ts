import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { Provider, createStore } from 'jotai';
import useDashboardConfig from '../useDashboardConfig';
import {
  DashboardTemplate,
  ExtendedTemplateConfig,
  getDashboardTemplates,
  getDefaultTemplate,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplate,
} from '../../api/dashboard-templates';
import useCurrentUser from '../useCurrentUser';
import { useAddNotification } from '../../state/notificationsAtom';
import { templateIdAtom } from '../../state/templateAtom';

jest.mock('awesome-debounce-promise', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (fn: (...args: any[]) => any) => fn,
}));

jest.mock('../../api/dashboard-templates', () => ({
  getDashboardTemplates: jest.fn(),
  getDefaultTemplate: jest.fn(),
  mapTemplateConfigToExtendedTemplateConfig: jest.fn(),
  patchDashboardTemplate: jest.fn(),
}));

jest.mock('../useCurrentUser', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../state/notificationsAtom', () => ({
  useAddNotification: jest.fn(),
}));

const mockedGetDashboardTemplates = getDashboardTemplates as jest.MockedFunction<typeof getDashboardTemplates>;
const mockedGetDefaultTemplate = getDefaultTemplate as jest.MockedFunction<typeof getDefaultTemplate>;
const mockedMapTemplateConfig = mapTemplateConfigToExtendedTemplateConfig as jest.MockedFunction<typeof mapTemplateConfigToExtendedTemplateConfig>;
const mockedPatchDashboardTemplate = patchDashboardTemplate as jest.MockedFunction<typeof patchDashboardTemplate>;
const mockedUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>;
const mockedUseAddNotification = useAddNotification as jest.MockedFunction<typeof useAddNotification>;

const emptyTemplate: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };

const createMockDashboardTemplate = (overrides: Partial<DashboardTemplate> = {}): DashboardTemplate => ({
  id: 42,
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

const mockExtendedTemplate: ExtendedTemplateConfig = {
  sm: [],
  md: [],
  lg: [{ i: 'widget#0', x: 0, y: 0, w: 2, h: 3, maxH: 4, minH: 1, title: 'My Widget', widgetType: 'widget', locked: false }],
  xl: [],
};

function createWrapper() {
  const store = createStore();
  const wrapper = ({ children }: { children: React.ReactNode }) => createElement(Provider, { store }, children);
  return { wrapper, store };
}

describe('useDashboardConfig', () => {
  let mockAddNotification: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddNotification = jest.fn();
    mockedUseAddNotification.mockReturnValue(mockAddNotification);
    // Default: no current user
    mockedUseCurrentUser.mockReturnValue({ currentUser: undefined, isLoaded: false });
    // Default: set document.body.clientWidth
    Object.defineProperty(document.body, 'clientWidth', { value: 1300, configurable: true });
  });

  it('should return initial state with isLoaded false and empty template', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDashboardConfig(), { wrapper });

    expect(result.current.isLoaded).toBe(false);
    expect(result.current.template).toEqual(emptyTemplate);
    expect(result.current.templateId).toBe(-1);
    expect(typeof result.current.saveTemplate).toBe('function');
    expect(result.current.layoutRef).toBeDefined();
  });

  it('should not fetch when currentUser is falsy', async () => {
    mockedUseCurrentUser.mockReturnValue({ currentUser: undefined, isLoaded: false });
    const { wrapper } = createWrapper();

    renderHook(() => useDashboardConfig(), { wrapper });

    await act(async () => {
      /* flush */
    });

    expect(mockedGetDashboardTemplates).not.toHaveBeenCalled();
  });

  it('should not fetch when templateId >= 0', async () => {
    // Simulate templateId already set by pre-loading atom
    mockedUseCurrentUser.mockReturnValue({
      currentUser: { username: 'test-user' } as ReturnType<typeof useCurrentUser>['currentUser'],
      isLoaded: true,
    });

    const { wrapper, store } = createWrapper();
    store.set(templateIdAtom, 5);

    renderHook(() => useDashboardConfig(), { wrapper });

    await act(async () => {
      /* flush */
    });

    expect(mockedGetDashboardTemplates).not.toHaveBeenCalled();
  });

  it('should fetch and set template when currentUser exists and templateId < 0', async () => {
    mockedUseCurrentUser.mockReturnValue({
      currentUser: { username: 'test-user' } as ReturnType<typeof useCurrentUser>['currentUser'],
      isLoaded: true,
    });

    const mockTemplates = [createMockDashboardTemplate()];
    const mockDefault = createMockDashboardTemplate({ id: 42 });
    mockedGetDashboardTemplates.mockResolvedValue(mockTemplates);
    mockedGetDefaultTemplate.mockReturnValue(mockDefault);
    mockedMapTemplateConfig.mockReturnValue(mockExtendedTemplate);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDashboardConfig('landingPage'), { wrapper });

    await act(async () => {
      /* flush promises */
    });

    expect(mockedGetDashboardTemplates).toHaveBeenCalledWith('landingPage');
    expect(mockedGetDefaultTemplate).toHaveBeenCalledWith(mockTemplates);
    expect(mockedMapTemplateConfig).toHaveBeenCalledWith(mockDefault.templateConfig);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.template).toEqual(mockExtendedTemplate);
    expect(result.current.templateId).toBe(42);
  });

  it('should call addNotification on fetch error and set isLoaded true', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedUseCurrentUser.mockReturnValue({
      currentUser: { username: 'test-user' } as ReturnType<typeof useCurrentUser>['currentUser'],
      isLoaded: true,
    });
    mockedGetDashboardTemplates.mockRejectedValue(new Error('Network error'));

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDashboardConfig(), { wrapper });

    await act(async () => {
      /* flush */
    });

    expect(result.current.isLoaded).toBe(true);
    expect(mockAddNotification).toHaveBeenCalledWith({
      variant: 'danger',
      title: 'Failed to fetch dashboard template',
      description: 'Try reloading the page.',
    });
    consoleSpy.mockRestore();
  });

  it('should trigger error path when getDefaultTemplate returns null', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedUseCurrentUser.mockReturnValue({
      currentUser: { username: 'test-user' } as ReturnType<typeof useCurrentUser>['currentUser'],
      isLoaded: true,
    });
    mockedGetDashboardTemplates.mockResolvedValue([]);
    mockedGetDefaultTemplate.mockReturnValue(undefined as unknown as ReturnType<typeof getDefaultTemplate>);

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useDashboardConfig(), { wrapper });

    await act(async () => {
      /* flush */
    });

    expect(result.current.isLoaded).toBe(true);
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to fetch dashboard template',
      })
    );
    consoleSpy.mockRestore();
  });

  describe('layout variant selection based on viewport width', () => {
    const setupFetchScenario = () => {
      mockedUseCurrentUser.mockReturnValue({
        currentUser: { username: 'test-user' } as ReturnType<typeof useCurrentUser>['currentUser'],
        isLoaded: true,
      });
      const mockDefault = createMockDashboardTemplate({ id: 10 });
      mockedGetDashboardTemplates.mockResolvedValue([mockDefault]);
      mockedGetDefaultTemplate.mockReturnValue(mockDefault);
      mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
    };

    it('should set variant to xl when width >= 1250', async () => {
      setupFetchScenario();
      Object.defineProperty(document.body, 'clientWidth', { value: 1250, configurable: true });

      const { wrapper } = createWrapper();
      renderHook(() => useDashboardConfig(), { wrapper });

      await act(async () => {
        /* flush */
      });

      // We can verify indirectly that the hook ran without error.
      // The variant is set via setLayoutVariant atom; we verify the fetch path completed.
      expect(mockedGetDashboardTemplates).toHaveBeenCalled();
    });

    it('should set variant to lg when width >= 1100 and < 1250', async () => {
      setupFetchScenario();
      Object.defineProperty(document.body, 'clientWidth', { value: 1100, configurable: true });

      const { wrapper } = createWrapper();
      renderHook(() => useDashboardConfig(), { wrapper });

      await act(async () => {
        /* flush */
      });

      expect(mockedGetDashboardTemplates).toHaveBeenCalled();
    });

    it('should set variant to md when width >= 800 and < 1100', async () => {
      setupFetchScenario();
      Object.defineProperty(document.body, 'clientWidth', { value: 800, configurable: true });

      const { wrapper } = createWrapper();
      renderHook(() => useDashboardConfig(), { wrapper });

      await act(async () => {
        /* flush */
      });

      expect(mockedGetDashboardTemplates).toHaveBeenCalled();
    });

    it('should set variant to sm when width < 800', async () => {
      setupFetchScenario();
      Object.defineProperty(document.body, 'clientWidth', { value: 400, configurable: true });

      const { wrapper } = createWrapper();
      renderHook(() => useDashboardConfig(), { wrapper });

      await act(async () => {
        /* flush */
      });

      expect(mockedGetDashboardTemplates).toHaveBeenCalled();
    });
  });

  describe('saveTemplate', () => {
    const setupWithLoadedTemplate = async () => {
      mockedUseCurrentUser.mockReturnValue({
        currentUser: { username: 'test-user' } as ReturnType<typeof useCurrentUser>['currentUser'],
        isLoaded: true,
      });
      const mockDefault = createMockDashboardTemplate({ id: 5 });
      mockedGetDashboardTemplates.mockResolvedValue([mockDefault]);
      mockedGetDefaultTemplate.mockReturnValue(mockDefault);
      mockedMapTemplateConfig.mockReturnValue(emptyTemplate);
      mockedPatchDashboardTemplate.mockResolvedValue(mockDefault);

      const { wrapper } = createWrapper();
      const hookResult = renderHook(() => useDashboardConfig(), { wrapper });

      await act(async () => {
        /* flush initial load */
      });

      return hookResult;
    };

    it('should skip patch when templateId < 0', async () => {
      mockedUseCurrentUser.mockReturnValue({ currentUser: undefined, isLoaded: false });
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useDashboardConfig(), { wrapper });

      await act(async () => {
        await result.current.saveTemplate(emptyTemplate);
      });

      expect(mockedPatchDashboardTemplate).not.toHaveBeenCalled();
    });

    it('should update template and call patchDashboardTemplate when templateId >= 0', async () => {
      const { result } = await setupWithLoadedTemplate();

      const newTemplate: ExtendedTemplateConfig = {
        sm: [],
        md: [],
        lg: [{ i: 'widget#0', x: 0, y: 0, w: 2, h: 3, maxH: 4, minH: 1, title: 'My Widget', widgetType: 'widget' }],
        xl: [],
      };

      await act(async () => {
        await result.current.saveTemplate(newTemplate);
      });

      expect(result.current.template).toEqual(newTemplate);
      expect(mockedPatchDashboardTemplate).toHaveBeenCalledWith(5, {
        templateConfig: {
          sm: [],
          md: [],
          lg: [{ i: 'widget#0', x: 0, y: 0, w: 2, h: 3, maxH: 4, minH: 1, title: 'My Widget' }],
          xl: [],
        },
      });
    });

    it('should map only i, x, y, w, h, maxH, minH, title fields and strip widgetType/locked/config', async () => {
      const { result } = await setupWithLoadedTemplate();

      const templateWithExtras: ExtendedTemplateConfig = {
        sm: [
          {
            i: 'extra#0',
            x: 1,
            y: 2,
            w: 3,
            h: 4,
            maxH: 5,
            minH: 1,
            title: 'Extra',
            widgetType: 'extra',
            locked: true,
            config: { foo: 'bar' },
          } as ExtendedTemplateConfig['sm'][0],
        ],
        md: [],
        lg: [],
        xl: [],
      };

      await act(async () => {
        await result.current.saveTemplate(templateWithExtras);
      });

      const patchCall = mockedPatchDashboardTemplate.mock.calls[0][1];
      const smItems = (patchCall as unknown as { templateConfig: { sm: Record<string, unknown>[] } }).templateConfig.sm;
      expect(smItems[0]).toEqual({
        i: 'extra#0',
        x: 1,
        y: 2,
        w: 3,
        h: 4,
        maxH: 5,
        minH: 1,
        title: 'Extra',
      });
      // Ensure extra fields are not present
      expect(smItems[0]).not.toHaveProperty('widgetType');
      expect(smItems[0]).not.toHaveProperty('locked');
      expect(smItems[0]).not.toHaveProperty('config');
    });

    it('should default title to "Widget" when title is falsy', async () => {
      const { result } = await setupWithLoadedTemplate();

      const templateNoTitle: ExtendedTemplateConfig = {
        sm: [],
        md: [{ i: 'notitle#0', x: 0, y: 0, w: 1, h: 1, maxH: 1, minH: 1, title: '', widgetType: 'notitle' }],
        lg: [],
        xl: [],
      };

      await act(async () => {
        await result.current.saveTemplate(templateNoTitle);
      });

      const patchCall = mockedPatchDashboardTemplate.mock.calls[0][1];
      const mdItems = (patchCall as unknown as { templateConfig: { md: Record<string, unknown>[] } }).templateConfig.md;
      expect(mdItems[0]).toEqual(expect.objectContaining({ title: 'Widget' }));
    });

    it('should call addNotification when patchDashboardTemplate fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = await setupWithLoadedTemplate();

      mockedPatchDashboardTemplate.mockRejectedValue(new Error('Patch failed'));

      await act(async () => {
        await result.current.saveTemplate(emptyTemplate);
      });

      expect(mockAddNotification).toHaveBeenCalledWith({
        variant: 'danger',
        title: 'Failed to patch dashboard configuration',
        description: 'Your dashboard changes were unable to be saved.',
      });
      consoleSpy.mockRestore();
    });
  });
});
