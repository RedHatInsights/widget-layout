import { PageSection } from '@patternfly/react-core';
import AddWidgetDrawer from '../../Components/WidgetDrawer/WidgetDrawer';
import GridLayout from '../../Components/DnDLayout/GridLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import { lockedLayoutAtom } from '../../state/lockedLayoutAtom';
import Header from '../../Components/Header/Header';
import React, { useEffect } from 'react';
import useCurrentUser from '../../hooks/useCurrentUser';
import { LayoutTypes, getWidgetMapping } from '../../api/dashboard-templates';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import '../../App.scss';

const DefaultRoute = (props: { layoutType?: LayoutTypes }) => {
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  const setWidgetMapping = useSetAtom(widgetMappingAtom);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const getWidgetMap = async () => {
      const mapping = await getWidgetMapping();
      if (mapping) {
        setWidgetMapping(mapping);
      }
    };
    getWidgetMap();
  }, [currentUser]);

  return (
    <div className="widgetLayout">
      <Header />
      <AddWidgetDrawer dismissible={false}>
        <PageSection className="widg-c-page__main-section--grid pf-v5-u-p-md pf-v5-u-p-lg-on-sm">
          <GridLayout isLayoutLocked={isLayoutLocked} {...props} />
        </PageSection>
      </AddWidgetDrawer>
    </div>
  );
};

export default DefaultRoute;
