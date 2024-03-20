import { PageSection } from '@patternfly/react-core';
import AddWidgetDrawer from '../../Components/WidgetDrawer/WidgetDrawer';
import GridLayout from '../../Components/DnDLayout/GridLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import { lockedLayoutAtom } from '../../state/lockedLayoutAtom';
import Header from '../../Components/Header/Header';
import React, { useEffect } from 'react';
import useCurrentUser from '../../hooks/useCurrentUser';
import { getWidgetMapping } from '../../api/dashboard-templates';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';

const DefaultRoute = () => {
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  const setWidgetMapping = useSetAtom(widgetMappingAtom);
  const { currentToken } = useCurrentUser();

  useEffect(() => {
    if (!currentToken) {
      return;
    }
    const getWidgetMap = async () => {
      const mapping = await getWidgetMapping(currentToken);
      if (mapping) {
        setWidgetMapping(mapping);
      }
    };
    getWidgetMap();
  }, [currentToken]);

  return (
    <>
      <Header />
      <AddWidgetDrawer dismissible={false}>
        <PageSection className="pf-v5-u-p-xs pf-v5-u-p-md-on-sm">
          <GridLayout isLayoutLocked={isLayoutLocked} />
        </PageSection>
      </AddWidgetDrawer>
    </>
  );
};

export default DefaultRoute;
