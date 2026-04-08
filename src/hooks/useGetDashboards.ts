import { useEffect, useState } from 'react';
import { DashboardTemplate, getUsersDashboards } from '../api/dashboard-templates';
import useCurrentUser from './useCurrentUser';

const useGetDashboards = () => {
  const { currentUser } = useCurrentUser();
  const [dashboards, setDashboards] = useState<DashboardTemplate[]>([]);

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
