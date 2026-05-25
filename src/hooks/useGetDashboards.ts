import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useApi } from './useApi';
import { dashboardsAtom } from '../state/dashboardsAtom';
import useCurrentUser from './useCurrentUser';

const useGetDashboards = () => {
  const { currentUser } = useCurrentUser();
  const [dashboards, setDashboards] = useAtom(dashboardsAtom);
  const api = useApi();

  const fetchDashboards = async () => {
    try {
      const userDashboards = await api.getUsersDashboards();
      setDashboards(userDashboards);
    } catch (error) {
      console.error('Error fetching user dashboards:', error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    fetchDashboards();
  }, [currentUser]);

  return { dashboards, fetchDashboards };
};

export default useGetDashboards;
