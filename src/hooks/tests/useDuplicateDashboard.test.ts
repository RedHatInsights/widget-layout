import { act, renderHook } from '@testing-library/react';
import { useDuplicateDashboard } from '../useDuplicateDashboard';
import { DashboardTemplate, DashboardTemplatesError, copyDashboardTemplate, setDefaultTemplate } from '../../api/dashboard-templates';

jest.mock('../../api/dashboard-templates', () => ({
  ...jest.requireActual('../../api/dashboard-templates'),
  copyDashboardTemplate: jest.fn(),
  setDefaultTemplate: jest.fn(),
  getUsersDashboards: jest.fn().mockResolvedValue([]),
}));

const mockedCopyDashboardTemplate = copyDashboardTemplate as jest.MockedFunction<typeof copyDashboardTemplate>;
const mockedSetDefaultTemplate = setDefaultTemplate as jest.MockedFunction<typeof setDefaultTemplate>;

const mockDashboard: DashboardTemplate = {
  id: 42,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  deletedAt: null,
  userIdentityID: 1,
  default: false,
  templateBase: { name: 'test', displayName: 'Test' },
  templateConfig: { sm: [], md: [], lg: [], xl: [] },
  dashboardName: 'Test Dashboard',
};

describe('useDuplicateDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state with isLoading false, error null, and isFormValid false', () => {
    const { result } = renderHook(() => useDuplicateDashboard());

    expect(result.current.name).toBe('');
    expect(result.current.selectedDashboardId).toBeNull();
    expect(result.current.setAsHomepage).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isFormValid).toBe(false);
    expect(typeof result.current.setName).toBe('function');
    expect(typeof result.current.setSelectedDashboardId).toBe('function');
    expect(typeof result.current.setSetAsHomepage).toBe('function');
    expect(typeof result.current.duplicateDashboard).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should update name when setName is called', () => {
    const { result } = renderHook(() => useDuplicateDashboard());

    act(() => {
      result.current.setName('My Dashboard');
    });

    expect(result.current.name).toBe('My Dashboard');
  });

  it('should update selectedDashboardId when setSelectedDashboardId is called', () => {
    const { result } = renderHook(() => useDuplicateDashboard());

    act(() => {
      result.current.setSelectedDashboardId(5);
    });

    expect(result.current.selectedDashboardId).toBe(5);
  });

  it('should update setAsHomepage when setSetAsHomepage is called', () => {
    const { result } = renderHook(() => useDuplicateDashboard());

    act(() => {
      result.current.setSetAsHomepage(true);
    });

    expect(result.current.setAsHomepage).toBe(true);
  });

  it('should set isFormValid to true when name is non-empty and selectedDashboardId is not null', () => {
    const { result } = renderHook(() => useDuplicateDashboard());

    act(() => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
    });

    expect(result.current.isFormValid).toBe(true);
  });

  it('should set isFormValid to false when name is whitespace only', () => {
    const { result } = renderHook(() => useDuplicateDashboard());

    act(() => {
      result.current.setName('   ');
      result.current.setSelectedDashboardId(1);
    });

    expect(result.current.isFormValid).toBe(false);
  });

  it('should return null and not call API when form is invalid', async () => {
    const { result } = renderHook(() => useDuplicateDashboard());

    let duplicateResult: DashboardTemplate | null = mockDashboard;
    await act(async () => {
      duplicateResult = await result.current.duplicateDashboard();
    });

    expect(duplicateResult).toBeNull();
    expect(mockedCopyDashboardTemplate).not.toHaveBeenCalled();
    expect(mockedSetDefaultTemplate).not.toHaveBeenCalled();
  });

  it('should call copyDashboardTemplate with correct args and return the new dashboard', async () => {
    mockedCopyDashboardTemplate.mockResolvedValue(mockDashboard);
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
    });

    let duplicateResult: DashboardTemplate | null = null;
    await act(async () => {
      duplicateResult = await result.current.duplicateDashboard();
    });

    expect(duplicateResult).toEqual(mockDashboard);
    expect(mockedCopyDashboardTemplate).toHaveBeenCalledWith(1, { dashboardName: 'My Copy' });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call setDefaultTemplate when setAsHomepage is true', async () => {
    mockedCopyDashboardTemplate.mockResolvedValue(mockDashboard);
    mockedSetDefaultTemplate.mockResolvedValue(mockDashboard);
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
      result.current.setSetAsHomepage(true);
    });

    await act(async () => {
      await result.current.duplicateDashboard();
    });

    expect(mockedSetDefaultTemplate).toHaveBeenCalledWith(42);
  });

  it('should not call setDefaultTemplate when setAsHomepage is false', async () => {
    mockedCopyDashboardTemplate.mockResolvedValue(mockDashboard);
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
    });

    await act(async () => {
      await result.current.duplicateDashboard();
    });

    expect(mockedSetDefaultTemplate).not.toHaveBeenCalled();
  });

  it('should set server error message when DashboardTemplatesError has status >= 500', async () => {
    mockedCopyDashboardTemplate.mockRejectedValue(new DashboardTemplatesError('Server error', 500, {} as Response));
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
    });

    let duplicateResult: DashboardTemplate | null = mockDashboard;
    await act(async () => {
      duplicateResult = await result.current.duplicateDashboard();
    });

    expect(duplicateResult).toBeNull();
    expect(result.current.error).toBe('The server is currently unavailable. Please try again later.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set generic failed message when DashboardTemplatesError has status < 500', async () => {
    mockedCopyDashboardTemplate.mockRejectedValue(new DashboardTemplatesError('Bad request', 400, {} as Response));
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
    });

    let duplicateResult: DashboardTemplate | null = mockDashboard;
    await act(async () => {
      duplicateResult = await result.current.duplicateDashboard();
    });

    expect(duplicateResult).toBeNull();
    expect(result.current.error).toBe('Failed to duplicate dashboard. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set network error message when TypeError is thrown', async () => {
    mockedCopyDashboardTemplate.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
    });

    let duplicateResult: DashboardTemplate | null = mockDashboard;
    await act(async () => {
      duplicateResult = await result.current.duplicateDashboard();
    });

    expect(duplicateResult).toBeNull();
    expect(result.current.error).toBe('Network error. Please check your connection and try again.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set unexpected error message when unknown error is thrown', async () => {
    mockedCopyDashboardTemplate.mockRejectedValue('something went wrong');
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
    });

    let duplicateResult: DashboardTemplate | null = mockDashboard;
    await act(async () => {
      duplicateResult = await result.current.duplicateDashboard();
    });

    expect(duplicateResult).toBeNull();
    expect(result.current.error).toBe('An unexpected error occurred. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should restore initial state when reset is called', async () => {
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
      result.current.setSetAsHomepage(true);
    });

    expect(result.current.name).toBe('My Copy');
    expect(result.current.selectedDashboardId).toBe(1);
    expect(result.current.setAsHomepage).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.name).toBe('');
    expect(result.current.selectedDashboardId).toBeNull();
    expect(result.current.setAsHomepage).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should clear previous error on a new successful call', async () => {
    mockedCopyDashboardTemplate.mockRejectedValueOnce(new DashboardTemplatesError('Bad request', 400, {} as Response));
    mockedCopyDashboardTemplate.mockResolvedValueOnce(mockDashboard);
    const { result } = renderHook(() => useDuplicateDashboard());

    await act(async () => {
      result.current.setName('My Copy');
      result.current.setSelectedDashboardId(1);
    });

    await act(async () => {
      await result.current.duplicateDashboard();
    });

    expect(result.current.error).toBe('Failed to duplicate dashboard. Please try again.');

    await act(async () => {
      await result.current.duplicateDashboard();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
