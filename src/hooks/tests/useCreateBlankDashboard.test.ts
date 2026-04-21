import { act, renderHook } from '@testing-library/react';
import { useCreateBlankDashboard } from '../useCreateBlankDashboard';
import { DashboardTemplatesError, importDashboardTemplate, setDefaultTemplate } from '../../api/dashboard-templates';

jest.mock('../../api/dashboard-templates', () => ({
  ...jest.requireActual('../../api/dashboard-templates'),
  importDashboardTemplate: jest.fn(),
  setDefaultTemplate: jest.fn(),
  getUsersDashboards: jest.fn().mockResolvedValue([]),
}));

const mockedImportDashboardTemplate = importDashboardTemplate as jest.MockedFunction<typeof importDashboardTemplate>;
const mockedSetDefaultTemplate = setDefaultTemplate as jest.MockedFunction<typeof setDefaultTemplate>;

const mockDashboardTemplate = {
  id: 42,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  deletedAt: null,
  userIdentityID: 1,
  default: false,
  templateBase: { name: 'landingPage', displayName: 'Landing Page' },
  templateConfig: { sm: [], md: [], lg: [], xl: [] },
  dashboardName: 'My Dashboard',
};

describe('useCreateBlankDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useCreateBlankDashboard());

    expect(result.current.name).toBe('');
    expect(result.current.setAsHomepage).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isFormValid).toBe(false);
  });

  it('should update name and set isFormValid to true', () => {
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('New Dashboard');
    });

    expect(result.current.name).toBe('New Dashboard');
    expect(result.current.isFormValid).toBe(true);
  });

  it('should keep isFormValid false for whitespace-only names', () => {
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('   ');
    });

    expect(result.current.name).toBe('   ');
    expect(result.current.isFormValid).toBe(false);
  });

  it('should update setAsHomepage flag', () => {
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setSetAsHomepage(true);
    });

    expect(result.current.setAsHomepage).toBe(true);
  });

  it('should reset state to initial values', () => {
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('Test');
      result.current.setSetAsHomepage(true);
    });

    expect(result.current.name).toBe('Test');
    expect(result.current.setAsHomepage).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.name).toBe('');
    expect(result.current.setAsHomepage).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isFormValid).toBe(false);
  });

  it('should return null when form is invalid', async () => {
    const { result } = renderHook(() => useCreateBlankDashboard());

    let createResult: unknown;
    await act(async () => {
      createResult = await result.current.createDashboard();
    });

    expect(createResult).toBeNull();
    expect(mockedImportDashboardTemplate).not.toHaveBeenCalled();
  });

  it('should call importDashboardTemplate with correct args on success', async () => {
    mockedImportDashboardTemplate.mockResolvedValue(mockDashboardTemplate);
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('My Dashboard');
    });

    let createResult: unknown;
    await act(async () => {
      createResult = await result.current.createDashboard();
    });

    expect(mockedImportDashboardTemplate).toHaveBeenCalledWith({
      dashboardName: 'My Dashboard',
      templateBase: { name: 'landingPage', displayName: 'Landing Page' },
      templateConfig: { sm: [], md: [], lg: [], xl: [] },
    });
    expect(createResult).toEqual(mockDashboardTemplate);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call setDefaultTemplate when setAsHomepage is true', async () => {
    mockedImportDashboardTemplate.mockResolvedValue(mockDashboardTemplate);
    mockedSetDefaultTemplate.mockResolvedValue(mockDashboardTemplate);
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('My Dashboard');
      result.current.setSetAsHomepage(true);
    });

    await act(async () => {
      await result.current.createDashboard();
    });

    expect(mockedSetDefaultTemplate).toHaveBeenCalledWith(42);
  });

  it('should NOT call setDefaultTemplate when setAsHomepage is false', async () => {
    mockedImportDashboardTemplate.mockResolvedValue(mockDashboardTemplate);
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('My Dashboard');
    });

    await act(async () => {
      await result.current.createDashboard();
    });

    expect(mockedSetDefaultTemplate).not.toHaveBeenCalled();
  });

  it('should set server error message when DashboardTemplatesError has status >= 500', async () => {
    const serverError = new DashboardTemplatesError('Internal Server Error', 500, {} as Response);
    mockedImportDashboardTemplate.mockRejectedValue(serverError);
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('My Dashboard');
    });

    let createResult: unknown;
    await act(async () => {
      createResult = await result.current.createDashboard();
    });

    expect(createResult).toBeNull();
    expect(result.current.error).toBe('The server is currently unavailable. Please try again later.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set generic error message when DashboardTemplatesError has status < 500', async () => {
    const clientError = new DashboardTemplatesError('Bad Request', 400, {} as Response);
    mockedImportDashboardTemplate.mockRejectedValue(clientError);
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('My Dashboard');
    });

    let createResult: unknown;
    await act(async () => {
      createResult = await result.current.createDashboard();
    });

    expect(createResult).toBeNull();
    expect(result.current.error).toBe('Failed to create dashboard. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set network error message when TypeError is thrown', async () => {
    mockedImportDashboardTemplate.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('My Dashboard');
    });

    let createResult: unknown;
    await act(async () => {
      createResult = await result.current.createDashboard();
    });

    expect(createResult).toBeNull();
    expect(result.current.error).toBe('Network error. Please check your connection and try again.');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set unexpected error message for unknown errors', async () => {
    mockedImportDashboardTemplate.mockRejectedValue('something unexpected');
    const { result } = renderHook(() => useCreateBlankDashboard());

    act(() => {
      result.current.setName('My Dashboard');
    });

    let createResult: unknown;
    await act(async () => {
      createResult = await result.current.createDashboard();
    });

    expect(createResult).toBeNull();
    expect(result.current.error).toBe('An unexpected error occurred. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });
});
