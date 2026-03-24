import { act, renderHook } from '@testing-library/react';
import { useDeleteDashboard } from '../useDeleteDashboard';
import { deleteDashboardTemplateFromHub } from '../../api/dashboard-templates';

jest.mock('../../api/dashboard-templates', () => ({
  deleteDashboardTemplateFromHub: jest.fn(),
}));

const mockedDeleteDashboardTemplateFromHub = deleteDashboardTemplateFromHub as jest.MockedFunction<typeof deleteDashboardTemplateFromHub>;

describe('useDeleteDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state with isLoading false and error null', () => {
    const { result } = renderHook(() => useDeleteDashboard());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.deleteDashboard).toBe('function');
  });

  it('should delete dashboard successfully and call onSuccess callback', async () => {
    mockedDeleteDashboardTemplateFromHub.mockResolvedValue(true);
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteDashboard(onSuccess));

    let deleteResult = false;
    await act(async () => {
      deleteResult = await result.current.deleteDashboard(1);
    });

    expect(deleteResult).toBe(true);
    expect(mockedDeleteDashboardTemplateFromHub).toHaveBeenCalledWith(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should not call onSuccess when API returns false', async () => {
    mockedDeleteDashboardTemplateFromHub.mockResolvedValue(false);
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteDashboard(onSuccess));

    let deleteResult = true;
    await act(async () => {
      deleteResult = await result.current.deleteDashboard(1);
    });

    expect(deleteResult).toBe(false);
    expect(mockedDeleteDashboardTemplateFromHub).toHaveBeenCalledWith(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error message when API throws an Error instance', async () => {
    mockedDeleteDashboardTemplateFromHub.mockRejectedValue(new Error('Network error'));
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteDashboard(onSuccess));

    let deleteResult = true;
    await act(async () => {
      deleteResult = await result.current.deleteDashboard(1);
    });

    expect(deleteResult).toBe(false);
    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should set fallback error message when API throws a non-Error value', async () => {
    mockedDeleteDashboardTemplateFromHub.mockRejectedValue('something went wrong');
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteDashboard(onSuccess));

    let deleteResult = true;
    await act(async () => {
      deleteResult = await result.current.deleteDashboard(1);
    });

    expect(deleteResult).toBe(false);
    expect(result.current.error).toBe('Failed to delete dashboard');
    expect(result.current.isLoading).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should clear previous error on a new successful call', async () => {
    mockedDeleteDashboardTemplateFromHub.mockRejectedValueOnce(new Error('First error'));
    mockedDeleteDashboardTemplateFromHub.mockResolvedValueOnce(true);
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteDashboard(onSuccess));

    await act(async () => {
      await result.current.deleteDashboard(1);
    });

    expect(result.current.error).toBe('First error');

    await act(async () => {
      await result.current.deleteDashboard(1);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should work without onSuccess callback', async () => {
    mockedDeleteDashboardTemplateFromHub.mockResolvedValue(true);
    const { result } = renderHook(() => useDeleteDashboard());

    let deleteResult = false;
    await act(async () => {
      deleteResult = await result.current.deleteDashboard(1);
    });

    expect(deleteResult).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
