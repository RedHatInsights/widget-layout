import React from 'react';
import Header from '../Components/DashboardHub/Header/Header';
import DashboardTable from '../Components/DashboardHub/DashboardTable/DashboardTable';
import { PageSection } from '@patternfly/react-core';
import useGetDashboards from '../hooks/useGetDashboards';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';
import { useAtomValue } from 'jotai';
import { notificationsAtom, useRemoveNotification } from '../state/notificationsAtom';

const DashboardHub = () => {
  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();
  const { dashboards, fetchDashboards } = useGetDashboards();

  return (
    <div className="dashboardHub">
      <Portal notifications={notifications} removeNotification={removeNotification} />
      <Header onRefetchDashboards={fetchDashboards} />
      <PageSection>
        <DashboardTable dashboards={dashboards} onRefetchDashboards={fetchDashboards} />
      </PageSection>
    </div>
  );
};

export default DashboardHub;
