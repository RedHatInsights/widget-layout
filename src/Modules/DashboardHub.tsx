import React, { useEffect } from 'react';
import Header from '../Components/DashboardHub/Header/Header';
import DashboardTable from '../Components/DashboardHub/DashboardTable/DashboardTable';
import { PageSection } from '@patternfly/react-core';
import useGetDashboards from '../hooks/useGetDashboards';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';
import { Provider, useAtomValue, useSetAtom } from 'jotai';
import { useFlag } from '@unleash/proxy-client-react';
import { notificationsAtom, useRemoveNotification } from '../state/notificationsAtom';
import { Route, Routes } from 'react-router-dom';
import GenericDashboardPage from './GenericDashboardPage';
import { backendFlagAtom, store } from '../state/store';

const DashboardHubInner = () => {
  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();
  const { dashboards, fetchDashboards } = useGetDashboards();
  const setBackendFlag = useSetAtom(backendFlagAtom);
  const isNewBackend = useFlag('platform.widget-layout.new-backend');

  useEffect(() => {
    setBackendFlag(isNewBackend);
  }, [isNewBackend]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="dashboardHub">
            <Portal notifications={notifications} removeNotification={removeNotification} />
            <Header onRefetchDashboards={fetchDashboards} />
            <PageSection>
              <DashboardTable dashboards={dashboards} onRefetchDashboards={fetchDashboards} />
            </PageSection>
          </div>
        }
      />

      <Route path="/:id" element={<GenericDashboardPage />} />
    </Routes>
  );
};

const DashboardHub = () => (
  <Provider store={store}>
    <DashboardHubInner />
  </Provider>
);

export default DashboardHub;
