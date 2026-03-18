import React, { useEffect, useState } from 'react';
import Header from '../Components/DashboardHub/Header/Header';
import DashboardTable from '../Components/DashboardHub/DashboardTable/DashboardTable';
import { PageSection } from '@patternfly/react-core';
import useCurrentUser from '../hooks/useCurrentUser';
import { DashboardTemplate, getUsersDashboards } from '../api/dashboard-templates';

const DashboardHub = () => {
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

  return (
    <div className="dashboardHub">
      <Header onRefetchDashboards={fetchDashboards} />
      <PageSection>
        <DashboardTable dashboards={dashboards} onRefetchDashboards={fetchDashboards} />
      </PageSection>
    </div>
  );
};

export default DashboardHub;
