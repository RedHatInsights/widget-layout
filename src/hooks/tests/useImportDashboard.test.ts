import { act, renderHook } from '@testing-library/react';
import { useImportDashboard } from '../useImportDashboard';
import { DashboardTemplate, importDashboardTemplate } from '../../api/dashboard-templates';

jest.mock('../../api/dashboard-templates', () => ({
  importDashboardTemplate: jest.fn(),
  getUsersDashboards: jest.fn().mockResolvedValue([]),
}));

const mockedImportDashboardTemplate = importDashboardTemplate as jest.MockedFunction<typeof importDashboardTemplate>;

const mockDashboardTemplate: DashboardTemplate = {
  id: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
  userIdentityID: 42,
  default: false,
  templateBase: { name: 'test-base', displayName: 'Test Base' },
  templateConfig: {} as DashboardTemplate['templateConfig'],
  dashboardName: 'My Dashboard',
};

describe('useImportDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useImportDashboard());

    expect(result.current.configString).toBe('');
    expect(result.current.name).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isFormValid).toBe(false);
    expect(typeof result.current.importDashboard).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should successfully import a dashboard', async () => {
    mockedImportDashboardTemplate.mockResolvedValue(mockDashboardTemplate);

    const configString = JSON.stringify({
      templateBase: { name: 'test-base', displayName: 'Test Base' },
      templateConfig: { someKey: 'someValue' },
    });

    const { result } = renderHook(() => useImportDashboard());

    act(() => {
      result.current.setConfigString(configString);
      result.current.setName('My Dashboard');
    });

    let returnValue: DashboardTemplate | null = null;
    await act(async () => {
      returnValue = await result.current.importDashboard();
    });

    expect(mockedImportDashboardTemplate).toHaveBeenCalledTimes(1);
    expect(mockedImportDashboardTemplate).toHaveBeenCalledWith({
      dashboardName: 'My Dashboard',
      templateBase: { name: 'test-base', displayName: 'Test Base' },
      templateConfig: { someKey: 'someValue' },
    });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(returnValue).toEqual(mockDashboardTemplate);
  });

  it('should set error for invalid JSON config string', async () => {
    const { result } = renderHook(() => useImportDashboard());

    act(() => {
      result.current.setConfigString('not valid json');
      result.current.setName('My Dashboard');
    });

    let returnValue: DashboardTemplate | null = null;
    await act(async () => {
      returnValue = await result.current.importDashboard();
    });

    expect(result.current.error).toBe('Invalid JSON format. Please check your configuration string.');
    expect(result.current.isLoading).toBe(false);
    expect(returnValue).toBeNull();
    expect(mockedImportDashboardTemplate).not.toHaveBeenCalled();
  });

  it('should set error message when API throws an Error instance', async () => {
    mockedImportDashboardTemplate.mockRejectedValue(new Error('Network failure'));

    const configString = JSON.stringify({ templateBase: { name: 'x', displayName: 'X' } });
    const { result } = renderHook(() => useImportDashboard());

    act(() => {
      result.current.setConfigString(configString);
      result.current.setName('Dashboard');
    });

    let returnValue: DashboardTemplate | null = null;
    await act(async () => {
      returnValue = await result.current.importDashboard();
    });

    expect(result.current.error).toBe('Network failure');
    expect(result.current.isLoading).toBe(false);
    expect(returnValue).toBeNull();
  });

  it('should use fallback message when Error instance has empty message', async () => {
    mockedImportDashboardTemplate.mockRejectedValue(new Error(''));

    const configString = JSON.stringify({ templateBase: { name: 'x', displayName: 'X' } });
    const { result } = renderHook(() => useImportDashboard());

    act(() => {
      result.current.setConfigString(configString);
      result.current.setName('Dashboard');
    });

    await act(async () => {
      await result.current.importDashboard();
    });

    expect(result.current.error).toBe('Failed to import dashboard. Please try again.');
  });

  it('should set generic error when API throws a non-Error value', async () => {
    mockedImportDashboardTemplate.mockRejectedValue('some string error');

    const configString = JSON.stringify({ templateBase: { name: 'x', displayName: 'X' } });
    const { result } = renderHook(() => useImportDashboard());

    act(() => {
      result.current.setConfigString(configString);
      result.current.setName('Dashboard');
    });

    let returnValue: DashboardTemplate | null = null;
    await act(async () => {
      returnValue = await result.current.importDashboard();
    });

    expect(result.current.error).toBe('An unexpected error occurred. Please try again.');
    expect(result.current.isLoading).toBe(false);
    expect(returnValue).toBeNull();
  });

  it('should reset state via the reset function', async () => {
    mockedImportDashboardTemplate.mockRejectedValue(new Error('fail'));

    const configString = JSON.stringify({ key: 'value' });
    const { result } = renderHook(() => useImportDashboard());

    act(() => {
      result.current.setConfigString(configString);
      result.current.setName('Dashboard');
    });

    await act(async () => {
      await result.current.importDashboard();
    });

    // Confirm error state is set before reset
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.configString).toBe('');
    expect(result.current.name).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('should overwrite dashboardName from config with the explicitly set name', async () => {
    mockedImportDashboardTemplate.mockResolvedValue(mockDashboardTemplate);

    const configString = JSON.stringify({
      dashboardName: 'name-from-config',
      templateBase: { name: 'b', displayName: 'B' },
    });

    const { result } = renderHook(() => useImportDashboard());

    act(() => {
      result.current.setConfigString(configString);
      result.current.setName('Correct Name');
    });

    await act(async () => {
      await result.current.importDashboard();
    });

    // The name state overwrites the dashboardName from parsedConfig
    expect(mockedImportDashboardTemplate).toHaveBeenCalledWith({
      dashboardName: 'Correct Name',
      templateBase: { name: 'b', displayName: 'B' },
    });
  });

  it('should report form as valid when both configString and name are non-empty', () => {
    const { result } = renderHook(() => useImportDashboard());

    expect(result.current.isFormValid).toBe(false);

    act(() => {
      result.current.setConfigString('some config');
    });
    expect(result.current.isFormValid).toBe(false);

    act(() => {
      result.current.setName('Dashboard Name');
    });
    expect(result.current.isFormValid).toBe(true);
  });
});
