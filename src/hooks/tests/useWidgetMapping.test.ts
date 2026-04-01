import { act, renderHook } from '@testing-library/react';
import useWidgetMapping from '../useWidgetMapping';
import { WidgetMapping, WidgetPermission, getWidgetMapping } from '../../api/dashboard-templates';

const mockSetWidgetMapping = jest.fn();
const mockCurrentUser = { currentUser: undefined as object | undefined };
const mockVisibilityFunctions: Record<string, jest.Mock> = {};

jest.mock('jotai', () => ({
  useSetAtom: () => mockSetWidgetMapping,
}));

jest.mock('../../state/widgetMappingAtom', () => ({
  widgetMappingAtom: {},
}));

jest.mock('../useCurrentUser', () => ({
  __esModule: true,
  default: () => mockCurrentUser,
}));

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({ visibilityFunctions: mockVisibilityFunctions }),
}));

jest.mock('../../api/dashboard-templates', () => ({
  getWidgetMapping: jest.fn(),
}));

const mockedGetWidgetMapping = getWidgetMapping as jest.MockedFunction<typeof getWidgetMapping>;

const createWidget = (key: string, permissions?: WidgetPermission[]): WidgetMapping[string] => ({
  scope: `@scope/${key}`,
  module: `./${key}`,
  importName: key,
  defaults: { w: 1, h: 1, maxH: 2, minH: 1 },
  ...(permissions !== undefined ? { config: { permissions } } : {}),
});

