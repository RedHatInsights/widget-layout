import '../Header/Header.scss';

import { ActionList, ActionListItem, Button, Flex, FlexItem, TextInput } from '@patternfly/react-core';
import PageHeader from '@patternfly/react-component-groups/dist/dynamic/PageHeader';
import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { CheckIcon, PencilAltIcon, PlusCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { useAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { DashboardTemplate } from '../../api/dashboard-templates';
import GenericHeaderDropdown from './GenericHeaderDropdown';
import { useAddNotification } from '../../state/notificationsAtom';

interface GenericHeaderProps {
  dashboard?: DashboardTemplate;
  onRenameDashboard?: (dashboardName: string) => Promise<unknown>;
}

const messages = defineMessages({
  dashboardNameAria: {
    id: 'widgetLayout.genericHeader.dashboardNameAria',
    description: 'Dashboard name input aria label',
    defaultMessage: 'Dashboard name',
  },
  confirmNameAria: {
    id: 'widgetLayout.genericHeader.confirmNameAria',
    description: 'Confirm name button aria label',
    defaultMessage: 'Confirm name',
  },
  cancelEditingAria: {
    id: 'widgetLayout.genericHeader.cancelEditingAria',
    description: 'Cancel editing button aria label',
    defaultMessage: 'Cancel editing',
  },
  editNameAria: {
    id: 'widgetLayout.genericHeader.editNameAria',
    description: 'Edit dashboard name button aria label',
    defaultMessage: 'Edit dashboard name',
  },
  addWidgets: {
    id: 'widgetLayout.genericHeader.addWidgets',
    description: 'Add widgets button label',
    defaultMessage: 'Add widgets',
  },
  closeWidgetPanel: {
    id: 'widgetLayout.genericHeader.closeWidgetPanel',
    description: 'Close widget panel button label',
    defaultMessage: 'Close widget panel',
  },
  renameFailed: {
    id: 'widgetLayout.genericHeader.renameFailed',
    description: 'Dashboard rename failure notification',
    defaultMessage: 'Failed to rename dashboard',
  },
});

const GenericHeader = ({ dashboard, onRenameDashboard }: GenericHeaderProps) => {
  const intl = useIntl();
  const [isDrawerExpanded, toggleOpen] = useAtom(drawerExpandedAtom);
  const addNotification = useAddNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');

  const handleConfirm = async () => {
    const trimmed = editedName.trim();
    if (trimmed && dashboard) {
      try {
        await onRenameDashboard?.(trimmed);
        setIsEditing(false);
      } catch {
        addNotification({
          variant: 'danger',
          title: intl.formatMessage(messages.renameFailed),
        });

        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
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
          aria-label={intl.formatMessage(messages.dashboardNameAria)}
          autoFocus
        />
      </FlexItem>
      <FlexItem>
        <Button variant="plain" aria-label={intl.formatMessage(messages.confirmNameAria)} onClick={handleConfirm} icon={<CheckIcon />} />
      </FlexItem>
      <FlexItem>
        <Button variant="plain" aria-label={intl.formatMessage(messages.cancelEditingAria)} onClick={handleCancel} icon={<TimesIcon />} />
      </FlexItem>
    </Flex>
  ) : dashboard ? (
    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
      <FlexItem>{dashboard.dashboardName}</FlexItem>
      <FlexItem>
        <Button
          variant="plain"
          aria-label={intl.formatMessage(messages.editNameAria)}
          onClick={() => {
            setEditedName(dashboard.dashboardName);
            setIsEditing(true);
          }}
          icon={<PencilAltIcon />}
        />
      </FlexItem>
    </Flex>
  ) : undefined;

  return (
    <PageHeader
      ouiaId="Dashboard-hub-title-generic-page"
      title={titleContent}
      actionMenu={
        <ActionList>
          <ActionListItem>
            <Button
              onClick={() => toggleOpen((prev) => !prev)}
              variant="secondary"
              icon={isDrawerExpanded ? <TimesIcon /> : <PlusCircleIcon />}
              ouiaId="add-widget-button"
            >
              {isDrawerExpanded ? <FormattedMessage {...messages.closeWidgetPanel} /> : <FormattedMessage {...messages.addWidgets} />}
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
