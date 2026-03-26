import { act, renderHook } from '@testing-library/react';
import { useExportDashboard } from '../useExportDashboard';
import { ExportDashboardTemplate, exportDashboardTemplate } from '../../api/dashboard-templates';

jest.mock('../../api/dashboard-templates', () => ({
  exportDashboardTemplate: jest.fn(),
}));

const mockedExportDashboardTemplate = exportDashboardTemplate as jest.MockedFunction<typeof exportDashboardTemplate>;

const mockExportResult: ExportDashboardTemplate = {
  templateBase: {
    name: 'test-dashboard',
    displayName: 'Test Dashboard',
  },
  templateConfig: {} as ExportDashboardTemplate['templateConfig'],
};

describe('useExportDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state with isLoading false and error null', () => {
    const { result } = renderHook(() => useExportDashboard());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.exportDashboard).toBe('function');
  });

  it('should return the exported template on successful API call', async () => {
    mockedExportDashboardTemplate.mockResolvedValue(mockExportResult);

    const { result } = renderHook(() => useExportDashboard());

    let exportResult: ExportDashboardTemplate | null = null;
    await act(async () => {
      exportResult = await result.current.exportDashboard(42);
    });

    expect(mockedExportDashboardTemplate).toHaveBeenCalledWith(42);
    expect(mockedExportDashboardTemplate).toHaveBeenCalledTimes(1);
    expect(exportResult).toEqual(mockExportResult);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error with the Error message when API throws an Error instance', async () => {
    mockedExportDashboardTemplate.mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useExportDashboard());

    let exportResult: ExportDashboardTemplate | null = null;
    await act(async () => {
      exportResult = await result.current.exportDashboard(99);
    });

    expect(exportResult).toBeNull();
    expect(result.current.error).toBe('Network failure');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set a fallback error message when API throws a non-Error value', async () => {
    mockedExportDashboardTemplate.mockRejectedValue('some string error');

    const { result } = renderHook(() => useExportDashboard());

    let exportResult: ExportDashboardTemplate | null = null;
    await act(async () => {
      exportResult = await result.current.exportDashboard(1);
    });

    expect(exportResult).toBeNull();
    expect(result.current.error).toBe('Failed to export dashboard');
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear previous error on a new successful call', async () => {
    mockedExportDashboardTemplate.mockRejectedValueOnce(new Error('First call fails'));
    mockedExportDashboardTemplate.mockResolvedValueOnce(mockExportResult);

    const { result } = renderHook(() => useExportDashboard());

    await act(async () => {
      await result.current.exportDashboard(1);
    });
    expect(result.current.error).toBe('First call fails');

    await act(async () => {
      await result.current.exportDashboard(2);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
