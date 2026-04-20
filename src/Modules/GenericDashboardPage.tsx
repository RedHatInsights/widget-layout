import { PageSection } from '@patternfly/react-core';
import React, { useEffect, useRef } from 'react';
import GridLayout from '../Components/DnDLayout/GridLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import { lockedLayoutAtom } from '../state/lockedLayoutAtom';
import { useParams } from 'react-router-dom';
import useDashboardTemplate from '../hooks/useDashboardTemplate';
import AddWidgetDrawer from '../Components/WidgetDrawer/WidgetDrawer';
import GenericHeader from '../Components/GenericHeader/GenericHeader';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { resolvedWidgetMappingAtom } from '../state/widgetMappingAtom';
import { notificationsAtom, useRemoveNotification } from '../state/notificationsAtom';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';

const GenericDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  const { template, saveTemplate, renameDashboard, isLoaded, dashboard } = useDashboardTemplate(Number(id));
  const resolveWidgetMapping = useSetAtom(resolvedWidgetMappingAtom);
  const { visibilityFunctions } = useChrome();
  const layoutRef = useRef<HTMLDivElement>(null);

  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();

  useEffect(() => {
    if (visibilityFunctions) {
      resolveWidgetMapping(visibilityFunctions);
    }
  }, [visibilityFunctions]);

  return (
    <div className="genericDashboardPage">
      <Portal notifications={notifications} removeNotification={removeNotification} />
      <GenericHeader dashboard={dashboard} onRenameDashboard={renameDashboard} />
      <AddWidgetDrawer dismissible={false}>
        <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--grid 6-u-p-md-on-sm">
          <GridLayout template={template} saveTemplate={saveTemplate} isLoaded={isLoaded} layoutRef={layoutRef} />
        </PageSection>
      </AddWidgetDrawer>
    </div>
  );
};

export default GenericDashboardPage;
