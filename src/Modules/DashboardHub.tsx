import React, { useEffect, useState } from 'react';
import Header from '../Components/DashboardHub/Header/Header';
import DashboardTable from '../Components/DashboardHub/DashboardTable/DashboardTable';
import { PageSection } from '@patternfly/react-core';
import useCurrentUser from '../hooks/useCurrentUser';
import { DashboardTemplate, getUsersDashboards } from '../api/dashboard-templates';

const DashboardHub = () => {
  const { currentUser } = useCurrentUser();
  const [dashboards, setDashboards] = useState<DashboardTemplate[]>([]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchDashboards = async () => {
      try {
        const userDashboards = await getUsersDashboards();
        setDashboards(userDashboards);
      } catch (error) {
        console.error('Error fetching user dashboards:', error);
      }
    };

    fetchDashboards();
  }, [currentUser]);

  return (
    <div className="dashboardHub">
      <Header />
      <PageSection>
        <DashboardTable dashboards={dashboards} />
      </PageSection>
    </div>
  );
};

export default DashboardHub;
