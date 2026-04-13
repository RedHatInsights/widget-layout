import '../Header/Header.scss';

import { ActionList, ActionListItem, Button, Flex, FlexItem, TextInput } from '@patternfly/react-core';
import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import React, { useState } from 'react';
import { CheckIcon, PencilAltIcon, PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { useSetAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { DashboardTemplate } from '../../api/dashboard-templates';
import GenericHeaderDropdown from './GenericHeaderDropdown';

interface GenericHeaderProps {
  dashboard?: DashboardTemplate;
  onRenameDashboard: (dashboardName: string) => Promise<unknown>;
}

const GenericHeader = ({ dashboard, onRenameDashboard }: GenericHeaderProps) => {
  const toggleOpen = useSetAtom(drawerExpandedAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(dashboard?.dashboardName ?? '');

  const handleConfirm = async () => {
    if (editedName.trim() && dashboard) {
      await onRenameDashboard(editedName.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(dashboard?.dashboardName ?? '');
    setIsEditing(false);
  };

  const titleContent = isEditing ? (
    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>
        <TextInput
          value={editedName}
          onChange={(_event, value) => setEditedName(value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleConfirm();
            if (event.key === 'Escape') handleCancel();
          }}
          aria-label="Dashboard name"
          autoFocus
        />
      </FlexItem>
      <FlexItem>
        <Button variant="plain" aria-label="Confirm name" onClick={handleConfirm} icon={<CheckIcon />} />
      </FlexItem>
      <FlexItem>
        <Button variant="plain" aria-label="Cancel editing" onClick={handleCancel} icon={<TimesIcon />} />
      </FlexItem>
    </Flex>
  ) : (
    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>{dashboard?.dashboardName}</FlexItem>
      {dashboard && (
        <FlexItem>
          <Button
            variant="plain"
            aria-label="Edit dashboard name"
            onClick={() => {
              setEditedName(dashboard.dashboardName);
              setIsEditing(true);
            }}
            icon={<PencilAltIcon />}
          />
        </FlexItem>
      )}
    </Flex>
  );

  return (
    <PageHeader
      title={titleContent}
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
