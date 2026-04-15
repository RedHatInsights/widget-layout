import React, { useState } from 'react';
import { Table, Tbody, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import { ActionsColumn } from '@patternfly/react-table';
import { Button, Content, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { DashboardTemplate } from '../../../api/dashboard-templates';
import { setDefaultDashboardAtom } from '../../../state/dashboardsAtom';
import { CodeIcon, CopyIcon, EditAltIcon, HomeIcon, TrashIcon, UsersIcon } from '@patternfly/react-icons';
import { useExportDashboard } from '../../../hooks/useExportDashboard';
import { useDeleteDashboard } from '../../../hooks/useDeleteDashboard';
import { DeleteDashboardModal } from '../DeleteDashboardModal/DeleteDashboardModal';
import { DuplicateModal } from '../../DuplicateModal/DuplicateModal';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { useFlag } from '@unleash/proxy-client-react';
import { useAddNotification } from '../../../state/notificationsAtom';
import { useSetAtom } from 'jotai';

interface Dashboard {
  id: number;
  name: string;
  description: string; // TODO
  lastModified: string;
  isDefault: boolean;
}

interface DashboardTableProps {
  dashboards: DashboardTemplate[];
  onRefetchDashboards: () => void;
}

export const ButtonCopy: React.FunctionComponent<{ onClick: () => void }> = ({ onClick }) => {
  return <Button variant="plain" aria-label="Duplicate" icon={<CopyIcon />} onClick={onClick} />;
};

export const DashboardTable: React.FunctionComponent<DashboardTableProps> = ({ dashboards, onRefetchDashboards }) => {
  const { exportDashboard, isLoading, error } = useExportDashboard();
  const { deleteDashboard, isLoading: isDeleting } = useDeleteDashboard();
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null);
  const [duplicateDashboardId, setDuplicateDashboardId] = useState<number | null>(null);
  const isEnabledDelete = useFlag('platform.widget-layout.delete-dashboard');
  const addNotification = useAddNotification();
  const setDefaultDashboard = useSetAtom(setDefaultDashboardAtom);

  // Map API data to table format
  const tableData: Dashboard[] = dashboards.map((dashboard) => ({
    id: dashboard.id,
    name: dashboard.dashboardName,
    description: dashboard.templateBase.name, // TODO: Update when description field is available
    lastModified: dashboard.updatedAt,
    isDefault: dashboard.default,
  }));

  const columnNames = {
    name: 'Name',
    description: 'Description',
    lastModified: 'Last Modified',
    actions: '',
  };

  // Sorting state
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleCopyConfiguration = async (dashboardId: number) => {
    const result = await exportDashboard(dashboardId);

    if (result) {
      try {
        const configString = JSON.stringify(result, null, 2);
        await navigator.clipboard.writeText(configString);
        console.log('Configuration copied to clipboard');
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const handleSetAsHomepage = async (dashboardId: number) => {
    await setDefaultDashboard(dashboardId);
  };

  // Sort dashboards by name
  const sortedDashboards = [...tableData].sort((a, b) => {
    if (activeSortDirection === 'asc') {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  const getSortParams = (): ThProps['sort'] => ({
    sortBy: {
      index: 0,
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, _index, direction) => {
      setActiveSortDirection(direction);
    },
    columnIndex: 0,
  });

  // Row actions for each dashboard
  const getRowActions = (dashboard: Dashboard) => [
    {
      icon: <EditAltIcon />,
      title: 'Edit dashboard',
      isDisabled: true,
      onClick: () => console.log(`Edit dashboard ${dashboard.id}`),
    },
    {
      icon: <HomeIcon />,
      title: 'Set as homepage',
      isAriaDisabled: dashboard.isDefault,
      tooltipProps: dashboard.isDefault ? { content: 'This dashboard is already set to your homepage', position: TooltipPosition.left } : undefined,
      onClick: () => handleSetAsHomepage(dashboard.id),
    },
    {
      icon: <CodeIcon />,
      title: 'Copy configuration string',
      onClick: () => handleCopyConfiguration(dashboard.id),
    },
    {
      icon: <UsersIcon />,
      title: 'Share dashboard',
      isDisabled: true,
      onClick: () => console.log(`Share dashboard ${dashboard.id}`),
    },
    ...(isEnabledDelete
      ? [
          {
            isSeparator: true,
          },
          {
            icon: <TrashIcon />,
            title: 'Delete dashboard',
            onClick: () => setDashboardToDelete(dashboard),
          },
        ]
      : []),
  ];

  const handleDeleteConfirm = async () => {
    if (dashboardToDelete) {
      const name = dashboardToDelete.name;
      await deleteDashboard(dashboardToDelete.id);
      setDashboardToDelete(null);
      addNotification({
        variant: 'danger',
        title: `'${name}' has been deleted and removed from Dashboard Hub`,
      });
    }
  };

  return (
    <>
      <DuplicateModal
        isOpen={duplicateDashboardId !== null}
        onClose={() => setDuplicateDashboardId(null)}
        preselectedDashboardId={duplicateDashboardId}
      />
      <DeleteDashboardModal
        isOpen={dashboardToDelete !== null}
        dashboardName={dashboardToDelete?.name ?? ''}
        isDeleting={isDeleting}
        onClose={() => setDashboardToDelete(null)}
        onDelete={handleDeleteConfirm}
      />
      <Table aria-label="Dashboards table" ouiaId="DashboardsTable">
        <Thead>
          <Tr>
            <Th screenReaderText="Homepage" modifier="fitContent" />
            <Th sort={getSortParams()}>{columnNames.name}</Th>
            <Th>{columnNames.description}</Th>
            <Th>{columnNames.lastModified}</Th>
            <Th screenReaderText="Actions" />
          </Tr>
        </Thead>
        <Tbody>
          {sortedDashboards.map((dashboard) => (
            <Tr key={dashboard.id}>
              <Td>{dashboard.isDefault && <HomeIcon />}</Td>
              <Td dataLabel={columnNames.name}>
                <Link to={`/dashboard-hub/${dashboard.id}`}>{dashboard.name}</Link>
              </Td>
              <Td dataLabel={columnNames.description}>{dashboard.description}</Td>
              <Td dataLabel={columnNames.lastModified}>
                <DateFormat date={dashboard.lastModified} />
              </Td>
              <Td isActionCell>
                <Td className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-gap-sm">
                  <Tooltip content="Duplicate dashboard" position={TooltipPosition.left}>
                    <ButtonCopy onClick={() => setDuplicateDashboardId(dashboard.id)} />
                  </Tooltip>
                  <ActionsColumn items={getRowActions(dashboard)} />
                </Td>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default DashboardTable;
