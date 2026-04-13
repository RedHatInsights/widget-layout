import { useEffect } from 'react';
import { getUsersDashboards } from '../api/dashboard-templates';
import { useAtomValue, useSetAtom } from 'jotai';
import { dashboardsAtom } from '../state/dashboardsAtom';
import useCurrentUser from './useCurrentUser';

const useGetDashboards = () => {
  const { currentUser } = useCurrentUser();
  const dashboards = useAtomValue(dashboardsAtom);
  const setDashboards = useSetAtom(dashboardsAtom);

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
