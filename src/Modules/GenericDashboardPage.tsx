import { PageSection } from '@patternfly/react-core';
import React, { useEffect } from 'react';
import GridLayout from '../Components/DnDLayout/GridLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import { lockedLayoutAtom } from '../state/lockedLayoutAtom';
import { useParams } from 'react-router-dom';
import useDashboardTemplate from '../hooks/useDashboardTemplate';
import AddWidgetDrawer from '../Components/WidgetDrawer/WidgetDrawer';
import { getWidgetMapping } from '../api/dashboard-templates';
import useCurrentUser from '../hooks/useCurrentUser';
import { widgetMappingAtom } from '../state/widgetMappingAtom';

const GenericDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  const { template, saveTemplate, isLoaded } = useDashboardTemplate(Number(id));

  const setWidgetMapping = useSetAtom(widgetMappingAtom);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const getWidgetMap = async () => {
      const mapping = await getWidgetMapping();

      if (mapping) {
        const checkedMapping = await Object.entries(mapping).reduce(async (acc, [key, value]) => {
          const resolvedAcc = await acc;
          const widgetConfig = value.config;
          // const hasPermissions = widgetConfig && widgetConfig.permissions ? await checkPermissions(widgetConfig.permissions) : true;
          // if (hasPermissions) {
          resolvedAcc[key] = value;
          // }
          return acc;
        }, Promise.resolve({} as Record<string, (typeof mapping)[string]>));

        setWidgetMapping(checkedMapping);
      }
    };

    getWidgetMap();
  }, [currentUser]);

  return (
    <div className="genericDashboardPage">
      <div>
        <span>Hello, this is generic page</span>
        <AddWidgetDrawer dismissible={false}>
          <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--grid 6-u-p-md-on-sm">
            <GridLayout template={template} saveTemplate={saveTemplate} isLoaded={isLoaded} />
          </PageSection>
        </AddWidgetDrawer>
      </div>
    </div>
  );
};

export default GenericDashboardPage;
