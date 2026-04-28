import { Divider, Dropdown, DropdownItem, DropdownList, MenuToggle, MenuToggleElement } from '@patternfly/react-core';
import React, { Ref, useState } from 'react';
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

interface GenericHeaderDropdownProps {
  dashboard: DashboardTemplate;
}

const GenericHeaderDropdown = ({ dashboard }: GenericHeaderDropdownProps) => {
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
        title: `'${dashboard.dashboardName}' has been set as homepage`,
      });
    } catch (err) {
      addNotification({
        variant: 'danger',
        title: `Failed to set '${dashboard.dashboardName}' as homepage`,
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
          title: `'${dashboard.dashboardName}' has been copied to clipboard`,
        });
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        addNotification({
          variant: 'danger',
          title: `Failed to copy '${dashboard.dashboardName}' to clipboard`,
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
      title: `'${dashboard.dashboardName}' has been deleted and removed from Dashboard Hub`,
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
            aria-label="kebab dropdown toggle"
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
            tooltipProps={isHomepage ? { content: 'This dashboard is already set as your homepage' } : undefined}
          >
            Set as homepage
          </DropdownItem>
          <DropdownItem icon={<CopyIcon />} onClick={handleDuplicate}>
            Duplicate dashboard
          </DropdownItem>
          <DropdownItem icon={<CodeIcon />} onClick={handleCopyConfiguration}>
            Copy configuration string
          </DropdownItem>
          <Divider />
          <DropdownItem
            icon={<TrashIcon />}
            onClick={() => {
              setIsOpen(false);
              setIsDeleteModalOpen(true);
            }}
          >
            Delete dashboard
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
