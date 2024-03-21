import { PageSection } from '@patternfly/react-core';
import AddWidgetDrawer from '../../Components/WidgetDrawer/WidgetDrawer';
import GridLayout from '../../Components/DnDLayout/GridLayout';
import { useAtomValue } from 'jotai';
import { lockedLayoutAtom } from '../../state/lockedLayoutAtom';
import Header from '../../Components/Header/Header';
import React from 'react';

const DefaultRoute = () => {
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  return (
    <>
      <Header />
      <AddWidgetDrawer dismissible={false}>
        <PageSection className="pf-v5-u-p-md pf-v5-u-p-lg-on-sm">
          <GridLayout isLayoutLocked={isLayoutLocked} />
        </PageSection>
      </AddWidgetDrawer>
    </>
  );
};

export default DefaultRoute;
