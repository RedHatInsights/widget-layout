import { act, renderHook } from '@testing-library/react';
import { useDeleteDashboard } from '../useDeleteDashboard';

const mockDeleteDashboardFromAtom = jest.fn();

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useSetAtom: () => mockDeleteDashboardFromAtom,
}));

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

  it('should delete dashboard successfully', async () => {
    mockDeleteDashboardFromAtom.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteDashboard());

    let deleteResult = false;
    await act(async () => {
      deleteResult = await result.current.deleteDashboard(1);
    });

    expect(deleteResult).toBe(true);
    expect(mockDeleteDashboardFromAtom).toHaveBeenCalledWith(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error message when atom throws an Error instance', async () => {
    mockDeleteDashboardFromAtom.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useDeleteDashboard());

    let deleteResult = true;
    await act(async () => {
      deleteResult = await result.current.deleteDashboard(1);
    });

    expect(deleteResult).toBe(false);
    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set fallback error message when atom throws a non-Error value', async () => {
    mockDeleteDashboardFromAtom.mockRejectedValue('something went wrong');
    const { result } = renderHook(() => useDeleteDashboard());

    let deleteResult = true;
    await act(async () => {
      deleteResult = await result.current.deleteDashboard(1);
    });

    expect(deleteResult).toBe(false);
    expect(result.current.error).toBe('Failed to delete dashboard');
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear previous error on a new successful call', async () => {
    mockDeleteDashboardFromAtom.mockRejectedValueOnce(new Error('First error'));
    mockDeleteDashboardFromAtom.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useDeleteDashboard());

    await act(async () => {
      await result.current.deleteDashboard(1);
    });

    expect(result.current.error).toBe('First error');

    await act(async () => {
      await result.current.deleteDashboard(1);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});