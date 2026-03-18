import React, { useState } from 'react';
import { Table, Tbody, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import { ActionsColumn } from '@patternfly/react-table';
import { Button } from '@patternfly/react-core';
import { DashboardTemplate } from '../../../api/dashboard-templates';
import { CodeIcon, CopyIcon, EditAltIcon, HomeIcon, TrashIcon, UsersIcon } from '@patternfly/react-icons';
import { useExportDashboard } from '../../../hooks/useExportDashboard';
import { useDeleteDashboard } from '../../../hooks/useDeleteDashboard';
import { DeleteDashboardModal } from '../DeleteDashboardModal/DeleteDashboardModal';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';

interface Dashboard {
  id: number;
  name: string;
  description: string; // TODO
  lastModified: string;
}

interface DashboardTableProps {
  dashboards: DashboardTemplate[];
  onRefetchDashboards: () => void;
}

export const ButtonCopy: React.FunctionComponent = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return <Button variant="plain" aria-label="Copy" icon={<CopyIcon />} onClick={() => {}} />;
};

export const DashboardTable: React.FunctionComponent<DashboardTableProps> = ({ dashboards, onRefetchDashboards }) => {
  const { exportDashboard, isLoading, error } = useExportDashboard();
  const { deleteDashboard, isLoading: isDeleting } = useDeleteDashboard(onRefetchDashboards);
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null);

  // Map API data to table format
  const tableData: Dashboard[] = dashboards.map((dashboard) => ({
    id: dashboard.id,
    name: dashboard.dashboardName,
    description: dashboard.templateBase.name, // TODO: Update when description field is available
    lastModified: dashboard.updatedAt,
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
      isDisabled: true,
      onClick: () => console.log(`Set as homepage dashboard ${dashboard.id}`),
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
    {
      isSeparator: true,
    },
    {
      icon: <TrashIcon />,
      title: 'Delete dashboard',
      onClick: () => setDashboardToDelete(dashboard),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (dashboardToDelete) {
      await deleteDashboard(dashboardToDelete.id);
      setDashboardToDelete(null);
    }
  };

  return (
    <>
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
            <Th sort={getSortParams()}>{columnNames.name}</Th>
            <Th>{columnNames.description}</Th>
            <Th>{columnNames.lastModified}</Th>
            <Th screenReaderText="Actions" />
          </Tr>
        </Thead>
        <Tbody>
          {sortedDashboards.map((dashboard) => (
            <Tr key={dashboard.id}>
              <Td dataLabel={columnNames.name}>{dashboard.name}</Td>
              <Td dataLabel={columnNames.description}>{dashboard.description}</Td>
              <Td dataLabel={columnNames.lastModified}>
                <DateFormat date={dashboard.lastModified} />
              </Td>
              <Td isActionCell>
                <Td className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-gap-sm">
                  <ButtonCopy />
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
