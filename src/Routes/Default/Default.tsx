import { PageSection } from '@patternfly/react-core';
import AddWidgetDrawer from '../../Components/WidgetDrawer/WidgetDrawer';
import GridLayout from '../../Components/DnDLayout/GridLayout';
import { Provider, useAtomValue, useSetAtom } from 'jotai';
import { useFlag } from '@unleash/proxy-client-react';
import { backendFlagAtom, store } from '../../state/store';
import { lockedLayoutAtom } from '../../state/lockedLayoutAtom';
import { notificationsAtom, useRemoveNotification } from '../../state/notificationsAtom';
import Header from '../../Components/Header/Header';
import React, { useEffect } from 'react';
import useDashboardConfig from '../../hooks/useDashboardConfig';
import { LayoutTypes } from '../../api/dashboard-templates';
import '../../App.scss';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { resolvedWidgetMappingAtom } from '../../state/widgetMappingAtom';

const DefaultRouteInner = (props: { layoutType: LayoutTypes }) => {
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();
  const { template, saveTemplate, isLoaded, layoutRef } = useDashboardConfig(props.layoutType);
  const resolveWidgetMapping = useSetAtom(resolvedWidgetMappingAtom);
  const { visibilityFunctions } = useChrome();
  const setBackendFlag = useSetAtom(backendFlagAtom);
  const isNewBackend = useFlag('platform.widget-layout.new-backend');

  useEffect(() => {
    setBackendFlag(isNewBackend);
  }, [isNewBackend]);

  useEffect(() => {
    if (visibilityFunctions) {
      resolveWidgetMapping(visibilityFunctions);
    }
  }, [visibilityFunctions]);

  return (
    <div className="widgetLayout">
      <Portal notifications={notifications} removeNotification={removeNotification} />
      <Header layoutType={props.layoutType} />
      <AddWidgetDrawer dismissible={false}>
        <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--grid 6-u-p-md-on-sm">
          <GridLayout template={template} saveTemplate={saveTemplate} isLoaded={isLoaded} isLayoutLocked={isLayoutLocked} layoutRef={layoutRef} />
        </PageSection>
      </AddWidgetDrawer>
    </div>
  );
};

const DefaultRoute = (props: { layoutType: LayoutTypes }) => (
  <Provider store={store}>
    <DefaultRouteInner {...props} />
  </Provider>
);

export default DefaultRoute;
