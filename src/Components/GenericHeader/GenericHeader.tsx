import '../Header/Header.scss';

import {
  Button,
  Content,
  Divider,
  Flex,
  FlexItem,
  Menu,
  MenuContainer,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useRef, useState } from 'react';
import { CodeIcon, CopyIcon, EllipsisVIcon, HomeIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { useSetAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { DashboardTemplate, setDefaultTemplate } from '../../api/dashboard-templates';
import { useExportDashboard } from '../../hooks/useExportDashboard';
import { useDeleteDashboard } from '../../hooks/useDeleteDashboard';
import { DeleteDashboardModal } from '../DashboardHub/DeleteDashboardModal/DeleteDashboardModal';
import { DuplicateModal } from '../DuplicateModal/DuplicateModal';
import { useAddNotification } from '../../state/notificationsAtom';
import { useNavigate } from 'react-router-dom';

interface KebabDropdownProps {
  dashboard: DashboardTemplate;
}

const KebabDropdown = ({ dashboard }: KebabDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { exportDashboard } = useExportDashboard();
  const { deleteDashboard, isLoading: isDeleting } = useDeleteDashboard();
  const addNotification = useAddNotification();
  const navigate = useNavigate();

  const handleSetAsHomepage = async () => {
    await setDefaultTemplate(dashboard.id);
    setIsOpen(false);
  };

  const handleCopyConfiguration = async () => {
    const result = await exportDashboard(dashboard.id);
    if (result) {
      try {
        const configString = JSON.stringify(result, null, 2);
        await navigator.clipboard.writeText(configString);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
    setIsOpen(false);
  };

  const handleDuplicate = () => {
    setIsOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await deleteDashboard(dashboard.id);
    setIsDeleteModalOpen(false);
    addNotification({
      variant: 'danger',
      title: `'${dashboard.dashboardName}' has been deleted and removed from Dashboard Hub`,
    });
    navigate('/staging/dashboard-hub');
  };

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      aria-label="kebab dropdown toggle"
      variant="plain"
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
      icon={<EllipsisVIcon />}
    />
  );

  const menu = (
    <Menu ref={menuRef}>
      <MenuContent>
        <MenuList>
          <MenuItem icon={<HomeIcon />} isAriaDisabled={dashboard.default} onClick={handleSetAsHomepage}>
            Set as homepage
          </MenuItem>
          <MenuItem icon={<CopyIcon />} isDisabled onClick={handleDuplicate}>
            Duplicate
          </MenuItem>
          <MenuItem icon={<CodeIcon />} onClick={handleCopyConfiguration}>
            Copy configuration string
          </MenuItem>
          <Divider component="li" />
          <MenuItem
            icon={<TrashIcon />}
            onClick={() => {
              setIsOpen(false);
              setIsDeleteModalOpen(true);
            }}
          >
            Delete dashboard
          </MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <>
      <MenuContainer
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        menu={menu}
        menuRef={menuRef}
        toggle={toggle}
        toggleRef={toggleRef}
        popperProps={{ position: 'end' }}
      />
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

interface GenericHeaderProps {
  dashboard?: DashboardTemplate;
}

const GenericHeader = ({ dashboard }: GenericHeaderProps) => {
  const toggleOpen = useSetAtom(drawerExpandedAtom);

  return (
    <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--header pf-v6-u-p-lg pf-v6-u-p-r-0-on-sm">
      <Flex className="widg-l-flex--header" direction={{ default: 'column', lg: 'row' }}>
        <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
          <Content component="h2">{dashboard?.dashboardName}</Content>
        </FlexItem>
        <FlexItem align={{ default: 'alignLeft', lg: 'alignRight' }}>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem className="pf-v6-u-pr-sm pf-v6-u-pr-0-on-lg pf-v6-u-pb-xs pf-v6-u-pb-0-on-lg">
                <Button onClick={() => toggleOpen((prev) => !prev)} variant="secondary" icon={<PlusCircleIcon />} ouiaId="add-widget-button">
                  Add widgets
                </Button>
              </ToolbarItem>
              {dashboard && (
                <ToolbarItem>
                  <KebabDropdown dashboard={dashboard} />
                </ToolbarItem>
              )}
            </ToolbarContent>
          </Toolbar>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default GenericHeader;