describe('useWidgetMapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser.currentUser = undefined;
    // Clear visibility functions
    Object.keys(mockVisibilityFunctions).forEach((key) => delete mockVisibilityFunctions[key]);
  });

  it('should NOT fetch widget mapping when currentUser is undefined', async () => {
    mockCurrentUser.currentUser = undefined;

    renderHook(() => useWidgetMapping());

    // Allow any pending promises to flush
    await act(async () => {
      /* flush pending promises */
    });

    expect(mockedGetWidgetMapping).not.toHaveBeenCalled();
    expect(mockSetWidgetMapping).not.toHaveBeenCalled();
  });

  it('should fetch and set full mapping when no widgets have permissions configured', async () => {
    mockCurrentUser.currentUser = { id: '1' };
    const mapping = {
      widgetA: createWidget('widgetA'),
      widgetB: createWidget('widgetB'),
    };
    mockedGetWidgetMapping.mockResolvedValue(mapping as WidgetMapping);

    renderHook(() => useWidgetMapping());

    await act(async () => {
      /* flush pending promises */
    });

    expect(mockedGetWidgetMapping).toHaveBeenCalledTimes(1);
    expect(mockSetWidgetMapping).toHaveBeenCalledWith(mapping);
  });

  it('should filter out widgets that fail permission checks', async () => {
    mockCurrentUser.currentUser = { id: '1' };
    mockVisibilityFunctions.isOrgAdmin = jest.fn().mockResolvedValue(false);

    const mapping = {
      widgetA: createWidget('widgetA', [{ method: 'isOrgAdmin' }]),
      widgetB: createWidget('widgetB'),
    };
    mockedGetWidgetMapping.mockResolvedValue(mapping as WidgetMapping);

    renderHook(() => useWidgetMapping());

    await act(async () => {
      /* flush pending promises */
    });

    expect(mockSetWidgetMapping).toHaveBeenCalledTimes(1);
    const result = mockSetWidgetMapping.mock.calls[0][0];
    expect(result).not.toHaveProperty('widgetA');
    expect(result).toHaveProperty('widgetB');
  });

  it('should include widgets that pass permission checks', async () => {
    mockCurrentUser.currentUser = { id: '1' };
    mockVisibilityFunctions.isOrgAdmin = jest.fn().mockResolvedValue(true);

    const mapping = {
      widgetA: createWidget('widgetA', [{ method: 'isOrgAdmin' }]),
    };
    mockedGetWidgetMapping.mockResolvedValue(mapping as WidgetMapping);

    renderHook(() => useWidgetMapping());

    await act(async () => {
      /* flush pending promises */
    });

    expect(mockSetWidgetMapping).toHaveBeenCalledTimes(1);
    const result = mockSetWidgetMapping.mock.calls[0][0];
    expect(result).toHaveProperty('widgetA');
  });

  it('should include widgets when the permission method does not exist in visibilityFunctions', async () => {
    mockCurrentUser.currentUser = { id: '1' };
    // Do NOT add 'nonExistentMethod' to mockVisibilityFunctions

    const mapping = {
      widgetA: createWidget('widgetA', [{ method: 'nonExistentMethod' as WidgetPermission['method'] }]),
    };
    mockedGetWidgetMapping.mockResolvedValue(mapping as WidgetMapping);

    renderHook(() => useWidgetMapping());

    await act(async () => {
      /* flush pending promises */
    });

    expect(mockSetWidgetMapping).toHaveBeenCalledTimes(1);
    const result = mockSetWidgetMapping.mock.calls[0][0];
    expect(result).toHaveProperty('widgetA');
  });

  it('should exclude widgets when a visibility function throws an error', async () => {
    mockCurrentUser.currentUser = { id: '1' };
    mockVisibilityFunctions.isOrgAdmin = jest.fn().mockRejectedValue(new Error('Permission service down'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* suppress console.error */
    });

    const mapping = {
      widgetA: createWidget('widgetA', [{ method: 'isOrgAdmin' }]),
    };
    mockedGetWidgetMapping.mockResolvedValue(mapping as WidgetMapping);

    renderHook(() => useWidgetMapping());

    await act(async () => {
      /* flush pending promises */
    });

    expect(mockSetWidgetMapping).toHaveBeenCalledTimes(1);
    const result = mockSetWidgetMapping.mock.calls[0][0];
    expect(result).not.toHaveProperty('widgetA');
    expect(consoleSpy).toHaveBeenCalledWith('Error checking permissions', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should correctly filter a mixed scenario with various permission outcomes', async () => {
    mockCurrentUser.currentUser = { id: '1' };
    mockVisibilityFunctions.isOrgAdmin = jest.fn().mockResolvedValue(true);
    mockVisibilityFunctions.isActive = jest.fn().mockResolvedValue(false);
    mockVisibilityFunctions.isEntitled = jest.fn().mockRejectedValue(new Error('fail'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* suppress console.error */
    });

    const mapping = {
      widgetPass: createWidget('widgetPass', [{ method: 'isOrgAdmin' }]),
      widgetFail: createWidget('widgetFail', [{ method: 'isActive' }]),
      widgetError: createWidget('widgetError', [{ method: 'isEntitled' }]),
      widgetNoPerms: createWidget('widgetNoPerms'),
      widgetMissing: createWidget('widgetMissing', [{ method: 'doesNotExist' as WidgetPermission['method'] }]),
    };
    mockedGetWidgetMapping.mockResolvedValue(mapping as WidgetMapping);

    renderHook(() => useWidgetMapping());

    await act(async () => {
      /* flush pending promises */
    });

    expect(mockSetWidgetMapping).toHaveBeenCalledTimes(1);
    const result = mockSetWidgetMapping.mock.calls[0][0];
    expect(result).toHaveProperty('widgetPass');
    expect(result).not.toHaveProperty('widgetFail');
    expect(result).not.toHaveProperty('widgetError');
    expect(result).toHaveProperty('widgetNoPerms');
    expect(result).toHaveProperty('widgetMissing');

    consoleSpy.mockRestore();
  });

  it('should NOT call setWidgetMapping when getWidgetMapping returns undefined', async () => {
    mockCurrentUser.currentUser = { id: '1' };
    mockedGetWidgetMapping.mockResolvedValue(undefined as unknown as WidgetMapping);

    renderHook(() => useWidgetMapping());

    await act(async () => {
      /* flush pending promises */
    });

    expect(mockedGetWidgetMapping).toHaveBeenCalledTimes(1);
    expect(mockSetWidgetMapping).not.toHaveBeenCalled();
  });
});
