import { useEffect } from 'react';
import { getUsersDashboards } from '../api/dashboard-templates';
import useCurrentUser from './useCurrentUser';
import { useAtom } from 'jotai';
import { dashboardsAtom } from '../state/dashboardsAtom';

const useGetDashboards = () => {
  const { currentUser } = useCurrentUser();
  const [dashboards, setDashboards] = useAtom(dashboardsAtom);

  const fetchDashboards = async () => {
    try {
      const userDashboards = await getUsersDashboards();
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
