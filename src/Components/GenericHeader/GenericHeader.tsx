import '../Header/Header.scss';

import { ActionList, ActionListItem, Button } from '@patternfly/react-core';
import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import React from 'react';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useSetAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { DashboardTemplate } from '../../api/dashboard-templates';
import GenericHeaderDropdown from './GenericHeaderDropdown';

interface GenericHeaderProps {
  dashboard?: DashboardTemplate;
}

const GenericHeader = ({ dashboard }: GenericHeaderProps) => {
  const toggleOpen = useSetAtom(drawerExpandedAtom);

  return (
    <PageHeader
      title={dashboard?.dashboardName}
      actionMenu={
        <ActionList>
          <ActionListItem>
            <Button onClick={() => toggleOpen((prev) => !prev)} variant="secondary" icon={<PlusCircleIcon />} ouiaId="add-widget-button">
              Add widgets
            </Button>
          </ActionListItem>
          {dashboard && (
            <ActionListItem>
              <GenericHeaderDropdown dashboard={dashboard} />
            </ActionListItem>
          )}
        </ActionList>
      }
    />
  );
};

export default GenericHeader;
