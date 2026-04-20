import { act, renderHook } from '@testing-library/react';
import useGetDashboards from '../useGetDashboards';
import { DashboardTemplate, getUsersDashboards } from '../../api/dashboard-templates';

jest.mock('../../api/dashboard-templates', () => ({
  getUsersDashboards: jest.fn(),
}));

jest.mock('../useCurrentUser', () => ({
  __esModule: true,
  default: jest.fn(),
}));

let mockAtomValue: DashboardTemplate[] = [];
const mockSetAtom = jest.fn((val: DashboardTemplate[]) => {
  mockAtomValue = val;
});

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtom: () => [mockAtomValue, mockSetAtom],
  useAtomValue: () => mockAtomValue,
  useSetAtom: () => mockSetAtom,
}));

import useCurrentUser from '../useCurrentUser';

const mockedGetUsersDashboards = getUsersDashboards as jest.MockedFunction<typeof getUsersDashboards>;
const mockedUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>;

const mockDashboards: DashboardTemplate[] = [
  {
    id: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    deletedAt: null,
    userIdentityID: 1,
    default: true,
    templateBase: {
      name: 'dashboard-1',
      displayName: 'Dashboard 1',
    },
  } as DashboardTemplate,
  {
    id: 2,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
    deletedAt: null,
    userIdentityID: 1,
    default: false,
    templateBase: {
      name: 'dashboard-2',
      displayName: 'Dashboard 2',
    },
  } as DashboardTemplate,
];

describe('useGetDashboards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAtomValue = [];
  });

  it('should return initial empty dashboards array', () => {
    mockedUseCurrentUser.mockReturnValue({ currentUser: undefined, isLoaded: false });

    const { result } = renderHook(() => useGetDashboards());

    expect(result.current.dashboards).toEqual([]);
    expect(typeof result.current.fetchDashboards).toBe('function');
  });

  it('should not fetch dashboards when currentUser is not available', () => {
    mockedUseCurrentUser.mockReturnValue({ currentUser: undefined, isLoaded: false });

    renderHook(() => useGetDashboards());

    expect(mockedGetUsersDashboards).not.toHaveBeenCalled();
  });

  it('should fetch dashboards when currentUser is available', async () => {
    mockedUseCurrentUser.mockReturnValue({
      currentUser: { username: 'test-user' } as ReturnType<typeof useCurrentUser>['currentUser'],
      isLoaded: true,
    });
    mockedGetUsersDashboards.mockResolvedValue(mockDashboards);

    renderHook(() => useGetDashboards());

    await act(async () => {
      // wait for useEffect to resolve
    });

    expect(mockedGetUsersDashboards).toHaveBeenCalledTimes(1);
    expect(mockSetAtom).toHaveBeenCalledWith(mockDashboards);
  });

  it('should handle API error and keep dashboards empty', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockedUseCurrentUser.mockReturnValue({
      currentUser: { username: 'test-user' } as ReturnType<typeof useCurrentUser>['currentUser'],
      isLoaded: true,
    });
    mockedGetUsersDashboards.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGetDashboards());

    await act(async () => {
      // wait for useEffect to resolve
    });

    expect(result.current.dashboards).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching user dashboards:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('should allow manual refetch via fetchDashboards', async () => {
    mockedUseCurrentUser.mockReturnValue({ currentUser: undefined, isLoaded: false });
    mockedGetUsersDashboards.mockResolvedValue(mockDashboards);

    const { result } = renderHook(() => useGetDashboards());

    expect(result.current.dashboards).toEqual([]);

    await act(async () => {
      await result.current.fetchDashboards();
    });

    expect(mockedGetUsersDashboards).toHaveBeenCalledTimes(1);
    expect(mockSetAtom).toHaveBeenCalledWith(mockDashboards);
  });
});
