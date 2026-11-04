import { Divider, Dropdown, DropdownItem, DropdownList, MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import React, { Ref, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { CodeIcon, CopyIcon, EllipsisVIcon, HomeIcon, TrashIcon } from '@patternfly/react-icons';
import { useAtomValue, useSetAtom } from 'jotai';
import { DashboardTemplate } from '../../api/dashboard-templates';
import { dashboardsAtom, setDefaultDashboardAtom } from '../../state/dashboardsAtom';
import { useExportDashboard } from '../../hooks/useExportDashboard';
import { useDeleteDashboard } from '../../hooks/useDeleteDashboard';
import { DeleteDashboardModal } from '../DashboardHub/DeleteDashboardModal/DeleteDashboardModal';
import { DuplicateModal } from '../DuplicateModal/DuplicateModal';
import { useAddNotification } from '../../state/notificationsAtom';
import { useNavigate } from 'react-router-dom';

const messages = defineMessages({
  kebabToggleAria: {
    id: 'widgetLayout.genericDropdown.kebabToggleAria',
    description: 'Kebab dropdown toggle aria label',
    defaultMessage: 'kebab dropdown toggle',
  },
  alreadyHomepage: {
    id: 'widgetLayout.genericDropdown.alreadyHomepage',
    description: 'Tooltip when the dashboard is already the homepage',
    defaultMessage: 'This dashboard is already set as your homepage',
  },
  setAsHomepage: {
    id: 'widgetLayout.genericDropdown.setAsHomepage',
    description: 'Set as homepage menu item',
    defaultMessage: 'Set as homepage',
  },
  duplicateDashboard: {
    id: 'widgetLayout.genericDropdown.duplicateDashboard',
    description: 'Duplicate dashboard menu item',
    defaultMessage: 'Duplicate dashboard',
  },
  copyConfiguration: {
    id: 'widgetLayout.genericDropdown.copyConfiguration',
    description: 'Copy configuration string menu item',
    defaultMessage: 'Copy configuration string',
  },
  deleteDashboard: {
    id: 'widgetLayout.genericDropdown.deleteDashboard',
    description: 'Delete dashboard menu item',
    defaultMessage: 'Delete dashboard',
  },
  setAsHomepageSuccess: {
    id: 'widgetLayout.genericDropdown.setAsHomepageSuccess',
    description: 'Dashboard set as homepage notification',
    defaultMessage: "''{name}'' has been set as homepage",
  },
  setAsHomepageFailed: {
    id: 'widgetLayout.genericDropdown.setAsHomepageFailed',
    description: 'Dashboard set as homepage failure notification',
    defaultMessage: "Failed to set ''{name}'' as homepage",
  },
  copiedToClipboard: {
    id: 'widgetLayout.genericDropdown.copiedToClipboard',
    description: 'Dashboard copied to clipboard notification',
    defaultMessage: "''{name}'' has been copied to clipboard",
  },
  copyFailed: {
    id: 'widgetLayout.genericDropdown.copyFailed',
    description: 'Dashboard copy to clipboard failure notification',
    defaultMessage: "Failed to copy ''{name}'' to clipboard",
  },
  deletedNotification: {
    id: 'widgetLayout.genericDropdown.deletedNotification',
    description: 'Dashboard deleted notification',
    defaultMessage: "''{name}'' has been deleted and removed from Dashboard Hub",
  },
});

interface GenericHeaderDropdownProps {
  dashboard: DashboardTemplate;
}

const GenericHeaderDropdown = ({ dashboard }: GenericHeaderDropdownProps) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const dashboards = useAtomValue(dashboardsAtom);
  const isHomepage = dashboards.find((d) => d.id === dashboard.id)?.default ?? dashboard.default;
  const { exportDashboard } = useExportDashboard();
  const { deleteDashboard, isLoading: isDeleting } = useDeleteDashboard();
  const addNotification = useAddNotification();
  const navigate = useNavigate();

  const setDefaultDashboard = useSetAtom(setDefaultDashboardAtom);

  const handleSetAsHomepage = async () => {
    try {
      await setDefaultDashboard(dashboard.id);
      addNotification({
        variant: 'success',
        title: intl.formatMessage(messages.setAsHomepageSuccess, { name: dashboard.dashboardName }),
      });
    } catch (err) {
      addNotification({
        variant: 'danger',
        title: intl.formatMessage(messages.setAsHomepageFailed, { name: dashboard.dashboardName }),
      });
    }
    setIsOpen(false);
  };

  const handleCopyConfiguration = async () => {
    const result = await exportDashboard(dashboard.id);
    if (result) {
      try {
        const configString = JSON.stringify(result, null, 2);
        await navigator.clipboard.writeText(configString);
        addNotification({
          variant: 'success',
          title: intl.formatMessage(messages.copiedToClipboard, { name: dashboard.dashboardName }),
        });
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        addNotification({
          variant: 'danger',
          title: intl.formatMessage(messages.copyFailed, { name: dashboard.dashboardName }),
        });
      }
    }
    setIsOpen(false);
  };

  const handleDuplicate = () => {
    setIsOpen(false);
    setIsDuplicateModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteDashboard(dashboard.id);
    setIsDeleteModalOpen(false);
    addNotification({
      variant: 'danger',
      title: intl.formatMessage(messages.deletedNotification, { name: dashboard.dashboardName }),
    });
    navigate('/dashboard-hub');
  };

  return (
    <>
      <Dropdown
        popperProps={{ position: 'end' }}
        toggle={(toggleRef: Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            aria-label={intl.formatMessage(messages.kebabToggleAria)}
            variant="plain"
            onClick={() => setIsOpen(!isOpen)}
            isExpanded={isOpen}
            icon={<EllipsisVIcon />}
          />
        )}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <DropdownList>
          <DropdownItem
            icon={<HomeIcon />}
            isAriaDisabled={isHomepage}
            onClick={handleSetAsHomepage}
            tooltipProps={isHomepage ? { content: intl.formatMessage(messages.alreadyHomepage) } : undefined}
          >
            <FormattedMessage {...messages.setAsHomepage} />
          </DropdownItem>
          <DropdownItem icon={<CopyIcon />} onClick={handleDuplicate}>
            <FormattedMessage {...messages.duplicateDashboard} />
          </DropdownItem>
          <DropdownItem icon={<CodeIcon />} onClick={handleCopyConfiguration}>
            <FormattedMessage {...messages.copyConfiguration} />
          </DropdownItem>
          <Divider />
          <DropdownItem
            icon={<TrashIcon />}
            onClick={() => {
              setIsOpen(false);
              setIsDeleteModalOpen(true);
            }}
          >
            <FormattedMessage {...messages.deleteDashboard} />
          </DropdownItem>
        </DropdownList>
      </Dropdown>
      <DuplicateModal isOpen={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)} preselectedDashboardId={dashboard.id} />
      <DeleteDashboardModal
        isOpen={isDeleteModalOpen}
        dashboardName={dashboard.dashboardName}
        isDeleting={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteConfirm}
      />
    </>
  );
};

export default GenericHeaderDropdown;
