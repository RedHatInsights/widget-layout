import { PageSection } from '@patternfly/react-core';
import React from 'react';
import GridLayout from '../Components/DnDLayout/GridLayout';
import { useAtomValue } from 'jotai';
import { lockedLayoutAtom } from '../state/lockedLayoutAtom';
import { useParams } from 'react-router-dom';
import useDashboardTemplate from '../hooks/useDashboardTemplate';
import AddWidgetDrawer from '../Components/WidgetDrawer/WidgetDrawer';
import Header from '../Components/Header/Header';
import useWidgetMapping from '../hooks/useWidgetMapping';

const GenericDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  const { template, saveTemplate, isLoaded, dashboardName } = useDashboardTemplate(Number(id));

  useWidgetMapping();

  return (
    <div className="genericDashboardPage">
      <Header dashboardName={dashboardName} />
      <AddWidgetDrawer dismissible={false}>
        <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--grid 6-u-p-md-on-sm">
          <GridLayout template={template} saveTemplate={saveTemplate} isLoaded={isLoaded} />
        </PageSection>
      </AddWidgetDrawer>
    </div>
  );
};

export default GenericDashboardPage;
