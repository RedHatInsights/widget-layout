import { PageSection } from '@patternfly/react-core';
import AddWidgetDrawer from '../../Components/WidgetDrawer/WidgetDrawer';
import GridLayout from '../../Components/DnDLayout/GridLayout';
import { useAtomValue, useSetAtom } from 'jotai';
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

const DefaultRoute = (props: { layoutType?: LayoutTypes }) => {
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();
  const { template, saveTemplate, isLoaded } = useDashboardConfig(props.layoutType);
  const resolveWidgetMapping = useSetAtom(resolvedWidgetMappingAtom);
  const { visibilityFunctions } = useChrome();

  useEffect(() => {
    if (visibilityFunctions) {
      resolveWidgetMapping(visibilityFunctions);
    }
  }, [visibilityFunctions]);

  return (
    <div className="widgetLayout">
      <Portal notifications={notifications} removeNotification={removeNotification} />
      <Header />
      <AddWidgetDrawer dismissible={false}>
        <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--grid 6-u-p-md-on-sm">
          <GridLayout template={template} saveTemplate={saveTemplate} isLoaded={isLoaded} isLayoutLocked={isLayoutLocked} />
        </PageSection>
      </AddWidgetDrawer>
    </div>
  );
};

export default DefaultRoute;
